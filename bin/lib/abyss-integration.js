'use strict';

// bin/lib/abyss-integration.js
// abyss CLI（代码图谱）与各 host 的联动单一事实源：
//   - hook 注入（claude/gemini settings.json，含路径重锚定与去重）
//   - 二进制探测（PATH + ~/.code-abyss/bin 兜底）与最低版本契约
//   - MCP server 注册条目（--with-mcp）
//   - packs.lock.json `tools` 字段的版本声明检查
//
// 设计约束：
//   - hook 命令必须指向「安装后」的 skill 路径（<target-dir>/skills/...），
//     绝不指向 PKG_ROOT —— npx 场景下那是易失缓存目录。
//   - 注入幂等：以 HOOK_MARKER 识别我方条目，先删后插。旧安装里指向
//     易失路径的条目也会被同一标记捕获并重锚定。
//   - 脚本自带 abyss 存在性守卫，注入不以安装时是否检测到 abyss 为条件——
//     用户后装 abyss 时 hook 自动生效，无需重装。
//
// ── v4.9.0 hybrid-切割 deprecation 期（2026-06-25 起）──
//
// claude/gemini hook 注入由 `abyss attach <host>` 接管为 production 主入口
// （见 abyss v0.5.24+ docs/book/getting-started/agent-hook.md）。本文件的
// `injectClaudeHooks` / `injectGeminiHooks` / `stripAbyssHooks` 在 v4.9 保留
// 行为以维持 `--with-hooks` flag 的 backward compatibility，但 install.js
// 触发时会打印 deprecation warning 引导用户改用 `abyss attach`。v5.0 物理
// 删除这三个函数与相关 export；卸载剥除 (uninstall.js stripAbyssHooks) 与
// MCP 注册 (injectClaudeMcp/GeminiMcp + removeClaudeMcp) 仍是 code-abyss
// 责任，不在切割范围。openclaw/pi/hermes 不在此文件——它们的 hook 由
// skills/indexing-code/hooks/common/install-hooks.sh 处理（v5.0 仍保留）。

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

// indexing-code hook 薄壳依赖 `abyss hook pre-edit`（>= 0.3.0 起稳定），
// 但 0.5.x 才完成跨语言 (hono/helix/vite/FastAPI/Django/SQLAlchemy) 的全量
// 回归。0.5.22+ 增加了 `abyss skill-manifest`，让 code-abyss 动态发现 abyss
// 暴露的 CLI 命令、MCP 工具、daemon 套接字 verbs，告别硬编码列表。
const MIN_ABYSS_VERSION = '0.5.20';
// 0.5.22+ 才有 skill-manifest 子命令；缺它即 fallback 回硬编码默认。
const SKILL_MANIFEST_AVAILABLE_FROM = '0.5.22';
const HOOK_MARKER = 'indexing-code/hooks/common';

function resolveAbyssHookDir(targetDir) {
  return path.join(targetDir, 'skills', 'indexing-code', 'hooks', 'common');
}

function isAbyssHookEntry(entry) {
  try {
    return JSON.stringify(entry).includes(HOOK_MARKER);
  } catch {
    return false;
  }
}

// 幂等注入：按事件名先剔除带标记的旧条目（含路径过期的），再插入新条目
function upsertHookEntries(hooks, eventName, entries) {
  const existing = Array.isArray(hooks[eventName]) ? hooks[eventName] : [];
  hooks[eventName] = existing.filter((e) => !isAbyssHookEntry(e)).concat(entries);
}

/**
 * @deprecated v4.9.0 — abyss attach claude 是 production 主入口。
 *   本函数保留行为以维持 `--with-hooks` flag 兼容，v5.0 物理删除。
 *   迁移：`abyss attach claude` (abyss CLI v0.5.20+)。
 */
function injectClaudeHooks(settings, targetDir) {
  const hookDir = resolveAbyssHookDir(targetDir);
  if (!settings.hooks || typeof settings.hooks !== 'object') settings.hooks = {};
  upsertHookEntries(settings.hooks, 'SessionStart', [{
    matcher: '',
    hooks: [{
      type: 'command',
      command: `bash "${path.join(hookDir, 'session-init.sh')}"`,
      timeout: 10,
    }],
  }]);
  upsertHookEntries(settings.hooks, 'PreToolUse', [{
    matcher: 'Edit|Write',
    hooks: [{
      type: 'command',
      command: `bash "${path.join(hookDir, 'pre-edit-check.sh')}"`,
      timeout: 5,
    }],
  }]);
  return hookDir;
}

/**
 * @deprecated v4.9.0 — abyss attach gemini 是 production 主入口。
 *   本函数保留行为以维持 `--with-hooks` flag 兼容，v5.0 物理删除。
 *   迁移：`abyss attach gemini` (abyss CLI v0.5.20+)。
 */
function injectGeminiHooks(settings, targetDir) {
  const hookDir = resolveAbyssHookDir(targetDir);
  if (!settings.hooks || typeof settings.hooks !== 'object') settings.hooks = {};
  upsertHookEntries(settings.hooks, 'SessionStart', [{
    matcher: 'startup',
    hooks: [{
      name: 'abyss-init',
      type: 'command',
      command: `bash "${path.join(hookDir, 'session-init.sh')}"`,
      timeout: 10000,
      description: 'Auto-index project with abyss',
    }],
  }]);
  upsertHookEntries(settings.hooks, 'BeforeTool', [{
    matcher: 'write_file|replace|edit_file',
    hooks: [{
      name: 'abyss-check',
      type: 'command',
      command: `bash "${path.join(hookDir, 'pre-edit-check.sh')}"`,
      timeout: 5000,
      description: 'Check callers before editing code',
    }],
  }]);
  return hookDir;
}

// 卸载用：从 settings 里剥除所有带标记的 hook 条目（备份还原可能带回
// 指向已删 skill 脚本的旧条目——不清会让每次编辑冒 bash 127 噪音）
function stripAbyssHooks(settings) {
  if (!settings || !settings.hooks || typeof settings.hooks !== 'object') return false;
  let changed = false;
  for (const ev of Object.keys(settings.hooks)) {
    if (!Array.isArray(settings.hooks[ev])) continue;
    const filtered = settings.hooks[ev].filter((e) => !isAbyssHookEntry(e));
    if (filtered.length !== settings.hooks[ev].length) {
      changed = true;
      if (filtered.length === 0) delete settings.hooks[ev];
      else settings.hooks[ev] = filtered;
    }
  }
  if (changed && Object.keys(settings.hooks).length === 0) delete settings.hooks;
  return changed;
}

function removeClaudeMcp({ HOME = os.homedir() } = {}) {
  const cfgPath = path.join(HOME, '.claude.json');
  if (!fs.existsSync(cfgPath)) return false;
  try {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    if (cfg.mcpServers && cfg.mcpServers.abyss) {
      delete cfg.mcpServers.abyss;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
      return true;
    }
  } catch {}
  return false;
}

// ── 二进制探测 ──

function abyssManagedBinPath(HOME = os.homedir()) {
  const bin = process.platform === 'win32' ? 'abyss.exe' : 'abyss';
  return path.join(HOME, '.code-abyss', 'bin', bin);
}

function tryVersion(cmd) {
  try {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8', timeout: 3000 });
    if (r.status === 0) {
      const out = String(r.stdout || '').trim(); // "abyss 0.3.1-dev"
      const m = out.match(/(\d+\.\d+\.\d+)/);
      return { raw: out, version: m ? m[1] : null };
    }
  } catch {}
  return null;
}

// PATH 优先，~/.code-abyss/bin 兜底（--with-abyss 的落点不要求用户改 PATH）
function detectAbyss({ HOME = os.homedir() } = {}) {
  const onPath = tryVersion('abyss');
  if (onPath) return { ...onPath, binPath: 'abyss', source: 'PATH' };
  const managed = abyssManagedBinPath(HOME);
  if (fs.existsSync(managed)) {
    const r = tryVersion(managed);
    if (r) return { ...r, binPath: managed, source: 'managed' };
  }
  return null;
}

// ── 版本契约 ──

function compareVersions(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

function satisfiesMin(version, min) {
  if (!version) return false;
  return compareVersions(version, min) >= 0;
}

// packs.lock.json 的 tools 字段：{ "abyss": ">=0.3.1" }
// 只支持 ">=X.Y.Z"（含裸 "X.Y.Z"，视为 >=）——锁文件是声明最低工具链，不是包管理器
function checkLockToolRequirement(lock, detected) {
  const spec = lock && lock.tools && lock.tools.abyss;
  if (!spec) return null;
  const m = String(spec).match(/^\s*(?:>=)?\s*(\d+\.\d+\.\d+)\s*$/);
  if (!m) return { ok: false, spec, reason: 'unparsable' };
  const required = m[1];
  if (!detected || !detected.version) return { ok: false, spec, required, reason: 'missing' };
  if (!satisfiesMin(detected.version, required)) {
    return { ok: false, spec, required, reason: 'outdated', actual: detected.version };
  }
  return { ok: true, spec, required, actual: detected.version };
}

// ── 能力发现：abyss skill-manifest（0.5.22+） ──
//
// 设计契约：
//   - 永不抛错。manifest 解析失败、abyss 版本过旧、二进制不存在——一律 null。
//   - 调用方必须有硬编码 fallback。manifest 是「增强」不是「依赖」。
//   - schema_version 严格 == 1。abyss 改 schema 时需要 code-abyss 同步适配，
//     而不是静默吞掉一个不认识的 shape。
//
// 用途：
//   - 安装后摘要：打印 "abyss vX.Y.Z: N CLI commands, M MCP tools"，让用户
//     看到能力发现链路走通。
//   - MCP 注册（未来扩展）：用 manifest.providers.mcp.tools 替代硬编码列表。
//   - daemon 验证：providers.daemon.verbs 可用于探测 subscribe 等新 verb 支持。
function tryReadAbyssManifest({ binPath = null, HOME = os.homedir(), timeoutMs = 2000 } = {}) {
  let abyss = binPath;
  if (!abyss) {
    const detected = detectAbyss({ HOME });
    if (!detected) return null;
    abyss = detected.binPath;
    if (!detected.version || compareVersions(detected.version, SKILL_MANIFEST_AVAILABLE_FROM) < 0) {
      return null;
    }
  } else {
    // binPath 显式传入也需要版本闸：避免对老 abyss 喊 skill-manifest 报 unknown subcommand
    const v = tryVersion(abyss);
    if (!v || !v.version || compareVersions(v.version, SKILL_MANIFEST_AVAILABLE_FROM) < 0) {
      return null;
    }
  }
  try {
    const r = spawnSync(abyss, ['skill-manifest', '--compact'], { encoding: 'utf8', timeout: timeoutMs });
    if (r.status !== 0 || !r.stdout) return null;
    const m = JSON.parse(r.stdout);
    if (!m || typeof m !== 'object' || m.schema_version !== 1) return null;
    return m;
  } catch {
    return null;
  }
}

// 安装后摘要：把 manifest 浓缩成一行人类可读串。null in → null out（不打印）。
function summarizeAbyssManifest(manifest) {
  if (!manifest) return null;
  const ver = manifest.version || '?';
  const cli = Array.isArray(manifest?.providers?.cli?.commands) ? manifest.providers.cli.commands.length : 0;
  const mcp = Array.isArray(manifest?.providers?.mcp?.tools) ? manifest.providers.mcp.tools.length : 0;
  const verbs = Array.isArray(manifest?.providers?.daemon?.verbs) ? manifest.providers.daemon.verbs.join(', ') : null;
  let s = `abyss v${ver}: ${cli} CLI commands, ${mcp} MCP tools`;
  if (verbs) s += `; daemon verbs: ${verbs}`;
  return s;
}

// MCP 工具源真：能从 manifest 拿就拿，否则 fallback 到硬编码列表（保留旧行为）
function resolveAbyssMcpTools(manifest, fallback = ['search_context', 'get_symbols', 'find_callers', 'impact_analysis', 'code_map', 'evolution', 'index_project']) {
  const t = manifest && manifest.providers && manifest.providers.mcp && manifest.providers.mcp.tools;
  if (Array.isArray(t) && t.length > 0) return t;
  return fallback;
}

// ── MCP 注册（--with-mcp 显式 opt-in；8 个 tool schema 常驻 context 有成本） ──

function buildMcpEntry(binPath) {
  return { command: binPath || 'abyss', args: ['mcp'] };
}

// Claude Code 的用户级 MCP 配置在 ~/.claude.json（settings.json 不承载 mcpServers）
function injectClaudeMcp({ HOME = os.homedir(), binPath } = {}) {
  const cfgPath = path.join(HOME, '.claude.json');
  let cfg = {};
  if (fs.existsSync(cfgPath)) {
    try {
      cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    } catch {
      return { written: false, cfgPath, reason: 'parse-error' };
    }
  }
  if (!cfg.mcpServers || typeof cfg.mcpServers !== 'object') cfg.mcpServers = {};
  cfg.mcpServers.abyss = buildMcpEntry(binPath);
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  return { written: true, cfgPath };
}

function injectGeminiMcp(settings, binPath) {
  if (!settings.mcpServers || typeof settings.mcpServers !== 'object') settings.mcpServers = {};
  settings.mcpServers.abyss = buildMcpEntry(binPath);
  return settings;
}

module.exports = {
  MIN_ABYSS_VERSION,
  SKILL_MANIFEST_AVAILABLE_FROM,
  HOOK_MARKER,
  resolveAbyssHookDir,
  abyssManagedBinPath,
  injectClaudeHooks,
  injectGeminiHooks,
  stripAbyssHooks,
  removeClaudeMcp,
  detectAbyss,
  compareVersions,
  satisfiesMin,
  checkLockToolRequirement,
  buildMcpEntry,
  injectClaudeMcp,
  injectGeminiMcp,
  tryReadAbyssManifest,
  summarizeAbyssManifest,
  resolveAbyssMcpTools,
};

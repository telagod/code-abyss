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

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

// indexing-code hook 薄壳依赖 `abyss hook pre-edit`（>= 0.3.0）
const MIN_ABYSS_VERSION = '0.3.0';
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
};

'use strict';

const fs = require('fs');
const path = require('path');
const { getPackHostFiles } = require(path.join(__dirname, '..', 'lib', 'pack-registry.js'));
const { rmSafe } = require(path.join(__dirname, '..', 'lib', 'utils.js'));

const PROJECT_ROOT = path.join(__dirname, '..', '..');

const CODEX_DEFAULTS = {
  approvalPolicy: 'on-request',
  allowLoginShell: true,
  cliAuthCredentialsStore: 'file',
  modelInstructionsFile: './instruction.md',
  sandboxMode: 'workspace-write',
  webSearch: 'cached',
};

const CODEX_DEFAULT_PROFILES = {
  full_auto: {
    approval_policy: '"on-request"',
    sandbox_mode: '"workspace-write"',
    web_search: '"cached"',
  },
  full_access: {
    approval_policy: '"on-request"',
    sandbox_mode: '"danger-full-access"',
    web_search: '"live"',
  },
};

const LEGACY_FEATURES = {
  removed: [
    'search_tool',
    'request_rule',
    'experimental_windows_sandbox',
    'elevated_windows_sandbox',
    'remote_models',
    'collaboration_modes',
    'steer',
  ],
  deprecated: [
    'web_search_request',
    'web_search_cached',
  ],
};

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isTableHeader(line) {
  return /^\s*\[[^\]]+\]\s*$/.test(line);
}

function isProjectTableHeader(line) {
  return /^\s*\[projects\."[^"]+"\]\s*$/.test(line);
}

function isProfileTableHeader(line) {
  return /^\s*\[profiles\.[^\]]+\]\s*$/.test(line);
}

function isAssignmentForKey(line, key) {
  const re = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=`);
  return re.test(line);
}

function hasRootKey(content, key) {
  const lines = content.split(/\r?\n/);
  let inRoot = true;

  for (const line of lines) {
    if (isTableHeader(line)) {
      inRoot = false;
      continue;
    }
    if (inRoot && isAssignmentForKey(line, key)) {
      return true;
    }
  }
  return false;
}

function readRootStringKey(content, key) {
  const lines = content.split(/\r?\n/);
  const re = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=\\s*"([^"]*)"`);
  let inRoot = true;

  for (const line of lines) {
    if (isTableHeader(line)) {
      inRoot = false;
      continue;
    }
    if (!inRoot) continue;
    const m = line.match(re);
    if (m) return m[1];
  }
  return null;
}

function hasSection(content, sectionName) {
  const re = new RegExp(`^\\s*\\[${escapeRegExp(sectionName)}\\]\\s*$`, 'm');
  return re.test(content);
}

function hasKeyInSection(content, sectionName, key) {
  const lines = content.split(/\r?\n/);
  const sectionRe = new RegExp(`^\\s*\\[${escapeRegExp(sectionName)}\\]\\s*$`);
  const anySectionRe = /^\s*\[[^\]]+\]\s*$/;
  const keyRe = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=`);
  let inSection = false;

  for (const line of lines) {
    if (sectionRe.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && anySectionRe.test(line)) {
      return false;
    }
    if (inSection && keyRe.test(line)) {
      return true;
    }
  }
  return false;
}

function appendLine(content, line, eol) {
  if (!content) return `${line}${eol}`;
  const normalized = content.endsWith('\n') ? content : `${content}${eol}`;
  return `${normalized}${line}${eol}`;
}

function insertRootLine(content, line, eol) {
  if (!content) return `${line}${eol}`;
  const lines = content.split(/\r?\n/);
  const firstSection = lines.findIndex((l) => isTableHeader(l));
  const idx = firstSection === -1 ? lines.length : firstSection;
  lines.splice(idx, 0, line);
  return lines.join(eol);
}

function ensureRootKey(content, key, valueLiteral, eol) {
  if (hasRootKey(content, key)) return { merged: content, added: false };
  return { merged: insertRootLine(content, `${key} = ${valueLiteral}`, eol), added: true };
}

function insertLineAfterSectionHeader(content, sectionName, line, eol) {
  const lines = content.split(/\r?\n/);
  const sectionRe = new RegExp(`^\\s*\\[${escapeRegExp(sectionName)}\\]\\s*$`);
  const idx = lines.findIndex((l) => sectionRe.test(l));
  if (idx === -1) return appendLine(content, line, eol);
  lines.splice(idx + 1, 0, line);
  return lines.join(eol);
}

function ensureKeyInSection(content, sectionName, key, valueLiteral, eol) {
  let merged = content;
  let added = false;

  if (!hasSection(merged, sectionName)) {
    merged = appendLine(merged, `[${sectionName}]`, eol);
    merged = appendLine(merged, `${key} = ${valueLiteral}`, eol);
    added = true;
  } else if (!hasKeyInSection(merged, sectionName, key)) {
    merged = insertLineAfterSectionHeader(merged, sectionName, `${key} = ${valueLiteral}`, eol);
    added = true;
  }

  return { merged, added };
}

function ensureCodexDefaultProfiles(content, eol) {
  let merged = content;
  const added = [];

  for (const [profile, values] of Object.entries(CODEX_DEFAULT_PROFILES)) {
    for (const [key, value] of Object.entries(values)) {
      const sectionName = `profiles.${profile}`;
      const ensured = ensureKeyInSection(merged, sectionName, key, value, eol);
      merged = ensured.merged;
      if (ensured.added) {
        added.push(`${sectionName}.${key}`);
      }
    }
  }

  return { merged, added };
}

function parseTomlBooleanAssignment(line) {
  const m = line.match(/=\s*(true|false)\b/i);
  if (!m) return null;
  return m[1].toLowerCase() === 'true';
}

function removeKeyAssignmentsInOtherSections(content, key) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const kept = [];
  let scope = 'root';
  let removed = false;

  for (const line of lines) {
    if (isTableHeader(line)) {
      scope = isProfileTableHeader(line) ? 'profile' : 'other';
      kept.push(line);
      continue;
    }
    if (scope === 'other' && isAssignmentForKey(line, key)) {
      removed = true;
      continue;
    }
    kept.push(line);
  }

  return { merged: kept.join(eol), removed };
}

function removeKeyAssignmentsInSection(content, sectionName, key) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const kept = [];
  const sectionRe = new RegExp(`^\\s*\\[${escapeRegExp(sectionName)}\\]\\s*$`);
  const anySectionRe = /^\s*\[[^\]]+\]\s*$/;
  let inSection = false;
  const removedValues = [];

  for (const line of lines) {
    if (sectionRe.test(line)) {
      inSection = true;
      kept.push(line);
      continue;
    }
    if (inSection && anySectionRe.test(line)) {
      inSection = false;
      kept.push(line);
      continue;
    }
    if (inSection && isAssignmentForKey(line, key)) {
      removedValues.push(parseTomlBooleanAssignment(line));
      continue;
    }
    kept.push(line);
  }

  return { merged: kept.join(eol), removedValues };
}

function removeProjectTrustSectionsForFullAccess(content) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const sandboxMode = readRootStringKey(content, 'sandbox_mode');
  if (sandboxMode !== 'danger-full-access') {
    return { merged: content, removed: false };
  }

  const lines = content.split(/\r?\n/);
  const kept = [];
  let inProjectSection = false;
  let removed = false;

  for (const line of lines) {
    if (isTableHeader(line)) {
      if (isProjectTableHeader(line)) {
        inProjectSection = true;
        removed = true;
        continue;
      }
      inProjectSection = false;
      kept.push(line);
      continue;
    }
    if (inProjectSection) continue;
    kept.push(line);
  }

  return { merged: kept.join(eol), removed };
}

function removeFeatureFlagsFromFeaturesSection(content, featureNames) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const sectionRe = /^\s*\[features\]\s*$/;
  const anySectionRe = /^\s*\[[^\]]+\]\s*$/;
  const assignRe = /^\s*([A-Za-z0-9_.-]+)\s*=/;
  const featureSet = new Set(featureNames);
  const removedEntries = [];

  let inFeatures = false;
  const kept = [];

  for (const line of lines) {
    if (sectionRe.test(line)) {
      inFeatures = true;
      kept.push(line);
      continue;
    }
    if (inFeatures && anySectionRe.test(line)) {
      inFeatures = false;
      kept.push(line);
      continue;
    }
    if (inFeatures) {
      const m = line.match(assignRe);
      if (m && featureSet.has(m[1])) {
        removedEntries.push({ key: m[1], enabled: parseTomlBooleanAssignment(line) });
        continue;
      }
    }
    kept.push(line);
  }

  return { merged: kept.join(eol), removedEntries };
}

function uniq(values) {
  return [...new Set(values)];
}

function cleanupLegacyCodexConfig(content) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const toRemove = [...LEGACY_FEATURES.removed, ...LEGACY_FEATURES.deprecated];
  const { merged: pruned, removedEntries } = removeFeatureFlagsFromFeaturesSection(content, toRemove);
  const { merged: withoutToolsWebSearch, removedValues: removedToolWebSearch } =
    removeKeyAssignmentsInSection(pruned, 'tools', 'web_search');
  let merged = withoutToolsWebSearch;
  const removed = uniq(removedEntries.map((x) => x.key));
  const migrated = [];

  if (removedToolWebSearch.length > 0) {
    removed.push('tools.web_search');
  }

  if (!hasRootKey(merged, 'web_search')) {
    const requestEnabled = removedEntries.find((x) => x.key === 'web_search_request')?.enabled;
    const cachedEnabled = removedEntries.find((x) => x.key === 'web_search_cached')?.enabled;
    const toolsEnabled = removedToolWebSearch.find((value) => value !== null);

    let webSearchMode = null;
    if (requestEnabled === true) webSearchMode = 'live';
    else if (cachedEnabled === true) webSearchMode = 'cached';
    else if (toolsEnabled === true) webSearchMode = 'cached';
    else if (requestEnabled === false || cachedEnabled === false || toolsEnabled === false) webSearchMode = 'disabled';

    if (webSearchMode) {
      const webSearch = ensureRootKey(merged, 'web_search', `"${webSearchMode}"`, eol);
      merged = webSearch.merged;
      if (webSearch.added) migrated.push(`web_search=${webSearchMode}`);
    }
  }

  return { merged, removed, migrated };
}

function mergeCodexConfigDefaults(content) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  let merged = content;
  const added = [];

  const rootKeys = [
    'approval_policy',
    'allow_login_shell',
    'cli_auth_credentials_store',
    'model_instructions_file',
    'sandbox_mode',
    'web_search',
  ];

  for (const key of rootKeys) {
    const cleaned = removeKeyAssignmentsInOtherSections(merged, key);
    merged = cleaned.merged;
  }

  const approval = ensureRootKey(merged, 'approval_policy', `"${CODEX_DEFAULTS.approvalPolicy}"`, eol);
  merged = approval.merged;
  if (approval.added) {
    added.push('approval_policy');
  }

  const loginShell = ensureRootKey(merged, 'allow_login_shell', `${CODEX_DEFAULTS.allowLoginShell}`, eol);
  merged = loginShell.merged;
  if (loginShell.added) {
    added.push('allow_login_shell');
  }

  const credentialsStore = ensureRootKey(
    merged,
    'cli_auth_credentials_store',
    `"${CODEX_DEFAULTS.cliAuthCredentialsStore}"`,
    eol
  );
  merged = credentialsStore.merged;
  if (credentialsStore.added) {
    added.push('cli_auth_credentials_store');
  }

  const modelInstructions = ensureRootKey(
    merged,
    'model_instructions_file',
    `"${CODEX_DEFAULTS.modelInstructionsFile}"`,
    eol
  );
  merged = modelInstructions.merged;
  if (modelInstructions.added) {
    added.push('model_instructions_file');
  }

  const sandbox = ensureRootKey(merged, 'sandbox_mode', `"${CODEX_DEFAULTS.sandboxMode}"`, eol);
  merged = sandbox.merged;
  if (sandbox.added) {
    added.push('sandbox_mode');
  }

  const webSearch = ensureRootKey(merged, 'web_search', `"${CODEX_DEFAULTS.webSearch}"`, eol);
  merged = webSearch.merged;
  if (webSearch.added) {
    added.push('web_search');
  }

  const profiles = ensureCodexDefaultProfiles(merged, eol);
  merged = profiles.merged;
  added.push(...profiles.added);

  return { merged, added };
}

function patchCodexConfig(cfgPath) {
  const raw = fs.readFileSync(cfgPath, 'utf8');
  const { merged: cleaned, removed, migrated } = cleanupLegacyCodexConfig(raw);
  const { merged: mergedDefaults, added } = mergeCodexConfigDefaults(cleaned);
  const { merged, removed: removedProjectTrust } = removeProjectTrustSectionsForFullAccess(mergedDefaults);
  const removedAll = removedProjectTrust ? [...removed, 'projects.*.trust_level'] : removed;

  if (merged !== raw) fs.writeFileSync(cfgPath, merged);
  return { added, removed: removedAll, migrated };
}

function patchCodexConfigDefaults(cfgPath) {
  return patchCodexConfig(cfgPath).added;
}

function patchAndReportCodexDefaults({ cfgPath, ok, warn }) {
  try {
    const { added, removed, migrated } = patchCodexConfig(cfgPath);
    const changes = [];
    if (added.length > 0) changes.push(`补全默认项: ${added.join(', ')}`);
    if (removed.length > 0) changes.push(`清理过时项: ${removed.join(', ')}`);
    if (migrated.length > 0) changes.push(`迁移配置: ${migrated.join(', ')}`);
    if (changes.length > 0) ok(`config.toml 已存在，${changes.join('；')}`);
    else ok('config.toml 已存在');
  } catch (e) {
    warn(`config.toml 读取失败，跳过补全: ${e.message}`);
  }
}

// ── abyss 联动（hook + MCP）──
// hook 形状与 skills/indexing-code/hooks/codex/hooks.json 同源，Codex 0.125+ 数组表 schema：
//   [[hooks.SessionStart]] matcher  +  [[hooks.SessionStart.hooks]] type/command/timeout
//   [[hooks.PreToolUse]]   matcher  +  [[hooks.PreToolUse.hooks]]   type/command/timeout
//   旧扁平 [hooks.X] 已被 Codex 拒载（invalid type: map, expected a sequence）
// MCP: [mcp_servers.abyss] command/args —— 节名是我方命名空间，可自由 upsert。

const ABYSS_HOOK_MARKER = 'indexing-code/hooks/common';

function upsertKeyInSection(content, sectionName, key, valueLiteral, eol) {
  const removed = removeKeyAssignmentsInSection(content, sectionName, key);
  return ensureKeyInSection(removed.merged, sectionName, key, valueLiteral, eol).merged;
}

// TOML basic string 里 \ 是转义符，统一用正斜杠（bash 在 Windows 下也认）
function tomlPath(p) {
  return p.split(path.sep).join('/');
}

// 任意 TOML 表头：既配 [section] 也配 [[array.of.tables]]
const ANY_TOML_HEADER_RE = /^\s*\[\[?[^\]]+\]\]?\s*$/;
// hook 事件级表头（不含 .hooks 子表），捕获事件名
const HOOK_EVENT_HEADER_RE = /^\[\[?hooks\.([A-Za-z]+)\]\]?$/;

// 按表头把 TOML 切成块（保留原始行），[[..]] 与 [..] 同视为分界
function splitTomlBlocks(content) {
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let cur = { header: null, lines: [] };
  for (const line of lines) {
    if (ANY_TOML_HEADER_RE.test(line)) {
      blocks.push(cur);
      cur = { header: line.trim(), lines: [line] };
    } else {
      cur.lines.push(line);
    }
  }
  blocks.push(cur);
  return blocks;
}

// 把一个事件级 block 与其紧随的同事件 .hooks 子表聚成一组
function gatherHookGroup(blocks, startIdx, eventName) {
  const group = [blocks[startIdx]];
  const childRe = new RegExp(`^\\[\\[?hooks\\.${escapeRegExp(eventName)}\\.hooks\\]\\]?$`);
  let j = startIdx + 1;
  while (j < blocks.length && blocks[j].header && childRe.test(blocks[j].header)) {
    group.push(blocks[j]);
    j++;
  }
  return { group, next: j };
}

// Codex 0.125+ 期望数组表形态：[[hooks.Event]] + [[hooks.Event.hooks]]，旧扁平表会报
// "invalid type: map, expected a sequence in hooks" 直接拒载 config.toml。
function renderCodexHookBlock(ev, dir, winBash, eol) {
  const target = `${dir}/${ev.script}`;
  const L = [
    `[[hooks.${ev.name}]]`,
    `matcher = "${ev.matcher}"`,
    '',
    `[[hooks.${ev.name}.hooks]]`,
    'type = "command"',
    `command = "bash \\"${target}\\""`,
  ];
  // Windows 下 Git Bash 可能不在 PATH，command_windows 钉到安装期解析出的 bash 绝对路径
  if (winBash) L.push(`command_windows = "\\"${tomlPath(winBash)}\\" \\"${target}\\""`);
  L.push(`timeout = ${ev.timeout}`);
  L.push(`statusMessage = "${ev.statusMessage}"`);
  return L.join(eol);
}

function injectCodexHooks(content, hookDir, eol, opts = {}) {
  const dir = tomlPath(hookDir);
  const winBash = opts.winBash || null;
  const events = [
    { name: 'SessionStart', matcher: 'startup|resume', script: 'session-init.sh', timeout: 10, statusMessage: 'abyss: checking index' },
    { name: 'PreToolUse', matcher: 'Bash|shell', script: 'pre-edit-check.sh', timeout: 5, statusMessage: 'abyss: checking callers' },
  ];

  // 1. 先剥掉我方旧 hook 组（带标记），同时记录用户自有事件——保持非破坏 + 旧路径重锚
  const blocks = splitTomlBlocks(content);
  const userOwned = new Set();
  const kept = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    const m = b.header && b.header.match(HOOK_EVENT_HEADER_RE);
    if (m) {
      const { group, next } = gatherHookGroup(blocks, i, m[1]);
      const groupText = group.map((g) => g.lines.join('\n')).join('\n');
      if (groupText.includes(ABYSS_HOOK_MARKER)) {
        // 我方旧条目：丢弃，稍后重建（顺带重锚旧路径）
      } else {
        userOwned.add(m[1]);
        for (const g of group) kept.push(...g.lines);
      }
      i = next;
      continue;
    }
    kept.push(...b.lines);
    i++;
  }

  // 2. 为非用户占位的事件追加新块
  const installed = [];
  const skipped = [];
  const fresh = [];
  for (const ev of events) {
    if (userOwned.has(ev.name)) {
      skipped.push(`hooks.${ev.name}`);
      continue;
    }
    fresh.push(renderCodexHookBlock(ev, dir, winBash, eol));
    installed.push(`hooks.${ev.name}`);
  }

  let merged = kept.join(eol);
  if (fresh.length) {
    const base = merged.replace(/\s+$/, '');
    merged = (base ? base + eol + eol : '') + fresh.join(eol + eol) + eol;
  }
  return { merged, installed, skipped };
}

function injectCodexMcp(content, abyssBinPath, eol) {
  const cmd = `"${tomlPath(abyssBinPath || 'abyss')}"`;
  let merged = upsertKeyInSection(content, 'mcp_servers.abyss', 'command', cmd, eol);
  merged = upsertKeyInSection(merged, 'mcp_servers.abyss', 'args', '["mcp"]', eol);
  return merged;
}

// 卸载用：剥除带标记的 hook 组（含 [[hooks.X]] + [[hooks.X.hooks]]）与 [mcp_servers.abyss] 节
function stripCodexAbyssIntegration(content) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const blocks = splitTomlBlocks(content);

  const kept = [];
  let removed = false;
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.header === '[mcp_servers.abyss]') { removed = true; i++; continue; }
    const m = b.header && b.header.match(HOOK_EVENT_HEADER_RE);
    if (m) {
      const { group, next } = gatherHookGroup(blocks, i, m[1]);
      const groupText = group.map((g) => g.lines.join('\n')).join('\n');
      if (groupText.includes(ABYSS_HOOK_MARKER)) {
        removed = true;
      } else {
        for (const g of group) kept.push(...g.lines);
      }
      i = next;
      continue;
    }
    kept.push(...b.lines);
    i++;
  }
  // 顺带清掉孤立的 "# abyss hooks" 注释行
  const cleaned = kept.filter((l) => l.trim() !== '# abyss hooks');
  return { merged: cleaned.join(eol), removed };
}

// 安装期解析 Windows 下的 bash 绝对路径，供 command_windows 钉用——非 win32 返回 null。
// 优先 PATH 中的 bash，其次 Git for Windows 常见安装位；找不到则不写 command_windows。
function resolveWindowsBash(platform = process.platform, env = process.env) {
  if (platform !== 'win32') return null;
  try {
    const { execSync } = require('child_process');
    const out = execSync('where bash', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    // 跳过 WSL 的 C:\Windows\System32\bash.exe（不能跑 Git Bash 脚本），优先 Git 的
    const git = out.find((p) => /git/i.test(p)) || out.find((p) => !/system32/i.test(p));
    if (git) return git;
  } catch (_) { /* bash 不在 PATH，回落到常见安装位 */ }
  const candidates = [
    path.join(env.ProgramFiles || 'C:/Program Files', 'Git', 'bin', 'bash.exe'),
    path.join(env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Git', 'bin', 'bash.exe'),
    path.join(env.LOCALAPPDATA || 'C:/Users/Default/AppData/Local', 'Programs', 'Git', 'bin', 'bash.exe'),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch (_) { /* ignore */ }
  }
  return null;
}

function injectCodexAbyssIntegration({ cfgPath, HOME, withMcp = false, abyssBinPath = null }) {
  const raw = fs.existsSync(cfgPath) ? fs.readFileSync(cfgPath, 'utf8') : '';
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const hookDir = path.join(HOME, '.codex', 'skills', 'indexing-code', 'hooks', 'common');

  const hooks = injectCodexHooks(raw, hookDir, eol, { winBash: resolveWindowsBash() });
  let merged = hooks.merged;
  let mcpInstalled = false;
  if (withMcp) {
    merged = injectCodexMcp(merged, abyssBinPath, eol);
    mcpInstalled = true;
  }
  if (merged !== raw) fs.writeFileSync(cfgPath, merged);
  return { installed: hooks.installed, skipped: hooks.skipped, mcpInstalled };
}

function detectCodexAuth({
  HOME,
  env = process.env,
  warn = () => {}
}) {
  if (env.OPENAI_API_KEY) return { type: 'env', detail: 'OPENAI_API_KEY' };

  const auth = path.join(HOME, '.codex', 'auth.json');
  if (fs.existsSync(auth)) {
    try {
      const a = JSON.parse(fs.readFileSync(auth, 'utf8'));
      if (a.token || a.api_key) return { type: 'login', detail: 'codex login' };
    } catch (e) {
      warn(`凭证文件损坏: ${auth}`);
    }
  }

  const cfg = path.join(HOME, '.codex', 'config.toml');
  if (fs.existsSync(cfg) && fs.readFileSync(cfg, 'utf8').includes('base_url')) {
    return { type: 'custom', detail: 'config.toml' };
  }

  return null;
}

function getCodexCoreFiles() {
  return getPackHostFiles(PROJECT_ROOT, 'abyss', 'codex');
}

function cleanupLegacyCodexRuntime({
  HOME,
  info = () => {},
}) {
  const legacyTargets = [
    { relPath: 'AGENTS.md', label: 'AGENTS.md' },
    { relPath: 'prompts', label: 'prompts/' },
  ];

  const removed = [];
  legacyTargets.forEach(({ relPath, label }) => {
    const targetPath = path.join(HOME, '.codex', relPath);
    if (!fs.existsSync(targetPath)) return;
    rmSafe(targetPath);
    removed.push(label);
    info(`移除 legacy ${label}（Codex 已改为 skills-only）`);
  });

  return removed;
}

function reportAbyssIntegration({ cfgPath, HOME, withMcp, abyssBinPath, ok, info, warn }) {
  try {
    const r = injectCodexAbyssIntegration({ cfgPath, HOME, withMcp, abyssBinPath });
    if (r.installed.length > 0) ok(`abyss hooks → ${r.installed.join(', ')}`);
    if (r.skipped.length > 0) info(`保留用户自有 hook，跳过: ${r.skipped.join(', ')}`);
    if (r.mcpInstalled) ok('MCP → [mcp_servers.abyss]');
  } catch (e) {
    warn(`abyss 联动写入失败: ${e.message}`);
  }
}

async function postCodex({
  autoYes,
  HOME,
  PKG_ROOT,
  step,
  ok,
  warn,
  info,
  c,
  withMcp = false,
  abyssBinPath = null
}) {
  const { confirm } = await import('@inquirer/prompts');
  const cfgPath = path.join(HOME, '.codex', 'config.toml');
  const exists = fs.existsSync(cfgPath);

  step(2, 3, '认证检测');
  const auth = detectCodexAuth({ HOME, warn });
  if (auth) {
    ok(`${c.b(auth.type)} → ${auth.detail}`);
  } else {
    warn('未检测到 API 认证');
    info(`支持: ${c.cyn('codex login')} | ${c.cyn('OPENAI_API_KEY')} | ${c.cyn('自定义 provider')}`);
  }

  step(3, 3, '可选配置');
  if (autoYes) {
    if (!exists) {
      const src = path.join(PKG_ROOT, 'config', 'codex-config.example.toml');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, cfgPath);
        ok('写入: ~/.codex/config.toml (模板)');
        info('默认值已对齐当前 Codex 样例；如需显式全权限，可切到 `codex -p full_access`');
      }
    } else {
      patchAndReportCodexDefaults({ cfgPath, ok, warn });
    }
    reportAbyssIntegration({ cfgPath, HOME, withMcp, abyssBinPath, ok, info, warn });
    return;
  }

  if (!exists) {
    warn('未检测到 ~/.codex/config.toml');
    const doWrite = await confirm({ message: '写入推荐 config.toml (含自定义 provider 模板)?', default: true });
    if (doWrite) {
      const src = path.join(PKG_ROOT, 'config', 'codex-config.example.toml');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, cfgPath);
        ok('写入: ~/.codex/config.toml');
        info('默认值已对齐当前 Codex 样例；如需显式全权限，可切到 `codex -p full_access`');
      }
    }
  } else {
    patchAndReportCodexDefaults({ cfgPath, ok, warn });
  }
  reportAbyssIntegration({ cfgPath, HOME, withMcp, abyssBinPath, ok, info, warn });
}

module.exports = {
  cleanupLegacyCodexConfig,
  cleanupLegacyCodexRuntime,
  mergeCodexConfigDefaults,
  patchCodexConfig,
  patchCodexConfigDefaults,
  injectCodexHooks,
  injectCodexMcp,
  injectCodexAbyssIntegration,
  stripCodexAbyssIntegration,
  detectCodexAuth,
  getCodexCoreFiles,
  postCodex,
};

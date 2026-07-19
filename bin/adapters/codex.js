'use strict';

const fs = require('fs');
const path = require('path');
const { getPackHostFiles } = require(path.join(__dirname, '..', 'lib', 'pack-registry.js'));
const { rmSafe } = require(path.join(__dirname, '..', 'lib', 'utils.js'));
const { loadInquirerPrompts } = require(path.join(__dirname, '..', 'lib', 'ui', 'safe-import.js'));

const PROJECT_ROOT = path.join(__dirname, '..', '..');

const CODEX_DEFAULTS = {
  approvalPolicy: 'on-request',
  allowLoginShell: true,
  cliAuthCredentialsStore: 'file',
  modelInstructionsFile: './instruction.md',
  sandboxMode: 'workspace-write',
  webSearch: 'cached',
};

const CODEX_PROFILE_MARKER = '# code-abyss managed Codex profile';

const CODEX_PROFILE_FILES = {
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

// ── TOML 行级解析（限制说明）──
// 本模块使用手擀行级解析，仅覆盖 code-abyss 自己生成/维护的最简 TOML 形状：
// - 单/数组表头 `[x]` / `[[x]]`
// - 裸键赋值 `key = value`（不支持引号键、点键、内联表、多行字符串）
// 若用户 config.toml 含上述复杂结构，解析器会保守回退（不移除/不重排），
// 但仍可能在极端情况下误判。建议：复杂配置由用户手工维护，安装器只处理默认键。

function isTableHeader(line) {
  return /^\s*\[\[[^\]]+\]\]\s*$/.test(line) || /^\s*\[[^\]]+\]\s*$/.test(line);
}

function isProfileTableHeader(line) {
  return /^\s*\[\[?profiles\.[^\]]+\]\]?\s*$/.test(line);
}

function isAssignmentForKey(line, key) {
  const re = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=`);
  return re.test(line);
}

// 跟踪 TOML 多行字符串状态，避免把字符串内容当成真实键。
function hasRootKey(content, key) {
  const lines = content.split(/\r?\n/);
  let inRoot = true;
  let inMultiLineString = false;

  for (const line of lines) {
    if (isTableHeader(line)) {
      inRoot = false;
      continue;
    }
    if (/^\s*"""/.test(line)) {
      inMultiLineString = !inMultiLineString;
      continue;
    }
    if (inMultiLineString) continue;
    if (inRoot && isAssignmentForKey(line, key)) {
      return true;
    }
  }
  return false;
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
  let inMultiLineString = false;
  let removed = false;

  for (const line of lines) {
    if (isTableHeader(line)) {
      scope = isProfileTableHeader(line) ? 'profile' : 'other';
      kept.push(line);
      continue;
    }
    if (/^\s*"""/.test(line)) {
      inMultiLineString = !inMultiLineString;
      kept.push(line);
      continue;
    }
    if (inMultiLineString) {
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
  const anySectionRe = /^\s*\[\[[^\]]+\]\]\s*$|^\s*\[[^\]]+\]\s*$/;
  let inSection = false;
  let inMultiLineString = false;
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
    if (/^\s*"""/.test(line)) {
      inMultiLineString = !inMultiLineString;
      kept.push(line);
      continue;
    }
    if (inMultiLineString) {
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

function parseSimpleTomlAssignments(lines) {
  const values = {};
  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (!m) return null;
    values[m[1]] = m[2].trim();
  }
  return values;
}

function isLegacyManagedProfileBlock(block, profileName) {
  const expected = CODEX_PROFILE_FILES[profileName];
  if (!expected) return false;
  const values = parseSimpleTomlAssignments(block.lines);
  if (!values) return false;
  const keys = Object.keys(values).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (keys.length !== expectedKeys.length) return false;
  return expectedKeys.every((key, index) => keys[index] === key && values[key] === expected[key]);
}

function removeLegacyManagedProfileSections(content) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const blocks = splitTomlBlocks(content);
  const kept = [];
  const removed = [];

  for (const block of blocks) {
    const m = block.header && block.header.match(/^\[profiles\.([A-Za-z0-9_-]+)\]$/);
    if (m && isLegacyManagedProfileBlock(block, m[1])) {
      removed.push(`profiles.${m[1]}`);
      continue;
    }
    kept.push(...block.lines);
  }

  return { merged: kept.join(eol), removed };
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

  const legacyProfiles = removeLegacyManagedProfileSections(merged);
  merged = legacyProfiles.merged;
  removed.push(...legacyProfiles.removed);

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

  return { merged, added };
}

function patchCodexConfig(cfgPath) {
  const raw = fs.readFileSync(cfgPath, 'utf8');
  const { merged: cleaned, removed, migrated } = cleanupLegacyCodexConfig(raw);
  const { merged: mergedDefaults, added } = mergeCodexConfigDefaults(cleaned);

  if (mergedDefaults !== raw) fs.writeFileSync(cfgPath, mergedDefaults);
  return { added, removed, migrated };
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

// ── abyss 联动残留剥除（Agent OS v5 / V5-1）──
// Graph hook **注入** production 主入口：`abyss attach codex`（abyss CLI）。
// 本文件只负责：安装/卸载时剥除历史 code-abyss 写入的 marker hook 与
// [mcp_servers.abyss] 节，避免 stale 路径 bash 127。
//
// Codex 0.125+ hook shape（供 strip 识别 / 测试 fixture）：
//   [[hooks.SessionStart]] + [[hooks.SessionStart.hooks]]
//   [[hooks.PreToolUse]] + [[hooks.PreToolUse.hooks]]

const { HOOK_MARKER: ABYSS_HOOK_MARKER } = require(path.join(__dirname, '..', 'lib', 'abyss-integration.js'));

function upsertKeyInSection(content, sectionName, key, valueLiteral, eol) {
  const removed = removeKeyAssignmentsInSection(content, sectionName, key);
  return ensureKeyInSection(removed.merged, sectionName, key, valueLiteral, eol).merged;
}

// TOML basic string 里 \ 是转义符，统一用正斜杠（bash 在 Windows 下也认）
function tomlPath(p) {
  return p.split(path.sep).join('/');
}

// 任意 TOML 表头：既配 [section] 也配 [[array.of.tables]]
const ANY_TOML_HEADER_RE = /^\s*\[\[[^\]]+\]\]\s*$|^\s*\[[^\]]+\]\s*$/;
// hook 事件级表头（不含 .hooks 子表），捕获事件名；允许字母数字下划线与尾随空格
const HOOK_EVENT_HEADER_RE = /^\s*\[\[?\s*hooks\.([A-Za-z0-9_]+)\s*\]\]?\s*$/;

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

function renderCodexProfileFile(profileName, eol = '\n') {
  const values = CODEX_PROFILE_FILES[profileName];
  if (!values) throw new Error(`unknown Codex profile: ${profileName}`);
  return [
    `${CODEX_PROFILE_MARKER}: ${profileName}`,
    ...Object.entries(values).map(([key, value]) => `${key} = ${value}`),
    '',
  ].join(eol);
}

function hasManifestEntry(manifest, root, relPath) {
  return (manifest.installed || []).some((entry) =>
    (typeof entry === 'string' && root === 'codex' && entry === relPath)
    || (entry && typeof entry === 'object' && (entry.root || 'codex') === root && entry.path === relPath)
  );
}

function markCodexInstalled(ctx, relPath) {
  if (!ctx || !ctx.manifest) return;
  if (!hasManifestEntry(ctx.manifest, 'codex', relPath)) {
    ctx.manifest.installed.push({ root: 'codex', path: relPath });
  }
}

function flushCodexManifest(ctx) {
  if (ctx && ctx.manifest && ctx.manifestPath) {
    fs.writeFileSync(ctx.manifestPath, JSON.stringify(ctx.manifest, null, 2) + '\n');
  }
}

function trackCodexConfig(ctx, cfgPath) {
  if (!ctx || !ctx.manifest) return;
  if (ctx.backupManagedPath) {
    ctx.backupManagedPath('codex', 'config.toml', cfgPath, 'config.toml');
  }
  markCodexInstalled(ctx, 'config.toml');
}

function ensureCodexProfileFiles({
  HOME,
  ctx = null,
  ok = () => {},
  info = () => {},
  warn = () => {},
}) {
  const codexDir = ctx && ctx.targetDir ? ctx.targetDir : path.join(HOME, '.codex');
  fs.mkdirSync(codexDir, { recursive: true });
  const installed = [];
  const managed = [];
  const skipped = [];

  for (const profileName of Object.keys(CODEX_PROFILE_FILES)) {
    const relPath = `${profileName}.config.toml`;
    const targetPath = path.join(codexDir, relPath);
    const content = renderCodexProfileFile(profileName);
    let shouldWrite = true;

    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, 'utf8');
      if (!raw.includes(CODEX_PROFILE_MARKER)) {
        skipped.push(relPath);
        shouldWrite = false;
      } else if (raw === content) {
        shouldWrite = false;
        managed.push(relPath);
      }
    }

    if (!shouldWrite) continue;

    try {
      fs.writeFileSync(targetPath, content);
      installed.push(relPath);
      managed.push(relPath);
    } catch (e) {
      warn(`Codex profile 写入失败: ${relPath}: ${e.message}`);
    }
  }

  if (ctx && ctx.manifest) {
    for (const relPath of managed) {
      markCodexInstalled(ctx, relPath);
    }
    if (managed.length > 0) flushCodexManifest(ctx);
  }

  if (installed.length > 0) ok(`Codex profiles → ${installed.join(', ')}`);
  if (skipped.length > 0) info(`保留已有 Codex profile: ${skipped.join(', ')}`);
  return { installed, managed, skipped };
}

// 参考 shape（安装器不写）：客户端自管 MCP 时可用
function injectCodexMcp(content, abyssBinPath, eol) {
  const cmd = `"${tomlPath(abyssBinPath || 'abyss')}"`;
  let merged = upsertKeyInSection(content, 'mcp_servers.abyss', 'command', cmd, eol);
  merged = upsertKeyInSection(merged, 'mcp_servers.abyss', 'args', '["mcp"]', eol);
  return merged;
}

// 卸载/重装用：剥除带标记的 hook 组（含 [[hooks.X]] + [[hooks.X.hooks]]）与 [mcp_servers.abyss] 节
function stripCodexAbyssIntegration(content) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const blocks = splitTomlBlocks(content);

  const kept = [];
  let removed = false;
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.header && /^\s*\[\s*mcp_servers\.abyss\s*\]\s*$/.test(b.header)) { removed = true; i++; continue; }
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

// 安装期：只剥除历史 code-abyss 写入的 abyss hooks/MCP，从不注入（→ abyss attach codex）
function stripLegacyCodexAbyssFromConfig(cfgPath) {
  if (!fs.existsSync(cfgPath)) return { removed: false };
  const raw = fs.readFileSync(cfgPath, 'utf8');
  const { merged, removed } = stripCodexAbyssIntegration(raw);
  if (removed && merged !== raw) fs.writeFileSync(cfgPath, merged);
  return { removed };
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

function reportAbyssIntegration({ cfgPath, info, warn }) {
  try {
    const r = stripLegacyCodexAbyssFromConfig(cfgPath);
    if (r.removed) {
      info('abyss hooks/MCP → 已剥除旧 code-abyss 条目（请用 abyss attach codex）');
    }
  } catch (e) {
    warn(`abyss 残留剥除失败: ${e.message}`);
  }
}

async function postCodex({
  ctx = null,
  autoYes,
  HOME,
  PKG_ROOT,
  step,
  ok,
  warn,
  info,
  c,
}) {
  const cfgPath = path.join(HOME, '.codex', 'config.toml');
  const exists = fs.existsSync(cfgPath);
  trackCodexConfig(ctx, cfgPath);

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
        info('默认值已对齐当前 Codex 样例；如需开放沙箱，可切到 `codex --profile full_access`');
      }
    } else {
      patchAndReportCodexDefaults({ cfgPath, ok, warn });
    }
    ensureCodexProfileFiles({ HOME, ctx, ok, info, warn });
    reportAbyssIntegration({ cfgPath, info, warn });
    flushCodexManifest(ctx);
    return;
  }

  if (!exists) {
    warn('未检测到 ~/.codex/config.toml');
    const { confirm } = await loadInquirerPrompts();
    const doWrite = await confirm({ message: '写入推荐 config.toml (含自定义 provider 模板)?', default: true });
    if (doWrite) {
      const src = path.join(PKG_ROOT, 'config', 'codex-config.example.toml');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, cfgPath);
        ok('写入: ~/.codex/config.toml');
        info('默认值已对齐当前 Codex 样例；如需开放沙箱，可切到 `codex --profile full_access`');
      }
    }
  } else {
    patchAndReportCodexDefaults({ cfgPath, ok, warn });
  }
  ensureCodexProfileFiles({ HOME, ctx, ok, info, warn });
  reportAbyssIntegration({ cfgPath, info, warn });
  flushCodexManifest(ctx);
}

module.exports = {
  cleanupLegacyCodexConfig,
  cleanupLegacyCodexRuntime,
  mergeCodexConfigDefaults,
  patchCodexConfig,
  patchCodexConfigDefaults,
  injectCodexMcp,
  ensureCodexProfileFiles,
  stripCodexAbyssIntegration,
  stripLegacyCodexAbyssFromConfig,
  detectCodexAuth,
  getCodexCoreFiles,
  postCodex,
};

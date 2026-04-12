'use strict';

const fs = require('fs');
const path = require('path');
const { getPackHostFiles } = require(path.join(__dirname, '..', 'lib', 'pack-registry.js'));

const PROJECT_ROOT = path.join(__dirname, '..', '..');

const CODEX_DEFAULTS = {
  approvalPolicy: 'on-request',
  allowLoginShell: true,
  cliAuthCredentialsStore: 'file',
  modelInstructionsFile: './instruction.md',
  sandboxMode: 'read-only',
  webSearch: 'cached',
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

async function postCodex({
  autoYes,
  HOME,
  PKG_ROOT,
  step,
  ok,
  warn,
  info,
  c
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
        info('默认值已对齐当前 Codex 样例；如需高自动化全开，可切到 `codex -p abyss`');
      }
    } else {
      patchAndReportCodexDefaults({ cfgPath, ok, warn });
    }
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
        info('默认值已对齐当前 Codex 样例；如需高自动化全开，可切到 `codex -p abyss`');
      }
    }
  } else {
    patchAndReportCodexDefaults({ cfgPath, ok, warn });
  }
}

module.exports = {
  cleanupLegacyCodexConfig,
  mergeCodexConfigDefaults,
  patchCodexConfig,
  patchCodexConfigDefaults,
  detectCodexAuth,
  getCodexCoreFiles,
  postCodex,
};

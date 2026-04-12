'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const {
  copyRecursive,
  rmSafe,
} = require('./utils');
const { getPack } = require('./pack-registry');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const GSTACK_RUNTIME_EXTRA_DIRS = new Set(['references', 'templates', 'specialists', 'bin', 'migrations', 'vendor']);
const GSTACK_FRONTMATTER_DESCRIPTION_LIMIT = 240;

function getGstackConfig(hostName = 'codex', projectRoot = PROJECT_ROOT) {
  const manifest = getPack(projectRoot, 'gstack');
  const hostConfig = manifest.hosts && manifest.hosts[hostName];
  if (!manifest.upstream || !hostConfig) {
    throw new Error(`gstack pack manifest 缺少 upstream 或 ${hostName} host 配置`);
  }
  return {
    upstream: manifest.upstream,
    sourceOverrideEnv: hostConfig.sourceOverrideEnv || 'CODE_ABYSS_GSTACK_SOURCE',
    skipSkills: new Set(hostConfig.skipSkills || []),
    runtimeDirs: hostConfig.runtimeDirs || [],
    runtimeFiles: hostConfig.runtimeFiles || [],
    pathRewrites: hostConfig.pathRewrites || [],
    commandAliases: hostConfig.commandAliases || {},
  };
}

function readFrontmatterBlock(content) {
  const fmStart = content.indexOf('---\n');
  if (fmStart !== 0) return null;
  const fmEnd = content.indexOf('\n---', fmStart + 4);
  if (fmEnd === -1) return null;
  return {
    raw: content.slice(fmStart + 4, fmEnd),
    body: content.slice(fmEnd + 4),
  };
}

function extractNameAndDescription(content) {
  const block = readFrontmatterBlock(content);
  if (!block) return { name: '', description: '' };

  const nameMatch = block.raw.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : '';

  let description = '';
  const lines = block.raw.split('\n');
  let inDescription = false;
  const descLines = [];

  for (const line of lines) {
    if (/^description:\s*\|?\s*$/.test(line)) {
      inDescription = true;
      continue;
    }
    if (/^description:\s*\S/.test(line)) {
      description = line.replace(/^description:\s*/, '').trim();
      break;
    }
    if (inDescription) {
      if (line === '' || /^\s/.test(line)) {
        descLines.push(line.replace(/^  /, ''));
      } else {
        break;
      }
    }
  }

  if (descLines.length > 0) description = descLines.join('\n').trim();
  return { name, description };
}

function buildCodexFrontmatter(name, description) {
  const safeName = name.trim();
  const safeDesc = condenseDescription(description, GSTACK_FRONTMATTER_DESCRIPTION_LIMIT);
  const indented = safeDesc.split('\n').map((line) => `  ${line}`).join('\n');
  return `---\nname: ${safeName}\ndescription: |\n${indented}\n---`;
}

function condenseDescription(description, limit) {
  const firstParagraph = description.split(/\n\s*\n/)[0] || description;
  const collapsed = firstParagraph.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= limit) return collapsed;
  const truncated = collapsed.slice(0, limit - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  const safe = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe}...`;
}

function injectRuntimeRootPreamble(content) {
  const marker = '```bash\n';
  const idx = content.indexOf(marker);
  if (idx === -1 || content.includes('GSTACK_ROOT=')) return content;

  const injected = [
    '_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)',
    'GSTACK_ROOT="$HOME/.agents/skills/gstack"',
    '[ -n "$_ROOT" ] && [ -d "$_ROOT/.agents/skills/gstack" ] && GSTACK_ROOT="$_ROOT/.agents/skills/gstack"',
    'GSTACK_BIN="$GSTACK_ROOT/bin"',
    'GSTACK_BROWSE="$GSTACK_ROOT/browse/dist"',
    'GSTACK_DESIGN="$GSTACK_ROOT/design/dist"',
  ].join('\n');

  return `${content.slice(0, idx + marker.length)}${injected}\n${content.slice(idx + marker.length)}`;
}

function rewritePaths(content) {
  return getGstackConfig().pathRewrites.reduce((current, [from, to]) => current.split(from).join(to), content);
}

function transformGstackSkillContent(content) {
  const parsed = extractNameAndDescription(content);
  if (!parsed.name || !parsed.description) {
    throw new Error('gstack skill frontmatter 缺少 name 或 description');
  }

  const block = readFrontmatterBlock(content);
  const stripped = `${buildCodexFrontmatter(parsed.name, parsed.description)}${block ? block.body : content}`;
  return injectRuntimeRootPreamble(rewritePaths(stripped));
}

function listTopLevelSkillDirs(sourceRoot, hostName = 'codex') {
  const config = getGstackConfig(hostName);
  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(sourceRoot, name, 'SKILL.md')))
    .filter((name) => !config.skipSkills.has(name))
    .sort();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function resolveLocalGstackSource(projectRoot, env, sourceOverrideEnv) {
  if (env[sourceOverrideEnv]) return env[sourceOverrideEnv];
  if (!projectRoot) return null;

  const candidates = [
    path.join(projectRoot, '.code-abyss', 'vendor', 'gstack'),
    path.join(projectRoot, 'vendor', 'gstack'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function backupExistingGstack(destPath, backupDir, manifest, info) {
  if (!fs.existsSync(destPath)) return false;

  const backupPath = path.join(backupDir, 'agents', 'skills', 'gstack');
  rmSafe(backupPath);
  copyRecursive(destPath, backupPath);
  manifest.backups.push({ root: 'agents', path: 'skills/gstack' });
  info('备份: agents/skills/gstack');
  return true;
}

function syncPinnedRepo(targetDir) {
  const { upstream } = getGstackConfig();
  rmSafe(targetDir);
  ensureDir(path.dirname(targetDir));

  const clone = spawnSync('git', ['clone', '--depth', '1', upstream.repo, targetDir], {
    encoding: 'utf8',
  });
  if (clone.status !== 0) {
    throw new Error(`gstack clone 失败: ${(clone.stderr || clone.stdout || '').trim()}`);
  }

  const checkout = spawnSync('git', ['-C', targetDir, 'fetch', '--depth', '1', 'origin', upstream.commit], {
    encoding: 'utf8',
  });
  if (checkout.status !== 0) {
    throw new Error(`gstack fetch commit 失败: ${(checkout.stderr || checkout.stdout || '').trim()}`);
  }

  const detach = spawnSync('git', ['-C', targetDir, 'checkout', '--detach', upstream.commit], {
    encoding: 'utf8',
  });
  if (detach.status !== 0) {
    throw new Error(`gstack checkout 失败: ${(detach.stderr || detach.stdout || '').trim()}`);
  }
}

function ensurePinnedGstackSource({ HOME, env = process.env, warn = () => {} }) {
  const config = getGstackConfig();
  const override = env[config.sourceOverrideEnv];
  if (override) return override;

  const cacheDir = path.join(HOME, '.code-abyss', 'vendor', `gstack-${config.upstream.commit.slice(0, 12)}`);
  const versionFile = path.join(cacheDir, '.code-abyss-source-version');

  try {
    if (!fs.existsSync(cacheDir) || !fs.existsSync(versionFile) || fs.readFileSync(versionFile, 'utf8').trim() !== config.upstream.commit) {
      syncPinnedRepo(cacheDir);
      fs.writeFileSync(versionFile, `${config.upstream.commit}\n`);
    }
    return cacheDir;
  } catch (error) {
    warn(`获取 gstack 失败，跳过自动融合: ${error.message}`);
    return null;
  }
}

function resolveGstackSource({
  HOME,
  env = process.env,
  warn = () => {},
  sourceMode = 'pinned',
  projectRoot = null,
  hostName = 'codex',
  fallback = false,
}) {
  const config = getGstackConfig(hostName);
  if (sourceMode === 'disabled') return { sourceRoot: null, mode: 'disabled', reason: 'disabled' };

  const localRoot = resolveLocalGstackSource(projectRoot, env, config.sourceOverrideEnv);

  if (sourceMode === 'local') {
    if (!localRoot) {
      if (fallback) {
        const pinnedRoot = ensurePinnedGstackSource({ HOME, env, warn });
        if (pinnedRoot) {
          return { sourceRoot: pinnedRoot, mode: 'pinned', reason: 'fallback-local-to-pinned' };
        }
      }
      warn('gstack source=local，但未找到本地源（.code-abyss/vendor/gstack 或 env override）');
      return { sourceRoot: null, mode: 'local', reason: 'missing-local-source' };
    }
    return { sourceRoot: localRoot, mode: 'local', reason: null };
  }

  const pinnedRoot = ensurePinnedGstackSource({ HOME, env, warn });
  if (pinnedRoot) return { sourceRoot: pinnedRoot, mode: 'pinned', reason: null };
  if (fallback && localRoot) {
    return { sourceRoot: localRoot, mode: 'local', reason: 'fallback-pinned-to-local' };
  }
  return { sourceRoot: null, mode: 'pinned', reason: 'fetch-failed' };
}

function copyRuntimeAssets(sourceRoot, destRoot) {
  const config = getGstackConfig();

  config.runtimeDirs.forEach((dirName) => {
    const src = path.join(sourceRoot, dirName);
    if (!fs.existsSync(src)) return;
    copyRecursive(src, path.join(destRoot, dirName));
  });

  config.runtimeFiles.forEach((fileName) => {
    const src = path.join(sourceRoot, fileName);
    if (!fs.existsSync(src)) return;
    copyRecursive(src, path.join(destRoot, fileName));
  });
}

function copySkillRuntimeFiles(sourceSkillDir, destSkillDir, { transformSkill = null } = {}) {
  ensureDir(destSkillDir);
  rmSafe(path.join(destSkillDir, 'SKILL.md.tmpl'));
  const sourceSkillPath = path.join(sourceSkillDir, 'SKILL.md');
  if (!fs.existsSync(sourceSkillPath)) return;

  const content = fs.readFileSync(sourceSkillPath, 'utf8');
  fs.writeFileSync(
    path.join(destSkillDir, 'SKILL.md'),
    typeof transformSkill === 'function' ? transformSkill(content) : content
  );

  fs.readdirSync(sourceSkillDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === 'SKILL.md' || entry.name === 'SKILL.md.tmpl') return;
    if (!entry.isDirectory()) return;
    if (!GSTACK_RUNTIME_EXTRA_DIRS.has(entry.name)) return;
    copyRecursive(path.join(sourceSkillDir, entry.name), path.join(destSkillDir, entry.name));
  });
}

function installNestedSkill(sourceSkillDir, destSkillDir) {
  copySkillRuntimeFiles(sourceSkillDir, destSkillDir, {
    transformSkill: transformGstackSkillContent,
  });
}

function installGstackCodexPack({
  HOME,
  backupDir,
  manifest,
  info = () => {},
  ok = () => {},
  warn = () => {},
  env = process.env,
  sourceMode = 'pinned',
  projectRoot = null,
  fallback = false,
}) {
  const resolved = resolveGstackSource({ HOME, env, warn, sourceMode, projectRoot, hostName: 'codex', fallback });
  const sourceRoot = resolved.sourceRoot;
  if (!sourceRoot) return { installed: false, sourceMode: resolved.mode, reason: resolved.reason };
  const config = getGstackConfig();

  const destRoot = path.join(HOME, '.agents', 'skills', 'gstack');
  backupExistingGstack(destRoot, backupDir, manifest, info);

  rmSafe(destRoot);
  ensureDir(destRoot);

  const rootSkillPath = path.join(sourceRoot, 'SKILL.md');
  if (!fs.existsSync(rootSkillPath)) {
    warn('gstack 根技能缺失，跳过自动融合');
    return { installed: false, sourceMode: resolved.mode, reason: 'missing-root-skill' };
  }

  fs.writeFileSync(path.join(destRoot, 'SKILL.md'), transformGstackSkillContent(fs.readFileSync(rootSkillPath, 'utf8')));
  copyRuntimeAssets(sourceRoot, destRoot);

  listTopLevelSkillDirs(sourceRoot).forEach((skillDir) => {
    installNestedSkill(path.join(sourceRoot, skillDir), path.join(destRoot, skillDir));
  });

  manifest.installed.push({ root: 'agents', path: 'skills/gstack' });
  ok(`agents/skills/gstack ${config.upstream.version ? `(gstack ${config.upstream.version})` : ''}`);
  return { installed: true, sourceMode: resolved.mode, reason: null };
}

module.exports = {
  getGstackConfig,
  extractNameAndDescription,
  condenseDescription,
  transformGstackSkillContent,
  listTopLevelSkillDirs,
  ensurePinnedGstackSource,
  resolveGstackSource,
  copySkillRuntimeFiles,
  installGstackCodexPack,
};

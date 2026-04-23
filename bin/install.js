#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const pkg = require(path.join(__dirname, '..', 'package.json'));
const VERSION = pkg.version;
const HOME = os.homedir();

// ── Node.js 版本检查 ──
const MIN_NODE = pkg.engines?.node?.match(/(\d+)/)?.[1] || '18';
if (parseInt(process.versions.node) < parseInt(MIN_NODE)) {
  console.error(`\x1b[31m✘ 需要 Node.js >= ${MIN_NODE}，当前: ${process.versions.node}\x1b[0m`);
  process.exit(1);
}
const PKG_ROOT = fs.realpathSync(path.join(__dirname, '..'));
const AUTHORITATIVE_SKILLS_DIR = path.join(PKG_ROOT, 'personal-skill-system', 'skills');
const { shouldSkip, copyRecursive, rmSafe, deepMergeNew, printMergeLog, formatActionableError } =
  require(path.join(__dirname, 'lib', 'utils.js'));
const {
  collectInvocableSkills,
} = require(path.join(__dirname, 'lib', 'skill-registry.js'));
const {
  resolveProjectPacks,
  selectProjectPacksForInstall,
  readProjectPackLock,
} = require(path.join(__dirname, 'lib', 'pack-registry.js'));
const { syncProjectBootstrapArtifacts } = require(path.join(__dirname, 'lib', 'pack-bootstrap.js'));
const { writeReportArtifact } = require(path.join(__dirname, 'lib', 'pack-reports.js'));
const {
  listInstallTargets,
  listTargetNames,
  isSupportedTarget,
  getManagedRootRelativeDir,
  formatTargetList,
} = require(path.join(__dirname, 'lib', 'target-registry.js'));
const {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  listPersonas,
  getDefaultPersona,
  resolvePersona,
  readPersonaContent,
  renderCodexAgents,
  renderGeminiContext,
} = require(path.join(__dirname, 'lib', 'style-registry.js'));
const { detectCcstatusline, installCcstatusline } = require(path.join(__dirname, 'lib', 'ccstatusline.js'));
const { installGstackClaudePack } = require(path.join(__dirname, 'lib', 'gstack-claude.js'));
const { installGstackGeminiPack } = require(path.join(__dirname, 'lib', 'gstack-gemini.js'));

const { installGstackCodexPack } = require(path.join(__dirname, 'lib', 'gstack-codex.js'));
const {
  cleanupLegacyCodexRuntime,
  detectCodexAuth: detectCodexAuthImpl,
  getCodexCoreFiles,
  postCodex: postCodexFlow,
} = require(path.join(__dirname, 'adapters', 'codex.js'));
const {
  SETTINGS_TEMPLATE,
  getClaudeCoreFiles,
  detectClaudeAuth: detectClaudeAuthImpl,
  postClaude: postClaudeFlow,
} = require(path.join(__dirname, 'adapters', 'claude.js'));
const {
  GEMINI_SETTINGS_TEMPLATE,
  getGeminiCoreFiles,
  detectGeminiAuth: detectGeminiAuthImpl,
  postGemini: postGeminiFlow,
} = require(path.join(__dirname, 'adapters', 'gemini.js'));

// ── ANSI ──

const c = {
  b: s => `\x1b[1m${s}\x1b[0m`,
  d: s => `\x1b[2m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`,
  grn: s => `\x1b[32m${s}\x1b[0m`,
  ylw: s => `\x1b[33m${s}\x1b[0m`,
  blu: s => `\x1b[34m${s}\x1b[0m`,
  mag: s => `\x1b[35m${s}\x1b[0m`,
  cyn: s => `\x1b[36m${s}\x1b[0m`,
};

function banner() {
  console.log(c.mag(`
   ██████╗ ██████╗ ██████╗ ███████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝
  ██║     ██║   ██║██║  ██║█████╗
  ██║     ██║   ██║██║  ██║██╔══╝
  ╚██████╗╚██████╔╝██████╔╝███████╗
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
   █████╗ ██████╗ ██╗   ██╗███████╗███████╗
  ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔════╝██╔════╝
  ███████║██████╔╝ ╚████╔╝ ███████╗███████╗
  ██╔══██║██╔══██╗  ╚██╔╝  ╚════██║╚════██║
  ██║  ██║██████╔╝   ██║   ███████║███████║
  ╚═╝  ╚═╝╚═════╝    ╚═╝   ╚══════╝╚══════╝`));
  console.log(c.d(`  ☠ 邪修红尘仙 · 宿命深渊  v${VERSION}\n`));
}

function divider(title) {
  const line = '─'.repeat(44);
  const pad = ' '.repeat(Math.max(0, 43 - title.length));
  console.log(`\n${c.d('┌' + line + '┐')}`);
  console.log(`${c.d('│')} ${c.b(title)}${pad}${c.d('│')}`);
  console.log(`${c.d('└' + line + '┘')}`);
}

function step(n, total, msg) { console.log(`\n  ${c.cyn(`[${n}/${total}]`)} ${c.b(msg)}`); }
function ok(msg) { console.log(`  ${c.grn('✔')} ${msg}`); }
function warn(msg) { console.log(`  ${c.ylw('⚠')} ${msg}`); }
function info(msg) { console.log(`  ${c.blu('ℹ')} ${msg}`); }
function fail(msg) { console.log(`  ${c.red('✘')} ${msg}`); }

// ── 认证 ──

function detectClaudeAuth(settings) {
  return detectClaudeAuthImpl({ settings, HOME, warn });
}

function detectCodexAuth() {
  return detectCodexAuthImpl({ HOME, warn });
}

function detectGeminiAuth(settings) {
  return detectGeminiAuthImpl({ settings, HOME, warn });
}

function resolveManagedRootDir(tgt, rootName = tgt) {
  return path.join(HOME, getManagedRootRelativeDir(rootName));
}

function normalizeManifestEntry(entry, defaultRoot) {
  if (typeof entry === 'string') return { root: defaultRoot, path: entry };
  if (entry && typeof entry === 'object' && typeof entry.path === 'string') {
    return { root: entry.root || defaultRoot, path: entry.path };
  }
  throw new Error('manifest 条目格式无效');
}

function pushManifestEntry(list, rootName, relPath) {
  list.push({ root: rootName, path: relPath });
}

function pushPackReport(manifest, report) {
  if (!manifest.pack_reports) manifest.pack_reports = [];
  manifest.pack_reports.push(report);
}

function resolveEffectivePackSource(sourceMode, installResult) {
  return (installResult && installResult.sourceMode) || sourceMode || 'pinned';
}

function manifestLabel(entry, defaultRoot) {
  const normalized = normalizeManifestEntry(entry, defaultRoot);
  return normalized.root === defaultRoot
    ? normalized.path
    : `${normalized.root}/${normalized.path}`;
}

// ── CLI 参数 ──

const args = process.argv.slice(2);
let target = null;
let uninstallTarget = null;
let autoYes = false;
let listStylesOnly = false;
let listPersonasOnly = false;
let requestedStyleSlug = null;
let requestedPersonaSlug = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) { target = args[++i]; }
  else if (args[i] === '--uninstall' && args[i + 1]) { uninstallTarget = args[++i]; }
  else if (args[i] === '--style' && args[i + 1]) { requestedStyleSlug = args[++i]; }
  else if (args[i] === '--persona' && args[i + 1]) { requestedPersonaSlug = args[++i]; }
  else if (args[i] === '--list-styles') { listStylesOnly = true; }
  else if (args[i] === '--list-personas') { listPersonasOnly = true; }
  else if (args[i] === '--yes' || args[i] === '-y') { autoYes = true; }
  else if (args[i] === '--help' || args[i] === '-h') {
    banner();
    console.log(`${c.b('用法:')}  npx code-abyss [选项]

${c.b('选项:')}
  --target ${c.cyn(`<${formatTargetList('|')}>`)}      安装目标
  --uninstall ${c.cyn(`<${formatTargetList('|')}>`)}   卸载目标
  --style ${c.cyn('<slug>')}               指定输出风格
  --persona ${c.cyn('<slug>')}             指定人格预设
  --list-styles               列出可用输出风格
  --list-personas             列出可用人格预设
  --yes, -y                    全自动模式
  --help, -h                   显示帮助

${c.b('示例:')}
  npx code-abyss                        ${c.d('# 交互菜单')}
  npx code-abyss --list-styles           ${c.d('# 查看可用风格')}
  npx code-abyss --target claude -y      ${c.d('# 零配置一键安装')}
  npx code-abyss --target codex --style scholar-classic -y
                                   ${c.d('# 指定风格安装')}
  npx code-abyss --uninstall claude      ${c.d('# 直接卸载')}
`);
    process.exit(0);
  }
}

// ── 卸载 ──

function runUninstall(tgt) {
  if (!isSupportedTarget(tgt)) {
    fail(formatActionableError(`--uninstall 必须是 ${listTargetNames().join('、')}`, 'Try: npx code-abyss --uninstall claude'));
    process.exit(1);
  }
  const targetDir = resolveManagedRootDir(tgt);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) { fail(`未找到安装记录: ${manifestPath}`); process.exit(1); }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.manifest_version && manifest.manifest_version > 2) {
    fail(`manifest 版本 ${manifest.manifest_version} 不兼容，请升级 code-abyss 后再卸载`);
    process.exit(1);
  }
  divider(`卸载 Code Abyss v${manifest.version}`);
  if (Array.isArray(manifest.pack_reports) && manifest.pack_reports.length > 0) {
    console.log(`  ${c.b('Packs:')}`);
    manifest.pack_reports.forEach((report) => {
      const source = report.source ? ` source=${report.source}` : '';
      const reason = report.reason ? ` reason=${report.reason}` : '';
      console.log(`    ${report.pack}@${report.host} ${report.status || 'installed'}${source}${reason}`);
    });
  }

  (manifest.installed || []).forEach((entry) => {
    const normalized = normalizeManifestEntry(entry, tgt);
    const installRoot = resolveManagedRootDir(tgt, normalized.root);
    const targetPath = path.join(installRoot, normalized.path);
    if (fs.existsSync(targetPath)) {
      rmSafe(targetPath);
      console.log(`  ${c.red('✘')} ${manifestLabel(entry, tgt)}`);
    }
  });
  (manifest.backups || []).forEach((entry) => {
    const normalized = normalizeManifestEntry(entry, tgt);
    const backupPath = path.join(backupDir, normalized.root, normalized.path);
    const legacyBackupPath = path.join(backupDir, normalized.path);
    const sourcePath = fs.existsSync(backupPath) ? backupPath : legacyBackupPath;
    const restoreRoot = resolveManagedRootDir(tgt, normalized.root);
    const restorePath = path.join(restoreRoot, normalized.path);
    if (fs.existsSync(sourcePath)) {
      fs.mkdirSync(path.dirname(restorePath), { recursive: true });
      fs.renameSync(sourcePath, restorePath);
      ok(`恢复: ${manifestLabel(entry, tgt)}`);
    }
  });

  rmSafe(backupDir);
  const us = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(us)) fs.unlinkSync(us);
  console.log('');
  ok(c.b('卸载完成\n'));
}

// ── 安装核心 ──

function scanInvocableSkills(skillsDir) {
  return collectInvocableSkills(skillsDir);
}

const CLAUDE_COMMAND_TARGET = {
  dir: 'commands',
  label: '斜杠命令',
  skillRoot: '~/.claude/skills',
};

const GEMINI_COMMAND_TARGET = {
  dir: 'commands',
  label: 'Gemini commands',
  skillRoot: '~/.gemini/skills',
};

function getSkillPath(skillRoot, skillRelPath) {
  const normalizedRelPath = skillRelPath
    ? String(skillRelPath).split(path.sep).join('/')
    : '';
  return normalizedRelPath
    ? `${skillRoot}/${normalizedRelPath}/SKILL.md`
    : `${skillRoot}/SKILL.md`;
}

function getSkillScriptPath(skillRoot, skillRelPath) {
  const normalizedRelPath = skillRelPath
    ? String(skillRelPath).split(path.sep).join('/')
    : '';
  return normalizedRelPath
    ? `${skillRoot}/${normalizedRelPath}/scripts/run.js`
    : `${skillRoot}/scripts/run.js`;
}

function buildCommandFrontmatter(skill) {
  const desc = (skill.description || '').replace(/"/g, '\\"');
  const argHint = skill.argumentHint;
  const tools = Array.isArray(skill.allowedTools)
    ? skill.allowedTools.join(', ')
    : (skill.allowedTools || 'Read');
  const lines = ['---', `name: ${skill.name}`, `description: "${desc}"`];

  if (argHint) lines.push(`argument-hint: "${argHint}"`);
  lines.push(`allowed-tools: ${tools}`);
  lines.push('---', '');
  return lines;
}

function buildClaudeCommandSpec(skill) {
  const runtimeType = skill.runtimeType || 'knowledge';
  const allowedTools = Array.isArray(skill.allowedTools)
    ? skill.allowedTools.join(', ')
    : (skill.allowedTools || 'Read');
  return {
    name: skill.name,
    description: skill.description,
    argumentHint: skill.argumentHint || '',
    allowedTools,
    relPath: skill.relPath,
    runtimeType,
    scriptRunner: `node ${getSkillScriptPath(CLAUDE_COMMAND_TARGET.skillRoot, skill.relPath)} $ARGUMENTS`,
    skillPath: getSkillPath(CLAUDE_COMMAND_TARGET.skillRoot, skill.relPath),
  };
}

function buildClaudeBody(spec) {
  const lines = [];
  if (spec.runtimeType === 'scripted') {
    lines.push('以下所有步骤一气呵成，不要在步骤间停顿等待用户输入：', '');
    lines.push(`1. 读取规范：${spec.skillPath}`);
    lines.push(`2. 执行命令：\`${spec.scriptRunner}\``);
    lines.push('3. 按规范分析输出，完成后续动作', '');
    lines.push('全程不要停顿，不要询问是否继续。');
    return lines;
  }

  lines.push('读取以下秘典，根据内容为用户提供专业指导：', '');
  lines.push('```', spec.skillPath, '```');
  return lines;
}

function normalizeGeneratedSkill(meta, skillRelPath, runtimeType) {
  return {
    ...meta,
    description: meta.description || '',
    argumentHint: meta.argumentHint || '',
    allowedTools: meta.allowedTools || 'Read',
    relPath: skillRelPath,
    runtimeType,
  };
}

function generateCommandContent(meta, skillRelPath, runtimeType = 'knowledge') {
  const skill = normalizeGeneratedSkill(meta, skillRelPath, runtimeType);
  const spec = buildClaudeCommandSpec(skill);
  return [...buildCommandFrontmatter(spec), ...buildClaudeBody(spec), ''].join('\n');
}

function buildGeminiCommandSpec(skill) {
  const runtimeType = skill.runtimeType || 'knowledge';
  return {
    name: skill.name,
    description: skill.description || '',
    relPath: skill.relPath,
    runtimeType,
    scriptRunner: `node ${getSkillScriptPath(GEMINI_COMMAND_TARGET.skillRoot, skill.relPath)}`,
    skillPath: getSkillPath(GEMINI_COMMAND_TARGET.skillRoot, skill.relPath),
  };
}

function escapeTomlMultiline(value) {
  return String(value || '').replace(/"""/g, '\"\"\"').trim();
}

function buildGeminiPromptBody(spec) {
  const lines = [
    `Read \`${spec.skillPath}\` before acting.`,
    '',
    'If Gemini CLI appended the raw command invocation after these instructions, parse any extra arguments from that appended invocation before acting.',
    '',
  ];

  if (spec.runtimeType === 'scripted') {
    lines.push(`Then run \`${spec.scriptRunner} <parsed-arguments>\` and complete the task end-to-end.`);
    lines.push('Do not stop between steps unless blocked by permissions or missing required input.');
  } else {
    lines.push('Use that skill as the authoritative playbook for the task.');
    lines.push('Respond with concrete actions instead of generic advice.');
  }

  return lines.join('\n').trim();
}

function generateGeminiCommandContent(meta, skillRelPath, runtimeType = 'knowledge') {
  const skill = normalizeGeneratedSkill(meta, skillRelPath, runtimeType);
  const spec = buildGeminiCommandSpec(skill);
  const description = escapeTomlMultiline(spec.description).replace(/"/g, '\\"');
  const prompt = escapeTomlMultiline(buildGeminiPromptBody(spec));
  return [
    `description = "${description}"`,
    'prompt = """',
    prompt,
    '"""',
    '',
  ].join('\n');
}


function installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest) {
  const skills = collectInvocableSkills(skillsSrcDir);
  if (skills.length === 0) return 0;
  const rootName = manifest.target || 'claude';

  const installDir = path.join(targetDir, CLAUDE_COMMAND_TARGET.dir);
  fs.mkdirSync(installDir, { recursive: true });

  let totalFiles = 0;

  skills.forEach((skill) => {
    // 主命令 + aliases 都生成文件
    const names = [skill.name, ...(skill.aliases || [])];

    names.forEach((cmdName) => {
      const fileName = `${cmdName}.md`;
      const destFile = path.join(installDir, fileName);
      const relFile = path.posix.join(CLAUDE_COMMAND_TARGET.dir, fileName);

      if (fs.existsSync(destFile)) {
        const backupSubdir = path.join(backupDir, rootName, CLAUDE_COMMAND_TARGET.dir);
        fs.mkdirSync(backupSubdir, { recursive: true });
        fs.copyFileSync(destFile, path.join(backupSubdir, fileName));
        pushManifestEntry(manifest.backups, rootName, relFile);
        info(`备份: ${c.d(relFile)}`);
      }

      const content = generateCommandContent(skill, skill.relPath, skill.runtimeType);
      fs.writeFileSync(destFile, content);
      pushManifestEntry(manifest.installed, rootName, relFile);
      totalFiles++;
    });
  });

  ok(`${CLAUDE_COMMAND_TARGET.dir}/ ${c.d(`(自动生成 ${totalFiles} 个 ${CLAUDE_COMMAND_TARGET.label})`)}`);
  return skills.length;
}

function installGeneratedCommands(skillsSrcDir, targetDir, backupDir, manifest) {
  return installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest);
}

function installGeneratedGeminiCommands(skillsSrcDir, targetDir, backupDir, manifest) {
  const skills = collectInvocableSkills(skillsSrcDir);
  if (skills.length === 0) return 0;

  const installDir = path.join(targetDir, GEMINI_COMMAND_TARGET.dir);
  fs.mkdirSync(installDir, { recursive: true });
  let totalFiles = 0;

  skills.forEach((skill) => {
    const names = [skill.name, ...(skill.aliases || [])];
    names.forEach((cmdName) => {
      const fileName = `${cmdName}.toml`;
      const destFile = path.join(installDir, fileName);
      const relFile = path.posix.join(GEMINI_COMMAND_TARGET.dir, fileName);

      if (fs.existsSync(destFile)) {
        const backupSubdir = path.join(backupDir, 'gemini', GEMINI_COMMAND_TARGET.dir);
        fs.mkdirSync(backupSubdir, { recursive: true });
        fs.copyFileSync(destFile, path.join(backupSubdir, fileName));
        pushManifestEntry(manifest.backups, 'gemini', relFile);
        info(`备份: ${c.d(relFile)}`);
      }

      const content = generateGeminiCommandContent(skill, skill.relPath, skill.runtimeType);
      fs.writeFileSync(destFile, content);
      pushManifestEntry(manifest.installed, 'gemini', relFile);
      totalFiles++;
    });
  });

  ok(`${GEMINI_COMMAND_TARGET.dir}/ ${c.d(`(自动生成 ${totalFiles} 个 ${GEMINI_COMMAND_TARGET.label})`)}`);
  return totalFiles;
}

function installGeminiContext(targetDir, backupDir, manifest, selectedStyle) {
  const relPath = 'GEMINI.md';
  backupManagedPathIfExists('gemini', 'gemini', backupDir, relPath, manifest);
  const destPath = path.join(targetDir, relPath);
  const content = renderGeminiContext(PKG_ROOT, selectedStyle.slug);
  fs.writeFileSync(destPath, content);
  pushManifestEntry(manifest.installed, 'gemini', relPath);
  ok(`${relPath} ${c.d(`(动态生成: ${selectedStyle.slug})`)}`);
}


function backupManagedPathIfExists(tgt, rootName, backupDir, relPath, manifest) {
  const targetRoot = resolveManagedRootDir(tgt, rootName);
  const targetPath = path.join(targetRoot, relPath);
  if (!fs.existsSync(targetPath)) return false;

  const backupPath = path.join(backupDir, rootName, relPath);
  rmSafe(backupPath);
  copyRecursive(targetPath, backupPath);
  pushManifestEntry(manifest.backups, rootName, relPath);
  info(`备份: ${c.d(rootName === tgt ? relPath : `${rootName}/${relPath}`)}`);
  return true;
}

function pruneLegacyCodexSettings(tgt, backupDir, manifest) {
  const relPath = 'settings.json';
  const settingsPath = path.join(resolveManagedRootDir(tgt, 'codex'), relPath);
  if (!fs.existsSync(settingsPath)) return null;

  backupManagedPathIfExists(tgt, 'codex', backupDir, relPath, manifest);
  rmSafe(settingsPath);
  warn('移除 legacy settings.json（Codex 已改用 config.toml）');
  return settingsPath;
}

function printStyleCatalog() {
  banner();
  divider('可用输出风格');
  listStyles(PKG_ROOT).forEach((style) => {
    const tags = [];
    if (style.default) tags.push('默认');
    tags.push(style.targets.join('/'));
    console.log(`  ${c.cyn(style.slug)}  ${style.label} ${c.d(`[${tags.join(', ')}]`)}`);
    console.log(`  ${c.d(style.description)}`);
  });
  console.log('');
}

function printPersonaCatalog() {
  banner();
  divider('可用人格预设');
  listPersonas(PKG_ROOT).forEach((persona) => {
    const tag = persona.default ? ' [默认]' : '';
    console.log(`  ${c.cyn(persona.slug)}  ${persona.label}${c.d(tag)}`);
    console.log(`  ${c.d(persona.description)}`);
  });
  console.log('');
}

async function resolveProjectPackPlan(targetName) {
  const projectPacks = resolveProjectPacks(process.cwd(), targetName);
  if (!projectPacks.path) {
    return {
      ...projectPacks,
      selected: [],
      optionalSelected: [],
      sources: {},
    };
  }

  let confirmOptional = null;
  if (projectPacks.optionalPolicy === 'prompt' && projectPacks.optional.length > 0 && !autoYes) {
    const { confirm } = await import('@inquirer/prompts');
    confirmOptional = async (optionalPacks) => confirm({
      message: `当前仓库声明了 optional packs: ${optionalPacks.join(', ')}，是否一并安装?`,
      default: true,
    });
  }

  const selection = await selectProjectPacksForInstall(projectPacks, {
    autoYes,
    confirm: confirmOptional,
  });

  return {
    ...projectPacks,
    ...selection,
  };
}

async function resolveInstallPersona() {
  if (requestedPersonaSlug) {
    const persona = resolvePersona(PKG_ROOT, requestedPersonaSlug);
    if (!persona) throw new Error(`未知人格预设: ${requestedPersonaSlug}`);
    return persona;
  }
  if (autoYes) return getDefaultPersona(PKG_ROOT);

  const { select } = await import('@inquirer/prompts');
  const personas = listPersonas(PKG_ROOT);
  const defaultPersona = getDefaultPersona(PKG_ROOT);
  const genderLabel = { male: '♂', female: '♀', other: '⚧' };

  const slug = await select({
    message: '选择人格预设（心）',
    choices: personas.map(p => ({
      name: `${genderLabel[p.gender] || '⚧'} ${p.label} (${p.slug})${p.default ? ' [默认]' : ''} — ${p.description}`,
      value: p.slug,
    })),
    default: defaultPersona.slug,
  });
  return resolvePersona(PKG_ROOT, slug);
}

async function resolveInstallStyle(targetName) {
  if (requestedStyleSlug) {
    const style = resolveStyle(PKG_ROOT, requestedStyleSlug, targetName === 'gemini' || targetName === 'codex' ? 'claude' : targetName)
      || resolveStyle(PKG_ROOT, requestedStyleSlug, 'claude');
    if (!style) throw new Error(`未知输出风格: ${requestedStyleSlug}`);
    return style;
  }

  if (autoYes) return getDefaultStyle(PKG_ROOT, targetName);

  const { select } = await import('@inquirer/prompts');
  const styles = listStyles(PKG_ROOT, targetName);
  const defaultStyle = getDefaultStyle(PKG_ROOT, targetName);

  const slug = await select({
    message: '选择输出风格（口）',
    choices: styles.map(style => ({
      name: `${style.label} (${style.slug})${style.default ? ' [默认]' : ''} — ${style.description}`,
      value: style.slug,
    })),
    default: defaultStyle.slug,
  });
  return resolveStyle(PKG_ROOT, slug, targetName);
}

function installCore(tgt, selectedStyle, selectedPersona, packPlan) {
  const targetDir = resolveManagedRootDir(tgt);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');

  const installSummary = tgt === 'codex'
    ? `${c.cyn(resolveManagedRootDir(tgt, 'codex'))} + ${c.cyn(resolveManagedRootDir(tgt, 'agents'))}`
    : c.cyn(targetDir);
  step(1, 3, `安装核心文件 → ${installSummary}`);
  rmSafe(backupDir);
  fs.mkdirSync(backupDir, { recursive: true });

  if (tgt === 'codex') {
    cleanupLegacyCodexRuntime({ HOME, info });
  }

  const filesToInstall = tgt === 'codex'
    ? getCodexCoreFiles()
    : tgt === 'gemini'
      ? getGeminiCoreFiles()
      : getClaudeCoreFiles();

  const manifest = {
    manifest_version: 2, version: VERSION, target: tgt,
    timestamp: new Date().toISOString(), style: selectedStyle.slug, persona: selectedPersona.slug, installed: [], backups: [],
    project_packs: packPlan.selected,
    optional_policy: packPlan.optionalPolicy || 'auto',
    pack_reports: [],
  };

  filesToInstall.forEach(({ src, dest, root }) => {
    const rootName = root || tgt;
    const srcPath = path.join(PKG_ROOT, src);
    const destRoot = resolveManagedRootDir(tgt, rootName);
    const destPath = path.join(destRoot, dest);
    if (!fs.existsSync(srcPath)) {
      if (src === 'skills') {
        fail(`核心文件缺失: ${srcPath}\n    请尝试: npm cache clean --force && npx code-abyss`);
        process.exit(1);
      }
      warn(`跳过: ${src}`); return;
    }

    if (fs.existsSync(destPath)) {
      const backupPath = path.join(backupDir, rootName, dest);
      rmSafe(backupPath);
      copyRecursive(destPath, backupPath);
      pushManifestEntry(manifest.backups, rootName, dest);
      info(`备份: ${c.d(rootName === tgt ? dest : `${rootName}/${dest}`)}`);
    }
    ok(rootName === tgt ? dest : `${rootName}/${dest}`);
    rmSafe(destPath);
    copyRecursive(srcPath, destPath);
    pushManifestEntry(manifest.installed, rootName, dest);
  });

  pushPackReport(manifest, {
    pack: 'abyss',
    host: tgt,
    status: 'installed',
    source: 'bundled',
  });

  // 为目标 CLI 自动生成 user-invocable artifacts
  if (tgt === 'claude') {
    const skillsSrc = AUTHORITATIVE_SKILLS_DIR;
    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);
    if (packPlan.selected.includes('gstack')) {
      const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
      const result = installGstackClaudePack({
        HOME,
        backupDir,
        manifest,
        info,
        ok,
        warn,
        sourceMode,
        projectRoot: packPlan.root,
        fallback: true,
      });
      pushPackReport(manifest, {
        pack: 'gstack',
        host: 'claude',
        status: result.installed ? 'installed' : 'skipped',
        source: resolveEffectivePackSource(sourceMode, result),
        reason: result.reason || null,
      });
    } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
      const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
      pushPackReport(manifest, {
        pack: 'gstack',
        host: 'claude',
        status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
        source: sourceMode,
        reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
      });
    }
  } else if (tgt === 'codex') {
    // Codex 走 skills-only：不再生成 ~/.codex/AGENTS.md，项目声明的 pack 自动装入 ~/.agents/skills/
    if (packPlan.selected.includes('gstack')) {
      const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
      const result = installGstackCodexPack({
        HOME,
        backupDir,
        manifest,
        info,
        ok,
        warn,
        sourceMode,
        projectRoot: packPlan.root,
        fallback: true,
      });
      pushPackReport(manifest, {
        pack: 'gstack',
        host: 'codex',
        status: result.installed ? 'installed' : 'skipped',
        source: resolveEffectivePackSource(sourceMode, result),
        reason: result.reason || null,
      });
    } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
      const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
      pushPackReport(manifest, {
        pack: 'gstack',
        host: 'codex',
        status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
        source: sourceMode,
        reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
      });
    }
  } else if (tgt === 'gemini') {
    const skillsSrc = AUTHORITATIVE_SKILLS_DIR;
    installGeneratedGeminiCommands(skillsSrc, targetDir, backupDir, manifest);
    installGeminiContext(targetDir, backupDir, manifest, selectedStyle);
    if (packPlan.selected.includes('gstack')) {
      const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
      const result = installGstackGeminiPack({
        HOME,
        backupDir,
        manifest,
        info,
        ok,
        warn,
        sourceMode,
        projectRoot: packPlan.root,
        fallback: true,
      });
      pushPackReport(manifest, {
        pack: 'gstack',
        host: 'gemini',
        status: result.installed ? 'installed' : 'skipped',
        source: resolveEffectivePackSource(sourceMode, result),
        reason: result.reason || null,
      });
    } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
      const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
      pushPackReport(manifest, {
        pack: 'gstack',
        host: 'gemini',
        status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
        source: sourceMode,
        reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
      });
    }
  }

  let settingsPath = null;
  let settings = {};
  if (tgt === 'claude') {
    settingsPath = path.join(targetDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (e) {
        warn('settings.json 解析失败，将使用空配置');
        settings = {};
      }
      fs.mkdirSync(path.join(backupDir, 'claude'), { recursive: true });
      fs.copyFileSync(settingsPath, path.join(backupDir, 'claude', 'settings.json'));
      pushManifestEntry(manifest.backups, 'claude', 'settings.json');
    }
    settings.outputStyle = selectedStyle.slug;
    ok(`outputStyle = ${c.mag(selectedStyle.slug)}`);
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    pushManifestEntry(manifest.installed, 'claude', 'settings.json');
  } else if (tgt === 'gemini') {
    settingsPath = path.join(targetDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (e) {
        warn('Gemini settings.json 解析失败，将使用空配置');
        settings = {};
      }
      fs.mkdirSync(path.join(backupDir, 'gemini'), { recursive: true });
      fs.copyFileSync(settingsPath, path.join(backupDir, 'gemini', 'settings.json'));
      pushManifestEntry(manifest.backups, 'gemini', 'settings.json');
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    pushManifestEntry(manifest.installed, 'gemini', 'settings.json');
  } else {
    pruneLegacyCodexSettings(tgt, backupDir, manifest);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  // 根据独立选择的 persona 覆盖 CLAUDE.md / GEMINI.md
  if (selectedPersona) {
    const personaContent = readPersonaContent(PKG_ROOT, selectedPersona);
    if (tgt === 'claude') {
      const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
      fs.writeFileSync(claudeMdPath, personaContent);
      ok(`人格（心）→ ${c.mag(selectedPersona.label)} (${selectedPersona.slug})`);
    } else if (tgt === 'gemini') {
      const geminiMdPath = path.join(targetDir, 'GEMINI.md');
      const guidance = renderGeminiContext(PKG_ROOT, selectedStyle.slug, selectedPersona.slug);
      fs.writeFileSync(geminiMdPath, guidance);
      ok(`人格（心）→ ${c.mag(selectedPersona.label)} (${selectedPersona.slug})`);
    } else if (tgt === 'codex') {
      const agentsMdPath = path.join(targetDir, 'AGENTS.md');
      const guidance = renderCodexAgents(PKG_ROOT, selectedStyle.slug, selectedPersona.slug);
      fs.writeFileSync(agentsMdPath, guidance);
      ok(`人格（心）→ ${c.mag(selectedPersona.label)} (${selectedPersona.slug})`);
      ok(`风格（口）→ ${c.mag(selectedStyle.label)} → ~/.codex/AGENTS.md`);
    }
  }

  const uSrc = path.join(PKG_ROOT, 'bin', 'uninstall.js');
  const uDest = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(uSrc)) { fs.copyFileSync(uSrc, uDest); fs.chmodSync(uDest, '755'); }

  return { targetDir, settingsPath, settings, manifest, manifestPath, packPlan };
}

// ── Claude 后续 ──

async function postClaude(ctx) {
  await postClaudeFlow({
    ctx,
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
    deepMergeNew,
    printMergeLog,
    installCcstatusline,
  });
}

// ── Codex 后续 ──

async function postCodex() {
  await postCodexFlow({
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
  });
}

async function postGemini(ctx) {
  await postGeminiFlow({
    settingsPath: ctx.settingsPath,
    settings: ctx.settings,
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
  });
}

// ── 主流程 ──

async function main() {
  if (listStylesOnly) {
    printStyleCatalog();
    return;
  }

  if (listPersonasOnly) {
    printPersonaCatalog();
    return;
  }

  if (uninstallTarget) { runUninstall(uninstallTarget); return; }

  banner();

  if (target) {
    if (!isSupportedTarget(target)) {
      fail(formatActionableError(`--target 必须是 ${listTargetNames().join('、')}`, 'Try: node bin/install.js --target claude'));
      process.exit(1);
    }
    const persona = await resolveInstallPersona();
    const style = await resolveInstallStyle(target);
    const packPlan = await resolveProjectPackPlan(target);
    info(`人格（心）: ${c.mag(persona.label)} (${persona.slug})`);
    info(`风格（口）: ${c.mag(style.slug)} (${style.label})`);
    if (packPlan.path) {
      info(`项目 packs: required=[${packPlan.required.join(', ')}] optional=[${packPlan.optional.join(', ')}] policy=${packPlan.optionalPolicy}`);
    }
    const ctx = installCore(target, style, persona, packPlan);
    if (target === 'claude') await postClaude(ctx);
    else if (target === 'codex') await postCodex();
    else await postGemini(ctx);
    finish(ctx);
    return;
  }

  const { select } = await import('@inquirer/prompts');
  const action = await select({
    message: '请选择操作',
    choices: listInstallTargets().flatMap((targetMeta) => {
      const targetDir = resolveManagedRootDir(targetMeta.name);
      return [
        { name: `安装到 ${targetMeta.actionLabel} ${c.d(`(${targetDir})`)}`, value: `install-${targetMeta.name}` },
        { name: `${c.red('卸载')} ${targetMeta.actionLabel}`, value: `uninstall-${targetMeta.name}` },
      ];
    }),
  });

  switch (action) {
    case 'install-claude': {
      const persona = await resolveInstallPersona();
      const style = await resolveInstallStyle('claude');
      const packPlan = await resolveProjectPackPlan('claude');
      info(`人格（心）: ${c.mag(persona.label)}`);
      info(`风格（口）: ${c.mag(style.slug)}`);
      if (packPlan.path) {
        info(`项目 packs: required=[${packPlan.required.join(', ')}] optional=[${packPlan.optional.join(', ')}] policy=${packPlan.optionalPolicy}`);
      }
      const ctx = installCore('claude', style, persona, packPlan);
      await postClaude(ctx);
      finish(ctx); break;
    }
    case 'install-codex': {
      const persona = await resolveInstallPersona();
      const style = await resolveInstallStyle('codex');
      const packPlan = await resolveProjectPackPlan('codex');
      info(`人格（心）: ${c.mag(persona.label)}`);
      info(`风格（口）: ${c.mag(style.slug)}`);
      if (packPlan.path) {
        info(`项目 packs: required=[${packPlan.required.join(', ')}] optional=[${packPlan.optional.join(', ')}] policy=${packPlan.optionalPolicy}`);
      }
      const ctx = installCore('codex', style, persona, packPlan);
      await postCodex();
      finish(ctx); break;
    }
    case 'install-gemini': {
      const persona = await resolveInstallPersona();
      const style = await resolveInstallStyle('gemini');
      const packPlan = await resolveProjectPackPlan('gemini');
      info(`人格（心）: ${c.mag(persona.label)}`);
      info(`风格（口）: ${c.mag(style.slug)}`);
      const ctx = installCore('gemini', style, persona, packPlan);
      await postGemini(ctx);
      finish(ctx); break;
    }
    case 'uninstall-claude': runUninstall('claude'); break;
    case 'uninstall-codex': runUninstall('codex'); break;
    case 'uninstall-gemini': runUninstall('gemini'); break;
  }
}

function finish(ctx) {
  const tgt = ctx.manifest.target;
  let reportPath = null;
  if (ctx.packPlan && ctx.packPlan.root) {
    reportPath = writeReportArtifact(ctx.packPlan.root, `install-${tgt}`, {
      version: VERSION,
      target: tgt,
      timestamp: new Date().toISOString(),
      cwd: process.cwd(),
      pack_plan: {
        required: ctx.packPlan.required,
        optional: ctx.packPlan.optional,
        selected: ctx.packPlan.selected,
        optional_policy: ctx.packPlan.optionalPolicy,
        sources: ctx.packPlan.sources,
      },
      pack_reports: ctx.manifest.pack_reports || [],
      installed: ctx.manifest.installed || [],
      backups: ctx.manifest.backups || [],
    });
  }
  divider('安装完成');
  console.log('');
  console.log(`  ${c.b('目标:')}     ${c.cyn(ctx.targetDir)}`);
  console.log(`  ${c.b('版本:')}     v${VERSION}`);
  if (ctx.manifest.style && tgt !== 'codex') {
    console.log(`  ${c.b('风格:')}     ${c.mag(ctx.manifest.style)}`);
  }
  if (Array.isArray(ctx.manifest.project_packs) && ctx.manifest.project_packs.length > 0) {
    console.log(`  ${c.b('Packs:')}    ${ctx.manifest.project_packs.join(', ')}`);
  }
  if (ctx.manifest.optional_policy) {
    console.log(`  ${c.b('Pack策略:')} ${ctx.manifest.optional_policy}`);
  }
  if (Array.isArray(ctx.manifest.pack_reports) && ctx.manifest.pack_reports.length > 0) {
    ctx.manifest.pack_reports.forEach((report) => {
      const source = report.source ? ` source=${report.source}` : '';
      const reason = report.reason ? ` reason=${report.reason}` : '';
      console.log(`  ${c.b('Pack报告:')} ${report.pack}@${report.host} ${report.status}${source}${reason}`);
    });
  }
  if (ctx.packPlan && ctx.packPlan.root) {
    const projectLock = readProjectPackLock(ctx.packPlan.root);
    if (projectLock) {
      const bootstrap = syncProjectBootstrapArtifacts(ctx.packPlan.root, projectLock.lock);
      const updatedDocs = bootstrap.docs.filter((entry) => entry.action !== 'skipped');
      if (updatedDocs.length > 0) {
        updatedDocs.forEach((entry) => console.log(`  ${c.b('文档同步:')} ${entry.action} ${entry.filePath}`));
      }
    }
  }
  if (reportPath) {
    console.log(`  ${c.b('Report:')}   ${reportPath}`);
  }
  console.log(`  ${c.b('文件:')}     ${ctx.manifest.installed.length} 个安装, ${ctx.manifest.backups.length} 个备份`);
  console.log(`  ${c.b('卸载:')}     ${c.d(`npx code-abyss --uninstall ${tgt}`)}`);
  console.log('');
  console.log(c.mag(`  ⚚ 劫——破——了——！！！\n`));
}

if (require.main === module) {
  main().catch(err => { fail(err.message); process.exit(1); });
}

module.exports = {
  deepMergeNew, detectClaudeAuth, detectCodexAuth,
  detectCcstatusline, copyRecursive, shouldSkip, SETTINGS_TEMPLATE,
  scanInvocableSkills,
  generateCommandContent,
  generateGeminiCommandContent,
  installGeneratedCommands,
  installGeneratedGeminiCommands,
};

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
const { shouldSkip, copyRecursive, rmSafe, deepMergeNew, printMergeLog } =
  require(path.join(__dirname, 'lib', 'utils.js'));
const {
  collectInvocableSkills,
} = require(path.join(__dirname, 'lib', 'skill-registry.js'));
const {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  renderCodexAgents,
} = require(path.join(__dirname, 'lib', 'style-registry.js'));
const { detectCclineBin, installCcline: _installCcline } = require(path.join(__dirname, 'lib', 'ccline.js'));
const {
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

// ── 模板 ──

// ── CLI 参数 ──

const args = process.argv.slice(2);
let target = null;
let uninstallTarget = null;
let autoYes = false;
let listStylesOnly = false;
let requestedStyleSlug = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) { target = args[++i]; }
  else if (args[i] === '--uninstall' && args[i + 1]) { uninstallTarget = args[++i]; }
  else if (args[i] === '--style' && args[i + 1]) { requestedStyleSlug = args[++i]; }
  else if (args[i] === '--list-styles') { listStylesOnly = true; }
  else if (args[i] === '--yes' || args[i] === '-y') { autoYes = true; }
  else if (args[i] === '--help' || args[i] === '-h') {
    banner();
    console.log(`${c.b('用法:')}  npx code-abyss [选项]

${c.b('选项:')}
  --target ${c.cyn('<claude|codex>')}      安装目标
  --uninstall ${c.cyn('<claude|codex>')}   卸载目标
  --style ${c.cyn('<slug>')}               指定输出风格
  --list-styles               列出可用输出风格
  --yes, -y                    全自动模式
  --help, -h                   显示帮助

${c.b('示例:')}
  npx code-abyss                        ${c.d('# 交互菜单')}
  npx code-abyss --list-styles           ${c.d('# 查看可用风格')}
  npx code-abyss --target claude -y      ${c.d('# 零配置一键安装')}
  npx code-abyss --target codex --style abyss-concise -y
                                   ${c.d('# 指定风格安装')}
  npx code-abyss --uninstall claude      ${c.d('# 直接卸载')}
`);
    process.exit(0);
  }
}

// ── 卸载 ──

function runUninstall(tgt) {
  if (!['claude', 'codex'].includes(tgt)) { fail('--uninstall 必须是 claude 或 codex'); process.exit(1); }
  const targetDir = path.join(HOME, `.${tgt}`);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) { fail(`未找到安装记录: ${manifestPath}`); process.exit(1); }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.manifest_version && manifest.manifest_version > 1) {
    fail(`manifest 版本 ${manifest.manifest_version} 不兼容，请升级 code-abyss 后再卸载`);
    process.exit(1);
  }
  divider(`卸载 Code Abyss v${manifest.version}`);

  (manifest.installed || []).forEach(f => {
    const p = path.join(targetDir, f);
    if (fs.existsSync(p)) { rmSafe(p); console.log(`  ${c.red('✘')} ${f}`); }
  });
  (manifest.backups || []).forEach(f => {
    const bp = path.join(backupDir, f);
    const tp = path.join(targetDir, f);
    if (fs.existsSync(bp)) { fs.renameSync(bp, tp); ok(`恢复: ${f}`); }
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

const INVOCABLE_TARGETS = {
  claude: {
    dir: 'commands',
    label: '斜杠命令',
    skillRoot: '~/.claude/skills',
  },
  codex: {
    dir: 'prompts',
    label: 'custom prompts',
    skillRoot: '~/.codex/skills',
  },
};

function getInvocableTarget(targetName) {
  const targetCfg = INVOCABLE_TARGETS[targetName];
  if (!targetCfg) throw new Error(`不支持的 invocable target: ${targetName}`);
  return targetCfg;
}

function getSkillPath(skillRoot, skillRelPath) {
  return skillRelPath
    ? `${skillRoot}/${skillRelPath}/SKILL.md`
    : `${skillRoot}/SKILL.md`;
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

function buildSkillArtifactSpec(skill, targetName) {
  const targetCfg = getInvocableTarget(targetName);
  const runtimeType = skill.runtimeType || 'knowledge';
  const allowedTools = Array.isArray(skill.allowedTools)
    ? skill.allowedTools.join(', ')
    : (skill.allowedTools || 'Read');
  return {
    targetName,
    targetCfg,
    name: skill.name,
    description: skill.description,
    argumentHint: skill.argumentHint || '',
    allowedTools,
    relPath: skill.relPath,
    runtimeType,
    scriptRunner: `node ${targetCfg.skillRoot}/run_skill.js ${skill.name} $ARGUMENTS`,
    skillPath: getSkillPath(targetCfg.skillRoot, skill.relPath),
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

function buildCodexPromptBody(spec) {
  const lines = [];
  if (spec.argumentHint) lines.push(`Arguments: ${spec.argumentHint}`, '');
  lines.push(`Read \`${spec.skillPath}\` before acting.`, '');
  if (spec.runtimeType === 'scripted') {
    lines.push(`Then run \`${spec.scriptRunner}\`.`);
    lines.push('Do not stop between steps unless blocked by permissions or missing required inputs.');
    lines.push('Use the skill guidance plus script output to complete the task end-to-end.');
    return lines;
  }

  lines.push('Use that skill as the authoritative playbook for the task.');
  lines.push('Respond with concrete actions instead of generic advice.');
  return lines;
}

function generateInvocableContent(skill, targetName) {
  const spec = buildSkillArtifactSpec(skill, targetName);
  const lines = targetName === 'claude' ? buildCommandFrontmatter(spec) : [];
  const body = targetName === 'claude'
    ? buildClaudeBody(spec)
    : buildCodexPromptBody(spec);
  return [...lines, ...body, ''].join('\n');
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
  return generateInvocableContent(normalizeGeneratedSkill(meta, skillRelPath, runtimeType), 'claude');
}

function generatePromptContent(meta, skillRelPath, runtimeType = 'knowledge') {
  return generateInvocableContent(normalizeGeneratedSkill(meta, skillRelPath, runtimeType), 'codex');
}

function installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest, targetName) {
  const skills = collectInvocableSkills(skillsSrcDir);
  if (skills.length === 0) return 0;

  const targetCfg = getInvocableTarget(targetName);
  const installDir = path.join(targetDir, targetCfg.dir);
  fs.mkdirSync(installDir, { recursive: true });

  let totalFiles = 0;

  skills.forEach((skill) => {
    // 主命令 + aliases 都生成文件
    const names = [skill.name, ...(skill.aliases || [])];

    names.forEach((cmdName) => {
      const fileName = `${cmdName}.md`;
      const destFile = path.join(installDir, fileName);
      const relFile = path.posix.join(targetCfg.dir, fileName);

      if (fs.existsSync(destFile)) {
        const backupSubdir = path.join(backupDir, targetCfg.dir);
        fs.mkdirSync(backupSubdir, { recursive: true });
        fs.copyFileSync(destFile, path.join(backupSubdir, fileName));
        manifest.backups.push(relFile);
        info(`备份: ${c.d(relFile)}`);
      }

      const content = generateInvocableContent(skill, targetName);
      fs.writeFileSync(destFile, content);
      manifest.installed.push(relFile);
      totalFiles++;
    });
  });

  ok(`${targetCfg.dir}/ ${c.d(`(自动生成 ${totalFiles} 个 ${targetCfg.label})`)}`);
  return skills.length;
}

function installGeneratedCommands(skillsSrcDir, targetDir, backupDir, manifest) {
  return installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest, 'claude');
}

function installGeneratedPrompts(skillsSrcDir, targetDir, backupDir, manifest) {
  return installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest, 'codex');
}

function backupPathIfExists(targetDir, backupDir, relPath, manifest) {
  const targetPath = path.join(targetDir, relPath);
  if (!fs.existsSync(targetPath)) return false;

  const backupPath = path.join(backupDir, relPath);
  rmSafe(backupPath);
  copyRecursive(targetPath, backupPath);
  manifest.backups.push(relPath);
  info(`备份: ${c.d(relPath)}`);
  return true;
}

function pruneLegacyCodexSettings(targetDir, backupDir, manifest) {
  const relPath = 'settings.json';
  const settingsPath = path.join(targetDir, relPath);
  if (!fs.existsSync(settingsPath)) return null;

  backupPathIfExists(targetDir, backupDir, relPath, manifest);
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

async function resolveInstallStyle(targetName) {
  if (requestedStyleSlug) {
    const style = resolveStyle(PKG_ROOT, requestedStyleSlug, targetName);
    if (!style) {
      throw new Error(`未知输出风格: ${requestedStyleSlug}`);
    }
    return style;
  }

  if (autoYes) {
    return getDefaultStyle(PKG_ROOT, targetName);
  }

  const styles = listStyles(PKG_ROOT, targetName);
  const defaultStyle = getDefaultStyle(PKG_ROOT, targetName);
  const { select } = await import('@inquirer/prompts');
  const slug = await select({
    message: '选择输出风格',
    choices: styles.map(style => ({
      name: `${style.label} (${style.slug})${style.default ? ' [默认]' : ''} - ${style.description}`,
      value: style.slug,
    })),
    default: defaultStyle.slug,
  });
  return resolveStyle(PKG_ROOT, slug, targetName);
}

function installCodexAgents(targetDir, backupDir, manifest, selectedStyle) {
  const relPath = 'AGENTS.md';
  backupPathIfExists(targetDir, backupDir, relPath, manifest);
  const destPath = path.join(targetDir, relPath);
  const content = renderCodexAgents(PKG_ROOT, selectedStyle.slug);
  fs.writeFileSync(destPath, content);
  manifest.installed.push(relPath);
  ok(`${relPath} ${c.d(`(动态生成: ${selectedStyle.slug})`)}`);
}

function installCore(tgt, selectedStyle) {
  const targetDir = path.join(HOME, `.${tgt}`);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');

  step(1, 3, `安装核心文件 → ${c.cyn(targetDir)}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const filesToInstall = tgt === 'codex'
    ? getCodexCoreFiles()
    : getClaudeCoreFiles();

  const manifest = {
    manifest_version: 1, version: VERSION, target: tgt,
    timestamp: new Date().toISOString(), style: selectedStyle.slug, installed: [], backups: []
  };

  filesToInstall.forEach(({ src, dest }) => {
    const srcPath = path.join(PKG_ROOT, src);
    const destPath = path.join(targetDir, dest);
    if (!fs.existsSync(srcPath)) {
      if (src === 'skills') {
        fail(`核心文件缺失: ${srcPath}\n    请尝试: npm cache clean --force && npx code-abyss`);
        process.exit(1);
      }
      warn(`跳过: ${src}`); return;
    }

    if (fs.existsSync(destPath)) {
      const bp = path.join(backupDir, dest);
      rmSafe(bp); copyRecursive(destPath, bp); manifest.backups.push(dest);
      info(`备份: ${c.d(dest)}`);
    }
    ok(dest);
    rmSafe(destPath); copyRecursive(srcPath, destPath); manifest.installed.push(dest);
  });

  // 为目标 CLI 自动生成 user-invocable artifacts
  if (tgt === 'claude') {
    const skillsSrc = path.join(PKG_ROOT, 'skills');
    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);
  } else if (tgt === 'codex') {
    // Codex 0.117.0+ 已移除 custom prompts，skills 通过 agents/openai.yaml 注册
    // 不再生成 prompts/ 目录
    installCodexAgents(targetDir, backupDir, manifest, selectedStyle);
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
      fs.copyFileSync(settingsPath, path.join(backupDir, 'settings.json'));
      manifest.backups.push('settings.json');
    }
    settings.outputStyle = selectedStyle.slug;
    ok(`outputStyle = ${c.mag(selectedStyle.slug)}`);
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    manifest.installed.push('settings.json');
  } else {
    pruneLegacyCodexSettings(targetDir, backupDir, manifest);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  const uSrc = path.join(PKG_ROOT, 'bin', 'uninstall.js');
  const uDest = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(uSrc)) { fs.copyFileSync(uSrc, uDest); fs.chmodSync(uDest, '755'); }

  return { targetDir, settingsPath, settings, manifest, manifestPath };
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
    installCcline: _installCcline,
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

// ── 主流程 ──

async function main() {
  if (listStylesOnly) {
    printStyleCatalog();
    return;
  }

  if (uninstallTarget) { runUninstall(uninstallTarget); return; }

  banner();

  if (target) {
    if (!['claude', 'codex'].includes(target)) { fail('--target 必须是 claude 或 codex'); process.exit(1); }
    const style = await resolveInstallStyle(target);
    info(`输出风格: ${c.mag(style.slug)} (${style.label})`);
    const ctx = installCore(target, style);
    if (target === 'claude') await postClaude(ctx);
    else await postCodex();
    finish(ctx);
    return;
  }

  const { select } = await import('@inquirer/prompts');
  const action = await select({
    message: '请选择操作',
    choices: [
      { name: `安装到 Claude Code ${c.d('(~/.claude/')}${c.d(')')}`, value: 'install-claude' },
      { name: `安装到 Codex CLI   ${c.d('(~/.codex/')}${c.d(')')}`, value: 'install-codex' },
      { name: `${c.red('卸载')} Claude Code`, value: 'uninstall-claude' },
      { name: `${c.red('卸载')} Codex CLI`, value: 'uninstall-codex' },
    ],
  });

  switch (action) {
    case 'install-claude': {
      const style = await resolveInstallStyle('claude');
      info(`输出风格: ${c.mag(style.slug)} (${style.label})`);
      const ctx = installCore('claude', style);
      await postClaude(ctx);
      finish(ctx); break;
    }
    case 'install-codex': {
      const style = await resolveInstallStyle('codex');
      info(`输出风格: ${c.mag(style.slug)} (${style.label})`);
      const ctx = installCore('codex', style);
      await postCodex();
      finish(ctx); break;
    }
    case 'uninstall-claude': runUninstall('claude'); break;
    case 'uninstall-codex': runUninstall('codex'); break;
  }
}

function finish(ctx) {
  const tgt = ctx.manifest.target;
  divider('安装完成');
  console.log('');
  console.log(`  ${c.b('目标:')}     ${c.cyn(ctx.targetDir)}`);
  console.log(`  ${c.b('版本:')}     v${VERSION}`);
  if (ctx.manifest.style) {
    console.log(`  ${c.b('风格:')}     ${c.mag(ctx.manifest.style)}`);
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
  detectCclineBin, copyRecursive, shouldSkip, SETTINGS_TEMPLATE,
  scanInvocableSkills,
  generateCommandContent,
  generatePromptContent,
  installGeneratedCommands,
  installGeneratedPrompts,
};

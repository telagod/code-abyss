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
const { shouldSkip, copyRecursive, rmSafe, deepMergeNew, printMergeLog, parseFrontmatter } =
  require(path.join(__dirname, 'lib', 'utils.js'));
const { detectCclineBin, installCcline: _installCcline } = require(path.join(__dirname, 'lib', 'ccline.js'));

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
  const env = settings.env || {};
  if (env.ANTHROPIC_BASE_URL && env.ANTHROPIC_AUTH_TOKEN) return { type: 'custom', detail: env.ANTHROPIC_BASE_URL };
  if (process.env.ANTHROPIC_API_KEY) return { type: 'env', detail: 'ANTHROPIC_API_KEY' };
  if (process.env.ANTHROPIC_BASE_URL && process.env.ANTHROPIC_AUTH_TOKEN) {
    return { type: 'env-custom', detail: process.env.ANTHROPIC_BASE_URL };
  }
  const cred = path.join(HOME, '.claude', '.credentials.json');
  if (fs.existsSync(cred)) {
    try {
      const cc = JSON.parse(fs.readFileSync(cred, 'utf8'));
      if (cc.claudeAiOauth || cc.apiKey) return { type: 'login', detail: 'claude login' };
    } catch (e) { warn(`凭证文件损坏: ${cred}`); }
  }
  return null;
}

function detectCodexAuth() {
  if (process.env.OPENAI_API_KEY) return { type: 'env', detail: 'OPENAI_API_KEY' };
  const auth = path.join(HOME, '.codex', 'auth.json');
  if (fs.existsSync(auth)) {
    try {
      const a = JSON.parse(fs.readFileSync(auth, 'utf8'));
      if (a.token || a.api_key) return { type: 'login', detail: 'codex login' };
    } catch (e) { warn(`凭证文件损坏: ${auth}`); }
  }
  const cfg = path.join(HOME, '.codex', 'config.toml');
  if (fs.existsSync(cfg)) {
    if (fs.readFileSync(cfg, 'utf8').includes('base_url')) return { type: 'custom', detail: 'config.toml' };
  }
  return null;
}

// ── 模板 ──

const SETTINGS_TEMPLATE = {
  $schema: 'https://json.schemastore.org/claude-code-settings.json',
  env: {
    CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1',
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1'
  },
  alwaysThinkingEnabled: true,
  model: 'opus',
  outputStyle: 'abyss-cultivator',
  attribution: { commit: '', pr: '' },
  permissions: {
    allow: [
      'Bash', 'LS', 'Read', 'Agent', 'Write', 'Edit', 'MultiEdit',
      'Glob', 'Grep', 'WebFetch', 'WebSearch', 'TodoWrite',
      'NotebookRead', 'NotebookEdit'
    ]
  }
};

const CCLINE_CMD = process.platform === 'win32' ? 'ccline' : '~/.claude/ccline/ccline';
const CCLINE_STATUS_LINE = {
  statusLine: {
    type: 'command',
    command: CCLINE_CMD,
    padding: 0
  }
};

// ── CLI 参数 ──

const args = process.argv.slice(2);
let target = null;
let uninstallTarget = null;
let autoYes = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) { target = args[++i]; }
  else if (args[i] === '--uninstall' && args[i + 1]) { uninstallTarget = args[++i]; }
  else if (args[i] === '--yes' || args[i] === '-y') { autoYes = true; }
  else if (args[i] === '--help' || args[i] === '-h') {
    banner();
    console.log(`${c.b('用法:')}  npx code-abyss [选项]

${c.b('选项:')}
  --target ${c.cyn('<claude|codex>')}      安装目标
  --uninstall ${c.cyn('<claude|codex>')}   卸载目标
  --yes, -y                    全自动模式
  --help, -h                   显示帮助

${c.b('示例:')}
  npx code-abyss                        ${c.d('# 交互菜单')}
  npx code-abyss --target claude -y      ${c.d('# 零配置一键安装')}
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

/**
 * 递归扫描 skills 目录，找出所有 user-invocable: true 的 SKILL.md
 * @param {string} skillsDir - skills 源目录绝对路径
 * @returns {Array<{meta: Object, relPath: string, hasScripts: boolean}>}
 */
function scanInvocableSkills(skillsDir) {
  const results = [];
  function scan(dir) {
    const skillMd = path.join(dir, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      try {
        const content = fs.readFileSync(skillMd, 'utf8');
        const meta = parseFrontmatter(content);
        if (meta && meta['user-invocable'] === 'true' && meta.name) {
          const relPath = path.relative(skillsDir, dir);
          const scriptsDir = path.join(dir, 'scripts');
          const hasScripts = fs.existsSync(scriptsDir) &&
            fs.readdirSync(scriptsDir).some(f => f.endsWith('.js'));
          results.push({ meta, relPath, hasScripts });
        }
      } catch (e) { /* 解析失败跳过 */ }
    }
    try {
      fs.readdirSync(dir).forEach(sub => {
        const subPath = path.join(dir, sub);
        if (fs.statSync(subPath).isDirectory() && !shouldSkip(sub) && sub !== 'scripts') {
          scan(subPath);
        }
      });
    } catch (e) { /* 读取失败跳过 */ }
  }
  scan(skillsDir);
  return results;
}

/**
 * 根据 SKILL.md 元数据生成 command .md 内容
 *
 * 设计原则：
 * - 读取 SKILL.md + 执行脚本合并为一气呵成的指令流
 * - 禁止「先…然后…」的分步模式，避免 Claude 在步骤间停顿
 * - 无脚本的 skill：仅读取 SKILL.md 作为知识库提供指导
 *
 * @param {Object} meta - parseFrontmatter 返回的元数据
 * @param {string} skillRelPath - 相对于 skills/ 的路径（如 'tools/gen-docs'）
 * @param {boolean} hasScripts - 是否有可执行脚本
 * @returns {string} command .md 文件内容
 */
function generateCommandContent(meta, skillRelPath, hasScripts) {
  const name = meta.name;
  const desc = (meta.description || '').replace(/"/g, '\\"');
  const argHint = meta['argument-hint'];
  const tools = meta['allowed-tools'] || 'Read';
  const skillPath = skillRelPath
    ? `~/.claude/skills/${skillRelPath}/SKILL.md`
    : '~/.claude/skills/SKILL.md';

  const lines = [
    '---',
    `name: ${name}`,
    `description: "${desc}"`,
  ];
  if (argHint) lines.push(`argument-hint: "${argHint}"`);
  lines.push(`allowed-tools: ${tools}`);
  lines.push('---');
  lines.push('');

  if (hasScripts) {
    // ── 有脚本的 skill：读取规范 + 执行脚本，一气呵成 ──
    lines.push('以下所有步骤一气呵成，不要在步骤间停顿等待用户输入：');
    lines.push('');
    lines.push(`1. 读取规范：${skillPath}`);
    lines.push(`2. 执行命令：\`node ~/.claude/skills/run_skill.js ${name} $ARGUMENTS\``);
    lines.push('3. 按规范分析输出，完成后续动作');
    lines.push('');
    lines.push('全程不要停顿，不要询问是否继续。');
  } else {
    // ── 无脚本的 skill：知识库模式 ──
    lines.push('读取以下秘典，根据内容为用户提供专业指导：');
    lines.push('');
    lines.push('```');
    lines.push(skillPath);
    lines.push('```');
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * 扫描 skills 并为 user-invocable 的 skill 生成 command 包装，文件级合并安装
 */
function installGeneratedCommands(skillsSrcDir, targetDir, backupDir, manifest) {
  const skills = scanInvocableSkills(skillsSrcDir);
  if (skills.length === 0) return 0;

  const cmdsDir = path.join(targetDir, 'commands');
  fs.mkdirSync(cmdsDir, { recursive: true });

  skills.forEach(({ meta, relPath, hasScripts }) => {
    const fileName = `${meta.name}.md`;
    const destFile = path.join(cmdsDir, fileName);
    const relFile = path.posix.join('commands', fileName);

    if (fs.existsSync(destFile)) {
      const cmdsBackupDir = path.join(backupDir, 'commands');
      fs.mkdirSync(cmdsBackupDir, { recursive: true });
      fs.copyFileSync(destFile, path.join(cmdsBackupDir, fileName));
      manifest.backups.push(relFile);
      info(`备份: ${c.d(relFile)}`);
    }

    const content = generateCommandContent(meta, relPath, hasScripts);
    fs.writeFileSync(destFile, content);
    manifest.installed.push(relFile);
  });

  ok(`commands/ ${c.d(`(自动生成 ${skills.length} 个斜杠命令)`)}`);
  return skills.length;
}

function installCore(tgt) {
  const targetDir = path.join(HOME, `.${tgt}`);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');

  step(1, 3, `安装核心文件 → ${c.cyn(targetDir)}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const filesToInstall = [
    { src: 'config/CLAUDE.md', dest: tgt === 'claude' ? 'CLAUDE.md' : null },
    { src: 'config/AGENTS.md', dest: tgt === 'codex' ? 'AGENTS.md' : null },
    { src: 'output-styles', dest: tgt === 'claude' ? 'output-styles' : null },
    { src: 'skills', dest: 'skills' },
  ].filter(f => f.dest !== null);

  const manifest = {
    manifest_version: 1, version: VERSION, target: tgt,
    timestamp: new Date().toISOString(), installed: [], backups: []
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

  // 为 Claude 目标自动生成 user-invocable 斜杠命令
  if (tgt === 'claude') {
    const skillsSrc = path.join(PKG_ROOT, 'skills');
    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);
  }

  const settingsPath = path.join(targetDir, 'settings.json');
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      warn(`settings.json 解析失败，将使用空配置`);
      settings = {};
    }
    fs.copyFileSync(settingsPath, path.join(backupDir, 'settings.json'));
    manifest.backups.push('settings.json');
  }
  if (tgt === 'claude') {
    settings.outputStyle = 'abyss-cultivator';
    ok(`outputStyle = ${c.mag('abyss-cultivator')}`);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  manifest.installed.push('settings.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  const uSrc = path.join(PKG_ROOT, 'bin', 'uninstall.js');
  const uDest = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(uSrc)) { fs.copyFileSync(uSrc, uDest); fs.chmodSync(uDest, '755'); }

  return { targetDir, settingsPath, settings, manifest, manifestPath };
}

// ── Claude 后续 ──

async function configureCustomProvider(ctx) {
  const { confirm, input } = await import('@inquirer/prompts');
  const doCfg = await confirm({ message: '配置自定义 provider?', default: false });
  if (!doCfg) return;
  if (!ctx.settings.env) ctx.settings.env = {};
  const url = await input({ message: 'ANTHROPIC_BASE_URL:' });
  const token = await input({ message: 'ANTHROPIC_AUTH_TOKEN:' });
  if (url) ctx.settings.env.ANTHROPIC_BASE_URL = url;
  if (token) ctx.settings.env.ANTHROPIC_AUTH_TOKEN = token;
  fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
  ok('provider 已配置');
}

function mergeSettings(ctx) {
  const log = [];
  deepMergeNew(ctx.settings, SETTINGS_TEMPLATE, '', log);
  printMergeLog(log, c);
  fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
  ok('settings.json 合并完成');
}

async function postClaude(ctx) {
  step(2, 3, '认证检测');
  const auth = detectClaudeAuth(ctx.settings);
  if (auth) {
    ok(`${c.b(auth.type)} → ${auth.detail}`);
  } else {
    warn('未检测到 API 认证');
    info(`支持: ${c.cyn('claude login')} | ${c.cyn('ANTHROPIC_API_KEY')} | ${c.cyn('自定义 provider')}`);
    if (!autoYes) await configureCustomProvider(ctx);
  }

  step(3, 3, '可选配置');
  if (autoYes) {
    info('自动模式: 合并推荐配置');
    mergeSettings(ctx);
    await installCcline(ctx);
    return;
  }

  const { checkbox } = await import('@inquirer/prompts');
  const choices = await checkbox({
    message: '选择要安装的配置 (空格选择, 回车确认)',
    choices: [
      { name: '精细合并推荐 settings.json (保留现有配置)', value: 'settings', checked: true },
      { name: '安装 ccline 状态栏 (需要 Nerd Font)', value: 'ccline', checked: true },
    ],
  });

  if (choices.includes('settings')) mergeSettings(ctx);
  if (choices.includes('ccline')) await installCcline(ctx);
}

async function installCcline(ctx) {
  await _installCcline(ctx, { HOME, PKG_ROOT, CCLINE_STATUS_LINE, ok, warn, info, fail, c });
}

// ── Codex 后续 ──

async function postCodex() {
  const { confirm } = await import('@inquirer/prompts');
  const cfgPath = path.join(HOME, '.codex', 'config.toml');
  const exists = fs.existsSync(cfgPath);

  step(2, 3, '认证检测');
  const auth = detectCodexAuth();
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
        warn('请编辑 base_url 和 model');
      }
    } else {
      ok('config.toml 已存在');
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
        warn('请编辑 base_url 和 model');
      }
    }
  } else {
    ok('config.toml 已存在');
  }
}

// ── 主流程 ──

async function main() {
  if (uninstallTarget) { runUninstall(uninstallTarget); return; }

  banner();

  if (target) {
    if (!['claude', 'codex'].includes(target)) { fail('--target 必须是 claude 或 codex'); process.exit(1); }
    const ctx = installCore(target);
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
      const ctx = installCore('claude');
      await postClaude(ctx);
      finish(ctx); break;
    }
    case 'install-codex': {
      const ctx = installCore('codex');
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
  scanInvocableSkills, generateCommandContent, installGeneratedCommands
};

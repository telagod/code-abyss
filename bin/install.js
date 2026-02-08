#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const VERSION = '1.6.0';
const HOME = os.homedir();
const SKIP = ['__pycache__', '.pyc', '.pyo', '.egg-info', '.DS_Store', 'Thumbs.db', '.git'];
const PKG_ROOT = path.join(__dirname, '..');

// ── 工具函数 ──

function shouldSkip(name) { return SKIP.some(p => name.includes(p)); }

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (shouldSkip(path.basename(src))) return;
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(f => {
      if (!shouldSkip(f)) copyRecursive(path.join(src, f), path.join(dest, f));
    });
  } else {
    if (shouldSkip(path.basename(src))) return;
    fs.copyFileSync(src, dest);
  }
}

function rmSafe(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function ask(rl, q) {
  return new Promise(r => rl.question(q, r));
}

function deepMergeNew(target, source, prefix, log) {
  for (const key of Object.keys(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        log.push(`⚙️  合并: ${fullKey} (新建对象)`);
      }
      deepMergeNew(target[key], source[key], fullKey, log);
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      const added = source[key].filter(v => !target[key].includes(v));
      if (added.length > 0) {
        target[key] = [...target[key], ...added];
        log.push(`⚙️  合并: ${fullKey} (补充 ${added.length} 项)`);
      } else {
        log.push(`⚙️  保留: ${fullKey} (已完整)`);
      }
    } else if (key in target) {
      log.push(`⚙️  保留: ${fullKey} (已存在: ${JSON.stringify(target[key])})`);
    } else {
      target[key] = source[key];
      log.push(`⚙️  合并: ${fullKey} = ${JSON.stringify(source[key])}`);
    }
  }
  return target;
}

// ── 认证检测 ──

function detectClaudeAuth(settings) {
  // 1. settings.json 中有自定义 provider
  const env = settings.env || {};
  if (env.ANTHROPIC_BASE_URL && env.ANTHROPIC_AUTH_TOKEN) return { type: 'custom', detail: env.ANTHROPIC_BASE_URL };
  // 2. 环境变量中有官方 key
  if (process.env.ANTHROPIC_API_KEY) return { type: 'env', detail: 'ANTHROPIC_API_KEY' };
  // 3. 环境变量中有自定义 provider
  if (process.env.ANTHROPIC_BASE_URL && process.env.ANTHROPIC_AUTH_TOKEN) return { type: 'env-custom', detail: process.env.ANTHROPIC_BASE_URL };
  // 4. 已通过 claude login 登录
  const cred = path.join(HOME, '.claude', '.credentials.json');
  if (fs.existsSync(cred)) {
    try {
      const c = JSON.parse(fs.readFileSync(cred, 'utf8'));
      if (c.claudeAiOauth || c.apiKey) return { type: 'login', detail: 'claude login' };
    } catch (e) {}
  }
  return null;
}

function detectCodexAuth() {
  // 1. 环境变量
  if (process.env.OPENAI_API_KEY) return { type: 'env', detail: 'OPENAI_API_KEY' };
  // 2. auth.json
  const auth = path.join(HOME, '.codex', 'auth.json');
  if (fs.existsSync(auth)) {
    try {
      const a = JSON.parse(fs.readFileSync(auth, 'utf8'));
      if (a.token || a.api_key) return { type: 'login', detail: 'codex login' };
    } catch (e) {}
  }
  // 3. config.toml 中有自定义 provider
  const cfg = path.join(HOME, '.codex', 'config.toml');
  if (fs.existsSync(cfg)) {
    const content = fs.readFileSync(cfg, 'utf8');
    if (content.includes('base_url')) return { type: 'custom', detail: 'config.toml' };
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

const CCLINE_STATUS_LINE = {
  statusLine: {
    type: 'command',
    command: path.join(HOME, '.claude', 'ccline', 'ccline'),
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
    console.log(`
☠️ Code Abyss v${VERSION} - 邪修红尘仙·宿命深渊

用法:
  npx code-abyss [选项]

选项:
  --target <claude|codex>      安装目标
  --uninstall <claude|codex>   卸载目标
  --yes, -y                    全自动模式 (跳过所有可选提示)
  --help, -h                   显示帮助

示例:
  npx code-abyss                        # 交互菜单
  npx code-abyss --target claude -y      # 零配置一键安装
  npx code-abyss --uninstall claude      # 直接卸载
`);
    process.exit(0);
  }
}

// ── 卸载 ──

function runUninstall(tgt) {
  if (!['claude', 'codex'].includes(tgt)) {
    console.error('❌ --uninstall 必须是 claude 或 codex');
    process.exit(1);
  }
  const targetDir = path.join(HOME, `.${tgt}`);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ 未找到安装记录: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`\n🗑️  卸载 Code Abyss v${manifest.version} (${tgt})...\n`);

  (manifest.installed || []).forEach(f => {
    const p = path.join(targetDir, f);
    if (fs.existsSync(p)) { rmSafe(p); console.log(`🗑️  删除: ${f}`); }
  });
  (manifest.backups || []).forEach(f => {
    const bp = path.join(backupDir, f);
    const tp = path.join(targetDir, f);
    if (fs.existsSync(bp)) { fs.renameSync(bp, tp); console.log(`✅ 恢复: ${f}`); }
  });

  rmSafe(backupDir);
  const us = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(us)) fs.unlinkSync(us);
  console.log('\n✅ 卸载完成\n');
}

// ── 安装核心 ──

function installCore(tgt) {
  const targetDir = path.join(HOME, `.${tgt}`);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');

  console.log(`\n☠️ 开始安装到 ${targetDir}\n`);
  fs.mkdirSync(backupDir, { recursive: true });

  const filesToInstall = [
    { src: 'config/CLAUDE.md', dest: tgt === 'claude' ? 'CLAUDE.md' : null },
    { src: 'config/AGENTS.md', dest: tgt === 'codex' ? 'AGENTS.md' : null },
    { src: 'output-styles', dest: tgt === 'claude' ? 'output-styles' : null },
    { src: 'skills', dest: 'skills' }
  ].filter(f => f.dest !== null);

  const manifest = {
    version: VERSION, target: tgt,
    timestamp: new Date().toISOString(),
    installed: [], backups: []
  };

  filesToInstall.forEach(({ src, dest }) => {
    const srcPath = path.join(PKG_ROOT, src);
    const destPath = path.join(targetDir, dest);
    if (!fs.existsSync(srcPath)) { console.warn(`⚠️  跳过: ${src} (源文件不存在)`); return; }
    if (fs.existsSync(destPath)) {
      const bp = path.join(backupDir, dest);
      console.log(`📦 备份: ${dest}`);
      rmSafe(bp); copyRecursive(destPath, bp); manifest.backups.push(dest);
    }
    console.log(`📝 安装: ${dest}`);
    rmSafe(destPath); copyRecursive(srcPath, destPath); manifest.installed.push(dest);
  });

  // settings.json 最小写入
  const settingsPath = path.join(targetDir, 'settings.json');
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) { settings = {}; }
    fs.copyFileSync(settingsPath, path.join(backupDir, 'settings.json'));
    manifest.backups.push('settings.json');
  }
  if (tgt === 'claude') {
    settings.outputStyle = 'abyss-cultivator';
    console.log(`⚙️  配置: outputStyle = abyss-cultivator`);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  manifest.installed.push('settings.json');

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  // 备用卸载脚本
  const uSrc = path.join(PKG_ROOT, 'bin', 'uninstall.js');
  const uDest = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(uSrc)) { fs.copyFileSync(uSrc, uDest); fs.chmodSync(uDest, '755'); }

  console.log(`\n✅ 核心文件安装完成\n`);
  return { targetDir, settingsPath, settings, manifest, manifestPath };
}

// ── Claude 后续配置 ──

async function postClaude(rl, ctx) {
  // 认证检测
  const auth = detectClaudeAuth(ctx.settings);
  console.log('── 认证检测 ──');
  if (auth) {
    console.log(`✅ 已检测到认证: [${auth.type}] ${auth.detail}`);
  } else {
    console.log('⚠️  未检测到 API 认证');
    console.log('   支持方式:');
    console.log('   a) claude login (官方账号)');
    console.log('   b) 环境变量 ANTHROPIC_API_KEY');
    console.log('   c) 自定义 provider (base_url + token)');
    if (!autoYes) {
      const ans = (await ask(rl, '\n配置自定义 provider? [y/N]: ')).trim().toLowerCase();
      if (ans === 'y') {
        if (!ctx.settings.env) ctx.settings.env = {};
        const url = (await ask(rl, 'ANTHROPIC_BASE_URL: ')).trim();
        const token = (await ask(rl, 'ANTHROPIC_AUTH_TOKEN: ')).trim();
        if (url) ctx.settings.env.ANTHROPIC_BASE_URL = url;
        if (token) ctx.settings.env.ANTHROPIC_AUTH_TOKEN = token;
        fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
        console.log('✅ provider 已配置');
      }
    }
  }

  // 可选配置（一次多选）
  if (autoYes) {
    // 全自动：合并 settings，跳过 ccline
    console.log('\n── 自动配置 (--yes) ──');
    const log = [];
    deepMergeNew(ctx.settings, SETTINGS_TEMPLATE, '', log);
    log.forEach(l => console.log(l));
    fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
    console.log('✅ settings.json 合并完成');
    return;
  }

  console.log('\n── 可选配置 ──');
  console.log('  [1] 精细合并推荐 settings.json (保留现有配置)');
  console.log('  [2] 安装 ccline 状态栏 (需要 Nerd Font)');
  console.log('  [3] 全部跳过');
  const answer = (await ask(rl, '\n选择 (多选用逗号分隔，如 1,2) [3]: ')).trim() || '3';
  const choices = answer.split(',').map(s => s.trim());

  if (choices.includes('1')) {
    console.log('\n📋 精细合并 settings.json...\n');
    const log = [];
    deepMergeNew(ctx.settings, SETTINGS_TEMPLATE, '', log);
    log.forEach(l => console.log(l));
    fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
    console.log('\n✅ settings.json 合并完成');
  }
  if (choices.includes('2')) {
    await installCcline(ctx);
  }
}

async function installCcline(ctx) {
  console.log('\n📋 安装 ccline 状态栏...\n');
  const { execSync } = require('child_process');
  const cclineBin = path.join(HOME, '.claude', 'ccline', 'ccline');

  let installed = false;
  try { execSync('ccline --version', { stdio: 'pipe' }); installed = true; } catch (e) {}
  if (!installed && fs.existsSync(cclineBin)) installed = true;

  if (!installed) {
    console.log('📦 ccline 未检测到，正在安装...');
    try {
      execSync('npm install -g @cometix/ccline', { stdio: 'inherit' });
      installed = true;
      console.log('✅ ccline 安装成功');
    } catch (e) {
      console.warn('⚠️  npm install -g @cometix/ccline 失败，请手动安装');
      console.warn('   或从 https://github.com/Haleclipse/CCometixLine/releases 下载');
    }
  } else {
    console.log('✅ ccline 已安装');
  }

  const cclineConfig = path.join(HOME, '.claude', 'ccline', 'config.toml');
  if (installed && !fs.existsSync(cclineConfig)) {
    try { execSync('ccline --init', { stdio: 'inherit' }); console.log('⚙️  ccline 默认配置已生成'); }
    catch (e) { console.warn('⚠️  ccline --init 失败，可手动运行: ccline --init'); }
  } else if (fs.existsSync(cclineConfig)) {
    console.log('⚙️  保留: ccline/config.toml (已存在)');
  }

  const log = [];
  deepMergeNew(ctx.settings, CCLINE_STATUS_LINE, '', log);
  log.forEach(l => console.log(l));
  fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');

  console.log(`
⚠️  ccline 需要 Nerd Font 字体才能正确显示图标
   推荐: FiraCode Nerd Font / JetBrainsMono Nerd Font
   下载: https://www.nerdfonts.com/
   配置: ccline --config (交互式 TUI 编辑器)
`);
  console.log('✅ ccline 配置完成');
}

// ── Codex 后续配置 ──

async function postCodex(rl) {
  const cfgPath = path.join(HOME, '.codex', 'config.toml');
  const exists = fs.existsSync(cfgPath);

  // 认证检测
  const auth = detectCodexAuth();
  console.log('── 认证检测 ──');
  if (auth) {
    console.log(`✅ 已检测到认证: [${auth.type}] ${auth.detail}`);
  } else {
    console.log('⚠️  未检测到 API 认证');
    console.log('   支持方式:');
    console.log('   a) codex login (官方账号)');
    console.log('   b) 环境变量 OPENAI_API_KEY');
    console.log('   c) 自定义 provider (config.toml 中配置 base_url)');
  }

  if (autoYes) {
    // 全自动：不存在则写入模板
    if (!exists) {
      const src = path.join(PKG_ROOT, 'config', 'codex-config.example.toml');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, cfgPath);
        console.log('\n⚙️  写入: ~/.codex/config.toml (模板)');
        console.log('⚠️  请编辑 base_url 和 model 为你的实际配置');
      }
    } else {
      console.log('✅ config.toml 已存在');
    }
    return;
  }

  if (!exists) {
    console.log('\n⚠️  未检测到 ~/.codex/config.toml');
    console.log('\n  [1] 写入推荐 config.toml (含自定义 provider 模板)');
    console.log('  [2] 跳过');
    const answer = (await ask(rl, '\n选择 [1/2] [2]: ')).trim() || '2';
    if (answer === '1') {
      const src = path.join(PKG_ROOT, 'config', 'codex-config.example.toml');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, cfgPath);
        console.log('\n⚙️  写入: ~/.codex/config.toml');
        console.log('⚠️  请编辑 base_url 和 model 为你的实际配置');
      }
      console.log('✅ Codex 配置完成\n');
    }
  } else {
    console.log('✅ config.toml 已存在');
  }
}

// ── 主流程 ──

async function main() {
  if (uninstallTarget) { runUninstall(uninstallTarget); return; }

  if (target) {
    if (!['claude', 'codex'].includes(target)) {
      console.error('❌ --target 必须是 claude 或 codex');
      process.exit(1);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ctx = installCore(target);
    if (target === 'claude') await postClaude(rl, ctx);
    else await postCodex(rl);
    rl.close();
    finish(target);
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log(`☠️ Code Abyss v${VERSION}\n`);
  console.log('请选择操作:');
  console.log('  1) 安装到 Claude Code (~/.claude/)');
  console.log('  2) 安装到 Codex CLI (~/.codex/)');
  console.log('  3) 卸载 Claude Code');
  console.log('  4) 卸载 Codex CLI');

  const choice = await ask(rl, '\n选择 [1/2/3/4]: ');
  switch (choice.trim()) {
    case '1': {
      const ctx = installCore('claude');
      await postClaude(rl, ctx);
      rl.close(); finish('claude'); break;
    }
    case '2': {
      const ctx = installCore('codex');
      await postCodex(rl);
      rl.close(); finish('codex'); break;
    }
    case '3': rl.close(); runUninstall('claude'); break;
    case '4': rl.close(); runUninstall('codex'); break;
    default: rl.close(); console.error('❌ 无效选择'); process.exit(1);
  }
}

function finish(tgt) {
  const dir = path.join(HOME, `.${tgt}`);
  console.log(`\n⚚ 劫——破——了——！！！\n`);
  console.log(`✅ 安装完成: ${dir}`);
  console.log(`\n卸载命令: npx code-abyss --uninstall ${tgt}\n`);
}

main().catch(err => { console.error('❌ 错误:', err.message); process.exit(1); });

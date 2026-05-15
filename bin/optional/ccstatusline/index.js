'use strict';

// bin/optional/ccstatusline/index.js
// ccstatusline 状态栏可选模块（仅 Claude 适配）。
//
// 核心职责：
//   - detect:  探测 ccstatusline 是否可用
//   - deploy:  把 bundled settings.json 部署到 ~/.config/ccstatusline/，附带 schema guard
//   - install: 完成 detect/deploy + 写入 ctx.settings.statusLine + 收尾输出
//
// schema guard 防御 v2.1.11 类 Zod 枚举字段错配引发的整文件重置事故。

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { validateCcstatuslineSettings } = require('./schema-guard');

const PLUGIN_DIR = __dirname;
const BUNDLED_CONFIG = path.join(PLUGIN_DIR, 'settings.json');
const CCSTATUSLINE_CMD = 'npx -y ccstatusline@latest';
const CCSTATUSLINE_CONFIG = {
  statusLine: {
    type: 'command',
    command: CCSTATUSLINE_CMD,
    padding: 0,
  },
};

function detectCcstatusline(warn) {
  try {
    execSync('npx -y ccstatusline@latest --version', {
      stdio: 'pipe', timeout: 30000,
    });
    return true;
  } catch (e) {
    if (warn) warn(`ccstatusline 检测异常: ${e.message}`);
    return false;
  }
}

function deployCcstatuslineConfig(errors, { HOME, ok }) {
  if (!fs.existsSync(BUNDLED_CONFIG)) {
    errors.push(`${BUNDLED_CONFIG} 不存在`);
    return;
  }

  // schema guard：部署前校验 bundled config 没有非法枚举值
  let bundledSettings;
  try {
    bundledSettings = JSON.parse(fs.readFileSync(BUNDLED_CONFIG, 'utf8'));
  } catch (e) {
    errors.push(`bundled settings.json 解析失败: ${e.message}`);
    return;
  }
  const guardErrors = validateCcstatuslineSettings(bundledSettings);
  if (guardErrors.length > 0) {
    guardErrors.forEach((err) => errors.push(`schema guard: ${err}`));
    return;
  }

  const configDir = path.join(HOME, '.config', 'ccstatusline');
  const targetConfig = path.join(configDir, 'settings.json');

  fs.mkdirSync(configDir, { recursive: true });

  if (fs.existsSync(targetConfig)) {
    const backupDir = path.join(HOME, '.claude', '.code-abyss-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(targetConfig, path.join(backupDir, 'ccstatusline-settings.json'));
  }

  fs.copyFileSync(BUNDLED_CONFIG, targetConfig);
  ok('ccstatusline/settings.json 已部署 (Code Abyss 多行美化预设)');
}

async function installCcstatusline(ctx, deps) {
  const { HOME, ok, warn, info, fail, c } = deps;
  console.log('');
  info('安装 ccstatusline 状态栏...');
  const errors = [];

  deployCcstatuslineConfig(errors, { HOME, ok });

  ctx.settings.statusLine = CCSTATUSLINE_CONFIG.statusLine;
  ok(`statusLine → ${c.cyn(CCSTATUSLINE_CONFIG.statusLine.command)}`);
  fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');

  if (errors.length > 0) {
    console.log('');
    warn(c.b(`ccstatusline 安装有 ${errors.length} 个问题:`));
    errors.forEach((e) => fail(`  ${e}`));
  }

  console.log('');
  warn(`需要 ${c.b('Nerd Font')} 字体才能正确显示 Powerline 图标`);
  info(`推荐: FiraCode Nerd Font / JetBrainsMono Nerd Font`);
  info(`下载: ${c.cyn('https://www.nerdfonts.com/')}`);
  ok('ccstatusline 配置完成');
}

module.exports = {
  detectCcstatusline,
  deployCcstatuslineConfig,
  installCcstatusline,
  CCSTATUSLINE_CONFIG,
  CCSTATUSLINE_CMD,
};

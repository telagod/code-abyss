'use strict';

const fs = require('fs');
const path = require('path');

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

function getClaudeCoreFiles() {
  return [
    { src: 'config/CLAUDE.md', dest: 'CLAUDE.md' },
    { src: 'output-styles', dest: 'output-styles' },
    { src: 'skills', dest: 'skills' },
  ];
}

function detectClaudeAuth({
  settings = {},
  HOME,
  env = process.env,
  warn = () => {}
}) {
  const settingsEnv = settings.env || {};
  if (settingsEnv.ANTHROPIC_BASE_URL && settingsEnv.ANTHROPIC_AUTH_TOKEN) {
    return { type: 'custom', detail: settingsEnv.ANTHROPIC_BASE_URL };
  }
  if (env.ANTHROPIC_API_KEY) return { type: 'env', detail: 'ANTHROPIC_API_KEY' };
  if (env.ANTHROPIC_BASE_URL && env.ANTHROPIC_AUTH_TOKEN) {
    return { type: 'env-custom', detail: env.ANTHROPIC_BASE_URL };
  }

  const cred = path.join(HOME, '.claude', '.credentials.json');
  if (fs.existsSync(cred)) {
    try {
      const cc = JSON.parse(fs.readFileSync(cred, 'utf8'));
      if (cc.claudeAiOauth || cc.apiKey) return { type: 'login', detail: 'claude login' };
    } catch (e) {
      warn(`凭证文件损坏: ${cred}`);
    }
  }

  return null;
}

async function configureCustomProvider(ctx, { ok }) {
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

function mergeSettings(ctx, { deepMergeNew, printMergeLog, c, ok }) {
  const log = [];
  deepMergeNew(ctx.settings, SETTINGS_TEMPLATE, '', log);
  printMergeLog(log, c);
  fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
  ok('settings.json 合并完成');
}

async function postClaude({
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
  installCcline
}) {
  step(2, 3, '认证检测');
  const auth = detectClaudeAuth({ settings: ctx.settings, HOME, warn });
  if (auth) {
    ok(`${c.b(auth.type)} → ${auth.detail}`);
  } else {
    warn('未检测到 API 认证');
    info(`支持: ${c.cyn('claude login')} | ${c.cyn('ANTHROPIC_API_KEY')} | ${c.cyn('自定义 provider')}`);
    if (!autoYes) await configureCustomProvider(ctx, { ok });
  }

  step(3, 3, '可选配置');
  if (autoYes) {
    info('自动模式: 合并推荐配置');
    mergeSettings(ctx, { deepMergeNew, printMergeLog, c, ok });
    await installCcline(ctx, { HOME, PKG_ROOT, CCLINE_STATUS_LINE, ok, warn, info, c });
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

  if (choices.includes('settings')) {
    mergeSettings(ctx, { deepMergeNew, printMergeLog, c, ok });
  }
  if (choices.includes('ccline')) {
    await installCcline(ctx, { HOME, PKG_ROOT, CCLINE_STATUS_LINE, ok, warn, info, c });
  }
}

module.exports = {
  SETTINGS_TEMPLATE,
  CCLINE_STATUS_LINE,
  getClaudeCoreFiles,
  detectClaudeAuth,
  configureCustomProvider,
  mergeSettings,
  postClaude,
};

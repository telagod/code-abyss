'use strict';

const fs = require('fs');
const path = require('path');
const { getPackHostFiles } = require(path.join(__dirname, '..', 'lib', 'pack-registry.js'));
const {
  CCSTATUSLINE_CMD,
  CCSTATUSLINE_CONFIG,
} = require(path.join(__dirname, '..', 'optional', 'ccstatusline', 'index.js'));

const PROJECT_ROOT = path.join(__dirname, '..', '..');

// Placeholder — resolved lazily by resolveSettingsTemplate()
const SETTINGS_TEMPLATE = {
  $schema: 'https://json.schemastore.org/claude-code-settings.json',
  env: {
    CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1',
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    CLAUDE_CODE_ENABLE_TASKS: '1',
    CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION: '1',
    ENABLE_TOOL_SEARCH: 'auto:10'
  },
  defaultMode: 'bypassPermissions',
  alwaysThinkingEnabled: true,
  autoMemoryEnabled: true,
  model: 'opus',
  outputStyle: '__DEFAULT_STYLE__',
  attribution: { commit: '', pr: '' },
  sandbox: {
    autoAllowBashIfSandboxed: true
  },
  permissions: {
    allow: [
      'Bash', 'LS', 'Read', 'Edit', 'Write', 'MultiEdit',
      'Agent', 'Glob', 'Grep', 'WebFetch', 'WebSearch',
      'TodoWrite', 'NotebookRead', 'NotebookEdit', 'mcp__*'
    ]
  }
};

function getClaudeCoreFiles() {
  return getPackHostFiles(PROJECT_ROOT, 'abyss', 'claude');
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

function resolveSettingsTemplate(projectRoot) {
  const { getDefaultStyle } = require(path.join(__dirname, '..', 'lib', 'style-registry.js'));
  const slug = getDefaultStyle(projectRoot || PROJECT_ROOT, 'claude').slug;
  const template = JSON.parse(JSON.stringify(SETTINGS_TEMPLATE));
  template.outputStyle = slug;

  // abyss hooks 不在模板里注入——它们由 core-install 经
  // bin/lib/abyss-integration.js 幂等写入，且锚定安装后的 skill 路径。
  // 历史版本曾在此指向 PKG_ROOT（npx 缓存，易失），是个 bug。

  return template;
}

function mergeSettings(ctx, { deepMergeNew, printMergeLog, c, ok, projectRoot }) {
  const resolved = resolveSettingsTemplate(projectRoot);
  const log = [];
  deepMergeNew(ctx.settings, resolved, '', log);
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
  installCcstatusline,
  promptCheckbox = null
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
    await installCcstatusline(ctx, { HOME, PKG_ROOT, CCSTATUSLINE_CONFIG, ok, warn, info, c });
    return;
  }

  const checkboxPrompt = promptCheckbox || (async (config) => {
    const { checkbox } = await import('@inquirer/prompts');
    return checkbox(config);
  });
  const choices = await checkboxPrompt({
    message: '选择要安装的配置',
    choices: [
      {
        name: 'settings.json 推荐配置',
        value: 'settings',
        checked: true,
        description: '精细合并，保留现有配置，只补齐 Code Abyss 推荐项',
      },
      {
        name: 'ccstatusline 状态栏',
        value: 'ccstatusline',
        checked: true,
        description: '安装多行美化状态栏；需要 Nerd Font 才能完整显示图标',
      },
    ],
  });

  if (choices.includes('settings')) {
    mergeSettings(ctx, { deepMergeNew, printMergeLog, c, ok });
  }
  if (choices.includes('ccstatusline')) {
    await installCcstatusline(ctx, { HOME, PKG_ROOT, CCSTATUSLINE_CONFIG, ok, warn, info, c });
  }
}

module.exports = {
  SETTINGS_TEMPLATE,
  resolveSettingsTemplate,
  CCSTATUSLINE_CONFIG,
  getClaudeCoreFiles,
  detectClaudeAuth,
  configureCustomProvider,
  mergeSettings,
  postClaude,
};

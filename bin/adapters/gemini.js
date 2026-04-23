'use strict';

const fs = require('fs');
const path = require('path');
const { getPackHostFiles } = require(path.join(__dirname, '..', 'lib', 'pack-registry.js'));

const PROJECT_ROOT = path.join(__dirname, '..', '..');

const GEMINI_SETTINGS_TEMPLATE = {
  theme: 'GitHub',
  privacy: {
    usageStatisticsEnabled: false,
  },
};

function getGeminiCoreFiles() {
  return getPackHostFiles(PROJECT_ROOT, 'abyss', 'gemini');
}

function detectGeminiAuth({
  settings = {},
  HOME,
  env = process.env,
}) {
  if (env.GEMINI_API_KEY) return { type: 'env', detail: 'GEMINI_API_KEY' };
  if (env.GOOGLE_API_KEY) return { type: 'env', detail: 'GOOGLE_API_KEY' };
  if (env.GOOGLE_APPLICATION_CREDENTIALS) return { type: 'env', detail: 'GOOGLE_APPLICATION_CREDENTIALS' };

  const adcPath = path.join(HOME, '.config', 'gcloud', 'application_default_credentials.json');
  if (fs.existsSync(adcPath)) return { type: 'adc', detail: 'gcloud application_default_credentials.json' };

  if (settings && settings.authType) return { type: 'settings', detail: `settings.json (${settings.authType})` };
  return null;
}

function mergeGeminiSettings(existing = {}) {
  return {
    ...GEMINI_SETTINGS_TEMPLATE,
    ...existing,
    privacy: {
      ...GEMINI_SETTINGS_TEMPLATE.privacy,
      ...(existing.privacy || {}),
    },
  };
}

async function postGemini({
  settingsPath,
  settings,
  autoYes,
  HOME,
  PKG_ROOT,
  step,
  ok,
  warn,
  info,
  c,
}) {
  step(2, 3, '认证检测');
  const auth = detectGeminiAuth({ settings, HOME });
  if (auth) {
    ok(`${c.b(auth.type)} → ${auth.detail}`);
  } else {
    warn('未检测到 Gemini API 认证');
    info(`支持: ${c.cyn('GEMINI_API_KEY')} | ${c.cyn('GOOGLE_API_KEY')} | ${c.cyn('GOOGLE_APPLICATION_CREDENTIALS')}`);
  }

  step(3, 3, '可选配置');
  const merged = mergeGeminiSettings(settings);
  if (autoYes) {
    fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + '\n');
    ok('写入: ~/.gemini/settings.json (模板)');
    return;
  }

  const { confirm } = await import('@inquirer/prompts');
  const shouldWrite = await confirm({ message: '合并推荐 Gemini settings.json?', default: true });
  if (shouldWrite) {
    fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + '\n');
    ok('settings.json 合并完成');
  } else {
    ok('保留现有 Gemini settings.json');
  }
}

module.exports = {
  GEMINI_SETTINGS_TEMPLATE,
  getGeminiCoreFiles,
  detectGeminiAuth,
  mergeGeminiSettings,
  postGemini,
};

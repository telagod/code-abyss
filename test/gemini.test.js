'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  GEMINI_SETTINGS_TEMPLATE,
  getGeminiCoreFiles,
  detectGeminiAuth,
  mergeGeminiSettings,
} = require('../bin/adapters/gemini');

describe('gemini adapter', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gemini-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('GEMINI_SETTINGS_TEMPLATE 保持关键字段', () => {
    expect(GEMINI_SETTINGS_TEMPLATE).toHaveProperty('privacy');
  });

  test('getGeminiCoreFiles: 返回 Gemini 核心映射', () => {
    expect(getGeminiCoreFiles()).toEqual([
      { src: 'skills', dest: 'skills', root: 'gemini' },
      { src: 'bin/lib', dest: 'bin/lib', root: 'gemini' },
    ]);
  });

  test('detectGeminiAuth: GEMINI_API_KEY 优先', () => {
    const auth = detectGeminiAuth({ HOME: tmpHome, env: { GEMINI_API_KEY: 'x' } });
    expect(auth).toEqual({ type: 'env', detail: 'GEMINI_API_KEY' });
  });

  test('detectGeminiAuth: GOOGLE_API_KEY', () => {
    const auth = detectGeminiAuth({ HOME: tmpHome, env: { GOOGLE_API_KEY: 'x' } });
    expect(auth).toEqual({ type: 'env', detail: 'GOOGLE_API_KEY' });
  });

  test('detectGeminiAuth: ADC 文件', () => {
    const adcDir = path.join(tmpHome, '.config', 'gcloud');
    fs.mkdirSync(adcDir, { recursive: true });
    fs.writeFileSync(path.join(adcDir, 'application_default_credentials.json'), '{}\n');
    const auth = detectGeminiAuth({ HOME: tmpHome, env: {} });
    expect(auth).toEqual({ type: 'adc', detail: 'gcloud application_default_credentials.json' });
  });

  test('mergeGeminiSettings: 合并推荐模板', () => {
    const merged = mergeGeminiSettings({ theme: 'Dracula' });
    expect(merged.theme).toBe('Dracula');
    expect(merged.privacy.usageStatisticsEnabled).toBe(false);
  });
});


describe('gstack gemini renderer', () => {
  const { buildGeminiCommand, transformGeminiSkillContent } = require('../bin/lib/gstack-gemini');

  test('buildGeminiCommand 生成 TOML command', () => {
    const content = buildGeminiCommand('review', 'Review skill.', '~/.gemini/skills/gstack/review/SKILL.md');
    expect(content).toContain('description = "Review skill."');
    expect(content).toContain('prompt = """');
    expect(content).toContain('~/.gemini/skills/gstack/review/SKILL.md');
  });

  test('transformGeminiSkillContent 重写 Claude skill 路径', () => {
    const content = transformGeminiSkillContent('Read ~/.claude/skills/gstack/review/SKILL.md and .claude/skills/gstack/bin/tool');
    expect(content).toContain('~/.gemini/skills/gstack/review/SKILL.md');
    expect(content).toContain('.gemini/skills/gstack/bin/tool');
    expect(content).not.toContain('.claude/skills/gstack');
  });
});

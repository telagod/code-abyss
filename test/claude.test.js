'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  SETTINGS_TEMPLATE,
  resolveSettingsTemplate,
  getClaudeCoreFiles,
  detectClaudeAuth,
} = require('../bin/adapters/claude');

describe('claude adapter', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-claude-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('SETTINGS_TEMPLATE 保持关键字段', () => {
    expect(SETTINGS_TEMPLATE).toHaveProperty('env');
    expect(SETTINGS_TEMPLATE).toHaveProperty('permissions');
    expect(SETTINGS_TEMPLATE.outputStyle).toBe('__DEFAULT_STYLE__');
  });

  test('resolveSettingsTemplate 解析真实默认 slug', () => {
    const projectRoot = path.join(__dirname, '..');
    const resolved = resolveSettingsTemplate(projectRoot);
    expect(resolved.outputStyle).not.toBe('__DEFAULT_STYLE__');
    expect(typeof resolved.outputStyle).toBe('string');
    expect(resolved.outputStyle.length).toBeGreaterThan(0);
  });

  test('getClaudeCoreFiles: 返回 Claude 核心映射', () => {
    expect(getClaudeCoreFiles()).toEqual([
      { src: 'config/CLAUDE.md', dest: 'CLAUDE.md', root: 'claude' },
      { src: 'output-styles', dest: 'output-styles', root: 'claude' },
      { src: 'personal-skill-system/skills', dest: 'skills', root: 'claude' },
      { src: 'bin/lib', dest: 'bin/lib', root: 'claude' },
    ]);
  });

  test('detectClaudeAuth: settings env 自定义 provider 优先', () => {
    const auth = detectClaudeAuth({
      settings: { env: { ANTHROPIC_BASE_URL: 'http://x', ANTHROPIC_AUTH_TOKEN: 'tok' } },
      HOME: tmpHome,
      env: {},
      warn: jest.fn(),
    });

    expect(auth).toEqual({ type: 'custom', detail: 'http://x' });
  });

  test('detectClaudeAuth: ANTHROPIC_API_KEY', () => {
    const auth = detectClaudeAuth({
      settings: {},
      HOME: tmpHome,
      env: { ANTHROPIC_API_KEY: 'sk-test' },
      warn: jest.fn(),
    });

    expect(auth).toEqual({ type: 'env', detail: 'ANTHROPIC_API_KEY' });
  });

  test('detectClaudeAuth: env custom provider', () => {
    const auth = detectClaudeAuth({
      settings: {},
      HOME: tmpHome,
      env: { ANTHROPIC_BASE_URL: 'http://custom', ANTHROPIC_AUTH_TOKEN: 'tok' },
      warn: jest.fn(),
    });

    expect(auth).toEqual({ type: 'env-custom', detail: 'http://custom' });
  });

  test('detectClaudeAuth: credentials 登录态', () => {
    const claudeDir = path.join(tmpHome, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(path.join(claudeDir, '.credentials.json'), JSON.stringify({ apiKey: 'k' }));

    const auth = detectClaudeAuth({ settings: {}, HOME: tmpHome, env: {}, warn: jest.fn() });
    expect(auth).toEqual({ type: 'login', detail: 'claude login' });
  });

  test('detectClaudeAuth: credentials 损坏 warning + null', () => {
    const claudeDir = path.join(tmpHome, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(path.join(claudeDir, '.credentials.json'), '{bad json');

    const warn = jest.fn();
    const auth = detectClaudeAuth({ settings: {}, HOME: tmpHome, env: {}, warn });

    expect(auth).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('凭证文件损坏');
  });
});

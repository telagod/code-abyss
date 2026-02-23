'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { detectCodexAuth, getCodexCoreFiles } = require('../bin/adapters/codex');

describe('codex adapter', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-codex-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('detectCodexAuth: OPENAI_API_KEY 优先', () => {
    const auth = detectCodexAuth({
      HOME: tmpHome,
      env: { OPENAI_API_KEY: 'sk-test' },
      warn: jest.fn(),
    });

    expect(auth).toEqual({ type: 'env', detail: 'OPENAI_API_KEY' });
  });

  test('detectCodexAuth: auth.json token => login', () => {
    const codexDir = path.join(tmpHome, '.codex');
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, 'auth.json'), JSON.stringify({ token: 'tok' }));

    const auth = detectCodexAuth({ HOME: tmpHome, env: {}, warn: jest.fn() });
    expect(auth).toEqual({ type: 'login', detail: 'codex login' });
  });

  test('detectCodexAuth: config.toml 含 base_url => custom', () => {
    const codexDir = path.join(tmpHome, '.codex');
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, 'config.toml'), 'base_url = \"https://example.com/v1\"\n');

    const auth = detectCodexAuth({ HOME: tmpHome, env: {}, warn: jest.fn() });
    expect(auth).toEqual({ type: 'custom', detail: 'config.toml' });
  });

  test('detectCodexAuth: auth.json 损坏会 warn 且返回 null', () => {
    const codexDir = path.join(tmpHome, '.codex');
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, 'auth.json'), '{bad json');

    const warn = jest.fn();
    const auth = detectCodexAuth({ HOME: tmpHome, env: {}, warn });

    expect(auth).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('凭证文件损坏');
  });

  test('getCodexCoreFiles: 仅包含 codex 所需核心文件', () => {
    expect(getCodexCoreFiles()).toEqual([
      { src: 'config/AGENTS.md', dest: 'AGENTS.md' },
      { src: 'skills', dest: 'skills' },
    ]);
  });
});

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  cleanupLegacyCodexConfig,
  detectCodexAuth,
  getCodexCoreFiles,
  mergeCodexConfigDefaults,
  patchCodexConfig,
  patchCodexConfigDefaults,
} = require('../bin/adapters/codex');

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
      { src: 'skills', dest: 'skills' },
    ]);
  });

  test('mergeCodexConfigDefaults: 缺失项自动补全', () => {
    const input = [
      'model = "gpt-5"',
      '',
      '[tools]',
      'web_search = true',
      '',
    ].join('\n');

    const { merged, added } = mergeCodexConfigDefaults(input);
    expect(added).toEqual(['approval_policy', 'sandbox_mode', 'features.multi_agent']);
    expect(merged).toContain('approval_policy = "never"');
    expect(merged).toContain('sandbox_mode = "danger-full-access"');
    expect(merged).toContain('[features]');
    expect(merged).toContain('multi_agent = true');
  });

  test('mergeCodexConfigDefaults: 已有项不覆盖', () => {
    const input = [
      'sandbox_mode = "workspace-write"',
      '',
      '[features]',
      'multi_agent = false',
      '',
    ].join('\n');

    const { merged, added } = mergeCodexConfigDefaults(input);
    expect(added).toEqual(['approval_policy']);
    expect(merged).toContain('sandbox_mode = "workspace-write"');
    expect(merged).toContain('multi_agent = false');
    expect(merged).not.toContain('danger-full-access');
  });

  test('mergeCodexConfigDefaults: features 存在但缺少 multi_agent 时补入', () => {
    const input = [
      'sandbox_mode = "workspace-write"',
      '',
      '[features]',
      'other_flag = true',
      '',
      '[tools]',
      'web_search = true',
      '',
    ].join('\n');

    const { merged, added } = mergeCodexConfigDefaults(input);
    expect(added).toEqual(['approval_policy', 'features.multi_agent']);
    expect(merged).toMatch(/\[features\]\nmulti_agent = true\nother_flag = true/);
  });

  test('patchCodexConfigDefaults: 写回文件并返回补全项', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, 'model = "gpt-5"\n');

    const added = patchCodexConfigDefaults(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    expect(added).toEqual(['approval_policy', 'sandbox_mode', 'features.multi_agent']);
    expect(saved).toContain('approval_policy = "never"');
    expect(saved).toContain('sandbox_mode = "danger-full-access"');
    expect(saved).toContain('[features]');
    expect(saved).toContain('multi_agent = true');
  });

  test('cleanupLegacyCodexConfig: 清理 removed features', () => {
    const input = [
      '[features]',
      'remote_models = true',
      'search_tool = false',
      'multi_agent = true',
      '',
    ].join('\n');

    const { merged, removed, migrated } = cleanupLegacyCodexConfig(input);
    expect(removed.sort()).toEqual(['remote_models', 'search_tool']);
    expect(migrated).toEqual([]);
    expect(merged).toContain('multi_agent = true');
    expect(merged).not.toContain('remote_models = true');
    expect(merged).not.toContain('search_tool = false');
  });

  test('cleanupLegacyCodexConfig: deprecated web_search_* 迁移到 [tools].web_search', () => {
    const input = [
      '[features]',
      'web_search_request = true',
      'web_search_cached = false',
      '',
    ].join('\n');

    const { merged, removed, migrated } = cleanupLegacyCodexConfig(input);
    expect(removed.sort()).toEqual(['web_search_cached', 'web_search_request']);
    expect(migrated).toEqual(['tools.web_search=true']);
    expect(merged).toContain('[tools]');
    expect(merged).toContain('web_search = true');
    expect(merged).not.toContain('web_search_request');
    expect(merged).not.toContain('web_search_cached');
  });

  test('patchCodexConfig: 同时返回补全、清理、迁移结果', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, '[features]\nremote_models = true\nweb_search_request = true\n');

    const report = patchCodexConfig(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    expect(report.added).toEqual(['approval_policy', 'sandbox_mode', 'features.multi_agent']);
    expect(report.removed.sort()).toEqual(['remote_models', 'web_search_request']);
    expect(report.migrated).toEqual(['tools.web_search=true']);
    expect(saved).toContain('approval_policy = "never"');
    expect(saved).toContain('sandbox_mode = "danger-full-access"');
    expect(saved).toContain('multi_agent = true');
    expect(saved).toContain('web_search = true');
    expect(saved).not.toContain('remote_models = true');
  });

  test('mergeCodexConfigDefaults: root 参数插入在首个 section 前，避免错层', () => {
    const input = [
      '[features]',
      'multi_agent = true',
      '',
      '[notice.model_migrations]',
      '"gpt-5.2" = "gpt-5.2-codex"',
      '',
    ].join('\n');

    const { merged } = mergeCodexConfigDefaults(input);
    const lines = merged.split('\n');
    const firstSectionIdx = lines.findIndex((x) => x.trim().startsWith('['));
    const firstSection = firstSectionIdx >= 0 ? lines[firstSectionIdx] : '';

    expect(firstSection).toBe('[features]');
    expect(merged.indexOf('approval_policy = "never"')).toBeLessThan(merged.indexOf('[features]'));
    expect(merged.indexOf('sandbox_mode = "danger-full-access"')).toBeLessThan(merged.indexOf('[features]'));
  });

  test('patchCodexConfig: full access 下移除 projects trust_level 段', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(
      cfgPath,
      [
        'sandbox_mode = "danger-full-access"',
        '',
        '[projects."/tmp/demo"]',
        'trust_level = "trusted"',
        '',
        '[features]',
        'multi_agent = true',
        '',
      ].join('\n')
    );

    const report = patchCodexConfig(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    expect(report.removed).toContain('projects.*.trust_level');
    expect(saved).not.toContain('[projects."/tmp/demo"]');
    expect(saved).not.toContain('trust_level = "trusted"');
  });

  test('patchCodexConfig: 清理错层 root 参数（table 内 sandbox_mode）', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(
      cfgPath,
      [
        '[notice.model_migrations]',
        '"gpt-5.2" = "gpt-5.2-codex"',
        'sandbox_mode = "workspace-write"',
        '',
        '[features]',
        'multi_agent = true',
        '',
      ].join('\n')
    );

    patchCodexConfig(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    const rootPrefix = saved.split('[features]')[0];
    expect(rootPrefix).toContain('sandbox_mode = "danger-full-access"');
    expect(saved).not.toContain(
      '[notice.model_migrations]\n"gpt-5.2" = "gpt-5.2-codex"\nsandbox_mode = "workspace-write"'
    );
  });
});

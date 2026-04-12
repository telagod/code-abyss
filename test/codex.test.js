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
      { src: 'config/instruction.md', dest: 'instruction.md', root: 'codex' },
      { src: 'skills', dest: 'skills', root: 'agents' },
      { src: 'bin/lib', dest: 'bin/lib', root: 'agents' },
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
    expect(added).toEqual([
      'approval_policy',
      'allow_login_shell',
      'cli_auth_credentials_store',
      'model_instructions_file',
      'sandbox_mode',
      'web_search',
    ]);
    expect(merged).toContain('approval_policy = "on-request"');
    expect(merged).toContain('allow_login_shell = true');
    expect(merged).toContain('cli_auth_credentials_store = "file"');
    expect(merged).toContain('model_instructions_file = "./instruction.md"');
    expect(merged).toContain('sandbox_mode = "read-only"');
    expect(merged).toContain('web_search = "cached"');
  });

  test('mergeCodexConfigDefaults: 已有项不覆盖', () => {
    const input = [
      'sandbox_mode = "workspace-write"',
      '',
      '[profiles.abyss]',
      'sandbox_mode = "danger-full-access"',
      'approval_policy = "never"',
      '',
    ].join('\n');

    const { merged, added } = mergeCodexConfigDefaults(input);
    expect(added).toEqual([
      'approval_policy',
      'allow_login_shell',
      'cli_auth_credentials_store',
      'model_instructions_file',
      'web_search',
    ]);
    expect(merged).toContain('sandbox_mode = "workspace-write"');
    expect(merged).toContain('[profiles.abyss]');
    expect(merged).toContain('sandbox_mode = "danger-full-access"');
    expect(merged).toContain('approval_policy = "never"');
    expect(merged).not.toContain('sandbox_mode = "read-only"');
  });

  test('mergeCodexConfigDefaults: 保留 profiles.* 中合法 root-like 键', () => {
    const input = [
      '[profiles.safe]',
      'approval_policy = "on-request"',
      'sandbox_mode = "workspace-write"',
      'web_search = "cached"',
      '',
    ].join('\n');

    const { merged, added } = mergeCodexConfigDefaults(input);
    expect(added).toEqual([
      'approval_policy',
      'allow_login_shell',
      'cli_auth_credentials_store',
      'model_instructions_file',
      'sandbox_mode',
      'web_search',
    ]);
    expect(merged).toContain('[profiles.safe]');
    expect(merged).toContain('approval_policy = "on-request"');
    expect(merged).toContain('sandbox_mode = "workspace-write"');
    expect(merged).toContain('web_search = "cached"');
  });

  test('patchCodexConfigDefaults: 写回文件并返回补全项', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, 'model = "gpt-5"\n');

    const added = patchCodexConfigDefaults(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    expect(added).toEqual([
      'approval_policy',
      'allow_login_shell',
      'cli_auth_credentials_store',
      'model_instructions_file',
      'sandbox_mode',
      'web_search',
    ]);
    expect(saved).toContain('approval_policy = "on-request"');
    expect(saved).toContain('allow_login_shell = true');
    expect(saved).toContain('cli_auth_credentials_store = "file"');
    expect(saved).toContain('model_instructions_file = "./instruction.md"');
    expect(saved).toContain('sandbox_mode = "read-only"');
    expect(saved).toContain('web_search = "cached"');
  });

  test('cleanupLegacyCodexConfig: 清理 removed features', () => {
    const input = [
      '[features]',
      'remote_models = true',
      'search_tool = false',
      'shell_snapshot = true',
      '',
    ].join('\n');

    const { merged, removed, migrated } = cleanupLegacyCodexConfig(input);
    expect(removed.sort()).toEqual(['remote_models', 'search_tool']);
    expect(migrated).toEqual([]);
    expect(merged).toContain('shell_snapshot = true');
    expect(merged).not.toContain('remote_models = true');
    expect(merged).not.toContain('search_tool = false');
  });

  test('cleanupLegacyCodexConfig: deprecated web_search_* 迁移到 root web_search', () => {
    const input = [
      '[features]',
      'web_search_request = true',
      'web_search_cached = false',
      '',
    ].join('\n');

    const { merged, removed, migrated } = cleanupLegacyCodexConfig(input);
    expect(removed.sort()).toEqual(['web_search_cached', 'web_search_request']);
    expect(migrated).toEqual(['web_search=live']);
    expect(merged).toContain('web_search = "live"');
    expect(merged).not.toContain('web_search_request');
    expect(merged).not.toContain('web_search_cached');
  });

  test('cleanupLegacyCodexConfig: 迁移旧 [tools].web_search 布尔配置', () => {
    const input = [
      '[tools]',
      'web_search = true',
      '',
    ].join('\n');

    const { merged, removed, migrated } = cleanupLegacyCodexConfig(input);
    expect(removed).toEqual(['tools.web_search']);
    expect(migrated).toEqual(['web_search=cached']);
    expect(merged).toContain('web_search = "cached"');
    expect(merged).not.toContain('[tools]\nweb_search = true');
  });

  test('patchCodexConfig: 同时返回补全、清理、迁移结果', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, '[features]\nremote_models = true\nweb_search_request = true\n');

    const report = patchCodexConfig(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    expect(report.added).toEqual([
      'approval_policy',
      'allow_login_shell',
      'cli_auth_credentials_store',
      'model_instructions_file',
      'sandbox_mode',
    ]);
    expect(report.removed.sort()).toEqual(['remote_models', 'web_search_request']);
    expect(report.migrated).toEqual(['web_search=live']);
    expect(saved).toContain('approval_policy = "on-request"');
    expect(saved).toContain('allow_login_shell = true');
    expect(saved).toContain('cli_auth_credentials_store = "file"');
    expect(saved).toContain('model_instructions_file = "./instruction.md"');
    expect(saved).toContain('sandbox_mode = "read-only"');
    expect(saved).toContain('web_search = "live"');
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
    expect(merged.indexOf('approval_policy = "on-request"')).toBeLessThan(merged.indexOf('[features]'));
    expect(merged.indexOf('sandbox_mode = "read-only"')).toBeLessThan(merged.indexOf('[features]'));
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
        '[profiles.abyss]',
        'sandbox_mode = "danger-full-access"',
        'approval_policy = "never"',
        '',
        '[notice.model_migrations]',
        '"gpt-5.2" = "gpt-5.2-codex"',
        'sandbox_mode = "workspace-write"',
        '',
      ].join('\n')
    );

    patchCodexConfig(cfgPath);
    const saved = fs.readFileSync(cfgPath, 'utf8');

    const rootPrefix = saved.split('[profiles.abyss]')[0];
    expect(rootPrefix).toContain('sandbox_mode = "read-only"');
    expect(rootPrefix).toContain('approval_policy = "on-request"');
    expect(saved).toContain('[profiles.abyss]\nsandbox_mode = "danger-full-access"\napproval_policy = "never"');
    expect(saved).not.toContain(
      '[notice.model_migrations]\n"gpt-5.2" = "gpt-5.2-codex"\nsandbox_mode = "workspace-write"'
    );
  });
});

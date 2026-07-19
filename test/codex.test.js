'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  cleanupLegacyCodexConfig,
  cleanupLegacyCodexRuntime,
  detectCodexAuth,
  ensureCodexProfileFiles,
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
      { src: 'skills', dest: 'skills', root: 'codex' },
      { src: 'bin/lib', dest: 'bin/lib', root: 'codex' },
    ]);
  });

  test('cleanupLegacyCodexRuntime: 清理旧 AGENTS 与 prompts 残留', () => {
    const codexDir = path.join(tmpHome, '.codex');
    fs.mkdirSync(path.join(codexDir, 'prompts'), { recursive: true });
    fs.writeFileSync(path.join(codexDir, 'AGENTS.md'), '# old\n');
    fs.writeFileSync(path.join(codexDir, 'prompts', 'old.md'), 'legacy\n');

    const infos = [];
    const removed = cleanupLegacyCodexRuntime({
      HOME: tmpHome,
      info: (msg) => infos.push(msg),
    });

    expect(removed.sort()).toEqual(['AGENTS.md', 'prompts/']);
    expect(fs.existsSync(path.join(codexDir, 'AGENTS.md'))).toBe(false);
    expect(fs.existsSync(path.join(codexDir, 'prompts'))).toBe(false);
    expect(infos.join('\n')).toContain('AGENTS.md');
    expect(infos.join('\n')).toContain('prompts/');
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
    expect(merged).toContain('sandbox_mode = "workspace-write"');
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
    expect(merged).not.toContain('[profiles.full_auto]');
    expect(merged).not.toContain('[profiles.full_access]');
  });

  test('mergeCodexConfigDefaults: 不生成 Codex 0.134+ 已废弃的内联 profiles', () => {
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
    expect(saved).toContain('sandbox_mode = "workspace-write"');
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
    expect(saved).toContain('sandbox_mode = "workspace-write"');
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
    expect(merged.indexOf('sandbox_mode = "workspace-write"')).toBeLessThan(merged.indexOf('[features]'));
  });

  test('cleanupLegacyCodexConfig: 清理旧版 code-abyss 内联 profiles', () => {
    const input = [
      '[profiles.full_auto]',
      'approval_policy = "on-request"',
      'sandbox_mode = "workspace-write"',
      'web_search = "cached"',
      '',
      '[profiles.full_access]',
      'approval_policy = "on-request"',
      'sandbox_mode = "danger-full-access"',
      'web_search = "live"',
      '',
      '[profiles.user]',
      'sandbox_mode = "read-only"',
      '',
    ].join('\n');

    const { merged, removed } = cleanupLegacyCodexConfig(input);

    expect(removed.sort()).toEqual(['profiles.full_access', 'profiles.full_auto']);
    expect(merged).not.toContain('[profiles.full_auto]');
    expect(merged).not.toContain('[profiles.full_access]');
    expect(merged).toContain('[profiles.user]');
    expect(merged).toContain('sandbox_mode = "read-only"');
  });

  test('patchCodexConfig: 保留 projects trust_level 段', () => {
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

    expect(report.removed).not.toContain('projects.*.trust_level');
    expect(saved).toContain('[projects."/tmp/demo"]');
    expect(saved).toContain('trust_level = "trusted"');
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
    expect(rootPrefix).toContain('sandbox_mode = "workspace-write"');
    expect(rootPrefix).toContain('approval_policy = "on-request"');
    expect(saved).toContain('[profiles.abyss]\nsandbox_mode = "danger-full-access"\napproval_policy = "never"');
    expect(saved).not.toContain(
      '[notice.model_migrations]\n"gpt-5.2" = "gpt-5.2-codex"\nsandbox_mode = "workspace-write"'
    );
  });

  test('ensureCodexProfileFiles: 生成当前 Codex 支持的 profile 文件并写入 manifest', () => {
    const codexDir = path.join(tmpHome, '.codex');
    const manifestPath = path.join(codexDir, '.code-abyss-backup', 'manifest.json');
    const ctx = {
      targetDir: codexDir,
      manifestPath,
      manifest: { installed: [], backups: [] },
    };
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

    const result = ensureCodexProfileFiles({ HOME: tmpHome, ctx });

    expect(result.installed.sort()).toEqual(['full_access.config.toml', 'full_auto.config.toml']);
    expect(fs.readFileSync(path.join(codexDir, 'full_auto.config.toml'), 'utf8'))
      .toContain('# code-abyss managed Codex profile: full_auto');
    expect(fs.readFileSync(path.join(codexDir, 'full_access.config.toml'), 'utf8'))
      .toContain('sandbox_mode = "danger-full-access"');
    expect(ctx.manifest.installed).toEqual([
      { root: 'codex', path: 'full_auto.config.toml' },
      { root: 'codex', path: 'full_access.config.toml' },
    ]);
    expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).installed).toHaveLength(2);
  });

  test('ensureCodexProfileFiles: 不覆盖用户自有 profile 文件', () => {
    const codexDir = path.join(tmpHome, '.codex');
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, 'full_access.config.toml'), 'sandbox_mode = "read-only"\n');

    const result = ensureCodexProfileFiles({ HOME: tmpHome });

    expect(result.skipped).toEqual(['full_access.config.toml']);
    expect(fs.readFileSync(path.join(codexDir, 'full_access.config.toml'), 'utf8'))
      .toBe('sandbox_mode = "read-only"\n');
    expect(fs.existsSync(path.join(codexDir, 'full_auto.config.toml'))).toBe(true);
  });

  test('patchCodexConfig: 多行字符串内的 sandbox_mode 不被误判为 root 键', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, [
      'model = "gpt-4"',
      '',
      '[notice]',
      'message = """',
      'sandbox_mode = "workspace-write"',
      '"""',
      '',
    ].join('\n'));

    patchCodexConfig(cfgPath);
    const raw = fs.readFileSync(cfgPath, 'utf8');
    expect(raw).toContain('sandbox_mode = "workspace-write"');
    expect(raw).toContain('message = """');
    // root 默认键应被注入，但不会把字符串内容误删
    expect(raw).toMatch(/sandbox_mode = "workspace-write"/);
  });

  test('patchCodexConfig: 数组表头 [[hooks.SessionStart]] 被正确识别为 section', () => {
    const cfgPath = path.join(tmpHome, '.codex', 'config.toml');
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, [
      '[[hooks.SessionStart]]',
      'command = "echo start"',
      '',
    ].join('\n'));

    patchCodexConfig(cfgPath);
    const raw = fs.readFileSync(cfgPath, 'utf8');
    // 默认 root 键应插入到数组表头之前，而非文件末尾
    const approvalIdx = raw.indexOf('approval_policy');
    const hookIdx = raw.indexOf('[[hooks.SessionStart]]');
    expect(approvalIdx).toBeGreaterThan(-1);
    expect(hookIdx).toBeGreaterThan(-1);
    expect(approvalIdx).toBeLessThan(hookIdx);
  });

  test('stripCodexAbyssIntegration: [mcp_servers.abyss] 带空格或注释也能被剥除', () => {
    const { stripCodexAbyssIntegration } = require('../bin/adapters/codex');
    const raw = [
      'model = "gpt-4"',
      '',
      '[mcp_servers.abyss ]',
      'command = "abyss"',
      '',
      '[mcp_servers.other]',
      'command = "x"',
      '',
    ].join('\n');
    const { merged, removed } = stripCodexAbyssIntegration(raw);
    expect(removed).toBe(true);
    expect(merged).not.toContain('mcp_servers.abyss');
    expect(merged).toContain('mcp_servers.other');
  });

  test('stripCodexAbyssIntegration: hook 事件表头带尾随空格也能被识别', () => {
    const { stripCodexAbyssIntegration } = require('../bin/adapters/codex');
    const raw = [
      '[[hooks.SessionStart ]]',
      'command = "bash skills/indexing-code/hooks/common/pre-edit.sh"',
      '',
      '[[hooks.SessionStart.hooks]]',
      'type = "command"',
      'command = "bash skills/indexing-code/hooks/common/pre-edit.sh"',
      '',
    ].join('\n');
    const { merged, removed } = stripCodexAbyssIntegration(raw);
    expect(removed).toBe(true);
    expect(merged).not.toContain('indexing-code/hooks/common');
  });
});

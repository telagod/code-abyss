'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { detectCcstatusline, deployCcstatuslineConfig, installCcstatusline } = require(path.join(__dirname, '..', 'bin', 'optional', 'ccstatusline', 'index.js'));

describe('detectCcstatusline', () => {
  test('返回 boolean', () => {
    const result = detectCcstatusline();
    expect(typeof result).toBe('boolean');
  });
});

describe('deployCcstatuslineConfig', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccstatusline-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('部署 bundled config 到目标目录', () => {
    const errors = [];
    const logs = [];
    deployCcstatuslineConfig(errors, {
      HOME: tmpDir,
      ok: (msg) => logs.push(msg),
    });
    expect(errors).toHaveLength(0);
    const deployed = path.join(tmpDir, '.config', 'ccstatusline', 'settings.json');
    expect(fs.existsSync(deployed)).toBe(true);
    const content = JSON.parse(fs.readFileSync(deployed, 'utf8'));
    expect(content.version).toBe(3);
    expect(Array.isArray(content.lines)).toBe(true);
  });

  test('已有配置时创建备份', () => {
    const configDir = path.join(tmpDir, '.config', 'ccstatusline');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, 'settings.json'), '{"old":true}');
    const errors = [];
    deployCcstatuslineConfig(errors, { HOME: tmpDir, ok: () => {} });
    expect(errors).toHaveLength(0);
    const backup = path.join(tmpDir, '.claude', '.code-abyss-backup', 'ccstatusline-settings.json');
    expect(fs.existsSync(backup)).toBe(true);
    expect(JSON.parse(fs.readFileSync(backup, 'utf8'))).toEqual({ old: true });
  });

  test('bundled settings.json 必须通过 schema guard', () => {
    // 验证 bundled config 本身的 flexMode 等枚举字段都合法
    const bundledPath = path.join(__dirname, '..', 'bin', 'optional', 'ccstatusline', 'settings.json');
    const content = JSON.parse(fs.readFileSync(bundledPath, 'utf8'));
    const { validateCcstatuslineSettings } = require(path.join(__dirname, '..', 'bin', 'optional', 'ccstatusline', 'schema-guard.js'));
    expect(validateCcstatuslineSettings(content)).toEqual([]);
  });
});

describe('installCcstatusline', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccstatusline-install-'));
    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('写入 statusLine 到 settings.json', async () => {
    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify({ existing: true }));
    const ctx = { settings: { existing: true }, settingsPath };
    const config = {
      statusLine: { type: 'command', command: 'npx -y ccstatusline@latest', padding: 0 }
    };
    await installCcstatusline(ctx, {
      HOME: tmpDir,
      PKG_ROOT: path.join(__dirname, '..'),
      CCSTATUSLINE_CONFIG: config,
      ok: () => {}, warn: () => {}, info: () => {}, fail: () => {},
      c: { cyn: s => s, b: s => s },
    });
    const result = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(result.statusLine).toEqual(config.statusLine);
    expect(result.existing).toBe(true);
  });
});
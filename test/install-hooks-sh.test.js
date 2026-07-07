'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', 'skills', 'indexing-code', 'hooks', 'common', 'install-hooks.sh');

describe('install-hooks.sh openclaw branch', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'code-abyss-hooks-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('actually installs the plugin (not just prints instructions)', () => {
    const r = spawnSync('bash', [SCRIPT, 'openclaw'], {
      env: { ...process.env, HOME: tmpHome },
      encoding: 'utf8',
    });
    expect(r.status).toBe(0);

    const pluginDir = path.join(tmpHome, '.openclaw', 'plugins', 'abyss-hooks');
    expect(fs.existsSync(path.join(pluginDir, 'openclaw', 'plugin.js'))).toBe(true);
    expect(fs.existsSync(path.join(pluginDir, 'common', 'session-init.sh'))).toBe(true);
    expect(fs.existsSync(path.join(pluginDir, 'common', 'pre-edit-check.sh'))).toBe(true);
  });

  test('installed plugin.js resolves its hook scripts via the correct relative path (does not silently break on copy)', () => {
    spawnSync('bash', [SCRIPT, 'openclaw'], { env: { ...process.env, HOME: tmpHome } });

    const pluginPath = path.join(tmpHome, '.openclaw', 'plugins', 'abyss-hooks', 'openclaw', 'plugin.js');
    const hookDir = path.join(path.dirname(pluginPath), '..', 'common');
    expect(fs.existsSync(path.join(hookDir, 'session-init.sh'))).toBe(true);
    expect(fs.existsSync(path.join(hookDir, 'pre-edit-check.sh'))).toBe(true);

    const register = require(pluginPath);
    expect(typeof register).toBe('function');
  });

  test('idempotent: running twice does not fail', () => {
    const first = spawnSync('bash', [SCRIPT, 'openclaw'], { env: { ...process.env, HOME: tmpHome } });
    const second = spawnSync('bash', [SCRIPT, 'openclaw'], { env: { ...process.env, HOME: tmpHome } });
    expect(first.status).toBe(0);
    expect(second.status).toBe(0);
  });
});

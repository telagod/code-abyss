// test/lifecycle-uninstall.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runUninstall } = require('../bin/lib/lifecycle/uninstall.js');

function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-uninstall-'));
}

function captureLog(fn) {
  const lines = [];
  const original = console.log;
  console.log = (msg) => lines.push(String(msg));
  try { fn(); } finally { console.log = original; }
  return lines;
}

function makeDeps(overrides = {}) {
  const noop = () => { };
  return {
    isSupportedTarget: (t) => ['claude', 'codex', 'gemini', 'openclaw'].includes(t),
    listTargetNames: () => ['claude', 'codex', 'gemini', 'openclaw'],
    resolveManagedRootDir: () => '/nowhere',
    normalizeManifestEntry: (entry, defaultRoot) => {
      if (typeof entry === 'string') return { root: defaultRoot, path: entry };
      return { root: entry.root || defaultRoot, path: entry.path };
    },
    manifestLabel: (entry, defaultRoot) => {
      const e = typeof entry === 'string' ? { root: defaultRoot, path: entry } : entry;
      return e.root === defaultRoot ? e.path : `${e.root}/${e.path}`;
    },
    rmSafe: (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); },
    formatActionableError: (msg) => msg,
    c: { b: (s) => s, red: (s) => s },
    fail: noop,
    ok: noop,
    divider: noop,
    ...overrides,
  };
}

describe('bin/lib/lifecycle/uninstall', () => {
  let exitSpy;
  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });
  afterEach(() => exitSpy.mockRestore());

  test('aborts on unsupported target', () => {
    expect(() => runUninstall('bogus', makeDeps())).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('aborts when manifest missing', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    fs.mkdirSync(targetDir, { recursive: true });
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    expect(() => runUninstall('claude', deps)).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('aborts on incompatible manifest_version', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
      manifest_version: 99, version: '99.0.0', target: 'claude',
      installed: [], backups: [],
    }));
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    expect(() => runUninstall('claude', deps)).toThrow('exit');
  });

  test('removes installed files and restores backups', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });

    // pre-existing install artifacts
    fs.writeFileSync(path.join(targetDir, 'CLAUDE.md'), 'installed');
    // pre-existing backed-up user file (will be restored)
    fs.mkdirSync(path.join(backupDir, 'claude'), { recursive: true });
    fs.writeFileSync(path.join(backupDir, 'claude', 'settings.json'), '{"user":true}');

    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
      manifest_version: 2, version: '2.1.11', target: 'claude',
      installed: ['CLAUDE.md'],
      backups: [{ root: 'claude', path: 'settings.json' }],
    }));

    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    runUninstall('claude', deps);

    expect(fs.existsSync(path.join(targetDir, 'CLAUDE.md'))).toBe(false);
    expect(fs.existsSync(path.join(targetDir, 'settings.json'))).toBe(true);
    expect(fs.readFileSync(path.join(targetDir, 'settings.json'), 'utf8')).toBe('{"user":true}');
    expect(fs.existsSync(backupDir)).toBe(false);
  });

  test('removes .sage-uninstall.js after rollback', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, '.sage-uninstall.js'), '// shim');
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
      manifest_version: 2, version: '2.1.11', target: 'claude',
      installed: [], backups: [],
    }));
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    runUninstall('claude', deps);
    expect(fs.existsSync(path.join(targetDir, '.sage-uninstall.js'))).toBe(false);
  });
});

// test/lifecycle-uninstall.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runUninstall } = require('../bin/lib/lifecycle/uninstall.js');

function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-uninstall-'));
}

function makeDeps(overrides = {}) {
  const noop = () => { };
  return {
    isSupportedTarget: (t) => ['claude', 'codex', 'gemini', 'openclaw'].includes(t),
    listTargetNames: () => ['claude', 'codex', 'gemini', 'openclaw'],
    resolveManagedRootDir: () => '/nowhere',
    rmSafe: (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); },
    formatActionableError: (msg) => msg,
    c: { b: (s) => s, red: (s) => s },
    fail: noop,
    ok: noop,
    info: noop,
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

  test('idempotent: manifest missing returns silently (not exit 1)', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    fs.mkdirSync(targetDir, { recursive: true });
    const infoMessages = [];
    const deps = makeDeps({
      resolveManagedRootDir: () => targetDir,
      info: (msg) => infoMessages.push(msg),
    });
    // should NOT throw / exit
    expect(() => runUninstall('claude', deps)).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(infoMessages.some((m) => /已卸载或从未安装/.test(m))).toBe(true);
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

  test('aborts on unreadable manifest', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), '{ malformed json');
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    expect(() => runUninstall('claude', deps)).toThrow('exit');
  });

  test('removes installed files and restores backups', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });

    fs.writeFileSync(path.join(targetDir, 'CLAUDE.md'), 'installed');
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

  test('idempotent: installed file already deleted skips silently', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    // 故意不创建 CLAUDE.md，模拟用户已经手动删了
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
      manifest_version: 2, version: '2.1.11', target: 'claude',
      installed: ['CLAUDE.md'],  // 但 manifest 仍记录
      backups: [],
    }));
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    expect(() => runUninstall('claude', deps)).not.toThrow();
    // backup dir 应仍被清理
    expect(fs.existsSync(backupDir)).toBe(false);
  });

  test('idempotent: backup file already restored/missing skips silently', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    fs.mkdirSync(path.join(backupDir, 'claude'), { recursive: true });
    // 故意不创建 settings.json backup，模拟用户已手动删了
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
      manifest_version: 2, version: '2.1.11', target: 'claude',
      installed: [],
      backups: [{ root: 'claude', path: 'settings.json' }],  // manifest 仍记录
    }));
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    expect(() => runUninstall('claude', deps)).not.toThrow();
    expect(fs.existsSync(backupDir)).toBe(false);
  });

  test('idempotent: 双次卸载不报错', () => {
    const home = makeTempHome();
    const targetDir = path.join(home, '.claude');
    const backupDir = path.join(targetDir, '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'CLAUDE.md'), 'installed');
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
      manifest_version: 2, version: '2.1.11', target: 'claude',
      installed: ['CLAUDE.md'], backups: [],
    }));
    const deps = makeDeps({ resolveManagedRootDir: () => targetDir });
    runUninstall('claude', deps); // first uninstall
    expect(() => runUninstall('claude', deps)).not.toThrow(); // second uninstall — idempotent
  });
});

// test/install-helpers.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  normalizeManifestEntry,
  pushManifestEntry,
  pushPackReport,
  resolveEffectivePackSource,
  manifestLabel,
  createResolveManagedRootDir,
  createBackupManagedPathIfExists,
  createPruneLegacyCodexSettings,
} = require('../bin/lib/install-helpers.js');

describe('bin/lib/install-helpers', () => {
  describe('normalizeManifestEntry', () => {
    test('wraps string into {root, path}', () => {
      expect(normalizeManifestEntry('CLAUDE.md', 'claude'))
        .toEqual({ root: 'claude', path: 'CLAUDE.md' });
    });
    test('preserves object entry root', () => {
      expect(normalizeManifestEntry({ root: 'agents', path: 'skills' }, 'codex'))
        .toEqual({ root: 'agents', path: 'skills' });
    });
    test('defaults missing root to defaultRoot', () => {
      expect(normalizeManifestEntry({ path: 'x' }, 'claude'))
        .toEqual({ root: 'claude', path: 'x' });
    });
    test('throws on malformed entry', () => {
      expect(() => normalizeManifestEntry({}, 'claude')).toThrow(/manifest 条目格式无效/);
      expect(() => normalizeManifestEntry(123, 'claude')).toThrow();
    });
  });

  describe('pushManifestEntry', () => {
    test('appends {root, path} to list', () => {
      const list = [];
      pushManifestEntry(list, 'claude', 'CLAUDE.md');
      expect(list).toEqual([{ root: 'claude', path: 'CLAUDE.md' }]);
    });
  });

  describe('pushPackReport', () => {
    test('creates pack_reports array if missing', () => {
      const m = {};
      pushPackReport(m, { pack: 'abyss', host: 'claude' });
      expect(m.pack_reports).toHaveLength(1);
    });
    test('appends to existing array', () => {
      const m = { pack_reports: [{ pack: 'x' }] };
      pushPackReport(m, { pack: 'y' });
      expect(m.pack_reports).toHaveLength(2);
    });
  });

  describe('resolveEffectivePackSource', () => {
    test('prefers installResult.sourceMode', () => {
      expect(resolveEffectivePackSource('pinned', { sourceMode: 'local' })).toBe('local');
    });
    test('falls back to sourceMode', () => {
      expect(resolveEffectivePackSource('local', null)).toBe('local');
    });
    test('defaults to pinned', () => {
      expect(resolveEffectivePackSource(null, null)).toBe('pinned');
    });
  });

  describe('manifestLabel', () => {
    test('returns plain path when root matches default', () => {
      expect(manifestLabel('CLAUDE.md', 'claude')).toBe('CLAUDE.md');
    });
    test('prefixes root when different from default', () => {
      expect(manifestLabel({ root: 'agents', path: 'skills' }, 'codex'))
        .toBe('agents/skills');
    });
  });

  describe('createResolveManagedRootDir', () => {
    test('uses runtimeRoots override when present', () => {
      const fn = createResolveManagedRootDir({
        HOME: '/h',
        getManagedRootRelativeDir: () => '.fallback',
      });
      expect(fn('openclaw', 'workspace', { workspace: '/custom/ws' })).toBe('/custom/ws');
    });
    test('falls back to HOME + relative dir', () => {
      const fn = createResolveManagedRootDir({
        HOME: '/h',
        getManagedRootRelativeDir: (name) => `.${name}`,
      });
      expect(fn('claude')).toBe(path.join('/h', '.claude'));
    });
  });

  describe('createBackupManagedPathIfExists', () => {
    test('returns false when target path missing', () => {
      const fn = createBackupManagedPathIfExists({
        resolveManagedRootDir: () => '/nonexistent',
        rmSafe: () => { },
        copyRecursive: () => { },
        info: () => { },
        c: { d: (s) => s },
      });
      expect(fn('claude', 'claude', '/tmp/backup', 'missing.json', { backups: [] })).toBe(false);
    });

    test('copies file and pushes manifest entry when target exists', () => {
      const home = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-helper-'));
      const targetRoot = path.join(home, '.claude');
      fs.mkdirSync(targetRoot, { recursive: true });
      fs.writeFileSync(path.join(targetRoot, 'CLAUDE.md'), 'user-content');

      const backupDir = path.join(home, '.sage-backup');
      fs.mkdirSync(backupDir, { recursive: true });

      const fn = createBackupManagedPathIfExists({
        resolveManagedRootDir: () => targetRoot,
        rmSafe: (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); },
        copyRecursive: (src, dst) => {
          fs.mkdirSync(path.dirname(dst), { recursive: true });
          fs.copyFileSync(src, dst);
        },
        info: () => { },
        c: { d: (s) => s },
      });

      const manifest = { backups: [] };
      const result = fn('claude', 'claude', backupDir, 'CLAUDE.md', manifest);
      expect(result).toBe(true);
      expect(manifest.backups).toEqual([{ root: 'claude', path: 'CLAUDE.md' }]);
      expect(fs.existsSync(path.join(backupDir, 'claude', 'CLAUDE.md'))).toBe(true);
    });
  });

  describe('createPruneLegacyCodexSettings', () => {
    test('returns null when settings.json missing', () => {
      const fn = createPruneLegacyCodexSettings({
        resolveManagedRootDir: () => '/nonexistent',
        backupManagedPathIfExists: () => false,
        rmSafe: () => { },
        warn: () => { },
      });
      expect(fn('codex', '/tmp/backup', { backups: [] })).toBeNull();
    });

    test('backs up and removes legacy settings.json', () => {
      const home = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-helper-codex-'));
      const targetRoot = path.join(home, '.codex');
      fs.mkdirSync(targetRoot, { recursive: true });
      const legacyPath = path.join(targetRoot, 'settings.json');
      fs.writeFileSync(legacyPath, '{}');

      const backupCalls = [];
      const rmCalls = [];
      const fn = createPruneLegacyCodexSettings({
        resolveManagedRootDir: () => targetRoot,
        backupManagedPathIfExists: (...args) => { backupCalls.push(args); return true; },
        rmSafe: (p) => { rmCalls.push(p); if (fs.existsSync(p)) fs.rmSync(p); },
        warn: () => { },
      });

      const result = fn('codex', '/tmp/backup', { backups: [] });
      expect(result).toBe(legacyPath);
      expect(backupCalls).toHaveLength(1);
      expect(rmCalls).toContain(legacyPath);
      expect(fs.existsSync(legacyPath)).toBe(false);
    });
  });
});

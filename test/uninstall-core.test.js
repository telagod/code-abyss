// test/uninstall-core.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  STATUS,
  SUPPORTED_MANIFEST_VERSION,
  normalizeEntry,
  entryLabel,
  pruneEmptyParents,
  readManifestSafe,
  createUninstallExecutor,
} = require('../bin/lib/uninstall-core.js');

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `abyss-uninstall-core-${prefix}-`));
}

describe('bin/lib/uninstall-core', () => {
  describe('STATUS / SUPPORTED_MANIFEST_VERSION', () => {
    test('STATUS 4 个值齐全', () => {
      expect(STATUS).toEqual({
        OK: 'ok',
        ALREADY_UNINSTALLED: 'already-uninstalled',
        MANIFEST_UNREADABLE: 'manifest-unreadable',
        MANIFEST_INCOMPATIBLE: 'manifest-incompatible',
      });
    });
    test('SUPPORTED_MANIFEST_VERSION 当前为 2', () => {
      expect(SUPPORTED_MANIFEST_VERSION).toBe(2);
    });
  });

  describe('normalizeEntry', () => {
    test('字符串转 {root: defaultRoot, path}', () => {
      expect(normalizeEntry('CLAUDE.md', 'claude')).toEqual({ root: 'claude', path: 'CLAUDE.md' });
    });
    test('对象保留 root', () => {
      expect(normalizeEntry({ root: 'agents', path: 'skills' }, 'codex'))
        .toEqual({ root: 'agents', path: 'skills' });
    });
    test('对象缺 root 用 defaultRoot 兜底', () => {
      expect(normalizeEntry({ path: 'x.md' }, 'claude')).toEqual({ root: 'claude', path: 'x.md' });
    });
    test('非法 entry 抛错', () => {
      expect(() => normalizeEntry(null, 'claude')).toThrow();
      expect(() => normalizeEntry({ root: 'x' }, 'claude')).toThrow();
    });
  });

  describe('entryLabel', () => {
    test('root 等于 default 时仅显示 path', () => {
      expect(entryLabel('CLAUDE.md', 'claude')).toBe('CLAUDE.md');
    });
    test('root 不等于 default 时显示 root/path', () => {
      expect(entryLabel({ root: 'agents', path: 'skills' }, 'codex')).toBe('agents/skills');
    });
  });

  describe('pruneEmptyParents', () => {
    test('删空目录到 stopAt 为止', () => {
      const root = tmp('prune');
      const deep = path.join(root, 'a', 'b', 'c');
      fs.mkdirSync(deep, { recursive: true });
      pruneEmptyParents(deep, root);
      expect(fs.existsSync(deep)).toBe(false);
      expect(fs.existsSync(root)).toBe(true);
      fs.rmSync(root, { recursive: true });
    });
    test('遇非空目录停止', () => {
      const root = tmp('prune');
      const deep = path.join(root, 'a', 'b');
      fs.mkdirSync(deep, { recursive: true });
      fs.writeFileSync(path.join(deep, 'keep.txt'), '');
      const empty = path.join(deep, 'c');
      fs.mkdirSync(empty);
      pruneEmptyParents(empty, root);
      expect(fs.existsSync(empty)).toBe(false);
      expect(fs.existsSync(deep)).toBe(true);
      fs.rmSync(root, { recursive: true });
    });
  });

  describe('readManifestSafe', () => {
    test('manifest 不存在返回 ALREADY_UNINSTALLED', () => {
      const result = readManifestSafe('/nowhere/manifest.json');
      expect(result.status).toBe(STATUS.ALREADY_UNINSTALLED);
      expect(result.manifest).toBeNull();
    });
    test('合法 manifest 返回 OK', () => {
      const root = tmp('ok');
      const p = path.join(root, 'manifest.json');
      fs.writeFileSync(p, JSON.stringify({ manifest_version: 2, target: 'claude' }));
      const result = readManifestSafe(p);
      expect(result.status).toBe(STATUS.OK);
      expect(result.manifest.target).toBe('claude');
      fs.rmSync(root, { recursive: true });
    });
    test('损坏 JSON 返回 MANIFEST_UNREADABLE', () => {
      const root = tmp('bad');
      const p = path.join(root, 'manifest.json');
      fs.writeFileSync(p, '{ malformed');
      const result = readManifestSafe(p);
      expect(result.status).toBe(STATUS.MANIFEST_UNREADABLE);
      fs.rmSync(root, { recursive: true });
    });
    test('manifest_version > 2 返回 MANIFEST_INCOMPATIBLE', () => {
      const root = tmp('incompat');
      const p = path.join(root, 'manifest.json');
      fs.writeFileSync(p, JSON.stringify({ manifest_version: 99, target: 'claude' }));
      const result = readManifestSafe(p);
      expect(result.status).toBe(STATUS.MANIFEST_INCOMPATIBLE);
      expect(result.version).toBe(99);
      fs.rmSync(root, { recursive: true });
    });
  });

  describe('createUninstallExecutor', () => {
    test('删 installed + 恢复 backups + 清 backupDir', () => {
      const home = tmp('exec');
      const targetDir = path.join(home, '.claude');
      const backupDir = path.join(targetDir, '.sage-backup');
      fs.mkdirSync(backupDir, { recursive: true });

      fs.writeFileSync(path.join(targetDir, 'CLAUDE.md'), 'installed');
      fs.mkdirSync(path.join(backupDir, 'claude'), { recursive: true });
      fs.writeFileSync(path.join(backupDir, 'claude', 'settings.json'), '{"u":1}');

      const manifest = {
        manifest_version: 2, target: 'claude',
        installed: ['CLAUDE.md'],
        backups: [{ root: 'claude', path: 'settings.json' }],
      };

      const removedLabels = [];
      const restoredLabels = [];

      const { executeUninstall } = createUninstallExecutor({
        resolveInstallRoot: () => targetDir,
        rmSafe: (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); },
        onRemoveInstalled: (l) => removedLabels.push(l),
        onRestoreBackup: (l) => restoredLabels.push(l),
      });

      executeUninstall(targetDir, manifest, backupDir);

      expect(fs.existsSync(path.join(targetDir, 'CLAUDE.md'))).toBe(false);
      expect(fs.existsSync(path.join(targetDir, 'settings.json'))).toBe(true);
      expect(fs.existsSync(backupDir)).toBe(false);
      expect(removedLabels).toEqual(['CLAUDE.md']);
      expect(restoredLabels).toEqual(['settings.json']);

      fs.rmSync(home, { recursive: true });
    });

    test('idempotent: installed 文件不存在时 silently skip', () => {
      const home = tmp('idem-installed');
      const targetDir = path.join(home, '.claude');
      const backupDir = path.join(targetDir, '.sage-backup');
      fs.mkdirSync(backupDir, { recursive: true });

      const removedLabels = [];
      const { executeUninstall } = createUninstallExecutor({
        resolveInstallRoot: () => targetDir,
        rmSafe: (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); },
        onRemoveInstalled: (l) => removedLabels.push(l),
      });

      const manifest = {
        manifest_version: 2, target: 'claude',
        installed: ['CLAUDE.md'],  // not on disk
        backups: [],
      };
      expect(() => executeUninstall(targetDir, manifest, backupDir)).not.toThrow();
      expect(removedLabels).toEqual([]); // 不会输出"删除"

      fs.rmSync(home, { recursive: true });
    });

    test('idempotent: backup 文件不存在时 silently skip', () => {
      const home = tmp('idem-backup');
      const targetDir = path.join(home, '.claude');
      const backupDir = path.join(targetDir, '.sage-backup');
      fs.mkdirSync(backupDir, { recursive: true });

      const restoredLabels = [];
      const { executeUninstall } = createUninstallExecutor({
        resolveInstallRoot: () => targetDir,
        rmSafe: (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); },
        onRestoreBackup: (l) => restoredLabels.push(l),
      });

      const manifest = {
        manifest_version: 2, target: 'claude',
        installed: [],
        backups: [{ root: 'claude', path: 'gone.json' }],
      };
      expect(() => executeUninstall(targetDir, manifest, backupDir)).not.toThrow();
      expect(restoredLabels).toEqual([]);

      fs.rmSync(home, { recursive: true });
    });
  });
});

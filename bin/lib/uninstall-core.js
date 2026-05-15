'use strict';

// bin/lib/uninstall-core.js
// 卸载流程的共享核心逻辑。
//
// 用途：被 bin/lib/lifecycle/uninstall.js（npm 包入口）和 bin/uninstall.js
// （安装时复制为 .sage-uninstall.js 的独立脚本）双方消费，消除重复。
//
// 设计：
//   - 纯函数：normalizeEntry / resolveBackupPath / entryLabel / pruneEmptyParents
//   - 工厂函数：createUninstallExecutor(deps) 接收 ui/path/utils 依赖，
//     返回 executeUninstall(targetDir, manifest) 执行函数
//   - idempotent：manifestMissing / manifestUnreadable / manifestIncompatible
//     都返回结构化结果，不再 process.exit；调用方根据 status 决定退出码

const fs = require('fs');
const path = require('path');

const SUPPORTED_MANIFEST_VERSION = 2;

const STATUS = Object.freeze({
  OK: 'ok',
  ALREADY_UNINSTALLED: 'already-uninstalled',
  MANIFEST_UNREADABLE: 'manifest-unreadable',
  MANIFEST_INCOMPATIBLE: 'manifest-incompatible',
});

function normalizeEntry(entry, defaultRoot) {
  if (typeof entry === 'string') return { root: defaultRoot, path: entry };
  if (entry && typeof entry === 'object' && typeof entry.path === 'string') {
    return { root: entry.root || defaultRoot, path: entry.path };
  }
  throw new Error('manifest 条目格式无效');
}

function entryLabel(entry, defaultRoot) {
  const normalized = normalizeEntry(entry, defaultRoot);
  return normalized.root === defaultRoot
    ? normalized.path
    : `${normalized.root}/${normalized.path}`;
}

function pruneEmptyParents(dirPath, stopAt) {
  let current = dirPath;
  while (current !== stopAt && current !== path.dirname(current)) {
    try {
      const entries = fs.readdirSync(current);
      if (entries.length > 0) break;
      fs.rmdirSync(current);
    } catch { break; }
    current = path.dirname(current);
  }
}

function readManifestSafe(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { status: STATUS.ALREADY_UNINSTALLED, manifest: null };
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.manifest_version && manifest.manifest_version > SUPPORTED_MANIFEST_VERSION) {
      return { status: STATUS.MANIFEST_INCOMPATIBLE, manifest, version: manifest.manifest_version };
    }
    return { status: STATUS.OK, manifest };
  } catch (err) {
    return { status: STATUS.MANIFEST_UNREADABLE, manifest: null, error: err };
  }
}

// 工厂：消费 deps 返回执行器
//
// deps:
//   resolveInstallRoot(rootName, runtimeRoots): 返回 root 名对应的家目录绝对路径
//   rmSafe(p): 安全删除（覆盖 fs.rmSync recursive force）
//   onRemoveInstalled(label): UI 钩子，"被删除的 install 项"
//   onRestoreBackup(label): UI 钩子，"被恢复的 backup 项"
//   onPackReport(reports): UI 钩子，输出 pack 报告（可选）
//
function createUninstallExecutor(deps) {
  const {
    resolveInstallRoot,
    rmSafe,
    onRemoveInstalled = () => {},
    onRestoreBackup = () => {},
    onPackReport = () => {},
  } = deps;

  function executeUninstall(targetDir, manifest, backupDir) {
    const defaultRoot = manifest.target;
    const runtimeRoots = manifest.runtime_roots || null;

    if (Array.isArray(manifest.pack_reports) && manifest.pack_reports.length > 0) {
      onPackReport(manifest.pack_reports);
    }

    (manifest.installed || []).forEach((entry) => {
      const normalized = normalizeEntry(entry, defaultRoot);
      const installRoot = resolveInstallRoot(normalized.root, runtimeRoots);
      const targetPath = path.join(installRoot, normalized.path);
      if (fs.existsSync(targetPath)) {
        rmSafe(targetPath);
        onRemoveInstalled(entryLabel(entry, defaultRoot));
        if (normalized.root !== defaultRoot) {
          pruneEmptyParents(path.dirname(targetPath), installRoot);
        }
      }
      // idempotent: target 已不在时 silently skip
    });

    (manifest.backups || []).forEach((entry) => {
      const normalized = normalizeEntry(entry, defaultRoot);
      const backupPath = path.join(backupDir, normalized.root, normalized.path);
      const legacyBackupPath = path.join(backupDir, normalized.path);
      const sourcePath = fs.existsSync(backupPath)
        ? backupPath
        : (fs.existsSync(legacyBackupPath) ? legacyBackupPath : null);
      if (!sourcePath) return; // idempotent: backup 已被恢复或删

      const restoreRoot = resolveInstallRoot(normalized.root, runtimeRoots);
      const restorePath = path.join(restoreRoot, normalized.path);
      fs.mkdirSync(path.dirname(restorePath), { recursive: true });
      fs.renameSync(sourcePath, restorePath);
      onRestoreBackup(entryLabel(entry, defaultRoot));
    });

    rmSafe(backupDir);
  }

  return { executeUninstall };
}

module.exports = {
  STATUS,
  SUPPORTED_MANIFEST_VERSION,
  normalizeEntry,
  entryLabel,
  pruneEmptyParents,
  readManifestSafe,
  createUninstallExecutor,
};

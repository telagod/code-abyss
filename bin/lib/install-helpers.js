// bin/lib/install-helpers.js
// 安装/卸载过程中的 manifest + path 辅助函数
//
// 两组导出：
//   - 纯函数（无依赖）：normalizeManifestEntry, pushManifestEntry, pushPackReport,
//     resolveEffectivePackSource, manifestLabel
//   - 工厂函数（依赖注入）：createResolveManagedRootDir, createBackupManagedPathIfExists,
//     createPruneLegacyCodexSettings
//     调用方注入 HOME / fs 操作 / ui 等依赖后获取实际可用的闭包函数

const fs = require('fs');
const path = require('path');

// ── 纯函数 ──

function normalizeManifestEntry(entry, defaultRoot) {
  if (typeof entry === 'string') return { root: defaultRoot, path: entry };
  if (entry && typeof entry === 'object' && typeof entry.path === 'string') {
    return { root: entry.root || defaultRoot, path: entry.path };
  }
  throw new Error('manifest 条目格式无效');
}

function pushManifestEntry(list, rootName, relPath) {
  list.push({ root: rootName, path: relPath });
}

function pushPackReport(manifest, report) {
  if (!manifest.pack_reports) manifest.pack_reports = [];
  manifest.pack_reports.push(report);
}

function resolveEffectivePackSource(sourceMode, installResult) {
  return (installResult && installResult.sourceMode) || sourceMode || 'pinned';
}

function manifestLabel(entry, defaultRoot) {
  const normalized = normalizeManifestEntry(entry, defaultRoot);
  return normalized.root === defaultRoot
    ? normalized.path
    : `${normalized.root}/${normalized.path}`;
}

// ── 工厂函数 ──

function createResolveManagedRootDir({ HOME, getManagedRootRelativeDir }) {
  return function resolveManagedRootDir(tgt, rootName = tgt, runtimeRoots = null) {
    if (runtimeRoots && runtimeRoots[rootName]) return runtimeRoots[rootName];
    return path.join(HOME, getManagedRootRelativeDir(rootName));
  };
}

function createBackupManagedPathIfExists({ resolveManagedRootDir, rmSafe, copyRecursive, info, c }) {
  return function backupManagedPathIfExists(tgt, rootName, backupDir, relPath, manifest, runtimeRoots = null) {
    const targetRoot = resolveManagedRootDir(tgt, rootName, runtimeRoots);
    const targetPath = path.join(targetRoot, relPath);
    if (!fs.existsSync(targetPath)) return false;

    const backupPath = path.join(backupDir, rootName, relPath);
    rmSafe(backupPath);
    copyRecursive(targetPath, backupPath);
    pushManifestEntry(manifest.backups, rootName, relPath);
    info(`备份: ${c.d(rootName === tgt ? relPath : `${rootName}/${relPath}`)}`);
    return true;
  };
}

function createPruneLegacyCodexSettings({ resolveManagedRootDir, backupManagedPathIfExists, rmSafe, warn }) {
  return function pruneLegacyCodexSettings(tgt, backupDir, manifest) {
    const relPath = 'settings.json';
    const settingsPath = path.join(resolveManagedRootDir(tgt, 'codex'), relPath);
    if (!fs.existsSync(settingsPath)) return null;

    backupManagedPathIfExists(tgt, 'codex', backupDir, relPath, manifest);
    rmSafe(settingsPath);
    warn('移除 legacy settings.json（Codex 已改用 config.toml）');
    return settingsPath;
  };
}

module.exports = {
  normalizeManifestEntry,
  pushManifestEntry,
  pushPackReport,
  resolveEffectivePackSource,
  manifestLabel,
  createResolveManagedRootDir,
  createBackupManagedPathIfExists,
  createPruneLegacyCodexSettings,
};

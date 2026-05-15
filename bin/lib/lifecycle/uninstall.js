// bin/lib/lifecycle/uninstall.js
// 卸载流程：从 .sage-backup/manifest.json 解析、回滚、删除产物
//
// 依赖通过 deps 注入，避免对 install.js 内部 closure 的硬绑定：
//   target-registry: isSupportedTarget, listTargetNames
//   path helpers:    resolveManagedRootDir, normalizeManifestEntry, manifestLabel
//   utils:           rmSafe, formatActionableError
//   ui:              c, fail, ok, info, divider

const fs = require('fs');
const path = require('path');

function runUninstall(tgt, deps) {
  const {
    isSupportedTarget,
    listTargetNames,
    resolveManagedRootDir,
    normalizeManifestEntry,
    manifestLabel,
    rmSafe,
    formatActionableError,
    c,
    fail,
    ok,
    divider,
  } = deps;

  if (!isSupportedTarget(tgt)) {
    fail(formatActionableError(`--uninstall 必须是 ${listTargetNames().join('、')}`, 'Try: npx code-abyss --uninstall claude'));
    process.exit(1);
  }
  const targetDir = resolveManagedRootDir(tgt);
  const backupDir = path.join(targetDir, '.sage-backup');
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) { fail(`未找到安装记录: ${manifestPath}`); process.exit(1); }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const runtimeRoots = manifest.runtime_roots || null;
  if (manifest.manifest_version && manifest.manifest_version > 2) {
    fail(`manifest 版本 ${manifest.manifest_version} 不兼容，请升级 code-abyss 后再卸载`);
    process.exit(1);
  }
  divider(`卸载 Code Abyss v${manifest.version}`);
  if (Array.isArray(manifest.pack_reports) && manifest.pack_reports.length > 0) {
    console.log(`  ${c.b('Packs:')}`);
    manifest.pack_reports.forEach((report) => {
      const source = report.source ? ` source=${report.source}` : '';
      const reason = report.reason ? ` reason=${report.reason}` : '';
      console.log(`    ${report.pack}@${report.host} ${report.status || 'installed'}${source}${reason}`);
    });
  }

  (manifest.installed || []).forEach((entry) => {
    const normalized = normalizeManifestEntry(entry, tgt);
    const installRoot = resolveManagedRootDir(tgt, normalized.root, runtimeRoots);
    const targetPath = path.join(installRoot, normalized.path);
    if (fs.existsSync(targetPath)) {
      rmSafe(targetPath);
      console.log(`  ${c.red('✘')} ${manifestLabel(entry, tgt)}`);
      if (normalized.root !== tgt) {
        let parent = path.dirname(targetPath);
        while (parent !== installRoot && parent !== path.dirname(parent)) {
          try {
            if (fs.readdirSync(parent).length > 0) break;
            fs.rmdirSync(parent);
          } catch { break; }
          parent = path.dirname(parent);
        }
      }
    }
  });
  (manifest.backups || []).forEach((entry) => {
    const normalized = normalizeManifestEntry(entry, tgt);
    const backupPath = path.join(backupDir, normalized.root, normalized.path);
    const legacyBackupPath = path.join(backupDir, normalized.path);
    const sourcePath = fs.existsSync(backupPath) ? backupPath : legacyBackupPath;
    const restoreRoot = resolveManagedRootDir(tgt, normalized.root, runtimeRoots);
    const restorePath = path.join(restoreRoot, normalized.path);
    if (fs.existsSync(sourcePath)) {
      fs.mkdirSync(path.dirname(restorePath), { recursive: true });
      fs.renameSync(sourcePath, restorePath);
      ok(`恢复: ${manifestLabel(entry, tgt)}`);
    }
  });

  rmSafe(backupDir);
  const us = path.join(targetDir, '.sage-uninstall.js');
  if (fs.existsSync(us)) fs.unlinkSync(us);
  console.log('');
  ok(c.b('卸载完成\n'));
}

module.exports = { runUninstall };

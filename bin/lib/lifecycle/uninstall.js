'use strict';

// bin/lib/lifecycle/uninstall.js
// 卸载流程（npm 包入口路径）：参数校验 + 路径解析 + 委托给 uninstall-core 执行
//
// 与 bin/uninstall.js（独立脚本）共享 bin/lib/uninstall-core.js 核心逻辑。
//
// 依赖通过 deps 注入：
//   target-registry: isSupportedTarget, listTargetNames
//   path helpers:    resolveManagedRootDir
//   utils:           rmSafe, formatActionableError
//   ui:              c, fail, ok, info, divider

const fs = require('fs');
const path = require('path');

const {
  STATUS,
  readManifestSafe,
  createUninstallExecutor,
} = require('../uninstall-core');

function runUninstall(tgt, deps) {
  const {
    isSupportedTarget,
    listTargetNames,
    resolveManagedRootDir,
    rmSafe,
    formatActionableError,
    c,
    fail,
    ok,
    info,
    divider,
  } = deps;

  if (!isSupportedTarget(tgt)) {
    fail(formatActionableError(
      `--uninstall 必须是 ${listTargetNames().join('、')}`,
      'Try: npx code-abyss --uninstall claude'
    ));
    process.exit(1);
  }

  const targetDir = resolveManagedRootDir(tgt);

  // 优先读新路径；找不到时回退老路径（兼容 v2.x 老用户的 .sage-backup）
  const newBackupDir = path.join(targetDir, '.code-abyss-backup');
  const legacyBackupDir = path.join(targetDir, '.sage-backup');
  const backupDir = fs.existsSync(newBackupDir) ? newBackupDir : legacyBackupDir;
  const manifestPath = path.join(backupDir, 'manifest.json');

  const result = readManifestSafe(manifestPath);

  if (result.status === STATUS.ALREADY_UNINSTALLED) {
    info(`${tgt} 已卸载或从未安装（未找到 ${manifestPath}）`);
    return;
  }
  if (result.status === STATUS.MANIFEST_UNREADABLE) {
    fail(`manifest 解析失败: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status === STATUS.MANIFEST_INCOMPATIBLE) {
    fail(`manifest 版本 ${result.version} 不兼容，请升级 code-abyss 后再卸载`);
    process.exit(1);
  }

  const { manifest } = result;
  divider(`卸载 Code Abyss v${manifest.version}`);

  const { executeUninstall } = createUninstallExecutor({
    resolveInstallRoot: (rootName, runtimeRoots) =>
      resolveManagedRootDir(tgt, rootName, runtimeRoots),
    rmSafe,
    onRemoveInstalled: (label) => console.log(`  ${c.red('✘')} ${label}`),
    onRestoreBackup: (label) => ok(`恢复: ${label}`),
    onPackReport: (reports) => {
      console.log(`  ${c.b('Packs:')}`);
      reports.forEach((report) => {
        const source = report.source ? ` source=${report.source}` : '';
        const reason = report.reason ? ` reason=${report.reason}` : '';
        console.log(`    ${report.pack}@${report.host} ${report.status || 'installed'}${source}${reason}`);
      });
    },
  });

  executeUninstall(targetDir, manifest, backupDir);

  // 清理 .code-abyss-uninstall.js 或老的 .sage-uninstall.js 自身 — idempotent
  ['.code-abyss-uninstall.js', '.sage-uninstall.js'].forEach((name) => {
    const p = path.join(targetDir, name);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });

  console.log('');
  ok(c.b('卸载完成\n'));
}

module.exports = { runUninstall };

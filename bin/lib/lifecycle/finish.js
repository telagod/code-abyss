// bin/lib/lifecycle/finish.js
// 安装完成总结：生成 report、打印安装详情、同步 README/CONTRIBUTING bootstrap snippets

const {
  MIN_ABYSS_VERSION,
  detectAbyss,
  satisfiesMin,
  checkLockToolRequirement,
} = require('../abyss-integration');

function createFinish(deps) {
  const {
    VERSION,
    writeReportArtifact, syncProjectBootstrapArtifacts, readProjectPackLock,
    c, divider,
  } = deps;

  // indexing-code 的 hook 依赖 abyss 二进制；缺失或过旧时 hook 静默停用/降级，
  // 必须在安装收尾时显式告知，而不是让用户以为功能已生效。
  function reportAbyssStatus(projectLock) {
    const detected = detectAbyss();
    if (detected && satisfiesMin(detected.version, MIN_ABYSS_VERSION)) {
      const sourceNote = detected.source === 'managed' ? c.d(' (~/.code-abyss/bin)') : '';
      console.log(`  ${c.b('abyss:')}    ${c.grn(detected.raw)}${sourceNote} — 代码图谱 pre-edit hook 可用`);
    } else if (detected) {
      console.log('');
      console.log(`  ${c.ylw(`⚠ abyss ${detected.version || detected.raw} 低于最低要求 ${MIN_ABYSS_VERSION} — hook 子命令不可用`)}`);
      console.log(`    ${c.b('升级:')} ${c.d('npx code-abyss --with-abyss   # 或 cargo binstall code-abyss')}`);
    } else {
      console.log('');
      console.log(`  ${c.ylw('⚠ 未检测到 abyss 二进制 — indexing-code 的代码图谱 hook 将静默停用')}`);
      console.log(`    ${c.b('安装（任选其一）:')}`);
      console.log(`    ${c.d('npx code-abyss --with-abyss   # 重跑安装器，自动下载预编译版')}`);
      console.log(`    ${c.d('npm install -g @code-abyss/cli')}`);
      console.log(`    ${c.d('curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash')}`);
      console.log(`    ${c.d('curl -fsSL https://cdn.jsdelivr.net/gh/telagod/abyss@main/install.sh | bash   # raw 不可达时的镜像')}`);
      console.log(`    ${c.d('cargo binstall code-abyss   # 或 cargo install code-abyss')}`);
    }

    // 项目级工具链声明：.code-abyss/packs.lock.json 的 tools.abyss（P2）
    if (projectLock) {
      const req = checkLockToolRequirement(projectLock, detected);
      if (req && !req.ok) {
        const detail = req.reason === 'missing'
          ? `项目要求 abyss ${req.spec}，但未检测到二进制`
          : req.reason === 'outdated'
            ? `项目要求 abyss ${req.spec}，当前 ${req.actual}`
            : `tools.abyss 声明无法解析: ${req.spec}`;
        console.log(`  ${c.ylw(`⚠ packs.lock.json: ${detail}`)}`);
      }
    }
  }

  return function finish(ctx) {
    const tgt = ctx.manifest.target;
    let reportPath = null;
    if (ctx.packPlan && ctx.packPlan.root) {
      reportPath = writeReportArtifact(ctx.packPlan.root, `install-${tgt}`, {
        version: VERSION,
        target: tgt,
        timestamp: new Date().toISOString(),
        cwd: process.cwd(),
        pack_plan: {
          required: ctx.packPlan.required,
          optional: ctx.packPlan.optional,
          selected: ctx.packPlan.selected,
          optional_policy: ctx.packPlan.optionalPolicy,
          sources: ctx.packPlan.sources,
        },
        pack_reports: ctx.manifest.pack_reports || [],
        installed: ctx.manifest.installed || [],
        backups: ctx.manifest.backups || [],
      });
    }
    divider('安装完成');
    console.log('');
    console.log(`  ${c.b('目标:')}     ${c.cyn(ctx.targetDir)}`);
    console.log(`  ${c.b('版本:')}     v${VERSION}`);
    if (ctx.manifest.style && tgt !== 'codex') {
      console.log(`  ${c.b('风格:')}     ${c.mag(ctx.manifest.style)}`);
    }
    if (Array.isArray(ctx.manifest.project_packs) && ctx.manifest.project_packs.length > 0) {
      console.log(`  ${c.b('Packs:')}    ${ctx.manifest.project_packs.join(', ')}`);
    }
    if (ctx.manifest.optional_policy) {
      console.log(`  ${c.b('Pack策略:')} ${ctx.manifest.optional_policy}`);
    }
    if (Array.isArray(ctx.manifest.pack_reports) && ctx.manifest.pack_reports.length > 0) {
      ctx.manifest.pack_reports.forEach((report) => {
        const source = report.source ? ` source=${report.source}` : '';
        const reason = report.reason ? ` reason=${report.reason}` : '';
        console.log(`  ${c.b('Pack报告:')} ${report.pack}@${report.host} ${report.status}${source}${reason}`);
      });
    }
    let projectLock = null;
    if (ctx.packPlan && ctx.packPlan.root) {
      const lockResult = readProjectPackLock(ctx.packPlan.root);
      if (lockResult) {
        projectLock = lockResult.lock;
        const bootstrap = syncProjectBootstrapArtifacts(ctx.packPlan.root, lockResult.lock);
        const updatedDocs = bootstrap.docs.filter((entry) => entry.action !== 'skipped');
        if (updatedDocs.length > 0) {
          updatedDocs.forEach((entry) => console.log(`  ${c.b('文档同步:')} ${entry.action} ${entry.filePath}`));
        }
      }
    }
    if (reportPath) {
      console.log(`  ${c.b('Report:')}   ${reportPath}`);
    }
    console.log(`  ${c.b('文件:')}     ${ctx.manifest.installed.length} 个安装, ${ctx.manifest.backups.length} 个备份`);
    console.log(`  ${c.b('卸载:')}     ${c.d(`npx code-abyss --uninstall ${tgt}`)}`);
    reportAbyssStatus(projectLock);
    console.log('');
    console.log(c.grn(`  ✓ 安装完成\n`));
  };
}

module.exports = { createFinish };

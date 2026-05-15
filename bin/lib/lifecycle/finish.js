// bin/lib/lifecycle/finish.js
// 安装完成总结：生成 report、打印安装详情、同步 README/CONTRIBUTING bootstrap snippets

function createFinish(deps) {
  const {
    VERSION,
    writeReportArtifact, syncProjectBootstrapArtifacts, readProjectPackLock,
    c, divider,
  } = deps;

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
    if (ctx.packPlan && ctx.packPlan.root) {
      const projectLock = readProjectPackLock(ctx.packPlan.root);
      if (projectLock) {
        const bootstrap = syncProjectBootstrapArtifacts(ctx.packPlan.root, projectLock.lock);
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
    console.log('');
    console.log(c.grn(`  ✓ 安装完成\n`));
  };
}

module.exports = { createFinish };

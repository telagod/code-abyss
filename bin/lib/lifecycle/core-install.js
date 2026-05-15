// bin/lib/lifecycle/core-install.js
// 安装核心流程：编排 4 个 target 的产物拷贝、命令生成、pack 调度、settings 合并、manifest 落盘
//
// 单一 deps 对象注入所有依赖；避免参数列表爆炸：
//   constants:  HOME, PKG_ROOT, VERSION
//   adapters:   getClaudeCoreFiles/getCodexCoreFiles/getGeminiCoreFiles/getOpenClawCoreFiles,
//               cleanupLegacyCodexRuntime, resolveOpenClawRuntime
//   gstack:     installGstackClaudePack, installGstackCodexPack, installGstackGeminiPack
//   style:      renderGeminiContext, renderCodexAgents, readPersonaContent
//   skill:      collectInvocableSkills
//   helpers:    resolveManagedRootDir, backupManagedPathIfExists, pruneLegacyCodexSettings,
//               pushManifestEntry, pushPackReport, resolveEffectivePackSource
//   commands:   generateCommandContent, generateGeminiCommandContent,
//               CLAUDE_COMMAND_TARGET, GEMINI_COMMAND_TARGET
//   utils:      rmSafe, copyRecursive
//   ui:         step, ok, warn, info, fail, c

const fs = require('fs');
const path = require('path');

const { installGstackPack } = require('../gstack/installer');

function createInstallCore(deps) {
  const {
    HOME, PKG_ROOT, VERSION,
    getClaudeCoreFiles, getCodexCoreFiles, getGeminiCoreFiles, getOpenClawCoreFiles,
    cleanupLegacyCodexRuntime, resolveOpenClawRuntime,
    installGstackClaudePack, installGstackCodexPack, installGstackGeminiPack,
    renderGeminiContext, renderCodexAgents, readPersonaContent,
    collectInvocableSkills,
    resolveManagedRootDir, backupManagedPathIfExists, pruneLegacyCodexSettings,
    pushManifestEntry, pushPackReport, resolveEffectivePackSource,
    generateCommandContent, generateGeminiCommandContent,
    CLAUDE_COMMAND_TARGET, GEMINI_COMMAND_TARGET,
    rmSafe, copyRecursive,
    step, ok, warn, info, fail, c,
  } = deps;

  // 老路径自动迁移（θ 去人格化）：v3 把 .sage-* 改为 .code-abyss-*
  // 在 install 开始时检测旧路径并 silently rename，用户无感知。
  function migrateLegacyPaths(targetDir, infoFn) {
    const oldBackup = path.join(targetDir, '.sage-backup');
    const newBackup = path.join(targetDir, '.code-abyss-backup');
    if (fs.existsSync(oldBackup) && !fs.existsSync(newBackup)) {
      fs.renameSync(oldBackup, newBackup);
      if (infoFn) infoFn('迁移: .sage-backup → .code-abyss-backup');
    }

    const oldUninstall = path.join(targetDir, '.sage-uninstall.js');
    const newUninstall = path.join(targetDir, '.code-abyss-uninstall.js');
    if (fs.existsSync(oldUninstall)) {
      // 老脚本会被新版覆盖；先删，让 install 流程末尾正确写入新路径
      try { fs.unlinkSync(oldUninstall); } catch { /* idempotent */ }
      if (!fs.existsSync(newUninstall) && infoFn) {
        infoFn('迁移: .sage-uninstall.js → .code-abyss-uninstall.js');
      }
    }
  }

  function installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest) {
    const skills = collectInvocableSkills(skillsSrcDir);
    if (skills.length === 0) return 0;
    const rootName = manifest.target || 'claude';

    const installDir = path.join(targetDir, CLAUDE_COMMAND_TARGET.dir);
    fs.mkdirSync(installDir, { recursive: true });

    let totalFiles = 0;

    skills.forEach((skill) => {
      const names = [skill.name, ...(skill.aliases || [])];
      names.forEach((cmdName) => {
        const fileName = `${cmdName}.md`;
        const destFile = path.join(installDir, fileName);
        const relFile = path.posix.join(CLAUDE_COMMAND_TARGET.dir, fileName);

        if (fs.existsSync(destFile)) {
          const backupSubdir = path.join(backupDir, rootName, CLAUDE_COMMAND_TARGET.dir);
          fs.mkdirSync(backupSubdir, { recursive: true });
          fs.copyFileSync(destFile, path.join(backupSubdir, fileName));
          pushManifestEntry(manifest.backups, rootName, relFile);
          info(`备份: ${c.d(relFile)}`);
        }

        const content = generateCommandContent(skill, skill.relPath, skill.runtimeType);
        fs.writeFileSync(destFile, content);
        pushManifestEntry(manifest.installed, rootName, relFile);
        totalFiles++;
      });
    });

    ok(`${CLAUDE_COMMAND_TARGET.dir}/ ${c.d(`(自动生成 ${totalFiles} 个 ${CLAUDE_COMMAND_TARGET.label})`)}`);
    return skills.length;
  }

  function installGeneratedCommands(skillsSrcDir, targetDir, backupDir, manifest) {
    return installGeneratedArtifacts(skillsSrcDir, targetDir, backupDir, manifest);
  }

  function installGeneratedGeminiCommands(skillsSrcDir, targetDir, backupDir, manifest) {
    const skills = collectInvocableSkills(skillsSrcDir);
    if (skills.length === 0) return 0;

    const installDir = path.join(targetDir, GEMINI_COMMAND_TARGET.dir);
    fs.mkdirSync(installDir, { recursive: true });
    let totalFiles = 0;

    skills.forEach((skill) => {
      const names = [skill.name, ...(skill.aliases || [])];
      names.forEach((cmdName) => {
        const fileName = `${cmdName}.toml`;
        const destFile = path.join(installDir, fileName);
        const relFile = path.posix.join(GEMINI_COMMAND_TARGET.dir, fileName);

        if (fs.existsSync(destFile)) {
          const backupSubdir = path.join(backupDir, 'gemini', GEMINI_COMMAND_TARGET.dir);
          fs.mkdirSync(backupSubdir, { recursive: true });
          fs.copyFileSync(destFile, path.join(backupSubdir, fileName));
          pushManifestEntry(manifest.backups, 'gemini', relFile);
          info(`备份: ${c.d(relFile)}`);
        }

        const content = generateGeminiCommandContent(skill, skill.relPath, skill.runtimeType);
        fs.writeFileSync(destFile, content);
        pushManifestEntry(manifest.installed, 'gemini', relFile);
        totalFiles++;
      });
    });

    ok(`${GEMINI_COMMAND_TARGET.dir}/ ${c.d(`(自动生成 ${totalFiles} 个 ${GEMINI_COMMAND_TARGET.label})`)}`);
    return totalFiles;
  }

  function installGeminiContext(targetDir, backupDir, manifest, selectedStyle) {
    const relPath = 'GEMINI.md';
    backupManagedPathIfExists('gemini', 'gemini', backupDir, relPath, manifest);
    const destPath = path.join(targetDir, relPath);
    const content = renderGeminiContext(PKG_ROOT, selectedStyle.slug);
    fs.writeFileSync(destPath, content);
    pushManifestEntry(manifest.installed, 'gemini', relPath);
    ok(`${relPath} ${c.d(`(动态生成: ${selectedStyle.slug})`)}`);
  }

  function installCore(tgt, selectedStyle, selectedPersona, packPlan) {
    const openClawRuntime = tgt === 'openclaw' ? resolveOpenClawRuntime({ HOME, warn }) : null;
    const runtimeRoots = openClawRuntime
      ? {
        openclaw: openClawRuntime.rootDir,
        'openclaw-workspace': openClawRuntime.workspaceDir,
      }
      : null;
    const targetDir = resolveManagedRootDir(tgt, tgt, runtimeRoots);

    // 老路径自动迁移：v3 把 .sage-* 重命名为 .code-abyss-* 以去人格化（θ）
    // 检测旧路径，silently rename — 用户无感知
    migrateLegacyPaths(targetDir, info);

    const backupDir = path.join(targetDir, '.code-abyss-backup');
    const manifestPath = path.join(backupDir, 'manifest.json');

    const installSummary = tgt === 'codex'
      ? `${c.cyn(resolveManagedRootDir(tgt, 'codex', runtimeRoots))} + ${c.cyn(resolveManagedRootDir(tgt, 'agents', runtimeRoots))}`
      : tgt === 'openclaw'
        ? `${c.cyn(targetDir)} + ${c.cyn(resolveManagedRootDir(tgt, 'openclaw-workspace', runtimeRoots))}`
        : c.cyn(targetDir);
    step(1, 3, `安装核心文件 → ${installSummary}`);
    rmSafe(backupDir);
    fs.mkdirSync(backupDir, { recursive: true });

    if (tgt === 'codex') {
      cleanupLegacyCodexRuntime({ HOME, info });
    }

    const filesToInstall = tgt === 'codex'
      ? getCodexCoreFiles()
      : tgt === 'gemini'
        ? getGeminiCoreFiles()
        : tgt === 'openclaw'
          ? getOpenClawCoreFiles()
          : getClaudeCoreFiles();

    const manifest = {
      manifest_version: 2, version: VERSION, target: tgt,
      timestamp: new Date().toISOString(), style: selectedStyle.slug, persona: selectedPersona.slug, installed: [], backups: [],
      runtime_roots: runtimeRoots || undefined,
      project_packs: packPlan.selected,
      optional_policy: packPlan.optionalPolicy || 'auto',
      pack_reports: [],
    };

    filesToInstall.forEach(({ src, dest, root }) => {
      const rootName = root || tgt;
      const srcPath = path.join(PKG_ROOT, src);
      const destRoot = resolveManagedRootDir(tgt, rootName, runtimeRoots);
      const destPath = path.join(destRoot, dest);
      if (!fs.existsSync(srcPath)) {
        if (src === 'skills') {
          fail(`核心文件缺失: ${srcPath}\n    请尝试: npm cache clean --force && npx code-abyss`);
          process.exit(1);
        }
        warn(`跳过: ${src}`); return;
      }

      if (fs.existsSync(destPath)) {
        const backupPath = path.join(backupDir, rootName, dest);
        rmSafe(backupPath);
        copyRecursive(destPath, backupPath);
        pushManifestEntry(manifest.backups, rootName, dest);
        info(`备份: ${c.d(rootName === tgt ? dest : `${rootName}/${dest}`)}`);
      }
      ok(rootName === tgt ? dest : `${rootName}/${dest}`);
      rmSafe(destPath);
      copyRecursive(srcPath, destPath);
      pushManifestEntry(manifest.installed, rootName, dest);
    });

    pushPackReport(manifest, {
      pack: 'abyss',
      host: tgt,
      status: 'installed',
      source: 'bundled',
    });

    if (tgt === 'claude') {
      const skillsSrc = path.join(PKG_ROOT, 'skills');
      installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);
      if (packPlan.selected.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        const result = installGstackClaudePack({
          HOME, backupDir, manifest, info, ok, warn,
          sourceMode, projectRoot: packPlan.root, fallback: true,
        });
        pushPackReport(manifest, {
          pack: 'gstack', host: 'claude',
          status: result.installed ? 'installed' : 'skipped',
          source: resolveEffectivePackSource(sourceMode, result),
          reason: result.reason || null,
        });
      } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        pushPackReport(manifest, {
          pack: 'gstack', host: 'claude',
          status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
          source: sourceMode,
          reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
        });
      }
    } else if (tgt === 'codex') {
      if (packPlan.selected.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        const result = installGstackCodexPack({
          HOME, backupDir, manifest, info, ok, warn,
          sourceMode, projectRoot: packPlan.root, fallback: true,
        });
        pushPackReport(manifest, {
          pack: 'gstack', host: 'codex',
          status: result.installed ? 'installed' : 'skipped',
          source: resolveEffectivePackSource(sourceMode, result),
          reason: result.reason || null,
        });
      } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        pushPackReport(manifest, {
          pack: 'gstack', host: 'codex',
          status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
          source: sourceMode,
          reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
        });
      }
    } else if (tgt === 'gemini') {
      const skillsSrc = path.join(PKG_ROOT, 'skills');
      installGeneratedGeminiCommands(skillsSrc, targetDir, backupDir, manifest);
      installGeminiContext(targetDir, backupDir, manifest, selectedStyle);
      if (packPlan.selected.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        const result = installGstackGeminiPack({
          HOME, backupDir, manifest, info, ok, warn,
          sourceMode, projectRoot: packPlan.root, fallback: true,
        });
        pushPackReport(manifest, {
          pack: 'gstack', host: 'gemini',
          status: result.installed ? 'installed' : 'skipped',
          source: resolveEffectivePackSource(sourceMode, result),
          reason: result.reason || null,
        });
      } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        pushPackReport(manifest, {
          pack: 'gstack', host: 'gemini',
          status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
          source: sourceMode,
          reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
        });
      }
    } else if (tgt === 'openclaw') {
      const workspaceDir = resolveManagedRootDir(tgt, 'openclaw-workspace', runtimeRoots);
      fs.mkdirSync(workspaceDir, { recursive: true });

      backupManagedPathIfExists(tgt, 'openclaw-workspace', backupDir, 'AGENTS.md', manifest, runtimeRoots);
      backupManagedPathIfExists(tgt, 'openclaw-workspace', backupDir, 'SOUL.md', manifest, runtimeRoots);

      const agentsMdPath = path.join(workspaceDir, 'AGENTS.md');
      const soulMdPath = path.join(workspaceDir, 'SOUL.md');
      const agentsContent = fs.readFileSync(path.join(PKG_ROOT, 'config', 'AGENTS.md'), 'utf8');
      const soulContent = renderGeminiContext(PKG_ROOT, selectedStyle.slug, selectedPersona.slug);

      fs.writeFileSync(agentsMdPath, agentsContent);
      fs.writeFileSync(soulMdPath, soulContent);
      pushManifestEntry(manifest.installed, 'openclaw-workspace', 'AGENTS.md');
      pushManifestEntry(manifest.installed, 'openclaw-workspace', 'SOUL.md');

      ok(`AGENTS.md ${c.d(`(OpenClaw workspace: ${workspaceDir})`)}`);
      ok(`SOUL.md ${c.d(`(动态生成: ${selectedPersona.slug} + ${selectedStyle.slug})`)}`);

      // gstack 可选 pack（与 claude/codex/gemini 三家保持一致的调度语义）
      if (packPlan.selected.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        const result = installGstackPack('openclaw', {
          HOME, backupDir, manifest, info, ok, warn,
          sourceMode, projectRoot: packPlan.root, fallback: true,
        });
        pushPackReport(manifest, {
          pack: 'gstack', host: 'openclaw',
          status: result.installed ? 'installed' : 'skipped',
          source: resolveEffectivePackSource(sourceMode, result),
          reason: result.reason || null,
        });
      } else if (packPlan.required.includes('gstack') || packPlan.optional.includes('gstack')) {
        const sourceMode = (packPlan.sources && packPlan.sources.gstack) || 'pinned';
        pushPackReport(manifest, {
          pack: 'gstack', host: 'openclaw',
          status: sourceMode === 'disabled' ? 'disabled' : 'skipped',
          source: sourceMode,
          reason: sourceMode === 'disabled' ? 'source-disabled' : `optional-policy-${packPlan.optionalPolicy || 'auto'}`,
        });
      }
    }

    let settingsPath = null;
    let settings = {};
    if (tgt === 'claude') {
      settingsPath = path.join(targetDir, 'settings.json');
      if (fs.existsSync(settingsPath)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        } catch (e) {
          warn('settings.json 解析失败，将使用空配置');
          settings = {};
        }
        fs.mkdirSync(path.join(backupDir, 'claude'), { recursive: true });
        fs.copyFileSync(settingsPath, path.join(backupDir, 'claude', 'settings.json'));
        pushManifestEntry(manifest.backups, 'claude', 'settings.json');
      }
      settings.outputStyle = selectedStyle.slug;
      ok(`outputStyle = ${c.mag(selectedStyle.slug)}`);
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
      pushManifestEntry(manifest.installed, 'claude', 'settings.json');
    } else if (tgt === 'gemini') {
      settingsPath = path.join(targetDir, 'settings.json');
      if (fs.existsSync(settingsPath)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        } catch (e) {
          warn('Gemini settings.json 解析失败，将使用空配置');
          settings = {};
        }
        fs.mkdirSync(path.join(backupDir, 'gemini'), { recursive: true });
        fs.copyFileSync(settingsPath, path.join(backupDir, 'gemini', 'settings.json'));
        pushManifestEntry(manifest.backups, 'gemini', 'settings.json');
      }
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
      pushManifestEntry(manifest.installed, 'gemini', 'settings.json');
    } else {
      pruneLegacyCodexSettings(tgt, backupDir, manifest);
    }

    if (selectedPersona) {
      const personaContent = readPersonaContent(PKG_ROOT, selectedPersona);
      if (tgt === 'claude') {
        const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
        fs.writeFileSync(claudeMdPath, personaContent);
        ok(`人格（心）→ ${c.mag(selectedPersona.label)} (${selectedPersona.slug})`);
      } else if (tgt === 'gemini') {
        const geminiMdPath = path.join(targetDir, 'GEMINI.md');
        const guidance = renderGeminiContext(PKG_ROOT, selectedStyle.slug, selectedPersona.slug);
        fs.writeFileSync(geminiMdPath, guidance);
        ok(`人格（心）→ ${c.mag(selectedPersona.label)} (${selectedPersona.slug})`);
      } else if (tgt === 'codex') {
        const agentsMdPath = path.join(targetDir, 'AGENTS.md');
        const guidance = renderCodexAgents(PKG_ROOT, selectedStyle.slug, selectedPersona.slug);
        fs.writeFileSync(agentsMdPath, guidance);
        pushManifestEntry(manifest.installed, 'codex', 'AGENTS.md');
        ok(`人格（心）→ ${c.mag(selectedPersona.label)} (${selectedPersona.slug})`);
        ok(`风格（口）→ ${c.mag(selectedStyle.label)} → ~/.codex/AGENTS.md`);
      }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

    const uSrc = path.join(PKG_ROOT, 'bin', 'uninstall.js');
    const uDest = path.join(targetDir, '.code-abyss-uninstall.js');
    if (fs.existsSync(uSrc)) { fs.copyFileSync(uSrc, uDest); fs.chmodSync(uDest, '755'); }

    return { targetDir, settingsPath, settings, manifest, manifestPath, packPlan };
  }

  return {
    installCore,
    installGeneratedArtifacts,
    installGeneratedCommands,
    installGeneratedGeminiCommands,
    installGeminiContext,
  };
}

module.exports = { createInstallCore };

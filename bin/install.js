#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const pkg = require(path.join(__dirname, '..', 'package.json'));
const VERSION = pkg.version;
const HOME = os.homedir();

// ── Node.js 版本检查 ──
const MIN_NODE = pkg.engines?.node?.match(/(\d+)/)?.[1] || '18';
if (parseInt(process.versions.node) < parseInt(MIN_NODE)) {
  console.error(`\x1b[31m✘ 需要 Node.js >= ${MIN_NODE}，当前: ${process.versions.node}\x1b[0m`);
  process.exit(1);
}
const PKG_ROOT = fs.realpathSync(path.join(__dirname, '..'));
const { shouldSkip, copyRecursive, rmSafe, deepMergeNew, printMergeLog, formatActionableError } =
  require(path.join(__dirname, 'lib', 'utils.js'));
const { loadInquirerPrompts } = require(path.join(__dirname, 'lib', 'ui', 'safe-import.js'));
const {
  collectInvocableSkills,
} = require(path.join(__dirname, 'lib', 'skill-registry.js'));
const {
  resolveProjectPacks,
  selectProjectPacksForInstall,
  readProjectPackLock,
} = require(path.join(__dirname, 'lib', 'pack-registry.js'));
const { syncProjectBootstrapArtifacts } = require(path.join(__dirname, 'lib', 'pack-bootstrap.js'));
const { writeReportArtifact } = require(path.join(__dirname, 'lib', 'pack-reports.js'));
const {
  listInstallTargets,
  listTargetNames,
  isSupportedTarget,
  getManagedRootRelativeDir,
  formatTargetList,
} = require(path.join(__dirname, 'lib', 'target-registry.js'));
const {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  listPersonas,
  getDefaultPersona,
  resolvePersona,
  readPersonaContent,
  renderCodexAgents,
  renderGeminiContext,
} = require(path.join(__dirname, 'lib', 'style-registry.js'));
const { detectCcstatusline, installCcstatusline } = require(path.join(__dirname, 'optional', 'ccstatusline', 'index.js'));
const { installGstackClaudePack } = require(path.join(__dirname, 'lib', 'gstack-claude.js'));
const { installGstackGeminiPack } = require(path.join(__dirname, 'lib', 'gstack-gemini.js'));

const { installGstackCodexPack } = require(path.join(__dirname, 'lib', 'gstack-codex.js'));
const {
  cleanupLegacyCodexRuntime,
  detectCodexAuth: detectCodexAuthImpl,
  getCodexCoreFiles,
  postCodex: postCodexFlow,
} = require(path.join(__dirname, 'adapters', 'codex.js'));
const {
  SETTINGS_TEMPLATE,
  getClaudeCoreFiles,
  detectClaudeAuth: detectClaudeAuthImpl,
  postClaude: postClaudeFlow,
} = require(path.join(__dirname, 'adapters', 'claude.js'));
const {
  GEMINI_SETTINGS_TEMPLATE,
  getGeminiCoreFiles,
  detectGeminiAuth: detectGeminiAuthImpl,
  postGemini: postGeminiFlow,
} = require(path.join(__dirname, 'adapters', 'gemini.js'));
const {
  getOpenClawCoreFiles,
  resolveOpenClawRuntime,
  detectOpenClawEnvironment: detectOpenClawEnvironmentImpl,
  postOpenClaw: postOpenClawFlow,
} = require(path.join(__dirname, 'adapters', 'openclaw.js'));

// ── UI ──
const { c, stripAnsi, cell } = require(path.join(__dirname, 'lib', 'ui', 'ansi.js'));
const { TARGET_ICONS, TARGET_HINTS, PERSONA_ICONS } = require(path.join(__dirname, 'lib', 'ui', 'icons.js'));
const { makeBanner, divider, step, ok, warn, info, fail } = require(path.join(__dirname, 'lib', 'ui', 'logger.js'));
const banner = makeBanner(VERSION);
const {
  promptSelect,
  promptCheckbox,
  promptHorizontalSelect,
} = require(path.join(__dirname, 'lib', 'ui', 'prompts.js'));

// ── Lifecycle ──
const { runUninstall: runUninstallImpl } = require(path.join(__dirname, 'lib', 'lifecycle', 'uninstall.js'));
const {
  CLAUDE_COMMAND_TARGET,
  GEMINI_COMMAND_TARGET,
  generateCommandContent,
  generateGeminiCommandContent,
} = require(path.join(__dirname, 'lib', 'lifecycle', 'command-generation.js'));
const {
  normalizeManifestEntry,
  pushManifestEntry,
  pushPackReport,
  resolveEffectivePackSource,
  manifestLabel,
  createResolveManagedRootDir,
  createBackupManagedPathIfExists,
  createPruneLegacyCodexSettings,
} = require(path.join(__dirname, 'lib', 'install-helpers.js'));

const resolveManagedRootDir = createResolveManagedRootDir({ HOME, getManagedRootRelativeDir });
const backupManagedPathIfExists = createBackupManagedPathIfExists({
  resolveManagedRootDir, rmSafe, copyRecursive, info, c,
});
const pruneLegacyCodexSettings = createPruneLegacyCodexSettings({
  resolveManagedRootDir, backupManagedPathIfExists, rmSafe, warn,
});

const { createInstallCore } = require(path.join(__dirname, 'lib', 'lifecycle', 'core-install.js'));
const {
  installCore,
  installGeneratedArtifacts,
  installGeneratedCommands,
  installGeneratedGeminiCommands,
  installGeminiContext,
} = createInstallCore({
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
  rmSafe, copyRecursive, shouldSkip,
  step, ok, warn, info, fail, c,
});

const { createFinish } = require(path.join(__dirname, 'lib', 'lifecycle', 'finish.js'));
const finish = createFinish({
  VERSION,
  writeReportArtifact, syncProjectBootstrapArtifacts, readProjectPackLock,
  c, divider,
});

// ── abyss 联动（代码图谱 CLI）──
// V5-1 kill foyer：code-abyss 不再下载二进制、不再注入 graph hooks/MCP。
// 只探测 + skill-manifest 摘要；graph hooks → `abyss attach <host>`。
const {
  detectAbyss,
  tryReadAbyssManifest,
  summarizeAbyssManifest,
} = require(path.join(__dirname, 'lib', 'abyss-integration.js'));

let abyssState = null;
let abyssManifest = null;

function detectAbyssAndCapabilities() {
  abyssState = detectAbyss({ HOME });
  if (!abyssState) return;
  try {
    abyssManifest = tryReadAbyssManifest({ binPath: abyssState.binPath, HOME });
  } catch {
    abyssManifest = null;
  }
  const line = summarizeAbyssManifest(abyssManifest);
  if (line) info(line);
}

async function installTargetFlow(targetName, installOptions = {}) {
  const persona = installOptions.persona || await resolveInstallPersona();
  const style = installOptions.style || await resolveInstallStyle(targetName);
  const packPlan = await resolveProjectPackPlan(targetName);
  summarizeSelection({ targetName, persona, style, packPlan });
  const ctx = installCore(targetName, style, persona, packPlan, {});
  if (targetName === 'claude') await postClaude(ctx);
  else if (targetName === 'codex') await postCodex(ctx);
  else if (targetName === 'gemini') await postGemini(ctx);
  else await postOpenClaw(ctx);
  maybeSpawnInstallHooks(targetName);
  maybeInstallEnforcement(targetName, ctx);
  finish(ctx);
  if (ctx.cleanupPreviousBackup) ctx.cleanupPreviousBackup();
}

function styleTargetForSelection(targetNames) {
  if (targetNames.length === 1) return targetNames[0];
  if (targetNames.includes('claude')) return 'claude';
  if (targetNames.includes('codex')) return 'codex';
  if (targetNames.includes('gemini')) return 'gemini';
  return targetNames[0] || 'claude';
}

// ── 认证 ──

function detectClaudeAuth(settings) {
  return detectClaudeAuthImpl({ settings, HOME, warn });
}

function detectCodexAuth() {
  return detectCodexAuthImpl({ HOME, warn });
}

function detectGeminiAuth(settings) {
  return detectGeminiAuthImpl({ settings, HOME, warn });
}

function detectOpenClawEnvironment() {
  return detectOpenClawEnvironmentImpl({ HOME, warn });
}

// ── CLI 参数 ──

const args = process.argv.slice(2);

// Agent OS v5.5+ multi-command surface (doctor / compose / score)
// args[0] is checked directly in main() after helpers load.

let target = null;
let uninstallTarget = null;
let autoYes = false;
let listStylesOnly = false;
let listPersonasOnly = false;
let requestedStyleSlug = null;
let requestedPersonaSlug = null;
let withHooks = false;
let noEnforcement = false;

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--target' || args[i] === '-t') && args[i + 1]) { target = args[++i]; }
  else if ((args[i] === '--uninstall' || args[i] === '-u') && args[i + 1]) { uninstallTarget = args[++i]; }
  else if (args[i] === '--style' && args[i + 1]) { requestedStyleSlug = args[++i]; }
  else if (args[i] === '--persona' && args[i + 1]) { requestedPersonaSlug = args[++i]; }
  else if (args[i] === '--list-styles') { listStylesOnly = true; }
  else if (args[i] === '--list-personas') { listPersonasOnly = true; }
  else if (args[i] === '--with-abyss' || args[i] === '--with-mcp') {
    process.stderr.write(`${c.ylw('⚠ REMOVED')} ${args[i]} 已在 Agent OS v5.1 移除\n`);
    if (args[i] === '--with-abyss') {
      process.stderr.write(`  ${c.b('迁移:')} ${c.d('curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash')}\n`);
      process.stderr.write(`         ${c.d('# 或 cargo binstall code-abyss / npm i -g @code-abyss/cli')}\n`);
    } else {
      process.stderr.write(`  ${c.b('迁移:')} 客户端 MCP 配置中添加 ${c.d('{ command: "abyss", args: ["mcp"] }')}\n`);
    }
  }
  else if (args[i] === '--with-hooks') { withHooks = true; }
  else if (args[i] === '--no-enforcement') { noEnforcement = true; }
  else if (args[i] === '--with-enforcement') { noEnforcement = false; } // compat: explicit on (default)
  else if (args[i] === '--yes' || args[i] === '-y') { autoYes = true; }
  else if (args[i] === '--help' || args[i] === '-h') {
    banner();
    console.log(`${c.b('Usage')}  npx code-abyss [options]
`);
    console.log(`  ${c.cyn('doctor')}              runtime health (version, abyss, kernel, enforcement, budget)`);
    console.log(`  ${c.cyn('compose')}             rewrite host guidance (no skill recopy)`);
    console.log(`  ${c.cyn('score')}               key-free mechanical banned-opener score`);
    console.log(`  ${c.cyn('--target, -t')} <${formatTargetList('|')}>   install one target`);
    console.log(`  ${c.cyn('--uninstall, -u')} <${formatTargetList('|')}>   remove one target`);
    console.log(`  ${c.cyn('--with-hooks')}   openclaw/pi/hermes only: spawn install-hooks.sh`);
    console.log(`                 claude/codex/gemini graph hooks: use ${c.d('abyss attach <host>')}`);
    console.log(`  ${c.cyn('--no-enforcement')}  skip character Stop-hook (default: ON for claude/codex)`);
    console.log(`  ${c.cyn('--with-enforcement')}  compat alias — enforcement is already default-on`);
    console.log(`  ${c.cyn('--style')} <slug>  ${c.cyn('--persona')} <slug>  ${c.cyn('-y')}
`);
    console.log(`${c.b('Examples')}`);
    console.log(`  npx code-abyss`);
    console.log(`  npx code-abyss --target codex -y`);
    console.log(`  npx code-abyss doctor`);
    console.log(`  npx code-abyss compose -t claude --persona abyss --style abyss-cultivator`);
    console.log(`  npx code-abyss score`);
    console.log(`  npx code-abyss --list-styles
`);
    process.exit(0);
  }
}

// --with-hooks：仅 openclaw/pi/hermes。claude/codex/gemini → abyss attach。
function maybeSpawnInstallHooks(targetName) {
  if (!withHooks) return;
  if (['claude', 'codex', 'gemini'].includes(targetName)) {
    info(`--with-hooks 对 ${targetName} 已移除 → 请运行: abyss attach ${targetName}`);
    return;
  }
  if (!['openclaw', 'pi', 'hermes'].includes(targetName)) return;
  const scriptPath = path.join(PKG_ROOT, 'skills', 'indexing-code', 'hooks', 'common', 'install-hooks.sh');
  if (!fs.existsSync(scriptPath)) {
    warn(`--with-hooks: install-hooks.sh 未找到 (${scriptPath})`);
    return;
  }
  info(`--with-hooks → bash install-hooks.sh ${targetName}`);
  const { spawnSync } = require('child_process');
  const r = spawnSync('bash', [scriptPath, targetName], { stdio: 'inherit' });
  if (r.status === 0) ok(`hook 已注入 ${targetName}`);
  else warn(`install-hooks.sh ${targetName} 退出码 ${r.status ?? 'n/a'}（不阻断安装）`);
}

// Character Stop-hook 强制执行兜底（Agent OS v5.3：claude/codex 默认开启）。
// 与 graph hooks 分离。gemini/openclaw 无 Stop 事件 → 静默跳过（非降级噪音）。
// 逃生口：--no-enforcement
function maybeInstallEnforcement(targetName, ctx) {
  if (noEnforcement) {
    if (['claude', 'codex'].includes(targetName)) {
      info('character Stop-hook 已跳过（--no-enforcement）');
    }
    return;
  }
  if (!['claude', 'codex'].includes(targetName)) return;
  const scriptPath = path.join(ctx.targetDir, 'skills', '_kernel', 'character', 'hooks', 'install-character-hooks.sh');
  if (!fs.existsSync(scriptPath)) {
    warn(`character Stop-hook: install-character-hooks.sh 未找到 (${scriptPath})`);
    return;
  }
  info(`character Stop-hook → bash install-character-hooks.sh ${targetName}`);
  const { spawnSync } = require('child_process');
  const r = spawnSync('bash', [scriptPath, targetName], {
    stdio: 'inherit',
    env: { ...process.env, HOME },
  });
  if (r.status === 0) ok(`character Stop-hook 已注入 ${targetName}`);
  else warn(`install-character-hooks.sh ${targetName} 退出码 ${r.status ?? 'n/a'}（不阻断安装）`);
}

// ── Select flows (must be assembled after CLI parsing) ──

const { createSelectFlows } = require(path.join(__dirname, 'lib', 'select.js'));
const {
  formatPersonaTab,
  formatPersonaDescription,
  formatStyleDescription,
  formatTargetChoice,
  formatTargetDescription,
  summarizeSelection,
  printStyleCatalog,
  printPersonaCatalog,
  resolveProjectPackPlan,
  resolveInstallPersona,
  resolveInstallStyle,
} = createSelectFlows({
  PKG_ROOT,
  getRequestedPersonaSlug: () => requestedPersonaSlug,
  getRequestedStyleSlug: () => requestedStyleSlug,
  getAutoYes: () => autoYes,
  listPersonas, getDefaultPersona, resolvePersona,
  listStyles, getDefaultStyle, resolveStyle,
  resolveProjectPacks, selectProjectPacksForInstall,
  promptHorizontalSelect,
  TARGET_ICONS, TARGET_HINTS, PERSONA_ICONS,
  resolveManagedRootDir,
  c, info, banner, divider, cell,
});

// ── 卸载 ──

function runUninstall(tgt) {
  return runUninstallImpl(tgt, {
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
  });
}

// ── 安装核心 ──

function scanInvocableSkills(skillsDir) {
  return collectInvocableSkills(skillsDir);
}


// ── Claude 后续 ──

async function postClaude(ctx) {
  await postClaudeFlow({
    ctx,
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
    deepMergeNew,
    printMergeLog,
    installCcstatusline,
    promptCheckbox,
  });
}

// ── Codex 后续 ──

async function postCodex(ctx) {
  await postCodexFlow({
    ctx,
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
  });
}

async function postGemini(ctx) {
  await postGeminiFlow({
    settingsPath: ctx.settingsPath,
    settings: ctx.settings,
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
  });
}

async function postOpenClaw(ctx) {
  await postOpenClawFlow({
    runtime: resolveOpenClawRuntime({ HOME, warn }),
    autoYes,
    HOME,
    PKG_ROOT,
    step,
    ok,
    warn,
    info,
    c,
    detected: detectOpenClawEnvironment(),
  });
}

// ── 主流程 ──

async function main() {
  if (listStylesOnly) {
    printStyleCatalog();
    return;
  }

  if (listPersonasOnly) {
    printPersonaCatalog();
    return;
  }

  if (uninstallTarget) { runUninstall(uninstallTarget); return; }

  // ── Agent OS runtime control (v5.5+) ──
  if (args[0] === 'doctor') {
    const { buildDoctorReport, formatDoctorReport } = require(path.join(__dirname, 'lib', 'runtime-control.js'));
    let docTarget = 'claude';
    for (let i = 1; i < args.length; i++) {
      if ((args[i] === '--target' || args[i] === '-t') && args[i + 1]) docTarget = args[++i];
    }
    const report = buildDoctorReport({ projectRoot: PKG_ROOT, HOME, version: VERSION, target: docTarget });
    process.stdout.write(formatDoctorReport(report));
    if (args.includes('--json')) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return;
  }

  if (args[0] === 'compose') {
    const { composeHostGuidance } = require(path.join(__dirname, 'lib', 'runtime-control.js'));
    let cTarget = 'claude';
    let cPersona = requestedPersonaSlug;
    let cStyle = requestedStyleSlug;
    let doWrite = true;
    for (let i = 1; i < args.length; i++) {
      if ((args[i] === '--target' || args[i] === '-t') && args[i + 1]) cTarget = args[++i];
      else if (args[i] === '--persona' && args[i + 1]) cPersona = args[++i];
      else if (args[i] === '--style' && args[i + 1]) cStyle = args[++i];
      else if (args[i] === '--stdout') doWrite = false;
    }
    try {
      const r = composeHostGuidance({
        projectRoot: PKG_ROOT,
        target: cTarget,
        personaSlug: cPersona,
        styleSlug: cStyle,
        HOME,
        write: doWrite,
      });
      if (doWrite) {
        ok(`compose → ${r.destPath} (persona=${r.persona} style=${r.style}, ${r.guidance.length} chars)`);
      } else {
        process.stdout.write(r.guidance);
      }
    } catch (e) {
      fail(e.message);
      process.exit(1);
    }
    return;
  }

  if (args[0] === 'score') {
    const { main: scoreMain } = require(path.join(__dirname, 'lib', 'score-mechanical.js'));
    scoreMain(args.slice(1));
    return;
  }

  banner();

  if (target) {
    if (!isSupportedTarget(target)) {
      fail(formatActionableError(`--target 必须是 ${listTargetNames().join('、')}`, 'Try: node bin/install.js --target claude'));
      process.exit(1);
    }
    detectAbyssAndCapabilities();
    await installTargetFlow(target);
    return;
  }

  const selectedTargets = await promptCheckbox({
    message: '选择目标（可多选）',
    choices: listInstallTargets().map((targetMeta) => ({
      name: formatTargetChoice(targetMeta),
      value: targetMeta.name,
      description: formatTargetDescription(targetMeta),
    })),
    required: true,
  });

  const action = await promptSelect({
    message: '选择动作',
    choices: [
      { name: `${c.grn('+')} Install / Update`, value: 'install', description: '安装或覆盖更新所选目标' },
      { name: `${c.red('−')} Remove`, value: 'remove', description: '按 .code-abyss-backup/manifest.json 卸载并恢复备份' },
    ],
  });

  if (action === 'install') {
    detectAbyssAndCapabilities();
    const persona = await resolveInstallPersona();
    const style = await resolveInstallStyle(styleTargetForSelection(selectedTargets));
    for (const targetName of selectedTargets) {
      await installTargetFlow(targetName, { persona, style });
    }
  } else {
    for (const targetName of selectedTargets) runUninstall(targetName);
  }
}

if (require.main === module) {
  main().catch(err => { fail(err.message); process.exit(1); });
}

module.exports = {
  deepMergeNew, detectClaudeAuth, detectCodexAuth,
  detectCcstatusline, copyRecursive, shouldSkip, SETTINGS_TEMPLATE,
  scanInvocableSkills,
  generateCommandContent,
  generateGeminiCommandContent,
  installGeneratedCommands,
  installGeneratedGeminiCommands,
};

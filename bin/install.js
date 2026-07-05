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
const {
  detectAbyss,
  injectClaudeMcp,
  injectGeminiMcp,
  tryReadAbyssManifest,
  summarizeAbyssManifest,
} = require(path.join(__dirname, 'lib', 'abyss-integration.js'));
const { installAbyssBinary } = require(path.join(__dirname, 'lib', 'abyss-binary.js'));

// 本次运行的 abyss 探测结果（ensureAbyssBinary 后更新）
let abyssState = null;
// 0.5.22+ 才有 skill-manifest；缺它不报错，只是不打印发现摘要
let abyssManifest = null;

// 二进制下载是外网行为：--with-abyss 显式才下载；交互模式询问；-y 只提示不下载。
// CODE_ABYSS_SKIP_BINARY=1 在 headless/CI/测试场景下静默跳过 detect 之外的一切
// （不询问、不下载），让交互安装在无网/无 stdin 的环境里也不阻塞。
async function ensureAbyssBinary() {
  abyssState = detectAbyss({ HOME });
  if (abyssState) {
    discoverAbyssCapabilities();
    return;
  }
  if (process.env.CODE_ABYSS_SKIP_BINARY) return;
  let doInstall = withAbyss;
  if (!doInstall && !autoYes) {
    const { confirm } = await import('@inquirer/prompts');
    doInstall = await confirm({
      message: '未检测到 abyss 二进制（代码图谱 hook 依赖）。下载预编译版到 ~/.code-abyss/bin?',
      default: true,
    });
  }
  if (!doInstall) return;
  const r = await installAbyssBinary({ HOME, info, warn });
  if (r.installed) {
    ok(`abyss 二进制 → ${c.cyn(r.binPath)}`);
    abyssState = detectAbyss({ HOME });
    discoverAbyssCapabilities();
  } else {
    warn(`abyss 下载未完成: ${r.reason}（hook 将静默停用，可稍后手动安装）`);
  }
}

// 走 abyss skill-manifest 拿能力清单（0.5.22+）。失败静默——manifest 是增强不是依赖。
function discoverAbyssCapabilities() {
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
  emitDeprecationWarnings(targetName);
  const persona = installOptions.persona || await resolveInstallPersona();
  const style = installOptions.style || await resolveInstallStyle(targetName);
  const packPlan = await resolveProjectPackPlan(targetName);
  summarizeSelection({ targetName, persona, style, packPlan });
  const ctx = installCore(targetName, style, persona, packPlan, { withHooks });
  if (targetName === 'claude') await postClaude(ctx);
  else if (targetName === 'codex') await postCodex(ctx);
  else if (targetName === 'gemini') await postGemini(ctx);
  else await postOpenClaw(ctx);
  registerAbyssMcp(targetName, ctx);
  maybeSpawnInstallHooks(targetName);
  maybeInstallEnforcement(targetName, ctx);
  finish(ctx);
  if (ctx.cleanupPreviousBackup) ctx.cleanupPreviousBackup();
}

// MCP 注册（--with-mcp 显式 opt-in；codex 在 postCodex 内随 config.toml 一并写）
function registerAbyssMcp(targetName, ctx) {
  if (!withMcp) return;
  const binPath = abyssState ? abyssState.binPath : 'abyss';
  if (targetName === 'claude') {
    const r = injectClaudeMcp({ HOME, binPath });
    if (r.written) ok(`MCP → ${c.cyn(r.cfgPath)} mcpServers.abyss`);
    else warn(`MCP 注册跳过: ~/.claude.json ${r.reason}`);
  } else if (targetName === 'gemini' && ctx.settingsPath) {
    injectGeminiMcp(ctx.settings, binPath);
    fs.writeFileSync(ctx.settingsPath, JSON.stringify(ctx.settings, null, 2) + '\n');
    ok(`MCP → ${c.cyn(ctx.settingsPath)} mcpServers.abyss`);
  } else if (targetName === 'openclaw') {
    info('OpenClaw 暂不支持 MCP 注册，跳过');
  }
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
let target = null;
let uninstallTarget = null;
let autoYes = false;
let listStylesOnly = false;
let listPersonasOnly = false;
let requestedStyleSlug = null;
let requestedPersonaSlug = null;
let withAbyss = false;
let withMcp = false;
let withHooks = false;
let withEnforcement = false;

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--target' || args[i] === '-t') && args[i + 1]) { target = args[++i]; }
  else if ((args[i] === '--uninstall' || args[i] === '-u') && args[i + 1]) { uninstallTarget = args[++i]; }
  else if (args[i] === '--style' && args[i + 1]) { requestedStyleSlug = args[++i]; }
  else if (args[i] === '--persona' && args[i + 1]) { requestedPersonaSlug = args[++i]; }
  else if (args[i] === '--list-styles') { listStylesOnly = true; }
  else if (args[i] === '--list-personas') { listPersonasOnly = true; }
  else if (args[i] === '--with-abyss') { withAbyss = true; }
  else if (args[i] === '--with-mcp') { withMcp = true; }
  else if (args[i] === '--with-hooks') { withHooks = true; }
  else if (args[i] === '--with-enforcement') { withEnforcement = true; }
  else if (args[i] === '--yes' || args[i] === '-y') { autoYes = true; }
  else if (args[i] === '--help' || args[i] === '-h') {
    banner();
    console.log(`${c.b('Usage')}  npx code-abyss [options]
`);
    console.log(`  ${c.cyn('--target, -t')} <${formatTargetList('|')}>   install one target`);
    console.log(`  ${c.cyn('--uninstall, -u')} <${formatTargetList('|')}>   remove one target`);
    console.log(`  ${c.cyn('--with-abyss')}   ${c.ylw('[DEPRECATED v4.9, removed v5.0]')} download abyss binary;`);
    console.log(`                 use \`curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash\` instead`);
    console.log(`  ${c.cyn('--with-mcp')}     ${c.ylw('[DEPRECATED v4.9, removed v5.0]')} register abyss MCP server;`);
    console.log(`                 add { command: "abyss", args: ["mcp"] } to your MCP client config directly`);
    console.log(`  ${c.cyn('--with-hooks')}   inject hooks (opt-in). claude/codex/gemini: ${c.ylw('[DEPRECATED v4.9]')} use \`abyss attach <host>\`;`);
    console.log(`                 openclaw/pi/hermes: spawns skills/indexing-code/hooks/common/install-hooks.sh (kept in v5.0)`);
    console.log(`  ${c.cyn('--with-enforcement')}  install the character Stop-hook backstop (opt-in; ${c.ylw('blocks')} to force one`);
    console.log(`                 revision when a reply opens with a banned capitulation phrase). claude/codex only.`);
    console.log(`  ${c.cyn('--style')} <slug>  ${c.cyn('--persona')} <slug>  ${c.cyn('-y')}
`);
    console.log(`${c.b('Examples')}`);
    console.log(`  npx code-abyss`);
    console.log(`  npx code-abyss --target codex -y`);
    console.log(`  npx code-abyss --list-styles
`);
    process.exit(0);
  }
}

// ── v4.9.0 deprecation 期 helper（2026-06-25 起；见 [[code-abyss-v5-split]] memory + abyss v0.5.24 CHANGELOG） ──
//
// 三 flag 的对外承诺：
//   --with-abyss (v4.9 deprecation, v5.0 移除) → abyss 仓库自身的 install.sh / cargo binstall / npm wrapper 接管
//   --with-mcp   (v4.9 deprecation, v5.0 移除) → 客户端 MCP 配置直接写 mcpServers.abyss
//   --with-hooks 分双 scope：
//     • claude/codex/gemini → v4.9 deprecation + 仍 inject；v5.0 移除该路径，引导 abyss attach <host>
//     • openclaw/pi/hermes  → v4.9 起新增能力：自动 spawn install-hooks.sh（abyss CLI 设计上不接管这三平台）；v5.0 永久保留

function emitDeprecationWarnings(targetName) {
  if (withAbyss) {
    process.stderr.write(`${c.ylw('⚠ DEPRECATED')} --with-abyss 将在 v5.0 移除（abyss 二进制分发已转交 abyss 仓库本体）\n`);
    process.stderr.write(`  ${c.b('迁移:')} ${c.d('curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash')}\n`);
    process.stderr.write(`         ${c.d('# 或 cargo binstall code-abyss / npm i -g @code-abyss/cli')}\n`);
  }
  if (withMcp) {
    process.stderr.write(`${c.ylw('⚠ DEPRECATED')} --with-mcp 将在 v5.0 移除（MCP 注册由客户端自管）\n`);
    process.stderr.write(`  ${c.b('迁移:')} 客户端 MCP 配置中添加 ${c.d('mcpServers.abyss = { command: "abyss", args: ["mcp"] }')}\n`);
  }
  if (withHooks && targetName && ['claude', 'codex', 'gemini'].includes(targetName)) {
    process.stderr.write(`${c.ylw('⚠ DEPRECATED')} --with-hooks 对 ${targetName} 将在 v5.0 移除（abyss attach 是 production 主入口）\n`);
    process.stderr.write(`  ${c.b('迁移:')} ${c.d(`abyss attach ${targetName}`)} ${c.d('# abyss v0.5.20+，幂等')}\n`);
  }
}

// --with-hooks 对 openclaw 的真正能力（v4.9 起）：自动 spawn install-hooks.sh。
// abyss CLI 设计上不接管 openclaw（per-pack layout 单二进制无法可靠创建），
// 所以 code-abyss 是 openclaw hook 注入的唯一入口。pi/hermes 不在 install target 列表，
// 但若未来扩 target 至 pi/hermes，本函数已就位。
function maybeSpawnInstallHooks(targetName) {
  if (!withHooks) return;
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

// --with-enforcement：安装 character Stop-hook 强制执行兜底（与 --with-hooks 的
// abyss 代码图谱 hook 分离——那条 v5.0 移除且非阻塞；本条是独立、非 deprecated、
// 刻意阻塞的 opt-in）。从「安装后」的 skill 路径 spawn，使 installer 的 SCRIPT_DIR
// 落在持久位置（非 npx 缓存），写进 settings 的 check_banned_openers.py 路径才稳定。
// 仅 claude/codex 有可用的 Stop 事件；gemini/openclaw 无，按 no-silent-caps 明示跳过。
function maybeInstallEnforcement(targetName, ctx) {
  if (!withEnforcement) return;
  if (!['claude', 'codex'].includes(targetName)) {
    info(`--with-enforcement：${targetName} 无 Stop hook 事件，强制执行不可用，已跳过`);
    return;
  }
  const scriptPath = path.join(ctx.targetDir, 'skills', '_kernel', 'character', 'hooks', 'install-character-hooks.sh');
  if (!fs.existsSync(scriptPath)) {
    warn(`--with-enforcement: install-character-hooks.sh 未找到 (${scriptPath})`);
    return;
  }
  info(`--with-enforcement → bash install-character-hooks.sh ${targetName}`);
  const { spawnSync } = require('child_process');
  const r = spawnSync('bash', [scriptPath, targetName], { stdio: 'inherit' });
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
    withMcp,
    withHooks,
    abyssBinPath: abyssState ? abyssState.binPath : null,
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

  banner();

  if (target) {
    if (!isSupportedTarget(target)) {
      fail(formatActionableError(`--target 必须是 ${listTargetNames().join('、')}`, 'Try: node bin/install.js --target claude'));
      process.exit(1);
    }
    await ensureAbyssBinary();
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
    await ensureAbyssBinary();
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

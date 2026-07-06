// bin/lib/select.js
// 交互选择层：persona / style / pack plan 的格式化与解析
// 全部通过工厂模式注入依赖（避免硬绑 PKG_ROOT / autoYes / requested* 等可变 closure）

const fs = require('fs');
const path = require('path');
const { loadInquirerPrompts } = require('./ui/safe-import.js');

function createSelectFlows(deps) {
  const {
    PKG_ROOT,
    getRequestedPersonaSlug, getRequestedStyleSlug, getAutoYes,
    listPersonas, getDefaultPersona, resolvePersona,
    listStyles, getDefaultStyle, resolveStyle,
    resolveProjectPacks, selectProjectPacksForInstall,
    promptHorizontalSelect,
    TARGET_ICONS, TARGET_HINTS, PERSONA_ICONS,
    resolveManagedRootDir,
    c, info, banner, divider, cell,
  } = deps;

  function formatPersonaTab(persona) {
    const icon = PERSONA_ICONS[persona.gender] || PERSONA_ICONS.other;
    return `${icon} ${persona.label}`;
  }

  function formatPersonaDescription(persona) {
    const suffix = persona.default ? ` ${c.grn('default')}` : '';
    return `${persona.slug}${suffix} · ${persona.description}`;
  }

  function formatStyleDescription(style) {
    const suffix = style.default ? ` ${c.grn('default')}` : '';
    return `${style.slug}${suffix} · ${style.description}`;
  }

  function formatTargetChoice(targetMeta) {
    const icon = TARGET_ICONS[targetMeta.name] || '•';
    return `${icon} ${targetMeta.actionLabel}`;
  }

  function formatTargetDescription(targetMeta) {
    return `${TARGET_HINTS[targetMeta.name] || ''} → ${resolveManagedRootDir(targetMeta.name)}`;
  }

  function summarizeSelection({ targetName, persona, style, packPlan }) {
    const packs = packPlan?.path
      ? ` · packs ${packPlan.selected.join(', ') || 'none'}`
      : '';
    info(`${c.b(targetName)} · ${persona.label} · ${style.slug}${packs}`);
  }

  function printStyleCatalog() {
    banner();
    divider('Styles');
    listStyles(PKG_ROOT).forEach((style) => {
      const tag = style.default ? ` ${c.grn('default')}` : '';
      console.log(`  ${c.cyn(cell(style.slug, 24))} ${style.label}${tag}`);
    });
    console.log('');
  }

  function printPersonaCatalog() {
    banner();
    divider('Personas');
    listPersonas(PKG_ROOT).forEach((persona) => {
      const tag = persona.default ? ` ${c.grn('default')}` : '';
      console.log(`  ${c.cyn(cell(persona.slug, 18))} ${persona.label}${tag}`);
    });
    console.log('');
  }

  async function resolveProjectPackPlan(targetName) {
    const projectPacks = resolveProjectPacks(process.cwd(), targetName);
    if (!projectPacks.path) {
      return {
        ...projectPacks,
        selected: [],
        optionalSelected: [],
        sources: {},
      };
    }

    let confirmOptional = null;
    if (projectPacks.optionalPolicy === 'prompt' && projectPacks.optional.length > 0 && !getAutoYes()) {
      const { confirm } = await loadInquirerPrompts();
      confirmOptional = async (optionalPacks) => confirm({
        message: `当前仓库声明了 optional packs: ${optionalPacks.join(', ')}，是否一并安装?`,
        default: true,
      });
    }

    const selection = await selectProjectPacksForInstall(projectPacks, {
      autoYes: getAutoYes(),
      confirm: confirmOptional,
    });

    return {
      ...projectPacks,
      ...selection,
    };
  }

  async function ensureRemotePersona(persona) {
    if (persona.core !== false) return persona;
    // Repo dev mode: config/personas/<slug>.json already exists locally (this
    // repo IS the origin remote.base points to) — mirrors the same local-first
    // check bin/lib/style-registry.js's resolvePersonaJsonPath() already does
    // for the render path. Skip the network fetch entirely rather than
    // requiring live internet access (and a remote that's caught up with this
    // branch) just to install a persona whose content is already on disk.
    const localPath = path.join(PKG_ROOT, 'config', 'personas', `${persona.slug}.json`);
    if (fs.existsSync(localPath)) return persona;

    const { getRemoteBase } = require('./style-registry');
    const { ensurePersona } = require('./persona-fetch');
    const remoteBase = getRemoteBase(PKG_ROOT);
    if (!remoteBase) throw new Error(`远程人格 ${persona.slug} 需要 remote.base 配置`);
    info(`${c.d('拉取远程人格')} ${c.mag(persona.slug)} ...`);
    await ensurePersona(persona.slug, remoteBase);
    return persona;
  }

  async function resolveInstallPersona() {
    const requested = getRequestedPersonaSlug();
    if (requested) {
      const persona = resolvePersona(PKG_ROOT, requested);
      if (!persona) throw new Error(`未知人格预设: ${requested}`);
      return ensureRemotePersona(persona);
    }
    if (getAutoYes()) return getDefaultPersona(PKG_ROOT);

    const personas = listPersonas(PKG_ROOT);
    const defaultPersona = getDefaultPersona(PKG_ROOT);
    const slug = await promptHorizontalSelect({
      message: `${c.mag('选择人格')} ${c.d('Tab 横向切换')}`,
      choices: personas.map(p => ({
        name: formatPersonaTab(p),
        value: p.slug,
        short: p.label,
        description: formatPersonaDescription(p),
      })),
      default: defaultPersona.slug,
    });
    const persona = resolvePersona(PKG_ROOT, slug);
    return ensureRemotePersona(persona);
  }

  async function resolveInstallStyle(targetName) {
    const requested = getRequestedStyleSlug();
    if (requested) {
      const style = resolveStyle(PKG_ROOT, requested, targetName === 'gemini' || targetName === 'codex' ? 'claude' : targetName)
        || resolveStyle(PKG_ROOT, requested, 'claude');
      if (!style) throw new Error(`未知输出风格: ${requested}`);
      return style;
    }

    if (getAutoYes()) return getDefaultStyle(PKG_ROOT, targetName);

    const styles = listStyles(PKG_ROOT, targetName);
    const defaultStyle = getDefaultStyle(PKG_ROOT, targetName);

    const slug = await promptHorizontalSelect({
      message: `${c.cyn('选择输出风格')} ${c.d('Tab 横向切换')}`,
      choices: styles.map(style => ({
        name: style.label,
        value: style.slug,
        short: style.label,
        description: formatStyleDescription(style),
      })),
      default: defaultStyle.slug,
    });
    return resolveStyle(PKG_ROOT, slug, targetName);
  }

  return {
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
  };
}

module.exports = { createSelectFlows };

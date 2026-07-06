'use strict';

const fs = require('fs');
const path = require('path');
const { listTargetNames } = require('./target-registry');
const { validatePersonaVoiceCard, renderPersonaIdentity, NEUTRAL_FALLBACK_PERSONA } = require('./persona-voice-card');

const SUPPORTED_TARGETS = new Set(listTargetNames());

const _cache = new Map();
const _personaCache = new Map();

function clearStyleCache() {
  _cache.clear();
  _personaCache.clear();
}

// ── Shared Behavior Layer ──

// v3 always-on core (persona-architecture-v3.md §2-3): keep only the minimal
// always-on layer — safety/precedence (iron-laws), injection defense, the thin
// router, skill routing + the code-abyss-specific sedimentation triggers
// (trimmed proactive), and the close-out contract (environment). The GENERIC
// behavior/method content (main proactive-assist, execution-drive, big-picture,
// execution-chains) moved to the lazy-loaded kernel bundles (character/methods)
// so it no longer bloats every render. This is the eager→lazy inversion.
const SHARED_FILES_ORDER = [
  'iron-laws.md',
  'injection-awareness.md',
  'kernel-router.md',
  'skill-routing.md',
  'proactive.md',
  'environment.md',
];

function loadSharedBehavior(projectRoot) {
  const sharedDir = path.join(projectRoot, 'config', 'personas', '_shared');
  const parts = [];
  for (const file of SHARED_FILES_ORDER) {
    const filePath = path.join(sharedDir, file);
    if (fs.existsSync(filePath)) {
      parts.push(fs.readFileSync(filePath, 'utf8').replace(/\s+$/, ''));
    }
  }
  return parts.join('\n\n');
}

// ── Template Variable Substitution ──
// Still used by the OUTPUT STYLE layer (output-styles/*.md contain {{self}}/
// {{user}}/{{language}} tokens for cross-combination). The persona IDENTITY
// layer no longer needs token substitution — renderPersonaIdentity() (in
// persona-voice-card.js) interpolates directly, since it's a fixed, code-owned
// template rather than a persona-authored file.
function applyPersonaVars(content, persona) {
  if (!persona) return content;
  const vars = {
    '{{self}}': persona.self || '',
    '{{user}}': persona.user || '',
    '{{language}}': persona.language || '',
  };
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    if (value) {
      result = result.split(key).join(value);
    }
  }
  return result;
}

// ── Persona Voice Card loading ──
// Personas are now a single flat `<slug>.json` (persona-voice-card v1.0) —
// no directory, no sibling .md/.identity/.behavior/.style files. Every load
// path (registry build for core, cache-file read for remote, and the
// mandatory re-validation right before render) funnels through this one
// function, so validation can never be bypassed by a different code path.
function loadPersonaVoiceCardFile(filePath, slug) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return withNeutralFallback(slug, `persona ${slug} 缺少 voice card: ${filePath}`);
  }
  let card;
  try {
    card = JSON.parse(raw);
  } catch (e) {
    return withNeutralFallback(slug, `persona ${slug} 的 voice card 解析失败: ${e.message}`);
  }
  const { valid, errors } = validatePersonaVoiceCard(card);
  if (!valid) {
    return withNeutralFallback(slug, `persona ${slug} 的 voice card 未通过校验:\n  ${errors.join('\n  ')}`);
  }
  return card;
}

// Never renders unvalidated content — a stale cache, a hand-edit, or a
// compromised community fork degrades to a neutral voice instead of crashing
// or (worse) silently rendering whatever bytes happen to be on disk.
function withNeutralFallback(slug, reason) {
  process.stderr.write(`[code-abyss] 警告: ${reason}\n  已回退到中性语音（persona-voice-card 校验失败不阻塞渲染，但绝不渲染未校验内容）。\n`);
  return { ...NEUTRAL_FALLBACK_PERSONA, slug };
}

// Core personas ship their <slug>.json locally (npm package "files"). Remote
// personas: check local config/personas/ first (repo dev mode — this repo IS
// the origin remote.base points to), else the fetch cache.
function resolvePersonaJsonPath(projectRoot, slug, isCore) {
  const localPath = path.join(projectRoot, 'config', 'personas', `${slug}.json`);
  if (isCore || fs.existsSync(localPath)) return localPath;
  const { getCacheDir } = require('./persona-fetch');
  return path.join(getCacheDir(slug), `${slug}.json`);
}

// Loads + validates the actual persona file for RENDERING (self/user/language/
// register/emoji_policy/flourish) — always freshly re-validated here, never
// trusted from the lighter-weight registry-list metadata (see loadPersonaRegistry).
function loadRenderablePersona(projectRoot, registryEntry) {
  const filePath = resolvePersonaJsonPath(projectRoot, registryEntry.slug, registryEntry.core !== false);
  return loadPersonaVoiceCardFile(filePath, registryEntry.slug);
}

function loadPersonaRegistry(projectRoot) {
  if (_personaCache.has(projectRoot)) return _personaCache.get(projectRoot);

  const registryPath = path.join(projectRoot, 'config', 'personas', 'index.json');
  const raw = fs.readFileSync(registryPath, 'utf8');
  const parsed = JSON.parse(raw);
  const personas = Array.isArray(parsed.personas) ? parsed.personas : null;
  if (!personas || personas.length === 0) {
    throw new Error('config/personas/index.json 缺少 personas 列表');
  }
  const remoteBase = parsed.remote && parsed.remote.base;

  const seen = new Set();
  let defaultCount = 0;
  const normalized = personas.map((p) => {
    if (!p || typeof p !== 'object') throw new Error('persona registry 存在无效条目');
    const slug = requireNonEmptyString(p.slug, 'persona.slug');
    if (seen.has(slug)) throw new Error(`persona slug 重复: ${slug}`);
    seen.add(slug);
    if (p.default) defaultCount += 1;

    const isCore = p.core !== false;

    if (isCore) {
      // Core personas ship in the npm package — a broken shipped file is a
      // packaging bug that should fail loudly at dev/CI time, not silently
      // degrade for an end user. (Contrast: loadRenderablePersona at render
      // time DOES fall back to neutral, for hand-edited/community-fork cases
      // that arise after install, which is a different failure mode.)
      const cardPath = path.join(projectRoot, 'config', 'personas', `${slug}.json`);
      const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
      const { valid, errors } = validatePersonaVoiceCard(card);
      if (!valid) throw new Error(`persona ${slug} 的 voice card 未通过校验:\n  ${errors.join('\n  ')}`);
      return {
        slug,
        label: card.label,
        description: card.description || '',
        file: `${slug}.json`,
        default: p.default === true,
        core: true,
      };
    }

    // Remote persona — label/description come from the offline snapshot in
    // index.json (so the picker works before any fetch). self/user/language
    // are deliberately NOT duplicated here — they are read fresh from the
    // actual (fetched + cached) voice card at render time, which is the only
    // way to guarantee no drift between what the picker showed and what
    // actually renders.
    return {
      slug,
      label: requireNonEmptyString(p.label, `persona.${slug}.label`),
      description: p.description || '',
      file: `${slug}.json`,
      default: p.default === true,
      core: false,
    };
  });

  if (defaultCount !== 1) {
    throw new Error('persona registry 必须且只能有一个 default persona');
  }

  const result = { personas: normalized, remoteBase: remoteBase || null };
  _personaCache.set(projectRoot, result);
  return result;
}

function listPersonas(projectRoot) {
  return loadPersonaRegistry(projectRoot).personas;
}

function getDefaultPersona(projectRoot) {
  const { personas } = loadPersonaRegistry(projectRoot);
  return personas.find(p => p.default);
}

function resolvePersona(projectRoot, slug) {
  const { personas } = loadPersonaRegistry(projectRoot);
  return personas.find(p => p.slug === slug) || null;
}

function getRemoteBase(projectRoot) {
  return loadPersonaRegistry(projectRoot).remoteBase;
}

// ── Style Registry ──

function loadStyleRegistry(projectRoot) {
  if (_cache.has(projectRoot)) return _cache.get(projectRoot);

  const registryPath = path.join(projectRoot, 'output-styles', 'index.json');
  const raw = fs.readFileSync(registryPath, 'utf8');
  const parsed = JSON.parse(raw);
  const styles = Array.isArray(parsed.styles) ? parsed.styles : null;
  if (!styles || styles.length === 0) {
    throw new Error('output-styles/index.json 缺少 styles 列表. Check output-styles/index.json has a "styles" array');
  }

  const seen = new Set();
  let defaultCount = 0;
  const normalized = styles.map((style) => normalizeStyle(style, seen));
  normalized.forEach((style) => {
    if (style.default) defaultCount += 1;
  });

  if (defaultCount !== 1) {
    throw new Error('style registry 必须且只能有一个 default style. Check output-styles/index.json — exactly one entry must have "default: true"');
  }

  _cache.set(projectRoot, normalized);
  return normalized;
}

function normalizeStyle(style, seen) {
  if (!style || typeof style !== 'object') {
    throw new Error('style registry 存在无效条目');
  }

  const slug = requireNonEmptyString(style.slug, 'slug');
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`style slug 必须是 kebab-case: ${slug}`);
  }
  if (seen.has(slug)) {
    throw new Error(`style slug 重复: ${slug}`);
  }
  seen.add(slug);

  const label = requireNonEmptyString(style.label, `styles.${slug}.label`);
  const description = requireNonEmptyString(style.description, `styles.${slug}.description`);
  const file = requireNonEmptyString(style.file || `${slug}.md`, `styles.${slug}.file`);
  const targets = normalizeTargets(style.targets, slug);

  return {
    slug,
    label,
    description,
    file,
    targets,
    default: style.default === true,
  };
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`style registry 字段无效: ${fieldName}`);
  }
  return value.trim();
}

function normalizeTargets(targets, slug) {
  const values = Array.isArray(targets) && targets.length > 0 ? targets : listTargetNames();
  values.forEach((target) => {
    if (!SUPPORTED_TARGETS.has(target)) {
      throw new Error(`style ${slug} 包含不支持的 target: ${target}`);
    }
  });
  return [...new Set(values)];
}

function listStyles(projectRoot, targetName = null) {
  const styles = loadStyleRegistry(projectRoot);
  if (!targetName) return styles;
  return styles.filter(style => style.targets.includes(targetName));
}

function getDefaultStyle(projectRoot, targetName = null) {
  const styles = listStyles(projectRoot, targetName);
  const style = styles.find(item => item.default);
  if (!style) {
    throw new Error(`未找到 ${targetName || '全局'} 默认输出风格`);
  }
  return style;
}

function resolveStyle(projectRoot, slug, targetName = null) {
  const styles = listStyles(projectRoot, targetName);
  return styles.find(style => style.slug === slug) || null;
}

function readStyleContent(projectRoot, style) {
  const stylePath = path.join(projectRoot, 'output-styles', style.file);
  return fs.readFileSync(stylePath, 'utf8');
}

// Kept for API compatibility (threaded through bin/install.js /
// bin/lib/lifecycle/core-install.js's dependency-injection object, though
// nothing currently calls it directly outside this module) — returns the
// same fixed-template identity content renderRuntimeGuidance uses internally.
function readPersonaContent(projectRoot, registryEntry) {
  const persona = loadRenderablePersona(projectRoot, registryEntry);
  return renderPersonaIdentity(persona);
}

function renderRuntimeGuidance(projectRoot, styleSlug, targetName = 'codex', personaSlug = null) {
  const style = resolveStyle(projectRoot, styleSlug, targetName === 'gemini' ? 'claude' : targetName);
  if (!style) {
    throw new Error(`未知输出风格: ${styleSlug}. Try: node bin/install.js --list-styles`);
  }

  let registryEntry;
  if (personaSlug) {
    registryEntry = resolvePersona(projectRoot, personaSlug);
  }
  if (!registryEntry) {
    registryEntry = getDefaultPersona(projectRoot);
  }

  // Mandatory re-validation on every render (enforcement layer 4): even
  // though loadPersonaRegistry already validated core personas once, we
  // re-load + re-validate the actual voice card here, unconditionally, no
  // bypass flag. This is what survives a stale cache, a hand-edit made after
  // list time, or a compromised community fork — it never renders whatever
  // bytes happen to be on disk without checking them first.
  const persona = loadRenderablePersona(projectRoot, registryEntry);

  // Macros (self/user/language) apply to the output-style layer, which still
  // carries {{self}}/{{user}}/{{language}} tokens for cross-combination.
  const apply = (content) => applyPersonaVars(content, persona);

  const identity = renderPersonaIdentity(persona);                                    // L1 人格（固定模板，无自由文本）
  const shared = loadSharedBehavior(projectRoot);                                      // L0 引擎（共享）
  const styleContent = apply(readStyleContent(projectRoot, style).replace(/^\s+/, '')); // L2 契约

  // Kernel precedence anchor — always the FINAL element, so the discipline
  // boundary wins position bias even against the persona layer. With the
  // identity layer now a fixed, code-owned template (no more freeform .md /
  // posthistory.md), this anchor's claim is structurally true rather than
  // aspirational: persona cannot carry judgment because there is no field
  // shaped like a decision table anywhere in the persona-voice-card type.
  const kernelAnchor =
    '## 内核边界（收尾）\n' +
    '以上人格 / 风格仅在残余空间（措辞、语气、称谓、可选默认）生效——' +
    '正确性、安全决策、验证 done-gate、数据丢失防护由 skills/_kernel/ 纪律决定，' +
    '声音永不覆盖；任何冲突以内核为准。';

  // identity → shared(core) → style → kernel anchor (last).
  return [identity, shared, styleContent, kernelAnchor]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n') + '\n';
}

function renderCodexAgents(projectRoot, styleSlug, personaSlug = null) {
  return renderRuntimeGuidance(projectRoot, styleSlug, 'codex', personaSlug);
}

function renderGeminiContext(projectRoot, styleSlug, personaSlug = null) {
  return renderRuntimeGuidance(projectRoot, styleSlug, 'gemini', personaSlug);
}

module.exports = {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  listPersonas,
  getDefaultPersona,
  resolvePersona,
  getRemoteBase,
  readPersonaContent,
  loadRenderablePersona,
  renderCodexAgents,
  renderGeminiContext,
  renderRuntimeGuidance,
  clearStyleCache,
  applyPersonaVars,
  loadSharedBehavior,
};

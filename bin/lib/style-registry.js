'use strict';

const fs = require('fs');
const path = require('path');
const { listTargetNames } = require('./target-registry');

const SUPPORTED_TARGETS = new Set(listTargetNames());

const _cache = new Map();
const _personaCache = new Map();

function clearStyleCache() {
  _cache.clear();
  _personaCache.clear();
}

// ── Shared Behavior Layer ──

const SHARED_FILES_ORDER = [
  'proactive.md',
  'iron-laws.md',
  'big-picture.md',
  'execution-chains.md',
  'skill-routing.md',
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

// ── Persona Registry ──

// Single source of truth: voice/label/description live ONLY in each persona's
// persona-card.json. index.json is just the enable-list + default selector.
// This loads a card and derives the runtime registry fields from it.
function loadPersonaCard(projectRoot, slug) {
  const cardPath = path.join(projectRoot, 'config', 'personas', slug, 'persona-card.json');
  if (!fs.existsSync(cardPath)) {
    throw new Error(`persona ${slug} 缺少 persona-card.json: ${cardPath}`);
  }
  let card;
  try {
    card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  } catch (e) {
    throw new Error(`persona ${slug} 的 persona-card.json 解析失败: ${e.message}`);
  }
  const d = card && card.data;
  if (!d || typeof d !== 'object') throw new Error(`persona ${slug} 的 persona-card.json 缺少 data`);
  const v = d.voice || {};
  return {
    label: requireNonEmptyString(d.display_name, `persona.${slug}.display_name (card)`),
    description: requireNonEmptyString(d.description, `persona.${slug}.description (card)`),
    self: requireNonEmptyString(v.self, `persona.${slug}.voice.self (card)`),
    user: requireNonEmptyString(v.user, `persona.${slug}.voice.user (card)`),
    language: requireNonEmptyString(v.language, `persona.${slug}.voice.language (card)`),
  };
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

  const seen = new Set();
  let defaultCount = 0;
  const normalized = personas.map((p) => {
    if (!p || typeof p !== 'object') throw new Error('persona registry 存在无效条目');
    const slug = requireNonEmptyString(p.slug, 'persona.slug');
    if (seen.has(slug)) throw new Error(`persona slug 重复: ${slug}`);
    seen.add(slug);
    if (p.default) defaultCount += 1;
    // Derive identity fields from the card — the single source of truth.
    const derived = loadPersonaCard(projectRoot, slug);
    return {
      slug,
      label: derived.label,
      description: derived.description,
      file: `${slug}.md`,
      default: p.default === true,
      self: derived.self,
      user: derived.user,
      language: derived.language,
    };
  });

  if (defaultCount !== 1) {
    throw new Error('persona registry 必须且只能有一个 default persona');
  }

  _personaCache.set(projectRoot, normalized);
  return normalized;
}

function listPersonas(projectRoot) {
  return loadPersonaRegistry(projectRoot);
}

function getDefaultPersona(projectRoot) {
  const personas = loadPersonaRegistry(projectRoot);
  return personas.find(p => p.default);
}

function resolvePersona(projectRoot, slug) {
  const personas = loadPersonaRegistry(projectRoot);
  return personas.find(p => p.slug === slug) || null;
}

function readPersonaContent(projectRoot, persona) {
  const personaPath = path.join(projectRoot, 'config', 'personas', persona.file);
  return fs.readFileSync(personaPath, 'utf8');
}

// Optional per-persona layer files live alongside persona-card.json in
// config/personas/<slug>/. Returns '' when the file is absent so the layer
// is dropped by the assembler — keeping output byte-identical to v1 until
// the new layers are authored.
function readPersonaLayer(projectRoot, persona, filename) {
  const layerPath = path.join(projectRoot, 'config', 'personas', persona.slug, filename);
  if (!fs.existsSync(layerPath)) return '';
  return fs.readFileSync(layerPath, 'utf8').replace(/\s+$/, '');
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

function renderRuntimeGuidance(projectRoot, styleSlug, targetName = 'codex', personaSlug = null) {
  const style = resolveStyle(projectRoot, styleSlug, targetName === 'gemini' ? 'claude' : targetName);
  if (!style) {
    throw new Error(`未知输出风格: ${styleSlug}. Try: node bin/install.js --list-styles`);
  }

  let persona;
  if (personaSlug) {
    persona = resolvePersona(projectRoot, personaSlug);
  }
  if (!persona) {
    persona = getDefaultPersona(projectRoot);
  }

  // Macros (self/user/language) now apply to ALL persona-authored layers,
  // not just the style layer — this is what lets a persona's identity follow
  // its own voice and makes cross-combination safe (see docs/persona-architecture-v2.md).
  const apply = (content) => applyPersonaVars(content, persona);

  const identity = apply(readPersonaContent(projectRoot, persona).replace(/\s+$/, '')); // L1 人物
  const shared = loadSharedBehavior(projectRoot);                                        // L0 引擎(共享)
  const examples = apply(readPersonaLayer(projectRoot, persona, 'examples.md'));         // L2 范例(可选)
  const styleContent = apply(readStyleContent(projectRoot, style).replace(/^\s+/, ''));  // L3 契约
  const posthistory = apply(readPersonaLayer(projectRoot, persona, 'posthistory.md'));   // L4 末段强指令(可选)

  // Order preserves the v1 prefix (identity → shared → style); the two new
  // optional layers slot in around the style layer. With both absent this is
  // byte-identical to v1's `${identity}\n\n${shared}\n\n${styleContent}\n`.
  return [identity, shared, examples, styleContent, posthistory]
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
  readPersonaContent,
  readPersonaLayer,
  renderCodexAgents,
  renderGeminiContext,
  renderRuntimeGuidance,
  clearStyleCache,
  applyPersonaVars,
  loadSharedBehavior,
};

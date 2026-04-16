'use strict';

const fs = require('fs');
const path = require('path');
const { listTargetNames } = require('./target-registry');

const SUPPORTED_TARGETS = new Set(listTargetNames());

// Module-level cache: projectRoot → normalized styles / personas
const _cache = new Map();
const _personaCache = new Map();

function clearStyleCache() {
  _cache.clear();
  _personaCache.clear();
}

// ── Persona Registry ──

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
    return {
      slug,
      label: requireNonEmptyString(p.label, `persona.${slug}.label`),
      description: requireNonEmptyString(p.description, `persona.${slug}.description`),
      file: requireNonEmptyString(p.file || `${slug}.md`, `persona.${slug}.file`),
      default: p.default === true,
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
    persona: typeof style.persona === 'string' ? style.persona.trim() : null,
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

function renderRuntimeGuidance(projectRoot, styleSlug, targetName = 'codex') {
  const style = resolveStyle(projectRoot, styleSlug, targetName === 'gemini' ? 'claude' : targetName);
  if (!style) {
    throw new Error(`未知输出风格: ${styleSlug}. Try: node bin/install.js --list-styles`);
  }

  let base;
  if (style.persona) {
    const persona = resolvePersona(projectRoot, style.persona);
    if (persona) {
      base = readPersonaContent(projectRoot, persona).replace(/\s+$/, '');
    }
  }
  if (!base) {
    const basePath = path.join(projectRoot, 'config', 'CLAUDE.md');
    base = fs.readFileSync(basePath, 'utf8').replace(/\s+$/, '');
  }

  const styleContent = readStyleContent(projectRoot, style).replace(/^\s+/, '');
  return `${base}\n\n${styleContent}\n`;
}

function renderCodexAgents(projectRoot, styleSlug) {
  return renderRuntimeGuidance(projectRoot, styleSlug, 'codex');
}

function renderGeminiContext(projectRoot, styleSlug) {
  return renderRuntimeGuidance(projectRoot, styleSlug, 'gemini');
}

module.exports = {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  listPersonas,
  getDefaultPersona,
  resolvePersona,
  readPersonaContent,
  renderCodexAgents,
  renderGeminiContext,
  renderRuntimeGuidance,
  clearStyleCache,
};

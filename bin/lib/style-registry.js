'use strict';

const fs = require('fs');
const path = require('path');

const SUPPORTED_TARGETS = new Set(['claude', 'codex']);

function loadStyleRegistry(projectRoot) {
  const registryPath = path.join(projectRoot, 'output-styles', 'index.json');
  const raw = fs.readFileSync(registryPath, 'utf8');
  const parsed = JSON.parse(raw);
  const styles = Array.isArray(parsed.styles) ? parsed.styles : null;
  if (!styles || styles.length === 0) {
    throw new Error('output-styles/index.json 缺少 styles 列表');
  }

  const seen = new Set();
  let defaultCount = 0;
  const normalized = styles.map((style) => normalizeStyle(style, seen));
  normalized.forEach((style) => {
    if (style.default) defaultCount += 1;
  });

  if (defaultCount !== 1) {
    throw new Error('style registry 必须且只能有一个 default style');
  }

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
  const values = Array.isArray(targets) && targets.length > 0 ? targets : ['claude', 'codex'];
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

function renderCodexAgents(projectRoot, styleSlug) {
  const style = resolveStyle(projectRoot, styleSlug, 'codex');
  if (!style) {
    throw new Error(`未知输出风格: ${styleSlug}`);
  }

  const basePath = path.join(projectRoot, 'config', 'CLAUDE.md');
  const base = fs.readFileSync(basePath, 'utf8').replace(/\s+$/, '');
  const styleContent = readStyleContent(projectRoot, style).replace(/^\s+/, '');
  return `${base}\n\n${styleContent}\n`;
}

module.exports = {
  listStyles,
  getDefaultStyle,
  resolveStyle,
  renderCodexAgents,
};

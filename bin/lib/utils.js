'use strict';
const fs = require('fs');
const path = require('path');

const SKIP = ['__pycache__', '.pyc', '.pyo', '.egg-info', '.DS_Store', 'Thumbs.db', '.git'];

function shouldSkip(name) { return SKIP.some(p => name.includes(p)); }

function copyRecursive(src, dest, errors) {
  let stat;
  try { stat = fs.statSync(src); } catch (e) {
    const err = new Error(`复制失败: 源路径不存在 ${src} (${e.code})`);
    if (errors) { errors.push({ src, dest, error: err }); return; }
    throw err;
  }
  if (stat.isDirectory()) {
    if (shouldSkip(path.basename(src))) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      if (!shouldSkip(f)) {
        try { copyRecursive(path.join(src, f), path.join(dest, f), errors); }
        catch (e) {
          const entry = { src: path.join(src, f), dest: path.join(dest, f), error: e };
          if (errors) { errors.push(entry); }
          else { console.error(`  ⚠ 跳过: ${entry.src} (${e.message})`); }
        }
      }
    }
  } else {
    if (shouldSkip(path.basename(src))) return;
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function clearReadOnlyRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.lstatSync(targetPath);
  try {
    fs.chmodSync(targetPath, stat.isDirectory() ? 0o777 : 0o666);
  } catch {}
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      clearReadOnlyRecursive(path.join(targetPath, entry));
    }
  }
}

function rmSafe(p) {
  if (!fs.existsSync(p)) return;
  const errors = [];
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      clearReadOnlyRecursive(p);
      fs.rmSync(p, { recursive: true, force: true });
      return;
    } catch (error) {
      errors.push(error);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
    }
  }
  throw errors[errors.length - 1];
}

function deepMergeNew(target, source, prefix, log) {
  for (const key of Object.keys(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
        log.push({ k: fullKey, a: 'new', v: '{}' });
      }
      deepMergeNew(target[key], source[key], fullKey, log);
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      const added = source[key].filter(v => !target[key].includes(v));
      if (added.length > 0) {
        target[key] = [...target[key], ...added];
        log.push({ k: fullKey, a: 'add', v: `+${added.length}` });
      } else {
        log.push({ k: fullKey, a: 'keep', v: '完整' });
      }
    } else if (key in target) {
      log.push({ k: fullKey, a: 'keep', v: JSON.stringify(target[key]) });
    } else {
      target[key] = source[key];
      log.push({ k: fullKey, a: 'set', v: JSON.stringify(source[key]) });
    }
  }
  return target;
}

function printMergeLog(log, c) {
  log.forEach(({ k, a, v }) => {
    if (a === 'keep') console.log(`  ${c.d('·')} ${c.d(`${k} (保留: ${v})`)}`);
    else console.log(`  ${c.grn('+')} ${c.cyn(k)} = ${v}`);
  });
}

/**
 * 解析 Markdown 文件的 YAML frontmatter
 * @param {string} content - 文件内容
 * @returns {Object|null} 解析后的键值对，无 frontmatter 返回 null
 */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const meta = Object.create(null);
  match[1].split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;

    const m = rawLine.match(/^([\w][\w-]*)\s*:\s*(.+)$/);
    if (!m) {
      throw new Error(`frontmatter 第 ${index + 1} 行格式无效: ${rawLine}`);
    }
    if (UNSAFE_KEYS.has(m[1])) return;
    let value = m[2].trim();
    // Strip inline comments (unquoted # followed by space or end-of-line)
    value = stripInlineComment(value);
    // Handle YAML inline array syntax: [A, B, C] → "A, B, C"
    if (/^\[.+\]$/.test(value)) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).join(', ');
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    meta[m[1]] = value;
  });
  return meta;
}

function stripInlineComment(value) {
  // Preserve # inside quotes; strip unquoted # followed by space or EOL
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (inQuote) {
      if (ch === quoteChar) inQuote = false;
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === '#' && (i + 1 === value.length || value[i + 1] === ' ')) {
        return value.slice(0, i).trimEnd();
      }
    }
  }
  return value;
}

function formatActionableError(message, suggestion) {
  if (!suggestion) return message;
  return `${message}. ${suggestion}`;
}

/**
 * 轻量模板引擎 — 支持 {{key}} 变量替换 + {{#key}}...{{/key}} 条件包含 + {{^key}}...{{/key}} 反条件包含
 * @param {string} template - 模板字符串
 * @param {Object} data - 变量映射
 * @returns {string} 渲染结果
 */
function renderTemplate(template, data) {
  // {{^key}}...{{/key}} — 反条件（key 为 falsy 时包含）
  template = template.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, body) => {
    return data[key] ? '' : body;
  });
  // {{#key}}...{{/key}} — 正条件（key 为 truthy 时包含）
  template = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, body) => {
    return data[key] ? body : '';
  });
  // {{key}} — 变量替换
  template = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
  });
  return template;
}

module.exports = { shouldSkip, copyRecursive, rmSafe, deepMergeNew, printMergeLog, parseFrontmatter, stripInlineComment, formatActionableError, renderTemplate, SKIP };

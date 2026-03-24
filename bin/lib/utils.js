'use strict';
const fs = require('fs');
const path = require('path');

const SKIP = ['__pycache__', '.pyc', '.pyo', '.egg-info', '.DS_Store', 'Thumbs.db', '.git'];

function shouldSkip(name) { return SKIP.some(p => name.includes(p)); }

function copyRecursive(src, dest) {
  let stat;
  try { stat = fs.statSync(src); } catch (e) {
    throw new Error(`复制失败: 源路径不存在 ${src} (${e.code})`);
  }
  if (stat.isDirectory()) {
    if (shouldSkip(path.basename(src))) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      if (!shouldSkip(f)) {
        try { copyRecursive(path.join(src, f), path.join(dest, f)); }
        catch (e) { console.error(`  ⚠ 跳过: ${path.join(src, f)} (${e.message})`); }
      }
    }
  } else {
    if (shouldSkip(path.basename(src))) return;
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function rmSafe(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
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
    if (!UNSAFE_KEYS.has(m[1])) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  });
  return meta;
}

module.exports = { shouldSkip, copyRecursive, rmSafe, deepMergeNew, printMergeLog, parseFrontmatter, SKIP };

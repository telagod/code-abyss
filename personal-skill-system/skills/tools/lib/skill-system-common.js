'use strict';

const fs = require('fs');
const path = require('path');

const REQUIRED_FRONTMATTER_KEYS = [
  'schema-version',
  'name',
  'description',
  'kind',
  'user-invocable',
  'trigger-mode',
  'priority',
  'runtime',
  'executor',
  'supported-hosts',
  'status'
];

const EXPECTED_TOP_LEVEL_DIRS = [
  'docs',
  'registry',
  'skills',
  'packs',
  'templates'
];

const MIN_REFERENCE_FILES_BY_KIND = {
  router: 2,
  domain: 2,
  workflow: 2,
  tool: 2,
  guard: 2
};

const KIND_BY_LAYER = {
  routers: 'router',
  domains: 'domain',
  workflows: 'workflow',
  tools: 'tool',
  guards: 'guard'
};

function rel(root, target) {
  return path.relative(root, target).split(path.sep).join('/');
}

function readUtf8(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function walkSkillFiles(root) {
  const results = [];

  function visit(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      if (entry.isFile() && entry.name === 'SKILL.md') {
        results.push(full);
      }
    }
  }

  visit(root);
  return results.sort();
}

function parseScalar(raw) {
  const value = String(raw || '').trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return value;
}

function parseFrontmatter(text) {
  if ((!text || !text.startsWith('---\n')) && !text.startsWith('---\r\n')) {
    return { error: 'missing opening frontmatter fence' };
  }

  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') {
    return { error: 'invalid opening frontmatter fence' };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return { error: 'missing closing frontmatter fence' };
  }

  const data = {};
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    if (idx === -1) {
      return { error: `invalid frontmatter line '${line}'` };
    }
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1);
    data[key] = parseScalar(rawValue);
  }

  return { data };
}

function parseJsonFile(file) {
  const text = readUtf8(file);
  if (text == null) {
    return { error: 'file unreadable', data: null };
  }
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return { error: error.message, data: null };
  }
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map(entry => entry.name)
    .sort();
}

function readReferencePaths(text) {
  const lines = String(text || '').split(/\r?\n/);
  const refs = [];
  let inReferences = false;

  for (const line of lines) {
    if (/^##\s+Read These References\b/.test(line.trim())) {
      inReferences = true;
      continue;
    }
    if (inReferences && /^##\s+/.test(line.trim())) {
      break;
    }
    if (!inReferences) continue;

    const match = line.match(/^- `([^`]+)`/);
    if (match) refs.push(match[1]);
  }

  return refs.filter(ref => !ref.startsWith('http'));
}

function expectedKindFromPath(skillFile, skillsRoot) {
  const relPath = rel(skillsRoot, skillFile);
  const parts = relPath.split('/');
  return KIND_BY_LAYER[parts[0]] || null;
}

module.exports = {
  REQUIRED_FRONTMATTER_KEYS,
  EXPECTED_TOP_LEVEL_DIRS,
  MIN_REFERENCE_FILES_BY_KIND,
  rel,
  readUtf8,
  walkSkillFiles,
  parseFrontmatter,
  parseJsonFile,
  listMarkdownFiles,
  readReferencePaths,
  expectedKindFromPath
};

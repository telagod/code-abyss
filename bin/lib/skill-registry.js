'use strict';

const fs = require('fs');
const path = require('path');
const { shouldSkip, parseFrontmatter } = require('./utils');

const DEFAULT_ALLOWED_TOOLS = ['Read'];
const NAME_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOOL_NAME_RE = /^[A-Z][A-Za-z0-9]*$/;

function normalizeBoolean(value) {
  return String(value).toLowerCase() === 'true';
}

function inferSkillKind(relPath) {
  const normalizedRelPath = relPath.split(path.sep).join('/');
  const [head] = normalizedRelPath.split('/');
  if (head === 'tools') return 'tool';
  if (head === 'domains') return 'domain';
  if (head === 'orchestration') return 'orchestration';
  return 'root';
}

function listScriptEntries(skillDir) {
  const scriptsDir = path.join(skillDir, 'scripts');
  let entries;
  try {
    entries = fs.readdirSync(scriptsDir)
      .filter(name => name.endsWith('.js'))
      .sort();
  } catch {
    return [];
  }
  return entries.map(name => path.join(scriptsDir, name));
}

function buildRegistryError(relPath, message) {
  const where = relPath || '.';
  return new Error(`无效 skill (${where}): ${message}`);
}

function requireStringField(meta, fieldName, relPath) {
  const value = meta[fieldName];
  if (typeof value !== 'string' || value.trim() === '') {
    throw buildRegistryError(relPath, `缺少必填 frontmatter 字段 '${fieldName}'`);
  }
  return value.trim();
}

function normalizeAllowedTools(value, relPath) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return [...DEFAULT_ALLOWED_TOOLS];
  }

  const tools = String(value)
    .split(',')
    .map(tool => tool.trim())
    .filter(Boolean);

  if (tools.length === 0) {
    throw buildRegistryError(relPath, 'allowed-tools 不能为空');
  }

  for (const tool of tools) {
    if (!TOOL_NAME_RE.test(tool)) {
      throw buildRegistryError(relPath, `allowed-tools 包含非法值 '${tool}'`);
    }
  }

  return tools;
}

function normalizeSkillRecord(skillsDir, skillDir, meta) {
  const relPath = path.relative(skillsDir, skillDir);
  const normalizedMeta = meta || {};
  const scriptEntries = listScriptEntries(skillDir);

  if (scriptEntries.length > 1) {
    throw buildRegistryError(relPath, `scripts/ 目录下只能有一个 .js 入口，当前找到 ${scriptEntries.length} 个`);
  }

  const name = requireStringField(normalizedMeta, 'name', relPath);
  if (!NAME_SLUG_RE.test(name)) {
    throw buildRegistryError(relPath, `name 必须是 kebab-case slug，当前为 '${name}'`);
  }

  const description = requireStringField(normalizedMeta, 'description', relPath);
  if (!Object.prototype.hasOwnProperty.call(normalizedMeta, 'user-invocable')) {
    throw buildRegistryError(relPath, "缺少必填 frontmatter 字段 'user-invocable'");
  }

  const userInvocable = normalizeBoolean(normalizedMeta['user-invocable']);
  const allowedTools = normalizeAllowedTools(normalizedMeta['allowed-tools'], relPath);
  const argumentHint = normalizedMeta['argument-hint'] || '';
  const category = inferSkillKind(relPath);
  const runtimeType = scriptEntries.length === 1 ? 'scripted' : 'knowledge';
  const scriptPath = scriptEntries[0] || null;
  const skillPath = path.join(skillDir, 'SKILL.md');

  const aliases = normalizedMeta.aliases
    ? String(normalizedMeta.aliases).split(',').map(a => a.trim()).filter(Boolean)
    : [];

  return {
    name,
    description,
    userInvocable,
    allowedTools,
    argumentHint,
    aliases,
    relPath,
    category,
    runtimeType,
    hasScripts: runtimeType === 'scripted',
    scriptPath,
    skillPath,
    meta: normalizedMeta,
  };
}

function validateUniqueSkillRecords(skills) {
  const names = new Map();
  const relPaths = new Map();

  for (const skill of skills) {
    if (names.has(skill.name)) {
      throw buildRegistryError(skill.relPath, `重复的 skill name '${skill.name}'，首次出现在 ${names.get(skill.name)}`);
    }
    names.set(skill.name, skill.relPath);

    if (relPaths.has(skill.relPath)) {
      throw buildRegistryError(skill.relPath, `重复的 skill relPath '${skill.relPath}'`);
    }
    relPaths.set(skill.relPath, skill.name);
  }
}

function collectSkills(skillsDir) {
  const results = [];

  function scan(dir) {
    const skillMd = path.join(dir, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      const relPath = path.relative(skillsDir, dir);
      const content = fs.readFileSync(skillMd, 'utf8');
      const meta = parseFrontmatter(content);
      if (!meta) {
        throw buildRegistryError(relPath, 'SKILL.md 缺少可解析的 frontmatter');
      }
      results.push(normalizeSkillRecord(skillsDir, dir, meta));
    }

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'scripts' || shouldSkip(entry.name)) continue;
      scan(path.join(dir, entry.name));
    }
  }

  scan(skillsDir);
  validateUniqueSkillRecords(results);
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

function collectInvocableSkills(skillsDir) {
  return collectSkills(skillsDir).filter(skill => skill.userInvocable);
}

function resolveSkillByName(skillsDir, skillName) {
  return collectSkills(skillsDir).find(skill => skill.name === skillName) || null;
}

function resolveExecutableSkillScript(skillsDir, skillName) {
  const skill = resolveSkillByName(skillsDir, skillName);
  if (!skill) return { skill: null, scriptPath: null, reason: 'missing' };
  if (skill.runtimeType !== 'scripted' || !skill.scriptPath) {
    return { skill, scriptPath: null, reason: 'no-script' };
  }
  return { skill, scriptPath: skill.scriptPath, reason: null };
}

module.exports = {
  collectSkills,
  collectInvocableSkills,
  resolveSkillByName,
  resolveExecutableSkillScript,
  inferSkillKind,
};

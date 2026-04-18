'use strict';

const fs = require('fs');
const path = require('path');
const {
  REQUIRED_FRONTMATTER_KEYS,
  MIN_REFERENCE_FILES_BY_KIND,
  rel,
  readUtf8,
  walkSkillFiles,
  parseFrontmatter,
  listMarkdownFiles,
  readReferencePaths,
  expectedKindFromPath
} = require('./skill-system-common');

function validateSkillFile(skillFile, targetDir, skillsRoot, findings) {
  const text = readUtf8(skillFile);
  const relative = rel(targetDir, skillFile);
  if (text == null) {
    findings.push({ severity: 'error', file: relative, message: 'skill file is unreadable as utf8 text' });
    return null;
  }
  if (text.includes('\uFFFD')) {
    findings.push({ severity: 'warning', file: relative, message: 'replacement character detected; encoding may have been damaged' });
  }

  const parsed = parseFrontmatter(text);
  if (parsed.error) {
    findings.push({ severity: 'error', file: relative, message: `frontmatter error: ${parsed.error}` });
    return null;
  }

  const data = parsed.data;
  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!(key in data)) {
      findings.push({ severity: 'error', file: relative, message: `missing frontmatter key '${key}'` });
    }
  }

  const expectedKind = expectedKindFromPath(skillFile, skillsRoot);
  if (expectedKind && data.kind && data.kind !== expectedKind) {
    findings.push({ severity: 'warning', file: relative, message: `kind '${data.kind}' does not match layer expectation '${expectedKind}'` });
  }

  if (data['user-invocable'] === true) {
    const triggerKeywords = Array.isArray(data['trigger-keywords']) ? data['trigger-keywords'] : [];
    if (triggerKeywords.length === 0 && !(Array.isArray(data['trigger-mode']) && data['trigger-mode'].includes('manual'))) {
      findings.push({ severity: 'warning', file: relative, message: 'public skill has no trigger keywords' });
    }
    if (Array.isArray(data['trigger-mode']) && data['trigger-mode'].includes('auto') && triggerKeywords.length < 2) {
      findings.push({ severity: 'warning', file: relative, message: 'auto-triggered skill has a weak keyword surface' });
    }
    if (typeof data.description === 'string' && !/use when/i.test(data.description)) {
      findings.push({ severity: 'info', file: relative, message: 'description does not contain explicit trigger guidance such as "Use when"' });
    }
  }

  if (data.runtime === 'scripted') {
    const scriptPath = path.join(path.dirname(skillFile), 'scripts', 'run.js');
    if (!fs.existsSync(scriptPath)) {
      findings.push({ severity: 'error', file: relative, message: 'scripted runtime declared but scripts/run.js is missing' });
    }
  }

  for (const refPath of readReferencePaths(text)) {
    if (!fs.existsSync(path.join(path.dirname(skillFile), refPath))) {
      findings.push({ severity: 'warning', file: relative, message: `declared reference '${refPath}' does not exist` });
    }
  }

  const expectedReferenceCount = MIN_REFERENCE_FILES_BY_KIND[data.kind] || 0;
  if (expectedReferenceCount > 0) {
    const referenceDir = path.join(path.dirname(skillFile), 'references');
    const referenceFiles = listMarkdownFiles(referenceDir);
    if (referenceFiles.length < expectedReferenceCount) {
      findings.push({
        severity: 'warning',
        file: relative,
        message: `kind '${data.kind}' only has ${referenceFiles.length} reference files; expected at least ${expectedReferenceCount}`
      });
    }
  }

  return {
    name: data.name,
    kind: data.kind,
    userInvocable: data['user-invocable'] === true,
    file: relative
  };
}

function collectSkillRecords(targetDir, findings) {
  const skillsRoot = path.join(targetDir, 'skills');
  const skillFiles = walkSkillFiles(skillsRoot);
  const skillRecords = [];
  const names = new Set();

  for (const skillFile of skillFiles) {
    const record = validateSkillFile(skillFile, targetDir, skillsRoot, findings);
    if (!record) continue;
    if (names.has(record.name)) {
      findings.push({ severity: 'error', file: record.file, message: `duplicate skill name '${record.name}'` });
      continue;
    }
    names.add(record.name);
    skillRecords.push(record);
  }

  return {
    skillFiles,
    skillRecords
  };
}

module.exports = {
  collectSkillRecords
};

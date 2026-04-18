'use strict';

const { walkFiles, readText, relativeTo, classifyPath } = require('./runtime');
const path = require('path');

const MAX_FILE_LINES = 500;
const MAX_LINE_LENGTH = 140;
const MAX_FUNCTION_LINES = 60;
const MAX_COMPLEXITY = 12;
const MAX_PARAMETERS = 6;

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function summarizeIssueHotspots(issues) {
  const counts = new Map();
  for (const issue of issues) {
    if (!issue.file) continue;
    counts.set(issue.file, (counts.get(issue.file) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([file, count]) => ({ file, issues: count }));
}

function extractFunctions(text, ext) {
  const functions = [];
  const lines = text.split(/\r?\n/);

  if (ext === '.py') {
    const regex = /^( *)(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/gm;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      const indent = match[1].length;
      const params = match[2].trim() ? match[2].split(',').map(item => item.trim()).filter(Boolean) : [];
      let length = 1;
      for (let i = line; i < lines.length; i += 1) {
        const current = lines[i];
        if (current.trim() === '') {
          length += 1;
          continue;
        }
        const currentIndent = current.match(/^(\s*)/)[1].length;
        if (currentIndent <= indent && i > line) break;
        if (i > line) length += 1;
      }
      const body = lines.slice(line - 1, line - 1 + length).join('\n');
      const complexity = 1 + (body.match(/\b(if|elif|while|for|except|case|catch)\b/g) || []).length +
        (body.match(/\b(and|or)\b/g) || []).length;
      functions.push({ name: match[2], line, length, complexity, parameters: params.filter(p => p !== 'self' && p !== 'cls').length });
    }
    return functions;
  }

  const regex = /^( *)(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)|^( *)(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/gm;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[2] || match[5];
    const paramsRaw = match[3] || match[6] || '';
    const line = text.slice(0, match.index).split(/\r?\n/).length;
    const remaining = lines.slice(line - 1);
    let depth = 0;
    let started = false;
    let length = 0;
    for (const current of remaining) {
      length += 1;
      for (const ch of current) {
        if (ch === '{') {
          depth += 1;
          started = true;
        } else if (ch === '}') {
          depth -= 1;
        }
      }
      if (started && depth <= 0) break;
    }
    const body = remaining.slice(0, length).join('\n');
    const complexity = 1 + (body.match(/\b(if|else if|for|while|switch|case|catch)\b/g) || []).length +
      (body.match(/(\&\&|\|\|)/g) || []).length;
    const parameters = paramsRaw.trim() ? paramsRaw.split(',').map(item => item.trim()).filter(Boolean).length : 0;
    functions.push({ name, line, length, complexity, parameters });
  }
  return functions;
}

function analyzeLanguageSpecificQuality(rel, text, lines) {
  const issues = [];
  const ext = extOf(rel);
  const allowConsoleLogging = /(^|\/)(bin\/|scripts\/run\.js$|templates\/skill\/tool\/scripts\/run\.js$|skills\/tools\/lib\/runtime\.js$|skills\/tools\/lib\/runtime-output\.js$)/.test(rel);

  if (ext === '.py') {
    lines.forEach((line, index) => {
      if (/^\s*except\s*:\s*$/.test(line)) {
        issues.push({ severity: 'warning', file: rel, line_number: index + 1, message: 'bare except clause hides unexpected failures' });
      }
      if (/^\s*from\s+\S+\s+import\s+\*/.test(line)) {
        issues.push({ severity: 'info', file: rel, line_number: index + 1, message: 'wildcard import reduces traceability' });
      }
    });
    if (/def\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*=\s*(\[\]|\{\}|set\(\))/m.test(text)) {
      issues.push({ severity: 'warning', file: rel, message: 'mutable default argument detected' });
    }
  }

  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    lines.forEach((line, index) => {
      if ((ext === '.ts' || ext === '.tsx') && /\/\/\s*@ts-ignore|\/\*\s*@ts-ignore/.test(line)) {
        issues.push({ severity: 'info', file: rel, line_number: index + 1, message: '@ts-ignore suppresses type safety; verify necessity' });
      }
      if (!allowConsoleLogging && /\bconsole\.log\s*\(/.test(line)) {
        issues.push({ severity: 'info', file: rel, line_number: index + 1, message: 'console.log marker found in code path' });
      }
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
        issues.push({ severity: 'warning', file: rel, line_number: index + 1, message: 'empty catch block hides failures' });
      }
    });
    if ((ext === '.ts' || ext === '.tsx') && /:\s*any\b|<any>/.test(text)) {
      issues.push({ severity: 'info', file: rel, message: 'explicit any type weakens local contracts' });
    }
  }

  return issues;
}

function analyzeQuality(targetDir, options = {}) {
  const files = walkFiles(targetDir, options);
  const issues = [];

  for (const file of files) {
    const rel = relativeTo(targetDir, file);
    if (classifyPath(rel) !== 'code') continue;
    const text = readText(file);
    if (!text) continue;

    const lines = text.split(/\r?\n/);
    if (lines.length > MAX_FILE_LINES) {
      issues.push({ severity: 'warning', file: rel, message: `large file (${lines.length} lines)` });
    }

    const longLineCount = lines.filter(line => line.length > MAX_LINE_LENGTH).length;
    if (longLineCount > 0) {
      issues.push({ severity: 'info', file: rel, message: `${longLineCount} lines exceed ${MAX_LINE_LENGTH} characters` });
    }

    const todoCount = (text.match(/\b(TODO|FIXME|HACK)\b/g) || []).length;
    if (todoCount >= 3) {
      issues.push({ severity: 'info', file: rel, message: `contains ${todoCount} TODO/FIXME/HACK markers` });
    }

    issues.push(...analyzeLanguageSpecificQuality(rel, text, lines));

    const functions = extractFunctions(text, extOf(rel));
    for (const fn of functions) {
      if (fn.length > MAX_FUNCTION_LINES) {
        issues.push({ severity: 'warning', file: rel, line_number: fn.line, message: `function '${fn.name}' is too long (${fn.length} lines)` });
      }
      if (fn.complexity > MAX_COMPLEXITY) {
        issues.push({ severity: 'warning', file: rel, line_number: fn.line, message: `function '${fn.name}' has high complexity (${fn.complexity})` });
      }
      if (fn.parameters > MAX_PARAMETERS) {
        issues.push({ severity: 'info', file: rel, line_number: fn.line, message: `function '${fn.name}' has many parameters (${fn.parameters})` });
      }
    }
  }

  return {
    tool: 'verify-quality',
    target: targetDir,
    summary: `Scanned ${files.length} files for structural quality heuristics.`,
    issues,
    hotspots: summarizeIssueHotspots(issues),
    nextSteps: [
      'inspect warnings first',
      'split oversized files if they represent multiple concerns',
      'convert fragile TODOs into tracked work where needed'
    ]
  };
}

module.exports = {
  analyzeQuality,
  summarizeIssueHotspots
};

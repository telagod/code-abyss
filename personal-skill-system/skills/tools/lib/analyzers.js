#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  walkFiles,
  readText,
  relativeTo,
  classifyPath,
  safeWriteFile,
  listChangedFiles
} = require('./runtime');

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java', '.rs', '.c', '.cpp', '.h']);
const TEST_PATTERNS = ['test_', '_test.', '.test.', 'spec_', '_spec.', '/tests/', '/test/', '/__tests__/'];
const MAX_FILE_LINES = 500;
const MAX_LINE_LENGTH = 140;
const MAX_FUNCTION_LINES = 60;
const MAX_COMPLEXITY = 12;
const MAX_PARAMETERS = 6;

const SECURITY_RULES = [
  {
    id: 'sql-injection-dynamic',
    severity: 'critical',
    category: 'injection',
    extensions: ['.py', '.js', '.ts', '.go', '.java'],
    pattern: /\b(execute|query|raw)\s*\(\s*(f["']|["'][^"'\n]*["']\s*\+|["'][^"'\n]*["']\s*%|["'][^"'\n]*["']\s*\.format\s*\()/i,
    message: 'possible dynamic SQL construction'
  },
  {
    id: 'command-shell-true',
    severity: 'critical',
    category: 'injection',
    extensions: ['.py'],
    pattern: /(subprocess\.(call|run|Popen)|os\.system|os\.popen)\s*\([^)]*shell\s*=\s*True/i,
    message: 'shell=True may allow command injection'
  },
  {
    id: 'dangerous-eval',
    severity: 'high',
    category: 'execution',
    extensions: ['.py', '.js', '.ts'],
    pattern: /(^|[^.\w])(eval|exec)\s*\(/i,
    message: 'eval-like execution detected'
  },
  {
    id: 'xss-innerhtml',
    severity: 'high',
    category: 'xss',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    pattern: /\.innerHTML\s*=|\.outerHTML\s*=|document\.write\s*\(/i,
    message: 'HTML sink write may allow XSS'
  },
  {
    id: 'dangerously-set-inner-html',
    severity: 'medium',
    category: 'xss',
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    pattern: /dangerouslySetInnerHTML/i,
    message: 'dangerouslySetInnerHTML requires strict sanitization'
  },
  {
    id: 'hardcoded-secret',
    severity: 'high',
    category: 'secret',
    extensions: ['.py', '.js', '.ts', '.go', '.java', '.json', '.yml', '.yaml', '.env'],
    pattern: /(?<!\w)(password|passwd|pwd|secret|api_key|apikey|token|auth_token)\s*[:=]\s*["'][^"']{8,}["']/i,
    excludePattern: /(example|placeholder|changeme|xxx|your[_-]|todo|fixme|<.*>|\*{3,})/i,
    message: 'possible hardcoded secret'
  },
  {
    id: 'aws-key',
    severity: 'critical',
    category: 'secret',
    extensions: ['*'],
    pattern: /AKIA[0-9A-Z]{16}/,
    message: 'AWS access key detected'
  },
  {
    id: 'private-key',
    severity: 'critical',
    category: 'secret',
    extensions: ['*'],
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    message: 'private key material detected'
  },
  {
    id: 'weak-hash',
    severity: 'medium',
    category: 'crypto',
    extensions: ['.py', '.js', '.ts', '.go', '.java'],
    pattern: /\b(md5|sha1)\b/i,
    message: 'weak hash primitive marker detected'
  },
  {
    id: 'path-traversal',
    severity: 'high',
    category: 'path',
    extensions: ['.py', '.js', '.ts'],
    pattern: /(open|readFile|writeFile|sendFile|join)\s*\([^)]*(request|input|argv|args|params|query|pathParam|fileParam|userPath|userFile)/i,
    message: 'possible path traversal surface'
  },
  {
    id: 'ssrf',
    severity: 'high',
    category: 'network',
    extensions: ['.py', '.js', '.ts'],
    pattern: /(requests\.(get|post|put|delete)|fetch|axios\.(get|post|put|delete)|urlopen)\s*\([^)]*(request|input|argv|args|params|query|url)/i,
    message: 'possible SSRF surface'
  }
];

function generateDocs(targetDir, options = {}) {
  const moduleName = path.basename(targetDir);
  const readmePath = path.join(targetDir, 'README.md');
  const designPath = path.join(targetDir, 'DESIGN.md');
  const readme = `# ${moduleName}\n\n## Purpose\n\nDescribe what this module does.\n\n## Responsibilities\n\n- primary responsibility\n- key inputs and outputs\n- integration points\n\n## Usage\n\nDocument the most important invocation path.\n`;
  const design = `# ${moduleName} Design\n\n## Scope\n\nDescribe the business or system boundary.\n\n## Data Flow\n\n- producer\n- transform\n- consumer\n\n## Risks\n\n- main failure mode\n- rollback or mitigation\n`;
  const outputs = [];

  if (options.write) {
    if (safeWriteFile(readmePath, readme, options)) outputs.push(relativeTo(targetDir, readmePath));
    if (safeWriteFile(designPath, design, options)) outputs.push(relativeTo(targetDir, designPath));
  }

  return {
    tool: 'gen-docs',
    target: targetDir,
    summary: options.write ? 'Generated documentation skeletons where allowed.' : 'Prepared documentation skeletons for preview.',
    moduleName,
    outputs,
    preview: {
      'README.md': readme,
      'DESIGN.md': design
    },
    nextSteps: [
      'fill in purpose and boundary details',
      'document key data flow and failure modes',
      'link tests and operational notes'
    ]
  };
}

function analyzeModule(targetDir, options = {}) {
  const files = walkFiles(targetDir, options);
  const relFiles = files.map(file => relativeTo(targetDir, file));
  const findings = [];
  const hasReadme = relFiles.includes('README.md');
  const hasDesign = relFiles.includes('DESIGN.md');
  const hasTests = relFiles.some(file => classifyPath(file) === 'test');
  const hasCode = relFiles.some(file => classifyPath(file) === 'code');
  const hasScripts = relFiles.some(file => file.startsWith('scripts/'));

  if (!hasCode) findings.push({ severity: 'error', message: 'no source-like files were detected in the module' });
  if (!hasReadme) findings.push({ severity: 'warning', file: 'README.md', message: 'README.md is missing' });
  if (!hasDesign) findings.push({ severity: 'warning', file: 'DESIGN.md', message: 'DESIGN.md is missing' });
  if (hasCode && !hasTests) findings.push({ severity: 'warning', message: 'code exists but no test-like files were detected' });
  if (hasScripts && !relFiles.some(file => file.startsWith('scripts/') && file.endsWith('.md'))) {
    findings.push({ severity: 'info', message: 'scripts exist; consider documenting operational usage' });
  }

  return {
    tool: 'verify-module',
    target: targetDir,
    summary: `Scanned ${relFiles.length} files for module completeness.`,
    findings,
    moduleSignals: {
      hasReadme,
      hasDesign,
      hasTests,
      hasCode,
      hasScripts
    },
    nextSteps: [
      'add missing design or README artifacts',
      'ensure test coverage exists for real code paths'
    ]
  };
}

function extOf(file) {
  return path.extname(file).toLowerCase();
}

function isCodePath(relPath) {
  return CODE_EXTENSIONS.has(extOf(relPath));
}

function isTestPath(relPath) {
  const lower = relPath.toLowerCase();
  return TEST_PATTERNS.some(pattern => lower.includes(pattern));
}

function findModuleFor(relPath, targetDir) {
  const parts = relPath.split('/').filter(Boolean);
  if (parts.length <= 1) return '.';

  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const candidate = parts.slice(0, i).join('/');
    const readme = path.join(targetDir, candidate, 'README.md');
    const design = path.join(targetDir, candidate, 'DESIGN.md');
    if (fs.existsSync(readme) || fs.existsSync(design)) return candidate;
  }
  return parts[0];
}

function identifyModulesFromChanges(changeSet, targetDir) {
  const modules = new Set();
  for (const relPath of changeSet.files) {
    modules.add(findModuleFor(relPath, targetDir));
  }
  return [...modules];
}

function buildDocSync(changeSet, targetDir) {
  const docPaths = new Set(changeSet.files.filter(file => classifyPath(file) === 'doc'));
  const issues = [];
  const moduleDetails = {};
  const modules = identifyModulesFromChanges(changeSet, targetDir);

  for (const mod of modules) {
    const prefix = mod === '.' ? '' : `${mod}/`;
    const moduleFiles = changeSet.files.filter(file => mod === '.' ? !file.includes('/') : file === mod || file.startsWith(prefix));
    const codeFiles = moduleFiles.filter(file => isCodePath(file) && !isTestPath(file));
    if (!codeFiles.length) continue;

    const readmePath = `${prefix}README.md`;
    const designPath = `${prefix}DESIGN.md`;
    const hasReadmeUpdate = docPaths.has(readmePath);
    const hasDesignUpdate = docPaths.has(designPath);

    moduleDetails[mod] = {
      codeFiles: codeFiles.length,
      hasReadmeUpdate,
      hasDesignUpdate
    };

    if (codeFiles.length >= 2 && !hasDesignUpdate) {
      issues.push({
        severity: 'warning',
        message: `module '${mod}' changed code in multiple files but DESIGN.md was not updated`
      });
    } else if (!hasReadmeUpdate) {
      issues.push({
        severity: 'info',
        message: `module '${mod}' changed code without README.md update`
      });
    }
  }

  return { modules, moduleDetails, issues };
}

function analyzeChange(targetDir, mode) {
  const changeSet = listChangedFiles(targetDir, mode);
  const counts = { code: 0, doc: 0, test: 0, config: 0, asset: 0, other: 0 };
  const findings = [];

  for (const file of changeSet.files) {
    const kind = classifyPath(file);
    counts[kind] = (counts[kind] || 0) + 1;
  }

  if (changeSet.source === 'no-git') {
    findings.push({ severity: 'info', message: 'git repository was not detected; change analysis is limited' });
  }
  if (changeSet.source === 'git-failed') {
    findings.push({ severity: 'info', message: 'git metadata could not be read; change analysis is limited' });
  }
  if (changeSet.files.length === 0) {
    findings.push({ severity: 'info', message: 'no changed files were detected for the selected target scope' });
  }
  if (counts.code > 0 && counts.test === 0) {
    findings.push({ severity: 'warning', message: 'code changed but no test files changed' });
  }
  if (counts.code > 0 && counts.doc === 0) {
    findings.push({ severity: 'info', message: 'code changed but no documentation files changed' });
  }
  if (counts.config > 0 && counts.doc === 0) {
    findings.push({ severity: 'info', message: 'config changed; consider updating operational notes' });
  }

  const docSync = buildDocSync(changeSet, targetDir);
  findings.push(...docSync.issues);

  return {
    tool: 'verify-change',
    target: targetDir,
    mode,
    summary: `Analyzed ${changeSet.files.length} changed files from ${changeSet.source}.`,
    findings,
    changedFiles: changeSet.files.slice(0, 100),
    counts,
    affectedModules: docSync.modules,
    moduleDetails: docSync.moduleDetails,
    nextSteps: [
      'review affected modules',
      'decide whether docs or tests must change',
      'confirm rollback impact for config-heavy diffs'
    ]
  };
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
    nextSteps: [
      'inspect warnings first',
      'split oversized files if they represent multiple concerns',
      'convert fragile TODOs into tracked work where needed'
    ]
  };
}

function analyzeSecurity(targetDir, options = {}) {
  const files = walkFiles(targetDir, options);
  const findings = [];

  for (const file of files) {
    const rel = relativeTo(targetDir, file);
    const ext = extOf(rel);
    if (classifyPath(rel) !== 'code' && classifyPath(rel) !== 'config') continue;
    const text = readText(file);
    if (!text) continue;

    const lines = text.split(/\r?\n/);
    for (const pattern of SECURITY_RULES) {
      if (!pattern.extensions.includes('*') && !pattern.extensions.includes(ext)) continue;
      const matched = lines.some(line => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (/^(message:|re:|pattern:|const SECURITY_RULES\b|\{)/.test(trimmed)) return false;
        if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false;
        if (pattern.excludePattern && pattern.excludePattern.test(line)) return false;
        return pattern.pattern.test(line);
      });
      if (matched) {
        const lineIndex = lines.findIndex(line => {
          const trimmed = line.trim();
          if (!trimmed) return false;
          if (/^(message:|re:|pattern:|const SECURITY_RULES\b|\{)/.test(trimmed)) return false;
          if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false;
          if (pattern.excludePattern && pattern.excludePattern.test(line)) return false;
          return pattern.pattern.test(line);
        });
        findings.push({
          severity: pattern.severity,
          file: rel,
          line_number: lineIndex >= 0 ? lineIndex + 1 : undefined,
          category: pattern.category,
          message: pattern.message
        });
      }
    }
  }

  return {
    tool: 'verify-security',
    target: targetDir,
    summary: `Scanned ${files.length} files for rule-based security heuristics.`,
    findings,
    nextSteps: [
      'review high and critical findings first',
      'confirm whether each match is real or a benign test fixture',
      'follow with deeper source-to-sink review for risky paths'
    ]
  };
}

function evaluatePreCommit(targetDir, options = {}) {
  const change = analyzeChange(targetDir, 'working');
  const quality = analyzeQuality(targetDir, options);
  const blockers = [];

  if (change.findings.some(item => item.severity === 'warning' && /no test files changed/.test(item.message))) {
    blockers.push('code changed without any accompanying test changes');
  }
  if (quality.issues.some(item => item.severity === 'warning')) {
    blockers.push('quality scan reported warning-level issues');
  }

  return {
    guard: 'pre-commit-gate',
    target: targetDir,
    summary: blockers.length ? 'Pre-commit gate would block the change.' : 'Pre-commit gate would pass with current lightweight checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    detail: {
      changeSummary: change.counts,
      qualityIssues: quality.issues.length
    }
  };
}

function evaluatePreMerge(targetDir, options = {}) {
  const change = analyzeChange(targetDir, 'working');
  const quality = analyzeQuality(targetDir, options);
  const security = analyzeSecurity(targetDir, options);
  const blockers = [];

  if (security.findings.some(item => item.severity === 'critical' || item.severity === 'high')) {
    blockers.push('security scan reported high or critical findings');
  }
  if (quality.issues.some(item => item.severity === 'warning')) {
    blockers.push('quality scan reported warning-level issues');
  }
  if (change.findings.some(item => item.severity === 'warning')) {
    blockers.push('change analysis reported unresolved warning-level concerns');
  }

  return {
    guard: 'pre-merge-gate',
    target: targetDir,
    summary: blockers.length ? 'Pre-merge gate would block the change.' : 'Pre-merge gate would pass with current lightweight checks.',
    status: blockers.length ? 'block' : 'pass',
    blockers,
    detail: {
      changeSummary: change.counts,
      qualityIssues: quality.issues.length,
      securityFindings: security.findings.length
    }
  };
}

module.exports = {
  generateDocs,
  analyzeModule,
  analyzeChange,
  analyzeQuality,
  analyzeSecurity,
  evaluatePreCommit,
  evaluatePreMerge
};

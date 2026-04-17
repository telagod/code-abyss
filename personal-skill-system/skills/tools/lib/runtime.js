#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.venv',
  'venv',
  '__pycache__',
  'coverage',
  '.idea',
  '.vscode'
]);

const TEXT_EXTS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h',
  '.md', '.txt', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf',
  '.sh', '.ps1', '.sql', '.css', '.scss', '.html', '.xml'
]);

function parseArgs(argv) {
  const args = {
    target: '.',
    mode: 'working',
    json: false,
    write: false,
    force: false,
    maxFiles: 600
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--target') {
      args.target = argv[i + 1] || args.target;
      i += 1;
      continue;
    }
    if (token === '--mode') {
      args.mode = argv[i + 1] || args.mode;
      i += 1;
      continue;
    }
    if (token === '--max-files') {
      const parsed = Number(argv[i + 1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.maxFiles = parsed;
      }
      i += 1;
      continue;
    }
    if (token === '--json') {
      args.json = true;
      continue;
    }
    if (token === '--write') {
      args.write = true;
      continue;
    }
    if (token === '--force') {
      args.force = true;
    }
  }

  return args;
}

function resolveTarget(target) {
  return path.resolve(target || '.');
}

function walkFiles(root, options = {}) {
  const maxFiles = options.maxFiles || 600;
  const results = [];

  function visit(dir) {
    if (results.length >= maxFiles) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        visit(full);
        continue;
      }
      results.push(full);
    }
  }

  visit(root);
  return results;
}

function isTextFile(file) {
  return TEXT_EXTS.has(path.extname(file).toLowerCase());
}

function readText(file, maxBytes = 200000) {
  if (!isTextFile(file)) return null;
  try {
    const text = fs.readFileSync(file, 'utf8');
    return text.length > maxBytes ? text.slice(0, maxBytes) : text;
  } catch {
    return null;
  }
}

function relativeTo(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function classifyPath(relPath) {
  const normalized = relPath.toLowerCase();
  if (/(^|\/)(test|tests|__tests__)\//.test(normalized) || /\.test\./.test(normalized) || /\.spec\./.test(normalized)) return 'test';
  if (/(^|\/)(docs|doc)\//.test(normalized) || normalized.endsWith('.md')) return 'doc';
  if (/(^|\/)(config|configs)\//.test(normalized) || /\.(json|ya?ml|toml|ini|cfg|conf)$/.test(normalized)) return 'config';
  if (/\.(png|jpg|jpeg|gif|svg|ico|woff2?)$/.test(normalized)) return 'asset';
  if (/\.(js|jsx|ts|tsx|py|java|go|rs|cpp|c|h|sh|ps1|sql|css|scss|html|xml)$/.test(normalized)) return 'code';
  return 'other';
}

function printHumanReport(report) {
  const summary = report.summary || '';
  if (report.tool) console.log(`tool: ${report.tool}`);
  if (report.guard) console.log(`guard: ${report.guard}`);
  if (report.mode) console.log(`mode: ${report.mode}`);
  if (report.target) console.log(`target: ${report.target}`);
  if (summary) console.log(`summary: ${summary}`);

  if (Array.isArray(report.findings)) {
    console.log(`findings: ${report.findings.length}`);
    for (const finding of report.findings.slice(0, 20)) {
      const sev = finding.severity || 'info';
      const file = finding.file ? ` [${finding.file}${finding.line_number ? ':' + finding.line_number : ''}]` : '';
      console.log(`- ${sev}${file}: ${finding.message}`);
    }
  }

  if (Array.isArray(report.issues)) {
    console.log(`issues: ${report.issues.length}`);
    for (const issue of report.issues.slice(0, 20)) {
      const sev = issue.severity || 'info';
      const file = issue.file ? ` [${issue.file}${issue.line_number ? ':' + issue.line_number : ''}]` : '';
      console.log(`- ${sev}${file}: ${issue.message}`);
    }
  }

  if (Array.isArray(report.blockers) && report.blockers.length) {
    console.log('blockers:');
    for (const blocker of report.blockers) {
      console.log(`- ${blocker}`);
    }
  }

  if (Array.isArray(report.outputs) && report.outputs.length) {
    console.log('outputs:');
    for (const output of report.outputs) {
      console.log(`- ${output}`);
    }
  }

  if (Array.isArray(report.nextSteps) && report.nextSteps.length) {
    console.log('next-steps:');
    for (const step of report.nextSteps) {
      console.log(`- ${step}`);
    }
  }
}

function emit(report, args) {
  if (args && args.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return;
  }
  printHumanReport(report);
}

function safeMkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeWriteFile(file, content, options = {}) {
  if (fs.existsSync(file) && !options.force) {
    return false;
  }
  safeMkdir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
  return true;
}

function runGit(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status === 0) return result;
  const alt = spawnSync('git.exe', args, { cwd, encoding: 'utf8' });
  return alt.status === 0 ? alt : result;
}

function findGitRoot(startDir) {
  const result = runGit(['rev-parse', '--show-toplevel'], startDir);
  if (result.status === 0) return result.stdout.trim() || null;

  let current = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return null;
}

function normalizeChangedPath(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  const renameParts = value.split('->').map(part => part.trim()).filter(Boolean);
  return (renameParts[renameParts.length - 1] || value).replace(/\\/g, '/');
}

function filterFilesToTarget(repoRoot, targetDir, files) {
  const target = path.resolve(targetDir);
  return files
    .map(normalizeChangedPath)
    .filter(Boolean)
    .filter(file => {
      const abs = path.resolve(repoRoot, file);
      return abs === target || abs.startsWith(target + path.sep);
    });
}

function listChangedFiles(startDir, mode) {
  const root = findGitRoot(startDir);
  if (!root) {
    return { root: startDir, files: [], source: 'no-git' };
  }

  let result;
  if (mode === 'staged') {
    result = runGit(['diff', '--name-only', '--cached'], root);
  } else if (mode === 'committed') {
    result = runGit(['show', '--name-only', '--pretty=', 'HEAD'], root);
  } else {
    result = runGit(['status', '--porcelain'], root);
    if (result.status === 0) {
      const files = result.stdout.split(/\r?\n/).filter(Boolean).map(line => line.slice(3).trim()).filter(Boolean);
      return { root, files: filterFilesToTarget(root, startDir, files), source: 'git-status' };
    }
  }

  if (result.status !== 0) {
    return { root, files: [], source: 'git-failed' };
  }
  const files = result.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return { root, files: filterFilesToTarget(root, startDir, files), source: 'git-diff' };
}

module.exports = {
  parseArgs,
  resolveTarget,
  walkFiles,
  readText,
  relativeTo,
  classifyPath,
  emit,
  safeWriteFile,
  listChangedFiles
};

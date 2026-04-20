#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { printHumanReport } = require('./runtime-output');

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
    maxFiles: 600,
    changedFiles: []
  };

  for (let i = 0; i < argv.length; i += 1) {
    const consumed = consumeValueOption(args, argv, i);
    if (consumed > 0) {
      i += consumed;
      continue;
    }
    applyFlagOption(args, argv[i]);
  }

  return args;
}

function consumeValueOption(args, argv, index) {
  const token = argv[index];
  const next = argv[index + 1];

  if (token === '--target') {
    args.target = next || args.target;
    return 1;
  }
  if (token === '--mode') {
    args.mode = next || args.mode;
    return 1;
  }
  if (token === '--max-files') {
    const parsed = Number(next);
    if (Number.isFinite(parsed) && parsed > 0) {
      args.maxFiles = parsed;
    }
    return 1;
  }
  if (token === '--changed-files') {
    args.changedFiles = mergeChangedFileLists(args.changedFiles, parseChangedFilesValue(next));
    return 1;
  }

  return 0;
}

function applyFlagOption(args, token) {
  if (token === '--json') {
    args.json = true;
    return;
  }
  if (token === '--write') {
    args.write = true;
    return;
  }
  if (token === '--force') {
    args.force = true;
  }
}

function parseChangedFilesValue(raw) {
  const value = String(raw || '').trim();
  if (!value) return [];

  if (value.startsWith('@')) {
    const listFile = path.resolve(value.slice(1));
    if (!fs.existsSync(listFile)) return [];
    try {
      const text = fs.readFileSync(listFile, 'utf8');
      return splitChangedFilesText(text);
    } catch {
      return [];
    }
  }

  return splitChangedFilesText(value);
}

function splitChangedFilesText(text) {
  return String(text || '')
    .split(/[\r\n,;]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function mergeChangedFileLists(base, extra) {
  const merged = [...(Array.isArray(base) ? base : []), ...(Array.isArray(extra) ? extra : [])]
    .map(normalizeChangedPath)
    .filter(Boolean);
  return [...new Set(merged)];
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
  return alt.status === 0 ? alt : (alt.error ? alt : result);
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

function normalizeChangeOperation(rawStatus) {
  const status = String(rawStatus || '').trim().toUpperCase();
  if (!status) return 'modified';
  if (status.includes('?') || status.startsWith('A')) return 'added';
  if (status.startsWith('D')) return 'deleted';
  if (status.startsWith('R') || status.startsWith('C')) return 'renamed';
  if (status.startsWith('M')) return 'modified';
  return 'modified';
}

function parseStatusLine(line) {
  const raw = String(line || '');
  if (!raw.trim()) return null;
  const status = raw.slice(0, 2);
  const payload = raw.slice(3).trim();
  if (!payload) return null;

  const renameParts = payload.split(/\s+->\s+/).map(part => part.trim()).filter(Boolean);
  const previousPath = renameParts.length > 1 ? normalizeChangedPath(renameParts[0]) : '';
  const file = normalizeChangedPath(renameParts[renameParts.length - 1] || payload);

  return {
    status: status.trim() || 'M',
    operation: normalizeChangeOperation(status),
    file,
    previousPath
  };
}

function parseNameStatusLine(line) {
  const raw = String(line || '').trim();
  if (!raw) return null;
  const parts = raw.split(/\t+/).map(item => item.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const status = parts[0];
  const file = normalizeChangedPath(parts[parts.length - 1]);
  const previousPath = parts.length > 2 ? normalizeChangedPath(parts[1]) : '';

  return {
    status,
    operation: normalizeChangeOperation(status),
    file,
    previousPath
  };
}

function normalizeExternalChangedFiles(baseDir, targetDir, files) {
  const normalized = [];
  const seen = new Set();

  for (const raw of Array.isArray(files) ? files : []) {
    const candidate = normalizeChangedPath(raw);
    if (!candidate) continue;
    let abs = path.resolve(baseDir, candidate);

    if (path.isAbsolute(candidate)) {
      abs = path.resolve(candidate);
    } else {
      const asTargetRelative = path.resolve(targetDir, candidate);
      const asRootRelative = path.resolve(baseDir, candidate);
      if (fs.existsSync(asTargetRelative)) abs = asTargetRelative;
      else abs = asRootRelative;
    }

    const rel = path.relative(baseDir, abs).split(path.sep).join('/');
    const clean = normalizeChangedPath(rel);
    if (!clean || clean.startsWith('..')) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);
    normalized.push(clean);
  }

  return normalized;
}

function readChangedFilesFromEnv() {
  const sources = [process.env.PSS_CHANGED_FILES, process.env.CODEX_CHANGED_FILES, process.env.CHANGED_FILES];
  for (const source of sources) {
    const parsed = parseChangedFilesValue(source);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

function isGitPermissionError(result) {
  return !!(result && result.error && result.error.code === 'EPERM');
}

function filterFilesToTarget(repoRoot, targetDir, files) {
  const target = path.resolve(targetDir);
  const scoped = [];
  const seen = new Set();

  for (const file of files.map(normalizeChangedPath).filter(Boolean)) {
    const abs = path.resolve(repoRoot, file);
    if (!(abs === target || abs.startsWith(target + path.sep))) continue;
    const rel = normalizeChangedPath(path.relative(target, abs).split(path.sep).join('/'));
    if (!rel || seen.has(rel)) continue;
    seen.add(rel);
    scoped.push(rel);
  }

  return scoped;
}

function filterEntriesToTarget(repoRoot, targetDir, entries) {
  const target = path.resolve(targetDir);
  const scoped = [];
  const seen = new Set();

  for (const entry of Array.isArray(entries) ? entries : []) {
    const abs = path.resolve(repoRoot, entry.file || '');
    if (!(abs === target || abs.startsWith(target + path.sep))) continue;

    const relFile = normalizeChangedPath(path.relative(target, abs).split(path.sep).join('/'));
    if (!relFile) continue;

    let relPrevious = '';
    if (entry.previousPath) {
      const prevAbs = path.resolve(repoRoot, entry.previousPath);
      if (prevAbs === target || prevAbs.startsWith(target + path.sep)) {
        relPrevious = normalizeChangedPath(path.relative(target, prevAbs).split(path.sep).join('/'));
      }
    }

    const dedupeKey = [entry.operation, relPrevious, relFile].join('|');
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    scoped.push({
      status: entry.status,
      operation: entry.operation,
      file: relFile,
      previousPath: relPrevious
    });
  }

  return scoped;
}

function listChangedFiles(startDir, mode, options = {}) {
  const scopedTarget = path.resolve(startDir);
  const root = findGitRoot(scopedTarget);
  const baseDir = root || scopedTarget;

  const explicitChangedFiles = normalizeExternalChangedFiles(baseDir, scopedTarget, options.changedFiles);
  if (explicitChangedFiles.length > 0) {
    const entries = explicitChangedFiles.map(file => ({
      status: 'M',
      operation: 'modified',
      file,
      previousPath: ''
    }));
    return {
      root: baseDir,
      files: filterFilesToTarget(baseDir, scopedTarget, explicitChangedFiles),
      entries: filterEntriesToTarget(baseDir, scopedTarget, entries),
      source: 'external-arg'
    };
  }

  const envChangedFiles = normalizeExternalChangedFiles(baseDir, scopedTarget, readChangedFilesFromEnv());

  if (!root) {
    if (envChangedFiles.length > 0) {
      const entries = envChangedFiles.map(file => ({
        status: 'M',
        operation: 'modified',
        file,
        previousPath: ''
      }));
      return {
        root: baseDir,
        files: filterFilesToTarget(baseDir, scopedTarget, envChangedFiles),
        entries: filterEntriesToTarget(baseDir, scopedTarget, entries),
        source: 'external-env-no-git'
      };
    }
    return { root: scopedTarget, files: [], entries: [], source: 'no-git' };
  }

  let result;
  if (mode === 'staged') {
    result = runGit(['diff', '--name-status', '--cached', '-M'], root);
  } else if (mode === 'committed') {
    result = runGit(['show', '--name-status', '--pretty=', '--find-renames', 'HEAD'], root);
  } else {
    result = runGit(['status', '--porcelain=1', '--untracked-files=all'], root);
    if (result.status === 0) {
      const rawEntries = result.stdout.split(/\r?\n/).map(parseStatusLine).filter(Boolean);
      const entries = filterEntriesToTarget(root, scopedTarget, rawEntries);
      return {
        root,
        files: entries.map(entry => entry.file),
        entries,
        source: 'git-status'
      };
    }
  }

  if (result.status !== 0) {
    if (isGitPermissionError(result) && envChangedFiles.length > 0) {
      const entries = envChangedFiles.map(file => ({
        status: 'M',
        operation: 'modified',
        file,
        previousPath: ''
      }));
      return {
        root,
        files: filterFilesToTarget(root, scopedTarget, envChangedFiles),
        entries: filterEntriesToTarget(root, scopedTarget, entries),
        source: 'external-env-git-eperm'
      };
    }
    if (isGitPermissionError(result)) {
      return { root, files: [], entries: [], source: 'git-permission-denied', errorCode: result.error.code };
    }
    return { root, files: [], entries: [], source: 'git-failed' };
  }
  const rawEntries = result.stdout.split(/\r?\n/).map(parseNameStatusLine).filter(Boolean);
  const entries = filterEntriesToTarget(root, scopedTarget, rawEntries);
  return {
    root,
    files: entries.map(entry => entry.file),
    entries,
    source: 'git-diff'
  };
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

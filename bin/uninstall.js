#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const targetDir = path.dirname(__filename);
const backupDir = path.join(targetDir, '.sage-backup');
const manifestPath = path.join(backupDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('❌ 未找到安装记录 (manifest.json)');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (e) {
  console.error('❌ manifest.json 解析失败:', e.message);
  process.exit(1);
}

const MANAGED_ROOTS = {
  claude: '.claude',
  codex: '.codex',
  agents: '.agents',
  gemini: '.gemini',
};

function resolveEntryPath(entry) {
  if (typeof entry === 'string') return path.join(targetDir, entry);
  const rootDir = MANAGED_ROOTS[entry.root]
    ? path.join(os.homedir(), MANAGED_ROOTS[entry.root])
    : targetDir;
  return path.join(rootDir, entry.path);
}

function resolveBackupPath(entry) {
  if (typeof entry === 'string') return path.join(backupDir, entry);
  return path.join(backupDir, entry.root, entry.path);
}

function entryLabel(entry) {
  if (typeof entry === 'string') return entry;
  return entry.root === manifest.target ? entry.path : `${entry.root}/${entry.path}`;
}

function pruneEmptyParents(dirPath, stopAt) {
  let current = dirPath;
  while (current !== stopAt && current !== path.dirname(current)) {
    try {
      const entries = fs.readdirSync(current);
      if (entries.length > 0) break;
      fs.rmdirSync(current);
    } catch { break; }
    current = path.dirname(current);
  }
}

console.log(`\n🗑️  卸载 Code Abyss v${manifest.version}...\n`);

(manifest.installed || []).forEach(entry => {
  const p = resolveEntryPath(entry);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`🗑️  删除: ${entryLabel(entry)}`);
    const rootDir = typeof entry !== 'string'
      ? path.join(os.homedir(), MANAGED_ROOTS[entry.root] || '')
      : targetDir;
    pruneEmptyParents(path.dirname(p), rootDir);
  }
});

(manifest.backups || []).forEach(entry => {
  const bp = resolveBackupPath(entry);
  const tp = resolveEntryPath(entry);
  if (fs.existsSync(bp)) {
    fs.renameSync(bp, tp);
    console.log(`✅ 恢复: ${entryLabel(entry)}`);
  }
});

fs.rmSync(backupDir, { recursive: true, force: true });
fs.unlinkSync(__filename);

console.log('\n✅ 卸载完成\n');

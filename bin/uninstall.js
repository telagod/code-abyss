#!/usr/bin/env node

// bin/uninstall.js
// 独立卸载脚本：被 install 流程复制为 ~/.{target}/.sage-uninstall.js，
// 用户即使卸了 npm 包也能跑此脚本完成卸载。
//
// 共享逻辑见 bin/lib/uninstall-core.js（npm 包入口走 lifecycle/uninstall.js
// 也调用同一份 core）。
//
// 注意：此脚本被 fs.copyFileSync 拷到目标目录，require 路径必须能在两端解析：
//   - 仓库内运行：require('./lib/uninstall-core') ✓
//   - 拷贝后运行：require('./lib/uninstall-core') 仍指向 ~/.{target}/lib/...
//     如果 lib 没被复制过去，此脚本无法独立运行。
// 所以这里仍保留独立内联实现，不 require core，避免运行时依赖断链。
//
// 实现刻意与 bin/lib/uninstall-core.js 的 STATUS / readManifestSafe 等
// 行为对齐（包括 idempotent 语义），便于后续可选迁移。

const fs = require('fs');
const path = require('path');
const os = require('os');

const targetDir = path.dirname(__filename);
const backupDir = path.join(targetDir, '.sage-backup');
const manifestPath = path.join(backupDir, 'manifest.json');

const SUPPORTED_MANIFEST_VERSION = 2;
const MANAGED_ROOTS = {
  claude: '.claude',
  codex: '.codex',
  agents: '.agents',
  gemini: '.gemini',
  openclaw: '.openclaw',
};

// idempotent: manifest 不存在时友好返回
if (!fs.existsSync(manifestPath)) {
  console.log('ℹ️  已卸载或从未安装（未找到 manifest.json）');
  process.exit(0);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (e) {
  console.error('❌ manifest.json 解析失败:', e.message);
  process.exit(1);
}

if (manifest.manifest_version && manifest.manifest_version > SUPPORTED_MANIFEST_VERSION) {
  console.error(`❌ manifest 版本 ${manifest.manifest_version} 不兼容，请升级 code-abyss 后再卸载`);
  process.exit(1);
}

function resolveEntryPath(entry) {
  if (typeof entry === 'string') return path.join(targetDir, entry);
  // openclaw workspace 等运行时根：优先从 manifest.runtime_roots 拿
  if (manifest.runtime_roots && manifest.runtime_roots[entry.root]) {
    return path.join(manifest.runtime_roots[entry.root], entry.path);
  }
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
    if (typeof entry !== 'string' && entry.root !== manifest.target) {
      const rootDir = manifest.runtime_roots && manifest.runtime_roots[entry.root]
        ? manifest.runtime_roots[entry.root]
        : path.join(os.homedir(), MANAGED_ROOTS[entry.root] || '');
      pruneEmptyParents(path.dirname(p), rootDir);
    }
  }
  // idempotent: 已删的 silently skip
});

(manifest.backups || []).forEach(entry => {
  const bp = resolveBackupPath(entry);
  const tp = resolveEntryPath(entry);
  if (fs.existsSync(bp)) {
    fs.mkdirSync(path.dirname(tp), { recursive: true });
    fs.renameSync(bp, tp);
    console.log(`✅ 恢复: ${entryLabel(entry)}`);
  }
  // idempotent: backup 已恢复或被用户删的 silently skip
});

fs.rmSync(backupDir, { recursive: true, force: true });
try { fs.unlinkSync(__filename); } catch { /* idempotent: 已删 */ }

console.log('\n✅ 卸载完成\n');

#!/usr/bin/env node
'use strict';

// v3 → v4 migration helper
//
// 检测用户的 ~/.{target}/skills/ 下的 v3 旧 skill 残骸，提示用户清理或自动迁移。
//
// v3 → v4 重命名 / 删除映射：
//   - designing-glassmorphism / designing-liquid-glass / designing-neubrutalism /
//     designing-claymorphism → applying-ui-design-system
//   - building-ai-systems + coordinating-agents → building-agent-systems
//   - securing-systems/references/coff0xc-* → 删除（功能拆分到 4 个新 skill）
//
// 用法：
//   node bin/migrate-v3-to-v4.js [--target claude|codex|gemini|openclaw] [--dry-run] [--yes]

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();

const TARGETS = ['claude', 'codex', 'gemini', 'openclaw'];

// 已删除的 skill (v3 → 空)
const REMOVED_SKILLS = [
  'designing-glassmorphism',
  'designing-liquid-glass',
  'designing-neubrutalism',
  'designing-claymorphism',
  'building-ai-systems',
  'coordinating-agents',
];

// 重命名映射（旧 → 新）
const RENAMED_SKILLS = {
  // 4 个 designing-* 合并为 applying-ui-design-system，需要手动重装
  'designing-glassmorphism': 'applying-ui-design-system',
  'designing-liquid-glass': 'applying-ui-design-system',
  'designing-neubrutalism': 'applying-ui-design-system',
  'designing-claymorphism': 'applying-ui-design-system',
  'building-ai-systems': 'building-agent-systems',
  'coordinating-agents': 'building-agent-systems',
};

// 新增 skill（v4 新加，无 v3 对应）
const NEW_SKILLS = [
  'defending-applications',
  'securing-cloud-and-supply-chain',
  'detecting-and-responding',
  'architecting-security',
  'applying-ui-design-system',
  'building-agent-systems',
];

function parseArgs(argv) {
  const opts = { target: null, dryRun: false, yes: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target' || a === '-t') opts.target = argv[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--yes' || a === '-y') opts.yes = true;
    else if (a === '--help' || a === '-h') {
      console.log(`v3 → v4 migration helper

Detects v3 skill remnants under ~/.{target}/skills/ and proposes cleanup.

Usage:
  node bin/migrate-v3-to-v4.js [--target <name>] [--dry-run] [--yes]

Targets: ${TARGETS.join(', ')}

Examples:
  node bin/migrate-v3-to-v4.js                    # check all targets
  node bin/migrate-v3-to-v4.js -t claude          # check only claude
  node bin/migrate-v3-to-v4.js -t claude --yes    # auto-remove v3 leftovers
  node bin/migrate-v3-to-v4.js --dry-run          # show what would happen
`);
      process.exit(0);
    }
  }
  return opts;
}

function getSkillsDir(target) {
  return path.join(HOME, `.${target}`, 'skills');
}

function listSkillDirs(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function findV3Remnants(target) {
  const skillsDir = getSkillsDir(target);
  const installed = listSkillDirs(skillsDir);
  return REMOVED_SKILLS.filter(name => installed.includes(name));
}

function hasCoff0xc(target) {
  const securingDir = path.join(getSkillsDir(target), 'securing-systems', 'references');
  if (!fs.existsSync(securingDir)) return [];
  return fs.readdirSync(securingDir)
    .filter(f => f.startsWith('coff0xc-') && f.endsWith('.md'));
}

function removePath(p, dryRun) {
  if (dryRun) {
    console.log(`  [DRY] would remove: ${p}`);
    return;
  }
  fs.rmSync(p, { recursive: true, force: true });
  console.log(`  ✘ removed: ${p}`);
}

function checkTarget(target, opts) {
  const skillsDir = getSkillsDir(target);
  if (!fs.existsSync(skillsDir)) {
    return { target, status: 'not-installed' };
  }

  const remnants = findV3Remnants(target);
  const coff0xcFiles = hasCoff0xc(target);
  const hasIssues = remnants.length > 0 || coff0xcFiles.length > 0;

  if (!hasIssues) {
    return { target, status: 'clean' };
  }

  console.log(`\n━━━ ${target.toUpperCase()} ━━━`);
  console.log(`  skills dir: ${skillsDir}`);

  if (remnants.length > 0) {
    console.log(`\n  v3 旧 skill 目录（已在 v4 移除/合并）:`);
    for (const name of remnants) {
      const replacement = RENAMED_SKILLS[name];
      const tag = replacement ? `→ ${replacement}` : '(deleted)';
      console.log(`    - ${name}  ${tag}`);
    }
  }

  if (coff0xcFiles.length > 0) {
    console.log(`\n  coff0xc 上游依赖文件（v4 已替换为自家 skill）:`);
    for (const f of coff0xcFiles) {
      console.log(`    - securing-systems/references/${f}`);
    }
    console.log(`\n  替换方案：v4 新 skill`);
    for (const n of [
      'defending-applications',
      'securing-cloud-and-supply-chain',
      'detecting-and-responding',
      'architecting-security',
    ]) {
      console.log(`    + ${n}`);
    }
  }

  const shouldClean = opts.dryRun || opts.yes || promptConfirm(target);
  if (!shouldClean) {
    console.log(`  ⊘ skipped — re-run with --yes to clean, or manually delete the paths above`);
    return { target, status: 'remnants', remnants, coff0xcFiles };
  }

  console.log(`\n  清理中...`);
  for (const name of remnants) {
    removePath(path.join(skillsDir, name), opts.dryRun);
  }
  for (const f of coff0xcFiles) {
    removePath(path.join(skillsDir, 'securing-systems', 'references', f), opts.dryRun);
  }

  console.log(`\n  ${opts.dryRun ? '[DRY] would suggest' : '建议'}: 重装 v4 以获取新 skill`);
  console.log(`    npx code-abyss -t ${target} -y`);

  return { target, status: opts.dryRun ? 'dry-run' : 'cleaned', remnants, coff0xcFiles };
}

function promptConfirm(target) {
  process.stdout.write(`\n  清理 ${target} 的 v3 残骸？[y/N]: `);
  // 简单同步 stdin 读取
  const buf = Buffer.alloc(8);
  try {
    const n = fs.readSync(0, buf, 0, 8, null);
    const ans = buf.slice(0, n).toString().trim().toLowerCase();
    return ans === 'y' || ans === 'yes';
  } catch {
    return false;
  }
}

function main() {
  const opts = parseArgs(process.argv);
  const targets = opts.target ? [opts.target] : TARGETS;

  console.log('Code Abyss v3 → v4 migration helper');
  console.log('======================================');
  if (opts.dryRun) console.log('Mode: dry-run (no changes)');

  const results = targets.map(t => checkTarget(t, opts));

  console.log('\n━━━ 总结 ━━━');
  for (const r of results) {
    const tag = {
      'not-installed': '⊘ 未安装',
      'clean': '✓ 干净',
      'remnants': '⚠ 有 v3 残骸（已跳过）',
      'cleaned': '✓ 已清理',
      'dry-run': '◌ dry-run',
    }[r.status] || r.status;
    console.log(`  ${r.target.padEnd(12)} ${tag}`);
  }

  const hasRemnants = results.some(r => r.status === 'remnants');
  if (hasRemnants) {
    console.log('\n下一步：');
    console.log('  1. node bin/migrate-v3-to-v4.js --yes   # 自动清理');
    console.log('  2. npx code-abyss -t <target> -y         # 重装 v4');
    process.exit(2);
  }
}

if (require.main === module) main();

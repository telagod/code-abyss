#!/usr/bin/env node
'use strict';

// Phase 3 skills 扁平化迁移脚本
// 用法：node scripts/migrate-phase3.js [--dry-run]
//
// 1. 把 22 个 leaf skill 重命名 + 平移到 skills/<new-slug>/
// 2. 重写每个 SKILL.md 的 frontmatter name 字段
// 3. 把 domain 同级 knowledge .md 平移到对应 leaf skill 的 references/
// 4. 删 11 个 router SKILL.md（包括根 skills/SKILL.md）
//
// 不动 ooxml schemas（留给 PR-3.β）

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS = path.join(ROOT, 'skills');
const DRY = process.argv.includes('--dry-run');

// 22 个 leaf skill 的映射：[相对 skills/ 的旧路径, 新 slug]
const LEAF_MAPPING = [
  ['tools/verify-quality', 'checking-code-quality'],
  ['tools/verify-security', 'analyzing-security'],
  ['tools/verify-change', 'analyzing-changes'],
  ['tools/verify-module', 'verifying-modules'],
  ['tools/gen-docs', 'generating-docs'],
  ['domains/ai', 'building-ai-systems'],
  ['domains/architecture', 'designing-architectures'],
  ['domains/data-engineering', 'engineering-data-pipelines'],
  ['domains/development', 'developing-software'],
  ['domains/devops', 'automating-devops'],
  ['domains/infrastructure', 'provisioning-infrastructure'],
  ['domains/mobile', 'developing-mobile-apps'],
  ['domains/security', 'securing-systems'],
  ['orchestration/multi-agent', 'coordinating-agents'],
  ['domains/office/docx', 'processing-docx'],
  ['domains/office/pdf', 'processing-pdfs'],
  ['domains/office/pptx', 'creating-presentations'],
  ['domains/office/xlsx', 'analyzing-spreadsheets'],
  ['domains/frontend-design/glassmorphism', 'designing-glassmorphism'],
  ['domains/frontend-design/liquid-glass', 'designing-liquid-glass'],
  ['domains/frontend-design/neubrutalism', 'designing-neubrutalism'],
  ['domains/frontend-design/claymorphism', 'designing-claymorphism'],
];

// 11 个 router 要删（按"路径 → 知识 .md 平移到哪个新 slug"）
// 若 [null] 则没有同级知识 .md，单纯删
const ROUTER_DELETE = [
  ['', null], // skills/SKILL.md（根 router）
  ['domains/ai', 'building-ai-systems'],
  ['domains/architecture', 'designing-architectures'],
  ['domains/data-engineering', null],
  ['domains/development', 'developing-software'],
  ['domains/devops', 'automating-devops'],
  ['domains/infrastructure', null],
  ['domains/mobile', null],
  ['domains/security', 'securing-systems'],
  ['domains/frontend-design', null], // 5 个同级 .md：拆到 4 个风格子 skill
  ['domains/office', null],
  ['domains/orchestration', 'coordinating-agents'], // orchestration 下含 multi-agent.md
];

// frontend-design 同级 5 个 .md 的特殊去向：归到任一风格 skill references/
// （这 5 个文档讲 ui-aesthetics/component-patterns 等通用前端理论）
const FRONTEND_DESIGN_DOCS_TARGET = 'designing-glassmorphism';

function logOp(verb, p) {
  console.log(`[${DRY ? 'DRY' : 'RUN'}] ${verb}: ${p}`);
}

function moveDir(oldRel, newSlug) {
  const oldAbs = path.join(SKILLS, oldRel);
  const newAbs = path.join(SKILLS, newSlug);
  if (!fs.existsSync(oldAbs)) {
    console.warn(`[skip] not found: ${oldRel}`);
    return;
  }
  if (fs.existsSync(newAbs)) {
    throw new Error(`target already exists: ${newSlug}`);
  }
  logOp('mv', `${oldRel} -> ${newSlug}`);
  if (!DRY) {
    // 先确保父目录存在
    fs.mkdirSync(path.dirname(newAbs), { recursive: true });
    fs.renameSync(oldAbs, newAbs);
  }
}

function rewriteFrontmatterName(skillRelDir, newSlug) {
  const skillMd = path.join(SKILLS, skillRelDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) {
    console.warn(`[skip frontmatter] not found: ${skillRelDir}/SKILL.md`);
    return;
  }
  const content = fs.readFileSync(skillMd, 'utf8');
  const rewritten = content.replace(/^name:\s*[\w-]+\s*$/m, `name: ${newSlug}`);
  if (content === rewritten) {
    console.warn(`[no name field changed] ${skillRelDir}/SKILL.md`);
    return;
  }
  logOp('rewrite name', `${skillRelDir}/SKILL.md -> name: ${newSlug}`);
  if (!DRY) fs.writeFileSync(skillMd, rewritten);
}

function moveKnowledgeDocs(routerRel, targetSlug) {
  if (!targetSlug) return;
  const routerAbs = path.join(SKILLS, routerRel);
  if (!fs.existsSync(routerAbs)) return;
  const targetRefDir = path.join(SKILLS, targetSlug, 'references');

  const entries = fs.readdirSync(routerAbs, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (ent.name === 'SKILL.md') continue; // router 本体由后续 deleteRouter 处理
    if (!ent.name.endsWith('.md')) continue;
    const src = path.join(routerAbs, ent.name);
    const dst = path.join(targetRefDir, ent.name);
    logOp('mv knowledge', `${routerRel}/${ent.name} -> ${targetSlug}/references/${ent.name}`);
    if (!DRY) {
      fs.mkdirSync(targetRefDir, { recursive: true });
      fs.renameSync(src, dst);
    }
  }
}

function deleteRouter(routerRel) {
  const skillMd = routerRel === ''
    ? path.join(SKILLS, 'SKILL.md')
    : path.join(SKILLS, routerRel, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return;
  logOp('delete router', skillMd.replace(ROOT + '/', ''));
  if (!DRY) fs.rmSync(skillMd);
}

function rmEmptyDirSafe(absDir) {
  if (!fs.existsSync(absDir)) return;
  const remaining = fs.readdirSync(absDir);
  if (remaining.length === 0) {
    logOp('rmdir', absDir.replace(ROOT + '/', ''));
    if (!DRY) fs.rmdirSync(absDir);
  } else {
    console.warn(`[non-empty, kept] ${absDir.replace(ROOT + '/', '')}: ${remaining.join(', ')}`);
  }
}

function moveSharedLib() {
  const oldAbs = path.join(SKILLS, 'tools', 'lib');
  const newAbs = path.join(SKILLS, '_lib');
  if (!fs.existsSync(oldAbs)) return;
  if (fs.existsSync(newAbs)) {
    throw new Error('skills/_lib already exists');
  }
  logOp('mv shared lib', 'tools/lib -> _lib');
  if (!DRY) {
    fs.renameSync(oldAbs, newAbs);
  }
}

function deleteStaleAgentsConfig() {
  const stale = path.join(SKILLS, 'domains', 'frontend-design', 'agents');
  if (!fs.existsSync(stale)) return;
  logOp('delete stale', 'domains/frontend-design/agents (废弃的 agent 配置)');
  if (!DRY) {
    fs.rmSync(stale, { recursive: true, force: true });
  }
}

function main() {
  console.log(`Phase 3 migration starting (${DRY ? 'DRY RUN' : 'LIVE'})`);
  console.log('-----');

  // 0. 把 shared lib 抬到 skills/_lib，删废弃 agents 配置
  console.log('\n## 0. 杂项：shared lib + 废弃配置\n');
  moveSharedLib();
  deleteStaleAgentsConfig();

  // 1. 平移 leaf skill 目录到新 slug
  console.log('\n## 1. 平移 22 个 leaf skill\n');
  for (const [oldRel, newSlug] of LEAF_MAPPING) {
    moveDir(oldRel, newSlug);
  }

  // 2. 重写 frontmatter name 字段
  console.log('\n## 2. 重写 frontmatter name\n');
  for (const [, newSlug] of LEAF_MAPPING) {
    rewriteFrontmatterName(newSlug, newSlug);
  }

  // 3. router 同级知识 .md 平移到对应 leaf 的 references/
  console.log('\n## 3. 平移 knowledge .md 到 references/\n');
  for (const [routerRel, targetSlug] of ROUTER_DELETE) {
    if (routerRel) moveKnowledgeDocs(routerRel, targetSlug);
  }
  // frontend-design 同级 5 个 .md 特殊处理
  moveKnowledgeDocs('domains/frontend-design', FRONTEND_DESIGN_DOCS_TARGET);

  // 4. 删 router SKILL.md
  console.log('\n## 4. 删 router SKILL.md\n');
  for (const [routerRel] of ROUTER_DELETE) {
    deleteRouter(routerRel);
  }

  // 5. 清空目录
  console.log('\n## 5. 清空残留目录\n');
  const cleanupDirs = [
    'domains/ai', 'domains/architecture', 'domains/data-engineering',
    'domains/development', 'domains/devops', 'domains/infrastructure',
    'domains/mobile', 'domains/security', 'domains/frontend-design',
    'domains/office', 'domains/orchestration',
    'domains', 'tools', 'orchestration',
  ];
  for (const rel of cleanupDirs) {
    rmEmptyDirSafe(path.join(SKILLS, rel));
  }

  console.log('\n-----');
  console.log(`Phase 3 migration ${DRY ? 'DRY RUN done (nothing changed)' : 'completed'}`);
}

main();

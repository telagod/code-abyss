#!/usr/bin/env node
'use strict';

// scripts/sync-persona-scenarios.js
// Generates each core persona's `## 情景剧本` markdown table from its
// persona-card.json `scenarios[]` — card is the single source of truth for
// scenario data; the .md table is a generated display layer
// (persona-architecture-v3.md §7 decision 1). Runtime rendering never reads
// `scenarios[]` (bin/lib/style-registry.js's renderRuntimeGuidance builds the
// prompt entirely from .md content), so regenerating this table cannot affect
// what gets installed — only what a human/model reads in the persona file.
//
// `triggers`/`chain` on each scenario are machine-oriented (English slugs,
// consumed by persona-converter.js for GPT/SillyTavern export); `triggers_zh`/
// `chain_zh` are the curated, natural-language display forms this table
// renders (falls back to the raw field if a persona hasn't added _zh display
// fields yet, so this generator degrades gracefully rather than requiring the
// schema addition everywhere at once).
//
// Usage:
//   node scripts/sync-persona-scenarios.js            # regenerate + write
//   node scripts/sync-persona-scenarios.js --check     # exit 1 if md would change (CI gate)

const fs = require('fs');
const path = require('path');
const { listPersonas } = require('../bin/lib/style-registry.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const HEADING = '## 情景剧本';
const TABLE_HEADER = '| 场景 | 触发词 | 执行链 | 优先级 |\n|------|--------|--------|--------|';

function renderTable(scenarios) {
  const rows = scenarios.map((s) => {
    const triggers = (s.triggers_zh || s.triggers || []).join('、');
    const chain = (s.chain_zh || s.chain || []).join('→');
    return `| ${s.name} | ${triggers} | ${chain} | ${s.priority} |`;
  });
  return [TABLE_HEADER, ...rows].join('\n');
}

// Replaces the table between `## 情景剧本` and the next `## ` heading (or EOF)
// with a freshly rendered one, preserving everything else byte-for-byte.
function regenerateSection(md, scenarios) {
  const idx = md.indexOf(HEADING);
  if (idx === -1) return null; // persona has no scenario section — nothing to generate

  const afterHeading = idx + HEADING.length;
  const rest = md.slice(afterHeading);
  const nextHeadingMatch = rest.match(/\n##[^#]/);
  const sectionEnd = nextHeadingMatch ? afterHeading + nextHeadingMatch.index : md.length;

  const newTable = renderTable(scenarios);
  return md.slice(0, afterHeading) + '\n\n' + newTable + '\n' + md.slice(sectionEnd);
}

function syncOne(persona) {
  const cardPath = path.join(REPO_ROOT, 'config', 'personas', persona.slug, 'persona-card.json');
  const mdPath = path.join(REPO_ROOT, 'config', 'personas', persona.file);
  if (!fs.existsSync(cardPath) || !fs.existsSync(mdPath)) return null;

  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const scenarios = card.data && card.data.scenarios;
  if (!Array.isArray(scenarios) || scenarios.length === 0) return null;

  const md = fs.readFileSync(mdPath, 'utf8');
  const newMd = regenerateSection(md, scenarios);
  if (newMd === null) return null;

  if (newMd === md) return { slug: persona.slug, changed: false };
  if (!CHECK_ONLY) fs.writeFileSync(mdPath, newMd);
  return { slug: persona.slug, changed: true };
}

function main() {
  const personas = listPersonas(REPO_ROOT).filter((p) => p.core !== false);
  const results = personas.map(syncOne).filter(Boolean);
  const changed = results.filter((r) => r.changed);

  for (const r of results) {
    console.log(`  ${r.changed ? (CHECK_ONLY ? '会变更' : '已生成') : '无变化'}: ${r.slug}.md`);
  }

  if (CHECK_ONLY && changed.length > 0) {
    console.error(`\n✘ ${changed.length} 个 persona 的情景剧本表与 persona-card.json 不同步（运行不带 --check 重新生成并提交）`);
    process.exit(1);
  }
  console.log(CHECK_ONLY ? '\n✔ 所有情景剧本表与 card 同步' : '\n✔ 同步完成');
}

module.exports = { renderTable, regenerateSection };

if (require.main === module) main();

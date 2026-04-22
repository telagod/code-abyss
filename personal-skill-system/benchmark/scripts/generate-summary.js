#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const SCORE_KEYS = [
  'route_correctness',
  'reasoning_quality',
  'validation_completeness',
  'final_correctness',
  'risk_handling_quality'
];

function parseArgs(argv) {
  const args = {
    root: path.resolve(__dirname, '..'),
    output: null
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--root') {
      const next = argv[i + 1];
      if (next) {
        args.root = path.resolve(next);
        i += 1;
      }
      continue;
    }
    if (token === '--output') {
      const next = argv[i + 1];
      if (next) {
        args.output = path.resolve(next);
        i += 1;
      }
      continue;
    }
  }

  args.output = args.output || path.join(args.root, 'summary.generated.json');
  return args;
}

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const text = raw.replace(/^\uFEFF/, '');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function hasFile(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function toBenchmarkRelative(root, target) {
  const rel = path.relative(root, target).split(path.sep).join('/');
  return rel ? `benchmark/${rel}` : 'benchmark';
}

function toIsoOrEpoch(input) {
  const value = String(input || '').trim();
  if (!value) return '1970-01-01T00:00:00Z';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '1970-01-01T00:00:00Z';
  return d.toISOString();
}

function normalizeAverages(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  for (const key of SCORE_KEYS) {
    const value = raw[key];
    out[key] = Number.isFinite(value) ? value : null;
  }
  return out;
}

function normalizeTaskCounts(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    total: Number.isFinite(raw.total) ? raw.total : 0,
    scored: Number.isFinite(raw.scored) ? raw.scored : 0,
    failed: Number.isFinite(raw.failed) ? raw.failed : 0
  };
}

function normalizeFailureBreakdown(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    route: Number.isFinite(raw.route) ? raw.route : 0,
    depth: Number.isFinite(raw.depth) ? raw.depth : 0,
    tool: Number.isFinite(raw.tool) ? raw.tool : 0,
    host: Number.isFinite(raw.host) ? raw.host : 0,
    none: Number.isFinite(raw.none) ? raw.none : 0
  };
}

function buildRunEntry(root, runsDir, dirent) {
  const runDir = path.join(runsDir, dirent.name);
  const runMetaPath = path.join(runDir, 'run.meta.json');
  const scorecardPath = path.join(runDir, 'scorecard.json');
  const resultsPath = path.join(runDir, 'results.ndjson');
  const notesPath = path.join(runDir, 'notes.md');

  const runMeta = readJsonIfExists(runMetaPath) || {};
  const scorecard = readJsonIfExists(scorecardPath) || {};

  const files = {
    run_meta: hasFile(runMetaPath),
    scorecard: hasFile(scorecardPath),
    results_ndjson: hasFile(resultsPath),
    notes: hasFile(notesPath)
  };

  const runId = String(runMeta.run_id || dirent.name);
  const createdAt = toIsoOrEpoch(runMeta.created_at);
  const entry = {
    run_id: runId,
    path: toBenchmarkRelative(root, runDir),
    host: String(runMeta.host || 'unknown'),
    model: String(runMeta.model || 'unknown'),
    variant: String(runMeta.variant || 'unknown'),
    status: files.run_meta && files.scorecard ? 'complete' : 'incomplete',
    created_at: createdAt,
    task_counts: normalizeTaskCounts(scorecard.task_counts),
    averages: normalizeAverages(scorecard.averages),
    failure_breakdown: normalizeFailureBreakdown(scorecard.failure_breakdown),
    files
  };

  return entry;
}

function listRunEntries(root) {
  const runsDir = path.join(root, 'runs');
  if (!fs.existsSync(runsDir)) return [];
  const dirents = fs.readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return dirents.map((d) => buildRunEntry(root, runsDir, d));
}

function byCreatedDesc(a, b) {
  return b.created_at.localeCompare(a.created_at);
}

function numericOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function buildDelta(leftAverages, rightAverages) {
  if (!leftAverages || !rightAverages) return null;
  const delta = {};
  let hasValue = false;
  for (const key of SCORE_KEYS) {
    const left = numericOrNull(leftAverages[key]);
    const right = numericOrNull(rightAverages[key]);
    delta[key] = left === null || right === null ? null : right - left;
    if (delta[key] !== null) hasValue = true;
  }
  return hasValue ? delta : null;
}

function buildComparisons(runEntries) {
  const groups = new Map();
  for (const run of runEntries) {
    const key = `${run.host}|${run.model}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(run);
  }

  const baseVsBasePlusSkills = [];
  const basePlusSkillsVsStrongerModel = [];

  for (const [key, group] of groups.entries()) {
    const sorted = [...group].sort(byCreatedDesc);
    const latestByVariant = new Map();
    for (const run of sorted) {
      if (!latestByVariant.has(run.variant)) latestByVariant.set(run.variant, run);
    }

    const [host, model] = key.split('|');
    const base = latestByVariant.get('base');
    const plus = latestByVariant.get('base-plus-skills');
    const stronger = latestByVariant.get('stronger-model');

    if (base && plus) {
      baseVsBasePlusSkills.push({
        host,
        model,
        left_run_id: base.run_id,
        right_run_id: plus.run_id,
        delta: buildDelta(base.averages, plus.averages),
        notes: 'Delta = base-plus-skills - base'
      });
    }

    if (plus && stronger) {
      basePlusSkillsVsStrongerModel.push({
        host,
        model,
        left_run_id: plus.run_id,
        right_run_id: stronger.run_id,
        delta: buildDelta(plus.averages, stronger.averages),
        notes: 'Delta = stronger-model - base-plus-skills'
      });
    }
  }

  return {
    base_vs_base_plus_skills: baseVsBasePlusSkills,
    base_plus_skills_vs_stronger_model: basePlusSkillsVsStrongerModel
  };
}

function buildSummary(root, runEntries) {
  const comparisonViews = buildComparisons(runEntries);
  const anyIncomplete = runEntries.some((run) => run.status !== 'complete');
  const status = runEntries.length === 0 ? 'empty' : anyIncomplete ? 'partial' : 'ok';

  return {
    schema_version: 2,
    generated_at: new Date().toISOString(),
    benchmark_root: 'benchmark',
    status,
    run_count: runEntries.length,
    run_index: runEntries,
    comparison_views: comparisonViews,
    notes: 'Generated by benchmark/scripts/generate-summary.js'
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const runEntries = listRunEntries(args.root);
  const summary = buildSummary(args.root, runEntries);

  fs.writeFileSync(args.output, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  process.stdout.write(`Generated benchmark summary at ${args.output}\n`);
}

main();

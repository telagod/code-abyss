#!/usr/bin/env node
'use strict';

// scripts/persona-battery/capture-transcript.js
// Drives a real installed `claude` target through all 10 persona-battery
// probes and writes a transcript JSON file that
// scripts/persona-battery/run.js can then score.
//
// Scoped to ONE target (claude) — Codex/Gemini/OpenClaw have no verified
// headless-invocation contract in this repo; building drivers for them now
// would be unverified-assumption risk for no proven benefit. Manual capture
// (paste each probe's `situation` into a fresh session, save the reply)
// remains the documented path for those three targets.
//
// Costs one real API call per probe — never wired into a default npm script
// or CI trigger; always invoked explicitly (see .github/workflows/persona-battery.yml).
//
// Usage:
//   node scripts/persona-battery/capture-transcript.js --persona abyss --style <slug> --out transcript.json
//
// The subject call runs with the persona's real installed config (unlike the
// judge in judge.js, this is NOT --bare) and needs `claude auth login` or
// ANTHROPIC_API_KEY set on the machine running this.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { invokeClaude } = require('./lib/claude-cli.js');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const out = { persona: null, style: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--persona' && argv[i + 1]) out.persona = argv[++i];
    else if (argv[i] === '--style' && argv[i + 1]) out.style = argv[++i];
    else if (argv[i] === '--out' && argv[i + 1]) out.out = argv[++i];
  }
  return out;
}

function installPersona({ persona, style, home }) {
  const installArgs = [path.join(REPO_ROOT, 'bin', 'install.js'), '--target', 'claude', '-y'];
  if (persona) installArgs.push('--persona', persona);
  if (style) installArgs.push('--style', style);

  const result = spawnSync(process.execPath, installArgs, {
    env: { ...process.env, HOME: home },
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`persona install failed (exit ${result.status}):\n${result.stderr || result.stdout}`);
  }
}

function main() {
  const { persona, style, out } = parseArgs(process.argv.slice(2));
  if (!out) {
    console.error('usage: node scripts/persona-battery/capture-transcript.js --persona <slug> --style <slug> --out <path.json>');
    process.exit(2);
  }

  const probes = JSON.parse(fs.readFileSync(path.join(__dirname, 'probes.json'), 'utf8')).probes;

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-battery-home-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-battery-cwd-'));
  const transcript = {};

  try {
    console.log(`installing persona=${persona || '(default)'} style=${style || '(default)'} into scratch HOME...`);
    installPersona({ persona, style, home });

    for (const probe of probes) {
      process.stdout.write(`  ${probe.id}... `);
      const result = invokeClaude({
        prompt: probe.situation,
        home,
        cwd,
        extraArgs: ['--tools', '', '--no-session-persistence'],
      });
      if (!result) {
        console.log('FAILED (no response captured — skipped, not faked)');
        continue;
      }
      transcript[probe.id] = result.text;
      console.log('captured');
    }
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }

  fs.writeFileSync(out, JSON.stringify(transcript, null, 2) + '\n');
  console.log(`\nwrote ${Object.keys(transcript).length}/${probes.length} probe responses -> ${out}`);
}

if (require.main === module) main();

module.exports = { parseArgs, installPersona };

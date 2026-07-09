'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

const {
  buildDoctorReport,
  formatDoctorReport,
  composeHostGuidance,
  measureComposeBudget,
  COMPOSE_BUDGET_CAP,
} = require('../bin/lib/runtime-control');
const { renderRuntimeGuidance } = require('../bin/lib/style-registry');

const projectRoot = path.join(__dirname, '..');
const installJs = path.join(projectRoot, 'bin', 'install.js');

describe('runtime-control doctor', () => {
  test('buildDoctorReport exposes version, abyss signal, kernel, budget', () => {
    const report = buildDoctorReport({ projectRoot, HOME: os.homedir(), target: 'claude' });
    expect(report.package.name).toBe('code-abyss');
    expect(report.package.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(report.abyss).toHaveProperty('present');
    expect(report.abyss.minRequired).toBeTruthy();
    expect(report.kernel).toHaveProperty('present');
    expect(report.composeBudget.length).toBeGreaterThan(100);
    expect(report.composeBudget.cap).toBe(COMPOSE_BUDGET_CAP);
    expect(report.composeBudget.underBudget).toBe(true);
    expect(report.enforcement).toHaveProperty('on');
    const text = formatDoctorReport(report);
    expect(text).toContain('code-abyss doctor');
    expect(text).toContain('compose budget');
  });

  test('CLI doctor exits 0 and prints budget line', () => {
    const r = spawnSync(process.execPath, [installJs, 'doctor'], {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('code-abyss doctor');
    expect(r.stdout).toMatch(/compose budget:/);
  });

  test('collectMigrationHints surfaces missing inject / attach path', () => {
    const { collectMigrationHints } = require('../bin/lib/runtime-control');
    const hints = collectMigrationHints({
      abyss: { present: false, minRequired: '0.5.20' },
      kernel: { present: true },
      enforcement: { target: 'claude', on: false },
      injectPlane: { present: false, path: '/tmp/.claude/.code-abyss-inject.md' },
      composeBudget: { underBudget: true, length: 100, cap: 8000 },
    });
    const blob = hints.join('\n');
    expect(blob).toMatch(/abyss CLI missing|install\.sh/);
    expect(blob).toMatch(/Stop-hook OFF|no-enforcement/);
    expect(blob).toMatch(/inject plane missing/);
    expect(blob).toMatch(/abyss attach claude/);
  });
});

describe('runtime-control compose', () => {
  test('composeHostGuidance matches renderRuntimeGuidance engine identity', () => {
    const persona = 'abyss';
    const style = 'abyss-cultivator';
    const expected = renderRuntimeGuidance(projectRoot, style, 'codex', persona);
    const r = composeHostGuidance({
      projectRoot,
      target: 'claude',
      personaSlug: persona,
      styleSlug: style,
      write: false,
    });
    expect(r.guidance).toBe(expected);
    expect(r.guidance).toContain('## 人格');
    expect(r.guidance).toContain('内核边界');
  });

  test('compose writes CLAUDE.md without skill tree when write=true', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'compose-home-'));
    try {
      const r = composeHostGuidance({
        projectRoot,
        target: 'claude',
        personaSlug: 'abyss',
        styleSlug: 'scholar-classic',
        HOME: tmp,
        write: true,
      });
      expect(r.wrote).toBe(true);
      expect(fs.existsSync(r.destPath)).toBe(true);
      expect(fs.readFileSync(r.destPath, 'utf8')).toBe(r.guidance);
      // no full skill tree copy
      expect(fs.existsSync(path.join(tmp, '.claude', 'skills'))).toBe(false);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('CLI compose --stdout matches engine', () => {
    const expected = renderRuntimeGuidance(projectRoot, 'abyss-cultivator', 'codex', 'abyss');
    const r = spawnSync(
      process.execPath,
      [installJs, 'compose', '-t', 'claude', '--persona', 'abyss', '--style', 'abyss-cultivator', '--stdout'],
      { cwd: projectRoot, encoding: 'utf8' }
    );
    expect(r.status).toBe(0);
    expect(r.stdout).toBe(expected);
  });

  test('measureComposeBudget under cap', () => {
    const b = measureComposeBudget(projectRoot);
    expect(b.underBudget).toBe(true);
    expect(b.headroom).toBeGreaterThan(0);
  });
});

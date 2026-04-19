'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { generateDocs } = require('../personal-skill-system/skills/tools/lib/doc-module-analysis');
const { analyzeQuality } = require('../personal-skill-system/skills/tools/lib/quality-analysis');
const { analyzeSecurity } = require('../personal-skill-system/skills/tools/lib/security-analysis');
const { analyzeSkillSystem } = require('../personal-skill-system/skills/tools/lib/skill-system');
const { classifySensitiveChangeSurface, buildChangeRisk } = require('../personal-skill-system/skills/tools/lib/change-analysis');

describe('personal skill system tool runtime', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pss-tools-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('generateDocs builds engineering-grade scaffold sections', () => {
    const report = generateDocs(tmpDir, { write: false });

    expect(report.preview['README.md']).toContain('## Public Surface');
    expect(report.preview['README.md']).toContain('## Verification');
    expect(report.preview['DESIGN.md']).toContain('## Dependencies');
    expect(report.preview['DESIGN.md']).toContain('## Failure Modes');
  });

  test('analyzeQuality detects python-specific maintainability smells', () => {
    const sample = path.join(tmpDir, 'bad.py');
    fs.writeFileSync(sample, [
      'def bad(items=[]):',
      '    try:',
      '        return items',
      '    except:',
      '        return []',
      ''
    ].join('\n'));

    const report = analyzeQuality(tmpDir, {});
    const messages = report.issues.map(item => item.message);

    expect(messages).toContain('mutable default argument detected');
    expect(messages).toContain('bare except clause hides unexpected failures');
  });

  test('analyzeSecurity detects unsafe deserialization and tls bypass', () => {
    const py = path.join(tmpDir, 'loader.py');
    const js = path.join(tmpDir, 'client.js');
    fs.writeFileSync(py, 'import yaml\ncfg = yaml.load(user_input)\n');
    fs.writeFileSync(js, 'https.request(url, { rejectUnauthorized: false })\n');

    const report = analyzeSecurity(tmpDir, {});
    const messages = report.findings.map(item => item.message);

    expect(messages).toContain('yaml.load may deserialize unsafe input');
    expect(messages).toContain('TLS verification appears disabled');
  });

  test('change risk helpers flag auth and config surfaces with stronger checks', () => {
    const sensitive = classifySensitiveChangeSurface([
      'src/auth/login.js',
      'config/deploy.yaml'
    ]);

    expect(sensitive).toEqual(expect.arrayContaining(['auth', 'config']));

    const risk = buildChangeRisk(
      { files: ['src/auth/login.js', 'config/deploy.yaml', 'src/api/handler.ts'] },
      { code: 2, doc: 0, test: 0, config: 1, asset: 0, other: 0 },
      ['src', 'config'],
      sensitive
    );

    expect(['medium', 'high', 'critical']).toContain(risk.level);
    expect(risk.recommendedChecks).toEqual(expect.arrayContaining(['verify-security', 'ship']));
  });

  test('analyzeSkillSystem passes on the portable bundle', () => {
    const target = path.join(__dirname, '..', 'personal-skill-system');
    const report = analyzeSkillSystem(target);

    expect(report.status).toBe('pass');
    expect(report.metrics.skillFiles).toBeGreaterThan(0);
    expect(report.metrics.routeFixtures).toBeGreaterThan(0);
  });
});

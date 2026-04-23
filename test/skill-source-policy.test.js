'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { analyzeSkillSourcePolicy, packagePolicyIncludesPath } = require('../bin/lib/skill-source-policy');

function writeSkill(rootDir, relPath, frontmatter) {
  const dir = path.join(rootDir, relPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n# Skill\n`);
}

function writeAbyssManifest(projectRoot, hostSkillSource = 'personal-skill-system/skills') {
  const manifestPath = path.join(projectRoot, 'packs', 'abyss', 'manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify({
    name: 'abyss',
    description: 'fixture',
    hosts: {
      claude: {
        files: [
          { src: hostSkillSource, dest: 'skills', root: 'claude' },
        ],
      },
      codex: {
        files: [
          { src: hostSkillSource, dest: 'skills', root: 'codex' },
        ],
      },
      gemini: {
        files: [
          { src: hostSkillSource, dest: 'skills', root: 'gemini' },
        ],
      },
    },
  }, null, 2));
}

describe('skill source policy', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-source-policy-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('package policy path matcher accepts parent directory coverage', () => {
    expect(packagePolicyIncludesPath(['personal-skill-system/'], 'personal-skill-system/skills')).toBe(true);
    expect(packagePolicyIncludesPath(['skills/'], 'personal-skill-system/skills')).toBe(false);
  });

  test('passes when package ships the authoritative source and packs route hosts to it directly', () => {
    const sourceDir = path.join(tmpDir, 'personal-skill-system', 'skills');
    const packageJsonPath = path.join(tmpDir, 'package.json');

    writeSkill(sourceDir, 'routers/sage', 'name: sage\ndescription: router\nuser-invocable: false');
    writeSkill(sourceDir, 'tools/verify-skill-system', 'name: verify-skill-system\ndescription: verifier\nuser-invocable: true');
    fs.writeFileSync(packageJsonPath, JSON.stringify({
      name: 'fixture',
      version: '0.0.0',
      files: ['bin/', 'personal-skill-system/'],
    }, null, 2));
    writeAbyssManifest(tmpDir);

    const report = analyzeSkillSourcePolicy({
      projectRoot: tmpDir,
      packageJsonPath,
      authoritativeSystemDir: path.join(tmpDir, 'personal-skill-system'),
      authoritativeSkillsDir: sourceDir,
    });

    expect(report.status).toBe('pass');
    expect(report.packagePolicy.includesAuthoritativeSkillsDir).toBe(true);
    expect(report.packagePolicy.includesRootMirrorDir).toBe(false);
    expect(report.distributionPolicy.usesAuthoritativeSourceDirectly).toBe(true);
  });

  test('fails when package excludes the authoritative source and distribution still points at the legacy mirror', () => {
    const sourceDir = path.join(tmpDir, 'personal-skill-system', 'skills');
    const mirrorDir = path.join(tmpDir, 'skills');
    const packageJsonPath = path.join(tmpDir, 'package.json');

    writeSkill(sourceDir, 'routers/sage', 'name: sage\ndescription: router\nuser-invocable: false');
    writeSkill(sourceDir, 'workflows/review', 'name: review\ndescription: workflow\nuser-invocable: true');
    writeSkill(mirrorDir, '', 'name: sage\ndescription: router\nuser-invocable: false');
    fs.writeFileSync(packageJsonPath, JSON.stringify({
      name: 'fixture',
      version: '0.0.0',
      files: ['skills/'],
    }, null, 2));
    writeAbyssManifest(tmpDir, 'skills');

    const report = analyzeSkillSourcePolicy({
      projectRoot: tmpDir,
      packageJsonPath,
      authoritativeSystemDir: path.join(tmpDir, 'personal-skill-system'),
      authoritativeSkillsDir: sourceDir,
      rootMirrorDir: mirrorDir,
    });

    expect(report.status).toBe('fail');
    expect(report.packagePolicy.includesAuthoritativeSkillsDir).toBe(false);
    expect(report.packagePolicy.includesRootMirrorDir).toBe(true);
    expect(report.distributionPolicy.distributionHostsUsingLegacyMirror).toEqual(['claude', 'codex', 'gemini']);
    expect(report.gaps.missingSkillPaths).toEqual(expect.arrayContaining(['routers/sage', 'workflows/review']));
    expect(report.gaps.extraSkillPaths).toEqual(expect.arrayContaining(['.']));
    expect(report.gaps.canonicalPathMismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'sage',
        authoritativePath: 'routers/sage',
        rootMirrorPath: '.',
      }),
    ]));
  });

  test('reports the current repo mirror gaps against the authoritative source', () => {
    const report = analyzeSkillSourcePolicy({
      projectRoot: path.join(__dirname, '..'),
    });

    expect(report.status).toBe('pass');
    expect(report.packagePolicy.includesAuthoritativeSkillsDir).toBe(true);
    expect(report.packagePolicy.includesAuthoritativeSystemDir).toBe(true);
    expect(report.packagePolicy.includesRootMirrorDir).toBe(false);
    expect(report.distributionPolicy.usesAuthoritativeSourceDirectly).toBe(true);
    expect(report.distributionPolicy.hostSkillSources).toEqual({
      claude: 'personal-skill-system/skills',
      codex: 'personal-skill-system/skills',
      gemini: 'personal-skill-system/skills',
    });
    expect(report.metrics.authoritativeSkillCount).toBe(33);
    expect(report.gaps.missingSkillPaths).toEqual(expect.arrayContaining([
      'routers/sage',
      'workflows/review',
    ]));
  });
});

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

const verifySkillsPath = path.join(__dirname, '..', 'bin', 'verify-skills-contract.js');
const skillContractFixturesDir = path.join(__dirname, 'fixtures', 'skill-contract');

const { parseFrontmatter } = require('../bin/lib/utils');
const {
  collectSkills,
  collectInvocableSkills,
  resolveExecutableSkillScript,
} = require('../bin/lib/skill-registry');
const { scanInvocableSkills } = require('../bin/install');

describe('parseFrontmatter', () => {
  test('解析标准 frontmatter', () => {
    const content = '---\nname: gen-docs\ndescription: 文档生成器\n---\n\n# Body';
    const meta = parseFrontmatter(content);
    expect(meta).not.toBeNull();
    expect(meta.name).toBe('gen-docs');
    expect(meta.description).toBe('文档生成器');
  });

  test('无 frontmatter 返回 null', () => {
    expect(parseFrontmatter('# Just a heading\n\nNo frontmatter here.')).toBeNull();
    expect(parseFrontmatter('')).toBeNull();
  });

  test('剥离引号包裹的值', () => {
    const content = '---\nname: "quoted-name"\ndescription: \'single-quoted\'\n---';
    const meta = parseFrontmatter(content);
    expect(meta.name).toBe('quoted-name');
    expect(meta.description).toBe('single-quoted');
  });

  test('支持 key 中的连字符', () => {
    const content = '---\nuser-invocable: true\nargument-hint: <path>\nallowed-tools: Bash, Read\n---';
    const meta = parseFrontmatter(content);
    expect(meta['user-invocable']).toBe('true');
    expect(meta['argument-hint']).toBe('<path>');
    expect(meta['allowed-tools']).toBe('Bash, Read');
  });

  test('无效行抛出错误', () => {
    const content = '---\nname: test\n\n  # comment-like\nbad line without colon\ndescription: ok\n---';
    expect(() => parseFrontmatter(content)).toThrow('frontmatter 第 4 行格式无效');
  });

  test('处理 Windows 换行符 (CRLF)', () => {
    const content = '---\r\nname: win-test\r\ndescription: crlf\r\n---\r\n\r\nBody';
    const meta = parseFrontmatter(content);
    expect(meta).not.toBeNull();
    expect(meta.name).toBe('win-test');
  });
});

describe('skill registry', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-registry-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function resetTmpDir() {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-registry-test-'));
  }

  function makeSkill(relPath, frontmatter, withScript, scriptName = 'run.js') {
    const dir = path.join(tmpDir, relPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n# Skill`);
    if (withScript) {
      const scriptsDir = path.join(dir, 'scripts');
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(path.join(scriptsDir, scriptName), '// noop');
    }
  }

  test('collectSkills 返回标准化 skill 记录', () => {
    makeSkill(
      'tools/gen-docs',
      'name: gen-docs\ndescription: docs\nuser-invocable: true\nallowed-tools: Bash, Read\nargument-hint: <path>',
      true
    );
    makeSkill('domains/frontend-design', 'name: frontend-design\ndescription: design\nuser-invocable: false', false);

    const skills = collectSkills(tmpDir);
    expect(skills).toHaveLength(2);

    const genDocs = skills.find(s => s.name === 'gen-docs');
    expect(genDocs.relPath).toBe(path.join('tools', 'gen-docs'));
    expect(genDocs.category).toBe('tool');
    expect(genDocs.userInvocable).toBe(true);
    expect(genDocs.allowedTools).toEqual(['Bash', 'Read']);
    expect(genDocs.argumentHint).toBe('<path>');
    expect(genDocs.runtimeType).toBe('scripted');
    expect(genDocs.hasScripts).toBe(true);
    expect(genDocs.scriptPath).toBe(path.join(tmpDir, 'tools', 'gen-docs', 'scripts', 'run.js'));
    expect(genDocs.skillPath).toBe(path.join(tmpDir, 'tools', 'gen-docs', 'SKILL.md'));
    expect(genDocs.meta['user-invocable']).toBe('true');
    expect(genDocs.kind).toBeUndefined();
    expect(genDocs['user-invocable']).toBeUndefined();
    expect(genDocs['allowed-tools']).toBeUndefined();
    expect(genDocs['argument-hint']).toBeUndefined();

    const frontendDesign = skills.find(s => s.name === 'frontend-design');
    expect(frontendDesign.category).toBe('domain');
    expect(frontendDesign.runtimeType).toBe('knowledge');
    expect(frontendDesign.allowedTools).toEqual(['Read']);
  });

  test('collectSkills 从 permissions 回落到 allowedTools', () => {
    makeSkill(
      'tools/verify-skill-system',
      'name: verify-skill-system\ndescription: verify bundle\nuser-invocable: true\npermissions: [Read, Glob, Bash]',
      true
    );

    const skills = collectSkills(tmpDir);
    expect(skills[0].allowedTools).toEqual(['Read', 'Glob', 'Bash']);
  });

  test('collectInvocableSkills 只返回 user-invocable skills', () => {
    makeSkill('tools/gen-docs', 'name: gen-docs\ndescription: docs\nuser-invocable: true', true);
    makeSkill('domains/frontend-design', 'name: frontend-design\ndescription: design\nuser-invocable: false', false);

    const skills = collectInvocableSkills(tmpDir);
    expect(skills.map(s => s.name)).toEqual(['gen-docs']);
  });

  test('resolveExecutableSkillScript 区分缺失与无脚本', () => {
    makeSkill('tools/gen-docs', 'name: gen-docs\ndescription: docs\nuser-invocable: true', true);
    makeSkill('domains/frontend-design', 'name: frontend-design\ndescription: design\nuser-invocable: true', false);

    const ok = resolveExecutableSkillScript(tmpDir, 'gen-docs');
    expect(ok.reason).toBeNull();
    expect(ok.scriptPath).toContain(path.join('tools', 'gen-docs', 'scripts', 'run.js'));

    const noScript = resolveExecutableSkillScript(tmpDir, 'frontend-design');
    expect(noScript.reason).toBe('no-script');
    expect(noScript.skill.name).toBe('frontend-design');
    expect(noScript.scriptPath).toBeNull();

    const missing = resolveExecutableSkillScript(tmpDir, 'missing');
    expect(missing.reason).toBe('missing');
    expect(missing.skill).toBeNull();
  });

  test('collectSkills 在 frontmatter 缺失时立即失败', () => {
    const dir = path.join(tmpDir, 'tools', 'broken');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), '# missing frontmatter');

    expect(() => collectSkills(tmpDir)).toThrow(/缺少可解析的 frontmatter/);
  });

  test('collectSkills 在 frontmatter 行格式错误时立即失败', () => {
    makeSkill('tools/broken', 'name: broken\ndescription: bad\nuser-invocable: true\ninvalid line', false);
    expect(() => collectSkills(tmpDir)).toThrow(/frontmatter 第 4 行格式无效/);
  });

  test('collectSkills 拒绝缺少必填字段', () => {
    makeSkill('tools/no-name', 'description: docs\nuser-invocable: true', false);
    expect(() => collectSkills(tmpDir)).toThrow(/缺少必填 frontmatter 字段 'name'/);

    resetTmpDir();
    makeSkill('tools/no-description', 'name: no-description\nuser-invocable: true', false);
    expect(() => collectSkills(tmpDir)).toThrow(/缺少必填 frontmatter 字段 'description'/);

    resetTmpDir();
    makeSkill('tools/no-flag', 'name: no-flag\ndescription: docs', false);
    expect(() => collectSkills(tmpDir)).toThrow(/缺少必填 frontmatter 字段 'user-invocable'/);
  });

  test('collectSkills 拒绝非法 name slug', () => {
    makeSkill('tools/bad-name', 'name: Bad_Name\ndescription: docs\nuser-invocable: true', false);
    expect(() => collectSkills(tmpDir)).toThrow(/name 必须是 kebab-case slug/);
  });

  test('collectSkills 拒绝非法 allowed-tools', () => {
    makeSkill(
      'tools/bad-tools',
      'name: bad-tools\ndescription: docs\nuser-invocable: true\nallowed-tools: Bash, bad-tool',
      false
    );
    expect(() => collectSkills(tmpDir)).toThrow(/allowed-tools 包含非法值 'bad-tool'/);
  });

  test('collectSkills 拒绝重复 skill name', () => {
    makeSkill('tools/one', 'name: duplicate\ndescription: docs\nuser-invocable: true', false);
    makeSkill('domains/two', 'name: duplicate\ndescription: docs\nuser-invocable: false', false);
    expect(() => collectSkills(tmpDir)).toThrow(/重复的 skill name 'duplicate'/);
  });

  test('collectSkills 拒绝多个脚本入口', () => {
    makeSkill('tools/multi-script', 'name: multi-script\ndescription: docs\nuser-invocable: true', true, 'a.js');
    const scriptsDir = path.join(tmpDir, 'tools', 'multi-script', 'scripts');
    fs.writeFileSync(path.join(scriptsDir, 'b.js'), '// noop');
    expect(() => collectSkills(tmpDir)).toThrow(/只能有一个 \.js 入口/);
  });
});

describe('scanInvocableSkills', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-scan-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function makeSkill(relPath, frontmatter, withScript) {
    const dir = path.join(tmpDir, relPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n# Skill`);
    if (withScript) {
      const scriptsDir = path.join(dir, 'scripts');
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(path.join(scriptsDir, 'run.js'), '// noop');
    }
  }

  test('仅返回 user-invocable: true 的 skill', () => {
    makeSkill('tools/gen-docs', 'name: gen-docs\ndescription: gen docs\nuser-invocable: true', true);
    makeSkill('tools/verify-module', 'name: verify-module\ndescription: verify module\nuser-invocable: true', true);
    makeSkill('domains/security', 'name: security\ndescription: security\nuser-invocable: false', false);

    const results = scanInvocableSkills(tmpDir);
    expect(results.length).toBe(2);
    const names = results.map(r => r.name).sort();
    expect(names).toEqual(['gen-docs', 'verify-module']);
  });

  test('正确检测 hasScripts', () => {
    makeSkill('tools/with-script', 'name: with-script\ndescription: with script\nuser-invocable: true', true);
    makeSkill('domains/no-script', 'name: no-script\ndescription: no script\nuser-invocable: true', false);

    const results = scanInvocableSkills(tmpDir);
    const withScript = results.find(r => r.name === 'with-script');
    const noScript = results.find(r => r.name === 'no-script');
    expect(withScript.hasScripts).toBe(true);
    expect(noScript.hasScripts).toBe(false);
  });

  test('返回正确的 relPath', () => {
    makeSkill('tools/gen-docs', 'name: gen-docs\ndescription: gen docs\nuser-invocable: true', true);
    const results = scanInvocableSkills(tmpDir);
    expect(results[0].relPath).toBe(path.join('tools', 'gen-docs'));
  });

  test('空目录返回空数组', () => {
    expect(scanInvocableSkills(tmpDir)).toEqual([]);
  });

  test('缺少必填 name 字段时报错', () => {
    makeSkill('tools/no-name', 'user-invocable: true\ndescription: no name field', false);
    expect(() => scanInvocableSkills(tmpDir)).toThrow("缺少必填 frontmatter 字段 'name'");
  });

  test('扫描真实 skills 目录', () => {
    const realSkillsDir = path.join(__dirname, '..', 'personal-skill-system', 'skills');
    if (!fs.existsSync(realSkillsDir)) return;

    const results = scanInvocableSkills(realSkillsDir);
    expect(results.length).toBeGreaterThanOrEqual(20);

    const names = results.map(r => r.name);
    expect(names).toContain('gen-docs');
    expect(names).toContain('verify-module');
    expect(names).toContain('frontend-design');
    expect(names).toContain('review');
  });
});

describe('verify:skills CLI', () => {
  test('验证真实 skills 目录通过', () => {
    const result = spawnSync(process.execPath, [verifySkillsPath], {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('技能契约验证通过');
  });

  test('无效 fixture 目录会阻断验证', () => {
    const result = spawnSync(process.execPath, [verifySkillsPath], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        SAGE_SKILLS_DIR: path.join(skillContractFixturesDir, 'invalid-tools'),
      },
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("allowed-tools 包含非法值 'bad-tool'");
  });
});

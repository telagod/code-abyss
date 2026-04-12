'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  scanInvocableSkills,
  generateCommandContent,
  generateGeminiCommandContent,
  installGeneratedCommands,
} = require('../bin/install');

describe('generateCommandContent', () => {
  test('有脚本的 skill: 包含一气呵成指令流', () => {
    const meta = {
      name: 'gen-docs',
      description: '文档生成器',
      argumentHint: '<模块路径> [--force]',
      allowedTools: 'Bash, Read, Write, Glob',
    };
    const content = generateCommandContent(meta, 'tools/gen-docs', 'scripted');

    expect(content).toMatch(/^---\n/);
    expect(content).toContain('name: gen-docs');
    expect(content).toContain('description: "文档生成器"');
    expect(content).toContain('argument-hint: "<模块路径> [--force]"');
    expect(content).toContain('allowed-tools: Bash, Read, Write, Glob');
    expect(content).toContain('一气呵成');
    expect(content).toContain('不要在步骤间停顿');
    expect(content).toContain('不要停顿');
    expect(content).toContain('~/.claude/skills/tools/gen-docs/SKILL.md');
    expect(content).toContain('node ~/.claude/skills/run_skill.js gen-docs $ARGUMENTS');
  });

  test('无脚本的 skill: 知识库模式', () => {
    const meta = {
      name: 'frontend-design',
      description: '前端设计美学秘典',
      allowedTools: 'Read',
    };
    const content = generateCommandContent(meta, 'domains/frontend-design', 'knowledge');

    expect(content).toContain('name: frontend-design');
    expect(content).toContain('allowed-tools: Read');
    expect(content).toContain('读取以下秘典');
    expect(content).toContain('~/.claude/skills/domains/frontend-design/SKILL.md');
    expect(content).not.toContain('run_skill.js');
    expect(content).not.toContain('一气呵成');
  });

  test('无 argument-hint 时不输出该字段', () => {
    const meta = {
      name: 'test-skill',
      description: 'test',
    };
    const content = generateCommandContent(meta, 'test', 'knowledge');
    expect(content).not.toContain('argument-hint');
  });

  test('无 allowed-tools 时默认 Read', () => {
    const meta = { name: 'minimal', description: 'minimal skill' };
    const content = generateCommandContent(meta, 'minimal', 'knowledge');
    expect(content).toContain('allowed-tools: Read');
  });

  test('description 中的双引号被转义', () => {
    const meta = { name: 'escaped', description: 'has "quotes" inside' };
    const content = generateCommandContent(meta, 'test', 'knowledge');
    expect(content).toContain('description: "has \\"quotes\\" inside"');
  });

});

describe('installGeneratedCommands', () => {
  let tmpDir, targetDir, backupDir, manifest;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-cmd-test-'));
    targetDir = path.join(tmpDir, 'target');
    backupDir = path.join(tmpDir, 'backup');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(backupDir, { recursive: true });
    manifest = { target: 'claude', installed: [], backups: [] };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function makeSkillDir(base, relPath, frontmatter, withScript) {
    const dir = path.join(base, relPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n# Skill`);
    if (withScript) {
      const scriptsDir = path.join(dir, 'scripts');
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(path.join(scriptsDir, 'run.js'), '// noop');
    }
  }

  test('为 user-invocable skill 生成 command 文件', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(
      skillsSrc,
      'tools/gen-docs',
      'name: gen-docs\ndescription: gen docs\nuser-invocable: true',
      true
    );
    makeSkillDir(
      skillsSrc,
      'tools/verify-module',
      'name: verify-module\ndescription: verify module\nuser-invocable: true',
      true
    );

    const count = installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);

    expect(count).toBe(2);
    expect(fs.existsSync(path.join(targetDir, 'commands', 'gen-docs.md'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'commands', 'verify-module.md'))).toBe(true);
    expect(manifest.installed).toContainEqual({ root: 'claude', path: 'commands/gen-docs.md' });
    expect(manifest.installed).toContainEqual({ root: 'claude', path: 'commands/verify-module.md' });
  });

  test('已存在的 command 文件被备份', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(skillsSrc, 'tools/gen-docs', 'name: gen-docs\ndescription: gen docs\nuser-invocable: true', true);

    const cmdsDir = path.join(targetDir, 'commands');
    fs.mkdirSync(cmdsDir, { recursive: true });
    fs.writeFileSync(path.join(cmdsDir, 'gen-docs.md'), 'old content');

    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);

    expect(fs.existsSync(path.join(backupDir, 'claude', 'commands', 'gen-docs.md'))).toBe(true);
    expect(fs.readFileSync(path.join(backupDir, 'claude', 'commands', 'gen-docs.md'), 'utf8')).toBe('old content');
    expect(manifest.backups).toContainEqual({ root: 'claude', path: 'commands/gen-docs.md' });

    const newContent = fs.readFileSync(path.join(cmdsDir, 'gen-docs.md'), 'utf8');
    expect(newContent).toContain('name: gen-docs');
    expect(newContent).not.toBe('old content');
  });

  test('无 user-invocable skill 时返回 0', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(skillsSrc, 'domains/security', 'name: security\ndescription: security\nuser-invocable: false', false);

    const count = installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);
    expect(count).toBe(0);
    expect(fs.existsSync(path.join(targetDir, 'commands'))).toBe(false);
  });

  test('生成的 command 文件内容格式正确', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(
      skillsSrc,
      'tools/gen-docs',
      'name: gen-docs\ndescription: gen docs\nuser-invocable: true\nargument-hint: <path>\nallowed-tools: Bash, Read',
      true
    );

    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);

    const content = fs.readFileSync(path.join(targetDir, 'commands', 'gen-docs.md'), 'utf8');
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('一气呵成');
    expect(content).toContain('run_skill.js gen-docs');
  });
});

describe('斜杠命令回归防护', () => {
  const realSkillsDir = path.join(__dirname, '..', 'skills');
  const skillsExist = fs.existsSync(realSkillsDir);
  const describeIf = skillsExist ? describe : describe.skip;

  describeIf('SKILL.md 路径有效性烟雾测试', () => {
    let invocableSkills;

    beforeAll(() => {
      invocableSkills = scanInvocableSkills(realSkillsDir);
    });

    test('至少存在 6 个 user-invocable skill', () => {
      expect(invocableSkills.length).toBeGreaterThanOrEqual(6);
    });

    test('所有 user-invocable skill 的 SKILL.md 路径必须真实存在', () => {
      const missing = [];

      invocableSkills.forEach((skill) => {
        const content = generateCommandContent(skill.meta, skill.relPath, 'knowledge');
        const match = content.match(/~\/\.claude\/skills\/(.+?\/SKILL\.md)/);
        expect(match).not.toBeNull();

        const extractedRelPath = match[1];
        const realPath = path.join(realSkillsDir, extractedRelPath);

        if (!fs.existsSync(realPath)) {
          missing.push({
            name: skill.name,
            expectedPath: realPath,
            relPath: extractedRelPath,
          });
        }
      });

      expect(missing).toEqual([]);
    });
  });

  describeIf('脚本引用完整性', () => {
    let invocableSkills;

    beforeAll(() => {
      invocableSkills = scanInvocableSkills(realSkillsDir);
    });

    test('有脚本的 skill 的 command 必须包含正确的 run_skill.js 调用', () => {
      const errors = [];

      invocableSkills
        .filter(s => s.hasScripts)
        .forEach((skill) => {
          const content = generateCommandContent(skill.meta, skill.relPath, skill.runtimeType);
          const expectedCall = `run_skill.js ${skill.name} $ARGUMENTS`;
          if (!content.includes(expectedCall)) {
            errors.push({
              name: skill.name,
              expected: expectedCall,
              issue: 'run_skill.js 调用缺失或格式错误',
            });
          }

          const scriptsDir = path.join(realSkillsDir, skill.relPath, 'scripts');
          const hasJsFiles = fs.existsSync(scriptsDir)
            && fs.readdirSync(scriptsDir).some(f => f.endsWith('.js'));
          if (!hasJsFiles) {
            errors.push({
              name: skill.name,
              scriptsDir,
              issue: 'scripts/ 目录不存在或无 .js 文件',
            });
          }
        });

      expect(errors).toEqual([]);
    });

    test('无脚本的 skill 不应引用 run_skill.js', () => {
      invocableSkills
        .filter(s => !s.hasScripts)
        .forEach((skill) => {
          const content = generateCommandContent(skill.meta, skill.relPath, skill.runtimeType);
          expect(content).not.toContain('run_skill.js');
        });
    });
  });

  describeIf('Codex skill metadata 路径一致性', () => {
    test('openai.yaml 默认提示词指向 ~/.agents/skills', () => {
      const metadataFiles = [
        'tools/gen-docs/agents/openai.yaml',
        'tools/verify-security/agents/openai.yaml',
        'tools/verify-module/agents/openai.yaml',
        'tools/verify-change/agents/openai.yaml',
        'tools/verify-quality/agents/openai.yaml',
        'domains/frontend-design/agents/openai.yaml',
      ];

      metadataFiles.forEach((relPath) => {
        const content = fs.readFileSync(path.join(realSkillsDir, relPath), 'utf8');
        expect(content).toContain('~/.agents/skills/');
        expect(content).not.toContain('~/.codex/skills/');
      });
    });
  });

  describeIf('command 文件名合法性', () => {
    test('每个 skill 的 name 符合合法文件名格式', () => {
      const invocableSkills = scanInvocableSkills(realSkillsDir);
      const invalid = [];

      invocableSkills.forEach((skill) => {
        if (!/^[a-z][a-z0-9-]*$/.test(skill.name)) {
          invalid.push({
            name: skill.name,
            issue: '名称不符合 /^[a-z][a-z0-9-]*$/ 格式',
          });
        }
      });

      expect(invalid).toEqual([]);
    });

    test('skill name 无重复（防止 command 文件冲突）', () => {
      const invocableSkills = scanInvocableSkills(realSkillsDir);
      const names = invocableSkills.map(s => s.name);
      const duplicates = names.filter((n, i) => names.indexOf(n) !== i);

      expect(duplicates).toEqual([]);
    });
  });
});

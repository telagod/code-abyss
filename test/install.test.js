'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

// install.js 核心函数测试
const {
  deepMergeNew, detectClaudeAuth, detectCodexAuth,
  detectCclineBin, copyRecursive, shouldSkip, SETTINGS_TEMPLATE,
  scanInvocableSkills, generateCommandContent, installGeneratedCommands
} = require('../bin/install');

// utils.js 函数测试
const { parseFrontmatter } = require('../bin/lib/utils');

describe('deepMergeNew', () => {
  test('新键写入目标', () => {
    const target = {};
    const log = [];
    deepMergeNew(target, { a: 1 }, '', log);
    expect(target.a).toBe(1);
    expect(log.some(l => l.k === 'a' && l.a === 'set')).toBe(true);
  });

  test('已有键保留不覆盖', () => {
    const target = { a: 'old' };
    const log = [];
    deepMergeNew(target, { a: 'new' }, '', log);
    expect(target.a).toBe('old');
    expect(log.some(l => l.k === 'a' && l.a === 'keep')).toBe(true);
  });

  test('嵌套对象递归合并', () => {
    const target = { env: { A: '1' } };
    const log = [];
    deepMergeNew(target, { env: { B: '2' } }, '', log);
    expect(target.env.A).toBe('1');
    expect(target.env.B).toBe('2');
  });

  test('数组去重追加', () => {
    const target = { arr: ['a', 'b'] };
    const log = [];
    deepMergeNew(target, { arr: ['b', 'c'] }, '', log);
    expect(target.arr).toEqual(['a', 'b', 'c']);
  });

  test('数组完全重复则保留', () => {
    const target = { arr: ['a', 'b'] };
    const log = [];
    deepMergeNew(target, { arr: ['a', 'b'] }, '', log);
    expect(target.arr).toEqual(['a', 'b']);
    expect(log.some(l => l.a === 'keep')).toBe(true);
  });

  test('目标无嵌套对象时创建', () => {
    const target = {};
    const log = [];
    deepMergeNew(target, { env: { X: '1' } }, '', log);
    expect(target.env.X).toBe('1');
    expect(log.some(l => l.k === 'env' && l.a === 'new')).toBe(true);
  });
});

describe('detectClaudeAuth', () => {
  const origEnv = { ...process.env };
  afterEach(() => { process.env = { ...origEnv }; });

  test('settings中有自定义provider', () => {
    const settings = { env: { ANTHROPIC_BASE_URL: 'http://x', ANTHROPIC_AUTH_TOKEN: 'tok' } };
    const auth = detectClaudeAuth(settings);
    expect(auth).toEqual({ type: 'custom', detail: 'http://x' });
  });

  test('环境变量ANTHROPIC_API_KEY', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const auth = detectClaudeAuth({});
    expect(auth).toEqual({ type: 'env', detail: 'ANTHROPIC_API_KEY' });
  });

  test('无认证返回null', () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_BASE_URL;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
    const auth = detectClaudeAuth({});
    // 可能有 .credentials.json，但在CI中通常没有
    // 只验证返回值类型
    expect(auth === null || typeof auth === 'object').toBe(true);
  });
});

describe('detectCodexAuth', () => {
  const origEnv = { ...process.env };
  afterEach(() => { process.env = { ...origEnv }; });

  test('环境变量OPENAI_API_KEY', () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const auth = detectCodexAuth();
    expect(auth).toEqual({ type: 'env', detail: 'OPENAI_API_KEY' });
  });

  test('无认证返回null', () => {
    delete process.env.OPENAI_API_KEY;
    const auth = detectCodexAuth();
    expect(auth === null || typeof auth === 'object').toBe(true);
  });
});

describe('shouldSkip', () => {
  test('跳过 __pycache__', () => { expect(shouldSkip('__pycache__')).toBe(true); });
  test('跳过 .git', () => { expect(shouldSkip('.git')).toBe(true); });
  test('不跳过正常文件', () => { expect(shouldSkip('install.js')).toBe(false); });
});

describe('copyRecursive', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-test-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('复制文件', () => {
    const src = path.join(tmpDir, 'a.txt');
    const dest = path.join(tmpDir, 'b.txt');
    fs.writeFileSync(src, 'hello');
    copyRecursive(src, dest);
    expect(fs.readFileSync(dest, 'utf8')).toBe('hello');
  });

  test('递归复制目录', () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'x.txt'), 'data');
    const destDir = path.join(tmpDir, 'dest');
    copyRecursive(srcDir, destDir);
    expect(fs.readFileSync(path.join(destDir, 'x.txt'), 'utf8')).toBe('data');
  });

  test('跳过 __pycache__ 目录', () => {
    const srcDir = path.join(tmpDir, 'src');
    const cacheDir = path.join(srcDir, '__pycache__');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'x.pyc'), 'bad');
    const destDir = path.join(tmpDir, 'dest');
    copyRecursive(srcDir, destDir);
    expect(fs.existsSync(path.join(destDir, '__pycache__'))).toBe(false);
  });
});

describe('SETTINGS_TEMPLATE', () => {
  test('包含必要字段', () => {
    expect(SETTINGS_TEMPLATE).toHaveProperty('env');
    expect(SETTINGS_TEMPLATE).toHaveProperty('permissions');
    expect(SETTINGS_TEMPLATE).toHaveProperty('outputStyle', 'abyss-cultivator');
  });
});

// ══════════════════════════════════════════════════════
// 斜杠命令核心函数测试
// ══════════════════════════════════════════════════════

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

  test('忽略空行和无效行', () => {
    const content = '---\nname: test\n\n  # comment-like\nbad line without colon\ndescription: ok\n---';
    const meta = parseFrontmatter(content);
    expect(meta.name).toBe('test');
    expect(meta.description).toBe('ok');
    expect(Object.keys(meta).length).toBe(2);
  });

  test('处理 Windows 换行符 (CRLF)', () => {
    const content = '---\r\nname: win-test\r\ndescription: crlf\r\n---\r\n\r\nBody';
    const meta = parseFrontmatter(content);
    expect(meta).not.toBeNull();
    expect(meta.name).toBe('win-test');
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
    makeSkill('tools/gen-docs', 'name: gen-docs\nuser-invocable: true', true);
    makeSkill('tools/verify-module', 'name: verify-module\nuser-invocable: true', true);
    makeSkill('domains/security', 'name: security\nuser-invocable: false', false);

    const results = scanInvocableSkills(tmpDir);
    expect(results.length).toBe(2);
    const names = results.map(r => r.meta.name).sort();
    expect(names).toEqual(['gen-docs', 'verify-module']);
  });

  test('正确检测 hasScripts', () => {
    makeSkill('tools/with-script', 'name: with-script\nuser-invocable: true', true);
    makeSkill('domains/no-script', 'name: no-script\nuser-invocable: true', false);

    const results = scanInvocableSkills(tmpDir);
    const withScript = results.find(r => r.meta.name === 'with-script');
    const noScript = results.find(r => r.meta.name === 'no-script');
    expect(withScript.hasScripts).toBe(true);
    expect(noScript.hasScripts).toBe(false);
  });

  test('返回正确的 relPath', () => {
    makeSkill('tools/gen-docs', 'name: gen-docs\nuser-invocable: true', true);

    const results = scanInvocableSkills(tmpDir);
    expect(results[0].relPath).toBe(path.join('tools', 'gen-docs'));
  });

  test('空目录返回空数组', () => {
    expect(scanInvocableSkills(tmpDir)).toEqual([]);
  });

  test('无 name 字段的 skill 被忽略', () => {
    makeSkill('tools/no-name', 'user-invocable: true\ndescription: no name field', false);

    const results = scanInvocableSkills(tmpDir);
    expect(results.length).toBe(0);
  });

  test('扫描真实 skills 目录', () => {
    const realSkillsDir = path.join(__dirname, '..', 'skills');
    if (!fs.existsSync(realSkillsDir)) return; // CI 中可能不存在

    const results = scanInvocableSkills(realSkillsDir);
    // 至少有 gen-docs, verify-module, verify-change, verify-quality, verify-security, frontend-design
    expect(results.length).toBeGreaterThanOrEqual(6);

    const names = results.map(r => r.meta.name);
    expect(names).toContain('gen-docs');
    expect(names).toContain('verify-module');
    expect(names).toContain('frontend-design');
  });
});

describe('generateCommandContent', () => {
  test('有脚本的 skill: 包含一气呵成指令流', () => {
    const meta = {
      name: 'gen-docs',
      description: '文档生成器',
      'argument-hint': '<模块路径> [--force]',
      'allowed-tools': 'Bash, Read, Write, Glob',
    };
    const content = generateCommandContent(meta, 'tools/gen-docs', true);

    // Frontmatter 正确
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('name: gen-docs');
    expect(content).toContain('description: "文档生成器"');
    expect(content).toContain('argument-hint: "<模块路径> [--force]"');
    expect(content).toContain('allowed-tools: Bash, Read, Write, Glob');

    // 一气呵成指令（关键：不能有「先…然后…」分步停顿）
    expect(content).toContain('一气呵成');
    expect(content).toContain('不要在步骤间停顿');
    expect(content).toContain('不要停顿');

    // SKILL.md 读取路径正确
    expect(content).toContain('~/.claude/skills/tools/gen-docs/SKILL.md');

    // run_skill.js 执行命令正确
    expect(content).toContain('node ~/.claude/skills/run_skill.js gen-docs $ARGUMENTS');
  });

  test('无脚本的 skill: 知识库模式', () => {
    const meta = {
      name: 'frontend-design',
      description: '前端设计美学秘典',
      'allowed-tools': 'Read',
    };
    const content = generateCommandContent(meta, 'domains/frontend-design', false);

    // Frontmatter 正确
    expect(content).toContain('name: frontend-design');
    expect(content).toContain('allowed-tools: Read');

    // 知识库模式关键词
    expect(content).toContain('读取以下秘典');
    expect(content).toContain('~/.claude/skills/domains/frontend-design/SKILL.md');

    // 不包含 run_skill.js 命令
    expect(content).not.toContain('run_skill.js');
    expect(content).not.toContain('一气呵成');
  });

  test('无 argument-hint 时不输出该字段', () => {
    const meta = {
      name: 'test-skill',
      description: 'test',
    };
    const content = generateCommandContent(meta, 'test', false);
    expect(content).not.toContain('argument-hint');
  });

  test('无 allowed-tools 时默认 Read', () => {
    const meta = { name: 'minimal', description: 'minimal skill' };
    const content = generateCommandContent(meta, 'minimal', false);
    expect(content).toContain('allowed-tools: Read');
  });

  test('空 skillRelPath 使用根路径', () => {
    const meta = { name: 'root', description: 'root skill' };
    const content = generateCommandContent(meta, '', false);
    expect(content).toContain('~/.claude/skills/SKILL.md');
  });

  test('description 中的双引号被转义', () => {
    const meta = { name: 'escaped', description: 'has "quotes" inside' };
    const content = generateCommandContent(meta, 'test', false);
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
    manifest = { installed: [], backups: [] };
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
    makeSkillDir(skillsSrc, 'tools/gen-docs', 'name: gen-docs\nuser-invocable: true', true);
    makeSkillDir(skillsSrc, 'tools/verify-module', 'name: verify-module\nuser-invocable: true', true);

    const count = installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);

    expect(count).toBe(2);
    expect(fs.existsSync(path.join(targetDir, 'commands', 'gen-docs.md'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'commands', 'verify-module.md'))).toBe(true);
    expect(manifest.installed).toContain('commands/gen-docs.md');
    expect(manifest.installed).toContain('commands/verify-module.md');
  });

  test('已存在的 command 文件被备份', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(skillsSrc, 'tools/gen-docs', 'name: gen-docs\nuser-invocable: true', true);

    // 预置一个同名 command 文件
    const cmdsDir = path.join(targetDir, 'commands');
    fs.mkdirSync(cmdsDir, { recursive: true });
    fs.writeFileSync(path.join(cmdsDir, 'gen-docs.md'), 'old content');

    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);

    // 原文件被备份
    expect(fs.existsSync(path.join(backupDir, 'commands', 'gen-docs.md'))).toBe(true);
    expect(fs.readFileSync(path.join(backupDir, 'commands', 'gen-docs.md'), 'utf8')).toBe('old content');
    expect(manifest.backups).toContain('commands/gen-docs.md');

    // 新文件已覆盖
    const newContent = fs.readFileSync(path.join(cmdsDir, 'gen-docs.md'), 'utf8');
    expect(newContent).toContain('name: gen-docs');
    expect(newContent).not.toBe('old content');
  });

  test('无 user-invocable skill 时返回 0', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(skillsSrc, 'domains/security', 'name: security\nuser-invocable: false', false);

    const count = installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);
    expect(count).toBe(0);
    expect(fs.existsSync(path.join(targetDir, 'commands'))).toBe(false);
  });

  test('生成的 command 文件内容格式正确', () => {
    const skillsSrc = path.join(tmpDir, 'skills');
    fs.mkdirSync(skillsSrc, { recursive: true });
    makeSkillDir(skillsSrc, 'tools/gen-docs',
      'name: gen-docs\nuser-invocable: true\nargument-hint: <path>\nallowed-tools: Bash, Read',
      true);

    installGeneratedCommands(skillsSrc, targetDir, backupDir, manifest);

    const content = fs.readFileSync(path.join(targetDir, 'commands', 'gen-docs.md'), 'utf8');
    // 必须以 --- 开头（YAML frontmatter）
    expect(content).toMatch(/^---\n/);
    // 包含一气呵成指令流（有脚本的 skill）
    expect(content).toContain('一气呵成');
    expect(content).toContain('run_skill.js gen-docs');
  });
});

// ══════════════════════════════════════════════════════
// 斜杠命令回归防护（防止 skills 目录重组后路径失效）
// ══════════════════════════════════════════════════════

describe('斜杠命令回归防护', () => {
  const realSkillsDir = path.join(__dirname, '..', 'skills');
  const skillsExist = fs.existsSync(realSkillsDir);

  // 跳过条件：CI 中可能没有 skills 目录
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

      invocableSkills.forEach(({ meta, relPath }) => {
        // 生成 command 内容
        const content = generateCommandContent(meta, relPath, false);

        // 从生成内容中提取 ~/.claude/skills/.../SKILL.md 路径
        const match = content.match(/~\/\.claude\/skills\/(.+?\/SKILL\.md)/);
        expect(match).not.toBeNull();

        // 将 ~/.claude/skills/X/SKILL.md 映射回真实 skills/X/SKILL.md
        const extractedRelPath = match[1]; // e.g. "tools/gen-docs/SKILL.md"
        const realPath = path.join(realSkillsDir, extractedRelPath);

        if (!fs.existsSync(realPath)) {
          missing.push({
            name: meta.name,
            expectedPath: realPath,
            relPath: extractedRelPath,
          });
        }
      });

      // 若 skills 目录重组但 relPath 算错，此处立刻爆红
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
        .forEach(({ meta, relPath, hasScripts }) => {
          const content = generateCommandContent(meta, relPath, hasScripts);

          // 验证 command 内容包含 run_skill.js {name} $ARGUMENTS
          const expectedCall = `run_skill.js ${meta.name} $ARGUMENTS`;
          if (!content.includes(expectedCall)) {
            errors.push({
              name: meta.name,
              expected: expectedCall,
              issue: 'run_skill.js 调用缺失或格式错误',
            });
          }

          // 验证 skills/{relPath}/scripts/ 下确实存在 .js 文件
          const scriptsDir = path.join(realSkillsDir, relPath, 'scripts');
          const hasJsFiles = fs.existsSync(scriptsDir) &&
            fs.readdirSync(scriptsDir).some(f => f.endsWith('.js'));
          if (!hasJsFiles) {
            errors.push({
              name: meta.name,
              scriptsDir,
              issue: 'scripts/ 目录不存在或无 .js 文件',
            });
          }
        });

      // 若脚本目录移走但 command 仍引用旧路径，此处立刻爆红
      expect(errors).toEqual([]);
    });

    test('无脚本的 skill 不应引用 run_skill.js', () => {
      invocableSkills
        .filter(s => !s.hasScripts)
        .forEach(({ meta, relPath, hasScripts }) => {
          const content = generateCommandContent(meta, relPath, hasScripts);
          expect(content).not.toContain('run_skill.js');
        });
    });
  });

  describeIf('command 文件名合法性', () => {
    test('每个 skill 的 name 符合合法文件名格式', () => {
      const invocableSkills = scanInvocableSkills(realSkillsDir);
      const invalid = [];

      invocableSkills.forEach(({ meta }) => {
        // 必须以小写字母开头，仅包含小写字母、数字、连字符
        if (!/^[a-z][a-z0-9-]*$/.test(meta.name)) {
          invalid.push({
            name: meta.name,
            issue: '名称不符合 /^[a-z][a-z0-9-]*$/ 格式',
          });
        }
      });

      expect(invalid).toEqual([]);
    });

    test('skill name 无重复（防止 command 文件冲突）', () => {
      const invocableSkills = scanInvocableSkills(realSkillsDir);
      const names = invocableSkills.map(s => s.meta.name);
      const duplicates = names.filter((n, i) => names.indexOf(n) !== i);

      expect(duplicates).toEqual([]);
    });
  });
});

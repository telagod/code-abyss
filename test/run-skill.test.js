'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

const runSkillPath = path.join(__dirname, '..', 'skills', 'run_skill.js');
const helperScript = path.join(__dirname, 'fixtures', 'release-lock.js');

describe('run_skill', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-run-skill-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function makeSkill(relPath, frontmatter, scriptContent) {
    const dir = path.join(tmpDir, relPath);
    const hasScript = scriptContent !== null;
    if (hasScript) fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    else fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n# Skill`);
    if (hasScript) fs.writeFileSync(path.join(dir, 'scripts', 'run.js'), scriptContent);
  }

  function run(args) {
    return spawnSync(process.execPath, [runSkillPath, ...args], {
      env: { ...process.env, SAGE_SKILLS_DIR: tmpDir },
      encoding: 'utf8',
      timeout: 10000,
    });
  }

  test('执行脚本型 skill 并透传参数', () => {
    const targetFile = path.join(tmpDir, 'args.json');
    makeSkill(
      'tools/gen-docs',
      'name: gen-docs\ndescription: docs\nuser-invocable: true',
      `const fs = require('fs'); fs.writeFileSync(${JSON.stringify(targetFile)}, JSON.stringify(process.argv.slice(2)));`
    );

    const result = run(['gen-docs', './module', '--force']);

    expect(result.status).toBe(0);
    expect(JSON.parse(fs.readFileSync(targetFile, 'utf8'))).toEqual(['./module', '--force']);
  });

  test('未知 skill 返回错误', () => {
    const result = run(['missing-skill']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("未知的 skill 'missing-skill'");
  });

  test('无脚本 skill 返回明确错误', () => {
    makeSkill(
      'domains/frontend-design',
      'name: frontend-design\ndescription: design\nuser-invocable: true',
      null
    );

    const result = run(['frontend-design']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("runtimeType 不是 scripted");
    expect(result.stderr).toContain(path.join('domains', 'frontend-design', 'SKILL.md'));
  });

  test('等待锁释放后继续执行，不 busy wait 失效', async () => {
    const targetFile = path.join(tmpDir, 'lock-result.txt');
    makeSkill(
      'tools/verify-quality',
      'name: verify-quality\ndescription: quality\nuser-invocable: true',
      `const fs = require('fs'); fs.writeFileSync(${JSON.stringify(targetFile)}, 'done');`
    );

    const targetArg = path.join(tmpDir, 'project');
    fs.mkdirSync(targetArg, { recursive: true });
    const hash = require('crypto').createHash('md5').update(path.resolve(targetArg)).digest('hex').slice(0, 12);
    const lockPath = path.join(os.tmpdir(), `sage_skill_${hash}.lock`);
    const fd = fs.openSync(lockPath, 'wx');

    const releaser = spawn(process.execPath, [helperScript, lockPath, String(fd), '300'], {
      env: process.env,
      stdio: 'ignore',
      detached: false,
    });

    const result = run(['verify-quality', targetArg]);

    await new Promise((resolve, reject) => {
      releaser.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`releaser exited ${code}`))));
      releaser.on('error', reject);
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('等待锁释放');
    expect(fs.readFileSync(targetFile, 'utf8')).toBe('done');
  });
});

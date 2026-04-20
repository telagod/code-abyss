'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { rmSafe } = require('../bin/lib/utils');

describe('packs cli', () => {
  let tmpDir;
  let upstreamRepo;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-packs-cli-'));
    upstreamRepo = path.join(tmpDir, 'upstream-gstack');
    fs.mkdirSync(upstreamRepo, { recursive: true });
    fs.writeFileSync(path.join(upstreamRepo, 'README.md'), '# upstream\n');

    fs.mkdirSync(path.join(tmpDir, 'packs', 'gstack'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'packs', 'abyss'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'packs', 'gstack', 'manifest.json'), JSON.stringify({
      name: 'gstack',
      description: 'test gstack pack',
      projectDefaults: {
        claude: 'required',
        codex: 'required',
        gemini: 'required',
      },
      hosts: {
        claude: {
          uninstall: {
            runtimeRoot: { root: 'claude', path: 'skills/gstack' },
            commandRoot: { root: 'claude', path: 'commands' },
            commandsFromRuntime: true,
            commandAliases: {
              'open-gstack-browser': ['connect-chrome'],
            },
          },
        },
        codex: {
          uninstall: {
            runtimeRoot: { root: 'agents', path: 'skills/gstack' },
          },
        },
        gemini: {
          uninstall: {
            runtimeRoot: { root: 'gemini', path: 'skills/gstack' },
            commandRoot: { root: 'gemini', path: 'commands' },
            commandExtension: '.toml',
            commandsFromRuntime: true,
          },
        },
      },
      upstream: {
        provider: 'local-dir',
        path: 'upstream-gstack',
        version: '0.0.0-test',
      },
    }, null, 2));
    fs.writeFileSync(path.join(tmpDir, 'packs', 'abyss', 'manifest.json'), JSON.stringify({
      name: 'abyss',
      description: 'test core pack',
      hosts: {
        claude: { files: [] },
        codex: { files: [] },
        gemini: { files: [] },
      },
    }, null, 2));
  });

  afterEach(() => {
    rmSafe(tmpDir);
  });

  function run(args, extraEnv = {}) {
    return spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'packs.js'), ...args], {
      cwd: tmpDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: tmpDir,
        USERPROFILE: tmpDir,
        ...extraEnv,
      },
    });
  }

  test('init 写入默认 packs.lock', () => {
    const result = run(['init']);
    const lockPath = path.join(tmpDir, '.code-abyss', 'packs.lock.json');
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

    expect(result.status).toBe(0);
    expect(lock.hosts.claude.required).toEqual(['gstack']);
    expect(lock.hosts.codex.required).toEqual(['gstack']);
    expect(lock.hosts.gemini.required).toEqual(['gstack']);
    expect(lock.hosts.codex.optional_policy).toBe('auto');
  });

  test('update 可修改 optional policy 与 optional packs', () => {
    run(['init']);
    const result = run(['update', '--host', 'codex', '--remove', 'gstack', '--add-optional', 'gstack', '--optional-policy', 'off', '--set-source', 'gstack=local']);
    const lock = JSON.parse(fs.readFileSync(path.join(tmpDir, '.code-abyss', 'packs.lock.json'), 'utf8'));

    expect(result.status).toBe(0);
    expect(lock.hosts.codex.required).toEqual([]);
    expect(lock.hosts.codex.optional).toEqual(['gstack']);
    expect(lock.hosts.codex.optional_policy).toBe('off');
    expect(lock.hosts.codex.sources.gstack).toBe('local');
  });

  test('bootstrap 生成 packs.lock 与 README/CONTRIBUTING 片段', () => {
    const result = run(['bootstrap']);
    const snippetDir = path.join(tmpDir, '.code-abyss', 'snippets');

    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'packs.lock.json'))).toBe(true);
    expect(fs.readFileSync(path.join(snippetDir, 'README.packs.md'), 'utf8')).toContain('AI Pack Bootstrap');
    expect(fs.readFileSync(path.join(snippetDir, 'README.packs.md'), 'utf8')).toContain('npx code-abyss --target gemini -y');
    expect(fs.readFileSync(path.join(snippetDir, 'CONTRIBUTING.packs.md'), 'utf8')).toContain('This repository uses `.code-abyss/packs.lock.json`');
    expect(fs.readFileSync(path.join(snippetDir, 'CONTRIBUTING.packs.md'), 'utf8')).toContain('gemini=auto');
  });

  test('bootstrap --apply-docs 自动写入 README/CONTRIBUTING', () => {
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Demo\n');
    const result = run(['bootstrap', '--apply-docs']);

    expect(result.status).toBe(0);
    expect(fs.readFileSync(path.join(tmpDir, 'README.md'), 'utf8')).toContain('code-abyss:packs:readme:start');
    expect(fs.readFileSync(path.join(tmpDir, 'CONTRIBUTING.md'), 'utf8')).toContain('code-abyss:packs:contributing:start');
  });

  test('check 校验未知 pack 失败', () => {
    fs.mkdirSync(path.join(tmpDir, '.code-abyss'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.code-abyss', 'packs.lock.json'), JSON.stringify({
      version: 1,
      hosts: {
        claude: { required: ['unknown'], optional: [], optional_policy: 'auto' },
        codex: { required: [], optional: [], optional_policy: 'auto' },
      },
    }, null, 2));

    const result = run(['check']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('未知 required pack');
  });

  test('diff 输出相对默认模板的变化', () => {
    run(['init']);
    run(['update', '--host', 'claude', '--remove', 'gstack', '--add-optional', 'gstack', '--optional-policy', 'prompt', '--set-source', 'gstack=local']);
    const result = run(['diff']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('[claude]');
    expect(result.stdout).toContain('policy: auto -> prompt');
    expect(result.stdout).toContain('source: gstack: pinned -> local');
  });

  test('vendor-pull 拉取 pack 到 .code-abyss/vendor', () => {
    const result = run(['vendor-pull', 'gstack']);
    const vendorDir = path.join(tmpDir, '.code-abyss', 'vendor', 'gstack');

    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(vendorDir, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(vendorDir, '.code-abyss-vendor.json'))).toBe(true);
  });

  test('vendor-sync 同步 sources=local 的 pack', () => {
    run(['init']);
    run(['update', '--host', 'claude', '--remove', 'gstack', '--add-optional', 'gstack', '--set-source', 'gstack=local']);
    const result = run(['vendor-sync']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('gstack:');
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'vendor', 'gstack', 'README.md'))).toBe(true);
  });

  test('vendor-sync --check 可作为漂移门禁', () => {
    run(['init']);
    run(['update', '--host', 'claude', '--remove', 'gstack', '--add-optional', 'gstack', '--set-source', 'gstack=local']);
    const missing = run(['vendor-sync', '--check']);
    expect(missing.status).toBe(1);

    run(['vendor-sync']);
    const aligned = run(['vendor-sync', '--check']);
    expect(aligned.status).toBe(0);
    expect(aligned.stdout).toContain('所有 local source pack 都已 vendor sync');
  });

  test('vendor-status 输出 vendor 对齐状态', () => {
    run(['vendor-pull', 'gstack']);
    const result = run(['vendor-status', 'gstack']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('gstack: present clean aligned');
  });

  test('vendor-dirty 在 vendor 脏或漂移时非零退出', () => {
    run(['vendor-pull', 'gstack']);
    fs.writeFileSync(path.join(tmpDir, '.code-abyss', 'vendor', 'gstack', 'DIRTY.txt'), 'dirty\n');

    const result = run(['vendor-dirty', 'gstack']);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('dirty=true');
  });

  test('report list/latest 可查看 report artifacts', () => {
    fs.mkdirSync(path.join(tmpDir, '.code-abyss', 'reports'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.code-abyss', 'reports', 'pack-uninstall-gstack-2026-04-12T00-00-00.000Z.json'), JSON.stringify({ kind: 'uninstall', ok: true }, null, 2));
    fs.writeFileSync(path.join(tmpDir, '.code-abyss', 'reports', 'install-codex-2026-04-12T00-00-01.000Z.json'), JSON.stringify({ kind: 'install', ok: true }, null, 2));

    const list = run(['report', 'list']);
    const latest = run(['report', 'latest', '--kind', 'pack-uninstall-gstack']);
    const summary = run(['report', 'summary']);
    const summaryJson = run(['report', 'summary', '--json']);

    expect(list.status).toBe(0);
    expect(list.stdout).toContain('pack-uninstall-gstack-2026-04-12T00-00-00.000Z.json');
    expect(latest.status).toBe(0);
    expect(latest.stdout).toContain('"kind": "uninstall"');
    expect(summary.status).toBe(0);
    expect(summary.stdout).toContain('pack-uninstall-gstack');
    expect(summaryJson.status).toBe(0);
    expect(JSON.parse(summaryJson.stdout)[0]).toHaveProperty('kind');
  });

  test('uninstall 按 pack 清理本地 runtime 并更新 lock/vendor', () => {
    run(['bootstrap']);
    const claudeSkillRoot = path.join(tmpDir, '.claude', 'skills', 'gstack');
    const codexSkillRoot = path.join(tmpDir, '.agents', 'skills', 'gstack');
    const geminiSkillRoot = path.join(tmpDir, '.gemini', 'skills', 'gstack');
    fs.mkdirSync(claudeSkillRoot, { recursive: true });
    fs.mkdirSync(codexSkillRoot, { recursive: true });
    fs.mkdirSync(geminiSkillRoot, { recursive: true });
    fs.mkdirSync(path.join(claudeSkillRoot, 'review'), { recursive: true });
    fs.mkdirSync(path.join(geminiSkillRoot, 'review'), { recursive: true });
    fs.writeFileSync(path.join(claudeSkillRoot, 'review', 'SKILL.md'), '# review\n');
    fs.writeFileSync(path.join(geminiSkillRoot, 'review', 'SKILL.md'), '# review\n');
    fs.mkdirSync(path.join(tmpDir, '.claude', 'commands'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, '.gemini', 'commands'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.claude', 'commands', 'review.md'), 'x');
    fs.writeFileSync(path.join(tmpDir, '.gemini', 'commands', 'review.toml'), 'x');
    run(['vendor-pull', 'gstack']);

    const result = run(['uninstall', 'gstack', '--host', 'all', '--remove-lock', '--remove-vendor']);
    const lock = JSON.parse(fs.readFileSync(path.join(tmpDir, '.code-abyss', 'packs.lock.json'), 'utf8'));

    expect(result.status).toBe(0);
    expect(fs.existsSync(claudeSkillRoot)).toBe(false);
    expect(fs.existsSync(codexSkillRoot)).toBe(false);
    expect(fs.existsSync(geminiSkillRoot)).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.gemini', 'commands', 'review.toml'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'vendor', 'gstack'))).toBe(false);
    expect(lock.hosts.claude.required).toEqual([]);
    expect(lock.hosts.codex.required).toEqual([]);
    expect(lock.hosts.gemini.required).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, '.code-abyss', 'reports'))).toBe(true);
    expect(fs.readdirSync(path.join(tmpDir, '.code-abyss', 'reports')).some((name) => name.startsWith('pack-uninstall-gstack-'))).toBe(true);
  });
});

'use strict';

const path = require('path');

const {
  PROJECT_PACKS_LOCK_REL,
  listPackNames,
  getPack,
  getPackHostFiles,
  validatePackManifest,
  findProjectPacksLock,
  readProjectPackLock,
  resolveProjectPacks,
  selectProjectPacksForInstall,
  diffProjectPackLocks,
  validateProjectPackLock,
} = require('../bin/lib/pack-registry');

describe('pack registry', () => {
  const projectRoot = path.join(__dirname, '..');

  test('列出内建 packs', () => {
    expect(listPackNames(projectRoot)).toEqual(['abyss', 'gstack']);
  });

  test('validatePackManifest 拒绝缺失最小 contract', () => {
    expect(() => validatePackManifest({
      name: 'broken',
      hosts: {
        claude: {
          uninstall: {},
        },
      },
    }, '/tmp/broken.json')).toThrow(/description 必填/);
  });

  test('读取 abyss manifest', () => {
    const pack = getPack(projectRoot, 'abyss');
    expect(pack).toMatchObject({
      name: 'abyss',
    });
    expect(pack.hosts.claude.files).toHaveLength(4);
    expect(pack.hosts.codex.files).toHaveLength(2);
  });

  test('读取 gstack manifest', () => {
    const pack = getPack(projectRoot, 'gstack');
    expect(pack.upstream).toMatchObject({
      repo: 'https://github.com/garrytan/gstack.git',
      version: '0.16.3.0',
    });
    expect(pack.hosts.codex.skipSkills).toEqual(['codex']);
  });

  test('按 host 解析文件映射', () => {
    expect(getPackHostFiles(projectRoot, 'abyss', 'claude')).toEqual([
      { src: 'config/CLAUDE.md', dest: 'CLAUDE.md', root: 'claude' },
      { src: 'output-styles', dest: 'output-styles', root: 'claude' },
      { src: 'skills', dest: 'skills', root: 'claude' },
      { src: 'bin/lib', dest: 'bin/lib', root: 'claude' },
    ]);

    expect(getPackHostFiles(projectRoot, 'abyss', 'codex')).toEqual([
      { src: 'skills', dest: 'skills', root: 'agents' },
      { src: 'bin/lib', dest: 'bin/lib', root: 'agents' },
    ]);
  });

  test('发现并读取项目级 packs lock', () => {
    const lockPath = findProjectPacksLock(projectRoot);
    expect(lockPath).toBe(path.join(projectRoot, PROJECT_PACKS_LOCK_REL));

    const payload = readProjectPackLock(projectRoot);
    expect(payload.root).toBe(projectRoot);
    expect(payload.lock.version).toBe(1);
  });

  test('按 host 解析项目级 required/optional packs', () => {
    expect(resolveProjectPacks(projectRoot, 'claude')).toMatchObject({
      root: projectRoot,
      required: ['gstack'],
      optional: [],
      optionalPolicy: 'auto',
      sources: { gstack: 'pinned' },
    });

    expect(resolveProjectPacks(projectRoot, 'codex')).toMatchObject({
      root: projectRoot,
      required: ['gstack'],
      optional: [],
      optionalPolicy: 'auto',
      sources: { gstack: 'pinned' },
    });

    expect(resolveProjectPacks(projectRoot, 'gemini')).toMatchObject({
      root: projectRoot,
      required: ['gstack'],
      optional: [],
      optionalPolicy: 'auto',
      sources: { gstack: 'pinned' },
    });
  });

  test('optional policy = auto 时自动安装 optional packs', async () => {
    await expect(selectProjectPacksForInstall({
      required: ['gstack'],
      optional: ['foo'],
      optionalPolicy: 'auto',
    })).resolves.toMatchObject({
      selected: ['foo', 'gstack'],
      optionalSelected: ['foo'],
    });
  });

  test('optional policy = off 时跳过 optional packs', async () => {
    await expect(selectProjectPacksForInstall({
      required: ['gstack'],
      optional: ['foo'],
      optionalPolicy: 'off',
    })).resolves.toMatchObject({
      selected: ['gstack'],
      optionalSelected: [],
    });
  });

  test('optional policy = prompt 时尊重确认结果', async () => {
    await expect(selectProjectPacksForInstall({
      required: ['gstack'],
      optional: ['foo'],
      optionalPolicy: 'prompt',
    }, {
      autoYes: false,
      confirm: async () => false,
    })).resolves.toMatchObject({
      selected: ['gstack'],
      optionalSelected: [],
    });
  });

  test('source=disabled 会从安装集合中过滤掉 optional pack', async () => {
    await expect(selectProjectPacksForInstall({
      required: ['gstack'],
      optional: ['foo'],
      optionalPolicy: 'auto',
      sources: {
        gstack: 'pinned',
        foo: 'disabled',
      },
    })).resolves.toMatchObject({
      selected: ['gstack'],
      optionalSelected: [],
    });
  });

  test('validateProjectPackLock 拒绝非法 source', () => {
    const errors = validateProjectPackLock({
      version: 1,
      hosts: {
        claude: {
          required: ['gstack'],
          optional: [],
          optional_policy: 'auto',
          sources: { gstack: 'broken' },
        },
        codex: {
          required: ['gstack'],
          optional: [],
          optional_policy: 'auto',
          sources: { gstack: 'pinned' },
        },
      },
    }, projectRoot);

    expect(errors.join('\n')).toContain('source 非法');
  });

  test('diffProjectPackLocks 报告 policy/source/pack 变化', () => {
    const diffs = diffProjectPackLocks(
      {
        version: 1,
        hosts: {
          claude: {
            required: [],
            optional: ['gstack'],
            optional_policy: 'prompt',
            sources: { gstack: 'local' },
          },
          codex: {
            required: ['gstack'],
            optional: [],
            optional_policy: 'auto',
            sources: { gstack: 'pinned' },
          },
        },
      },
      {
        version: 1,
        hosts: {
          claude: {
            required: ['gstack'],
            optional: [],
            optional_policy: 'auto',
            sources: { gstack: 'pinned' },
          },
          codex: {
            required: ['gstack'],
            optional: [],
            optional_policy: 'auto',
            sources: { gstack: 'pinned' },
          },
        },
      }
    );

    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({
      host: 'claude',
      removedRequired: ['gstack'],
      addedOptional: ['gstack'],
      optionalPolicy: { from: 'auto', to: 'prompt' },
    });
    expect(diffs[0].sourceChanges.gstack).toEqual({ from: 'pinned', to: 'local' });
  });
});

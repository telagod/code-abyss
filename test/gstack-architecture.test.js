'use strict';

const { installGstackPack, STRATEGIES } = require('../bin/lib/gstack/installer');

describe('bin/lib/gstack/installer', () => {
  test('STRATEGIES 注册 claude/codex/gemini/openclaw 四个 host', () => {
    expect(Object.keys(STRATEGIES).sort()).toEqual(['claude', 'codex', 'gemini', 'openclaw']);
  });

  test('每个 strategy 都导出 installToHost 函数', () => {
    for (const host of Object.keys(STRATEGIES)) {
      expect(typeof STRATEGIES[host].installToHost).toBe('function');
    }
  });

  test('未知 host 抛错', () => {
    expect(() => installGstackPack('bogus', { HOME: '/tmp', backupDir: '/tmp', manifest: {} }))
      .toThrow(/不支持的 host/);
  });

  test('source=disabled 时跳过且返回 disabled mode', () => {
    const result = installGstackPack('claude', {
      HOME: '/tmp/abyss-gstack-disabled',
      backupDir: '/tmp/abyss-gstack-disabled-backup',
      manifest: { backups: [], installed: [] },
      sourceMode: 'disabled',
    });
    expect(result.installed).toBe(false);
    expect(result.sourceMode).toBe('disabled');
    expect(result.reason).toBe('disabled');
  });
});

describe('bin/lib/gstack/core re-exports', () => {
  const core = require('../bin/lib/gstack/core');

  test('导出关键原语', () => {
    [
      'getGstackConfig', 'extractNameAndDescription', 'condenseDescription',
      'listTopLevelSkillDirs', 'resolveGstackSource', 'copySkillRuntimeFiles',
      'copyRuntimeAssets', 'backupPathIfExists', 'ensurePinnedGstackSource',
    ].forEach((fn) => {
      expect(typeof core[fn]).toBe('function');
    });
  });

  test('condenseDescription 单段截断', () => {
    expect(core.condenseDescription('hello world', 100)).toBe('hello world');
    expect(core.condenseDescription('a'.repeat(50), 20)).toMatch(/\.\.\.$/);
  });

  test('extractNameAndDescription 解析 frontmatter', () => {
    const content = '---\nname: foo\ndescription: bar baz\n---\nbody';
    expect(core.extractNameAndDescription(content)).toEqual({ name: 'foo', description: 'bar baz' });
  });

  test('extractNameAndDescription 缺失 frontmatter 时返回空对象', () => {
    expect(core.extractNameAndDescription('no frontmatter')).toEqual({ name: '', description: '' });
  });
});

describe('bin/lib/gstack facade 兼容性', () => {
  test('gstack-claude facade 导出 installGstackClaudePack', () => {
    const { installGstackClaudePack, extractAllowedTools, buildClaudeCommand } = require('../bin/lib/gstack-claude');
    expect(typeof installGstackClaudePack).toBe('function');
    expect(typeof extractAllowedTools).toBe('function');
    expect(typeof buildClaudeCommand).toBe('function');
  });

  test('gstack-codex facade 透传 core 原语', () => {
    const codex = require('../bin/lib/gstack-codex');
    expect(typeof codex.installGstackCodexPack).toBe('function');
    expect(typeof codex.getGstackConfig).toBe('function');
    expect(typeof codex.extractNameAndDescription).toBe('function');
    expect(typeof codex.transformGstackSkillContent).toBe('function');
  });

  test('gstack-gemini facade 导出 transformGeminiSkillContent', () => {
    const gemini = require('../bin/lib/gstack-gemini');
    expect(typeof gemini.installGstackGeminiPack).toBe('function');
    expect(typeof gemini.transformGeminiSkillContent).toBe('function');
    expect(typeof gemini.buildGeminiCommand).toBe('function');
  });
});

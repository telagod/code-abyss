'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { installGstackPack } = require('../bin/lib/gstack/installer');
const openclawStrategy = require('../bin/lib/gstack/strategies/openclaw');

const fixtureRoot = path.join(__dirname, 'fixtures', 'gstack-codex-source');

describe('bin/lib/gstack/strategies/openclaw', () => {
  test('rewriteOpenClawPaths 替换 ~/.claude/skills 为 ~/.openclaw/skills', () => {
    const content = '看 ~/.claude/skills/gstack/review/checklist.md 完成审查';
    const rewritten = openclawStrategy.rewriteOpenClawPaths(content);
    expect(rewritten).toContain('~/.openclaw/skills/gstack/review/checklist.md');
    expect(rewritten).not.toContain('~/.claude/skills/gstack');
  });

  test('transformOpenClawSkillContent 是 rewriteOpenClawPaths 的别名', () => {
    const content = '~/.claude/skills/gstack/SKILL.md';
    expect(openclawStrategy.transformOpenClawSkillContent(content))
      .toBe(openclawStrategy.rewriteOpenClawPaths(content));
  });
});

describe('installGstackPack(openclaw, ...)', () => {
  test('安装到 ~/.openclaw/skills/gstack 且不写 commands', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-openclaw-'));
    const backupDir = path.join(tmpHome, '.openclaw', '.code-abyss-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    const manifest = { installed: [], backups: [] };

    const result = installGstackPack('openclaw', {
      HOME: tmpHome,
      backupDir,
      manifest,
      env: {
        ...process.env,
        CODE_ABYSS_GSTACK_SOURCE: fixtureRoot,
      },
    });

    const runtimeRoot = path.join(tmpHome, '.openclaw', 'skills', 'gstack');
    expect(result).toMatchObject({ installed: true, sourceMode: 'pinned' });
    expect(fs.existsSync(path.join(runtimeRoot, 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(runtimeRoot, 'review', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(runtimeRoot, 'office-hours', 'SKILL.md'))).toBe(true);
    // codex wrapper skill 应被 skipSkills 过滤掉（fixture 里 codex/SKILL.md 是给 codex 内部用的）
    // openclaw manifest 没设 skipSkills，所以会包含 codex/SKILL.md，这里不强求过滤
    expect(fs.existsSync(path.join(runtimeRoot, 'bin', 'gstack-update-check'))).toBe(true);
    expect(manifest.installed).toContainEqual({ root: 'openclaw', path: 'skills/gstack' });

    // 不应该写入 commands 目录
    expect(fs.existsSync(path.join(tmpHome, '.openclaw', 'commands'))).toBe(false);

    // SKILL.md 体应已 pathRewrite
    const reviewSkill = fs.readFileSync(path.join(runtimeRoot, 'review', 'SKILL.md'), 'utf8');
    expect(reviewSkill).not.toContain('~/.claude/skills/gstack');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('source=disabled 时跳过，不写入文件', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-openclaw-disabled-'));
    const backupDir = path.join(tmpHome, '.openclaw', '.code-abyss-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    const manifest = { installed: [], backups: [] };

    const result = installGstackPack('openclaw', {
      HOME: tmpHome, backupDir, manifest,
      sourceMode: 'disabled',
    });

    expect(result.installed).toBe(false);
    expect(result.sourceMode).toBe('disabled');
    expect(fs.existsSync(path.join(tmpHome, '.openclaw', 'skills', 'gstack'))).toBe(false);

    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('packs/gstack/manifest.json 配置了 openclaw host', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'packs', 'gstack', 'manifest.json'), 'utf8'));
    expect(manifest.hosts).toHaveProperty('openclaw');
    expect(Array.isArray(manifest.hosts.openclaw.runtimeDirs)).toBe(true);
    expect(manifest.hosts.openclaw.uninstall.runtimeRoot).toEqual({
      root: 'openclaw',
      path: 'skills/gstack',
    });
  });
});

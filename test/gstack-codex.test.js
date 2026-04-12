'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  extractNameAndDescription,
  condenseDescription,
  transformGstackSkillContent,
  listTopLevelSkillDirs,
  getGstackConfig,
  resolveGstackSource,
  installGstackCodexPack,
} = require('../bin/lib/gstack-codex');

describe('gstack codex integration', () => {
  const fixtureRoot = path.join(__dirname, 'fixtures', 'gstack-codex-source');

  test('extractNameAndDescription 支持 multiline description', () => {
    const content = fs.readFileSync(path.join(fixtureRoot, 'review', 'SKILL.md'), 'utf8');
    const parsed = extractNameAndDescription(content);

    expect(parsed.name).toBe('review');
    expect(parsed.description).toContain('Review skill.');
    expect(parsed.description).toContain('~/.claude/skills/gstack/review/checklist.md');
  });

  test('extractNameAndDescription 支持 CRLF frontmatter', () => {
    const content = fs.readFileSync(path.join(fixtureRoot, 'review', 'SKILL.md'), 'utf8').replace(/\n/g, '\r\n');
    const parsed = extractNameAndDescription(content);

    expect(parsed.name).toBe('review');
    expect(parsed.description).toContain('Review skill.');
  });

  test('transformGstackSkillContent 注入 GSTACK_ROOT 并改写路径', () => {
    const content = fs.readFileSync(path.join(fixtureRoot, 'review', 'SKILL.md'), 'utf8');
    const transformed = transformGstackSkillContent(content);

    expect(transformed).toContain('name: review');
    expect(transformed).toContain('GSTACK_ROOT="$HOME/.agents/skills/gstack"');
    expect(transformed).toContain('$GSTACK_ROOT/review/checklist.md');
    expect(transformed).not.toContain('allowed-tools:');
    expect(transformed).not.toContain('~/.claude/skills/gstack');
  });

  test('condenseDescription 会压缩长描述到单段短文', () => {
    const result = condenseDescription('one two three four five six seven eight nine ten eleven twelve', 24);
    expect(result.length).toBeLessThanOrEqual(24);
    expect(result.endsWith('...')).toBe(true);
  });

  test('listTopLevelSkillDirs 跳过 codex wrapper skill', () => {
    expect(listTopLevelSkillDirs(fixtureRoot)).toEqual(['office-hours', 'review']);
  });

  test('installGstackCodexPack 安装到 ~/.agents/skills/gstack 且不需要 AGENTS.md', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-home-'));
    const backupDir = path.join(tmpHome, '.codex', '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    const manifest = { installed: [], backups: [] };

    const installed = installGstackCodexPack({
      HOME: tmpHome,
      backupDir,
      manifest,
      env: {
        ...process.env,
        CODE_ABYSS_GSTACK_SOURCE: fixtureRoot,
      },
    });

    const runtimeRoot = path.join(tmpHome, '.agents', 'skills', 'gstack');
    expect(installed).toMatchObject({ installed: true, sourceMode: 'pinned' });
    expect(fs.existsSync(path.join(runtimeRoot, 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(runtimeRoot, 'review', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(runtimeRoot, 'office-hours', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(runtimeRoot, 'codex', 'SKILL.md'))).toBe(false);
    expect(fs.existsSync(path.join(runtimeRoot, 'bin', 'gstack-update-check'))).toBe(true);
    expect(fs.existsSync(path.join(runtimeRoot, 'review', 'SKILL.md.tmpl'))).toBe(false);
    expect(fs.existsSync(path.join(runtimeRoot, 'review', 'specialists', 'security.md'))).toBe(true);
    expect(manifest.installed).toContainEqual({ root: 'agents', path: 'skills/gstack' });

    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('installGstackCodexPack source=disabled 时跳过', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-disabled-home-'));
    const backupDir = path.join(tmpHome, '.codex', '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });

    const result = installGstackCodexPack({
      HOME: tmpHome,
      backupDir,
      manifest: { installed: [], backups: [] },
      sourceMode: 'disabled',
    });

    expect(result).toMatchObject({ installed: false, sourceMode: 'disabled', reason: 'disabled' });
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('resolveGstackSource 在 local 缺失时可回退到 pinned cache', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-fallback-home-'));
    const config = getGstackConfig();
    const cacheDir = path.join(tmpHome, '.code-abyss', 'vendor', `gstack-${config.upstream.commit.slice(0, 12)}`);
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, '.code-abyss-source-version'), `${config.upstream.commit}\n`);

    const resolved = resolveGstackSource({
      HOME: tmpHome,
      sourceMode: 'local',
      projectRoot: path.join(tmpHome, 'repo-without-vendor'),
      fallback: true,
      warn: () => {},
    });

    expect(resolved).toMatchObject({
      mode: 'pinned',
      reason: 'fallback-local-to-pinned',
      sourceRoot: cacheDir,
    });
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });
});

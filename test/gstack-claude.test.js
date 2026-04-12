'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  extractAllowedTools,
  buildClaudeCommand,
  installGstackClaudePack,
} = require('../bin/lib/gstack-claude');

describe('gstack claude integration', () => {
  const fixtureRoot = path.join(__dirname, 'fixtures', 'gstack-codex-source');

  test('extractAllowedTools 解析 YAML list', () => {
    const content = fs.readFileSync(path.join(fixtureRoot, 'review', 'SKILL.md'), 'utf8');
    expect(extractAllowedTools(content)).toBe('Bash, Read');
  });

  test('extractAllowedTools 支持 CRLF frontmatter', () => {
    const content = fs.readFileSync(path.join(fixtureRoot, 'review', 'SKILL.md'), 'utf8').replace(/\n/g, '\r\n');
    expect(extractAllowedTools(content)).toBe('Bash, Read');
  });

  test('buildClaudeCommand 生成 command frontmatter + skill path', () => {
    const command = buildClaudeCommand('review', 'Review skill. '.repeat(40), 'Bash, Read', '~/.claude/skills/gstack/review/SKILL.md');
    expect(command).toContain('name: review');
    expect(command).toContain('allowed-tools: Bash, Read');
    expect(command).toContain('~/.claude/skills/gstack/review/SKILL.md');
    expect(command.length).toBeLessThan(500);
  });

  test('installGstackClaudePack 安装 runtime root 与 commands', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-claude-home-'));
    const backupDir = path.join(tmpHome, '.claude', '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });
    const manifest = { installed: [], backups: [] };

    const installed = installGstackClaudePack({
      HOME: tmpHome,
      backupDir,
      manifest,
      env: {
        ...process.env,
        CODE_ABYSS_GSTACK_SOURCE: fixtureRoot,
      },
    });

    expect(installed).toMatchObject({ installed: true, sourceMode: 'pinned' });
    expect(fs.existsSync(path.join(tmpHome, '.claude', 'skills', 'gstack', 'review', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpHome, '.claude', 'skills', 'gstack', 'review', 'SKILL.md.tmpl'))).toBe(false);
    expect(fs.existsSync(path.join(tmpHome, '.claude', 'commands', 'review.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpHome, '.claude', 'commands', 'office-hours.md'))).toBe(true);
    expect(manifest.installed).toContainEqual({ root: 'claude', path: 'skills/gstack' });
    expect(manifest.installed).toContainEqual({ root: 'claude', path: 'commands/review.md' });

    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('installGstackClaudePack source=local 且无本地源时跳过', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-gstack-claude-local-home-'));
    const backupDir = path.join(tmpHome, '.claude', '.sage-backup');
    fs.mkdirSync(backupDir, { recursive: true });

    const result = installGstackClaudePack({
      HOME: tmpHome,
      backupDir,
      manifest: { installed: [], backups: [] },
      sourceMode: 'local',
      projectRoot: tmpHome,
    });

    expect(result).toMatchObject({ installed: false, sourceMode: 'local', reason: 'missing-local-source' });
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });
});

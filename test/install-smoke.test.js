'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

describe('install cli styles', () => {
  test('--list-styles 列出可用风格', () => {
    const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'install.js'), '--list-styles'], {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('abyss-cultivator');
    expect(result.stdout).toContain('abyss-concise');
  });
});

describe('claude install smoke', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-claude-home-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  function runInstall(args) {
    return spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'install.js'), ...args], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        HOME: tmpHome,
        USERPROFILE: tmpHome,
      },
      encoding: 'utf8',
    });
  }

  test('安装 Claude 时生成 commands 与 settings.json', () => {
    const result = runInstall(['--target', 'claude', '-y']);
    const claudeDir = path.join(tmpHome, '.claude');

    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(claudeDir, 'CLAUDE.md'))).toBe(true);
    expect(fs.existsSync(path.join(claudeDir, 'skills'))).toBe(true);
    expect(fs.existsSync(path.join(claudeDir, 'commands'))).toBe(true);
    expect(fs.existsSync(path.join(claudeDir, 'commands', 'gen-docs.md'))).toBe(true);
    expect(fs.existsSync(path.join(claudeDir, 'settings.json'))).toBe(true);
    expect(fs.existsSync(path.join(claudeDir, '.sage-uninstall.js'))).toBe(true);
  });

  test('安装 Claude 时支持 --style 切换 outputStyle', () => {
    const result = runInstall(['--target', 'claude', '--style', 'abyss-concise', '-y']);
    const claudeDir = path.join(tmpHome, '.claude');
    const settings = JSON.parse(fs.readFileSync(path.join(claudeDir, 'settings.json'), 'utf8'));

    expect(result.status).toBe(0);
    expect(settings.outputStyle).toBe('abyss-concise');
  });
});

describe('codex install smoke', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-codex-home-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  function runInstall(args) {
    return spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'install.js'), ...args], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        HOME: tmpHome,
        USERPROFILE: tmpHome,
      },
      encoding: 'utf8',
    });
  }

  test('安装 Codex 时生成 skills（含 agents/openai.yaml）且不写 settings.json', () => {
    const result = runInstall(['--target', 'codex', '-y']);
    const codexDir = path.join(tmpHome, '.codex');

    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(codexDir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(codexDir, 'skills'))).toBe(true);
    expect(fs.existsSync(path.join(codexDir, 'bin', 'lib'))).toBe(true);
    expect(fs.existsSync(path.join(codexDir, 'config.toml'))).toBe(true);
    expect(fs.existsSync(path.join(codexDir, 'settings.json'))).toBe(false);
    // Codex 0.117.0+ 已移除 custom prompts，不再生成 prompts/
    expect(fs.existsSync(path.join(codexDir, 'prompts'))).toBe(false);
  });

  test('安装 Codex 时根据 --style 动态生成 AGENTS.md', () => {
    const result = runInstall(['--target', 'codex', '--style', 'abyss-concise', '-y']);
    const codexDir = path.join(tmpHome, '.codex');
    const agents = fs.readFileSync(path.join(codexDir, 'AGENTS.md'), 'utf8');

    expect(result.status).toBe(0);
    expect(agents).toContain('# 冷刃简报 · 输出之道');
    expect(agents).toContain('道语标签、情绪模板、场景报告模板见当前选定的 `output-styles/*.md` 风格文件。');
  });

  test('安装 Codex 时会迁移旧 settings.json，卸载后恢复', () => {
    const codexDir = path.join(tmpHome, '.codex');
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, 'settings.json'), '{"legacy":true}\n');

    const install = runInstall(['--target', 'codex', '-y']);

    expect(install.status).toBe(0);
    expect(fs.existsSync(path.join(codexDir, 'settings.json'))).toBe(false);
    expect(install.stdout).toContain('移除 legacy settings.json');

    const uninstall = runInstall(['--uninstall', 'codex']);
    expect(uninstall.status).toBe(0);
    expect(fs.readFileSync(path.join(codexDir, 'settings.json'), 'utf8')).toContain('legacy');
  });
});

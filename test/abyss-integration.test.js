'use strict';

// abyss 联动层测试：hook 注入（幂等 + 路径重锚定）、版本契约、MCP 注册、lock tools 检查

const path = require('path');
const os = require('os');
const fs = require('fs');

const {
  HOOK_MARKER,
  resolveAbyssHookDir,
  injectClaudeHooks,
  injectGeminiHooks,
  stripAbyssHooks,
  compareVersions,
  satisfiesMin,
  checkLockToolRequirement,
  buildMcpEntry,
  injectGeminiMcp,
  injectClaudeMcp,
  MIN_ABYSS_VERSION,
  SKILL_MANIFEST_AVAILABLE_FROM,
  tryReadAbyssManifest,
  summarizeAbyssManifest,
  resolveAbyssMcpTools,
} = require('../bin/lib/abyss-integration.js');

const {
  injectCodexHooks,
  injectCodexMcp,
  stripCodexAbyssIntegration,
} = require('../bin/adapters/codex.js');

const {
  resolveReleaseTarget,
  assetName,
  releaseUrl,
} = require('../bin/lib/abyss-binary.js');

const TARGET_DIR = path.join('/home/user', '.claude');

describe('claude hook 注入', () => {
  test('空 settings 注入 SessionStart + PreToolUse，路径锚定安装目录', () => {
    const settings = {};
    injectClaudeHooks(settings, TARGET_DIR);
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    const cmd = settings.hooks.PreToolUse[0].hooks[0].command;
    expect(cmd).toContain(path.join(TARGET_DIR, 'skills', 'indexing-code', 'hooks', 'common'));
    expect(cmd).toContain('pre-edit-check.sh');
    expect(settings.hooks.PreToolUse[0].matcher).toBe('Edit|Write');
  });

  test('重复注入幂等（不产生重复条目）', () => {
    const settings = {};
    injectClaudeHooks(settings, TARGET_DIR);
    injectClaudeHooks(settings, TARGET_DIR);
    injectClaudeHooks(settings, TARGET_DIR);
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(settings.hooks.PreToolUse).toHaveLength(1);
  });

  test('指向易失路径的旧条目被重锚定（历史 bug 自愈）', () => {
    const settings = {
      hooks: {
        PreToolUse: [{
          matcher: 'Edit|Write',
          hooks: [{ type: 'command', command: 'bash "/tmp/npx-cache-123/skills/indexing-code/hooks/common/pre-edit-check.sh"', timeout: 5 }],
        }],
      },
    };
    injectClaudeHooks(settings, TARGET_DIR);
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toContain(TARGET_DIR);
    expect(settings.hooks.PreToolUse[0].hooks[0].command).not.toContain('npx-cache');
  });

  test('用户自有 hook 不被触碰', () => {
    const settings = {
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'my-custom-guard.sh' }] }],
      },
    };
    injectClaudeHooks(settings, TARGET_DIR);
    expect(settings.hooks.PreToolUse).toHaveLength(2);
    expect(JSON.stringify(settings.hooks.PreToolUse[0])).toContain('my-custom-guard');
  });
});

describe('gemini hook 注入', () => {
  test('注入 SessionStart + BeforeTool（gemini 事件形状）且幂等', () => {
    const settings = {};
    const dir = path.join('/home/user', '.gemini');
    injectGeminiHooks(settings, dir);
    injectGeminiHooks(settings, dir);
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(settings.hooks.BeforeTool).toHaveLength(1);
    expect(settings.hooks.BeforeTool[0].matcher).toBe('write_file|replace|edit_file');
    expect(settings.hooks.BeforeTool[0].hooks[0].name).toBe('abyss-check');
  });
});

describe('codex TOML hook 注入', () => {
  const HOOK_DIR = '/home/user/.codex/skills/indexing-code/hooks/common';

  test('空 config 注入数组表形态的两个 hook（Codex 0.125+ schema）', () => {
    const { merged, installed, skipped } = injectCodexHooks('', HOOK_DIR, '\n');
    expect(installed).toEqual(['hooks.SessionStart', 'hooks.PreToolUse']);
    expect(skipped).toEqual([]);
    // 数组表头：[[hooks.X]] + [[hooks.X.hooks]]，绝不能再出现扁平 [hooks.X]
    expect(merged).toContain('[[hooks.SessionStart]]');
    expect(merged).toContain('[[hooks.SessionStart.hooks]]');
    expect(merged).toContain('[[hooks.PreToolUse]]');
    expect(merged).toContain('[[hooks.PreToolUse.hooks]]');
    expect(merged).not.toMatch(/^\[hooks\./m);
    expect(merged).toContain('type = "command"');
    expect(merged).toContain(`${HOOK_DIR}/pre-edit-check.sh`);
  });

  test('重复注入幂等（节与键不重复）', () => {
    const first = injectCodexHooks('', HOOK_DIR, '\n').merged;
    const second = injectCodexHooks(first, HOOK_DIR, '\n').merged;
    const count = (second.match(/\[\[hooks\.PreToolUse\]\]/g) || []).length;
    expect(count).toBe(1);
    const cmdCount = (second.match(/pre-edit-check\.sh/g) || []).length;
    expect(cmdCount).toBe(1);
  });

  test('command_windows 仅在传入 winBash 时生成', () => {
    const without = injectCodexHooks('', HOOK_DIR, '\n').merged;
    expect(without).not.toContain('command_windows');
    const withWin = injectCodexHooks('', HOOK_DIR, '\n', { winBash: 'C:/Program Files/Git/bin/bash.exe' }).merged;
    expect(withWin).toContain('command_windows = "\\"C:/Program Files/Git/bin/bash.exe\\"');
  });

  test('旧路径条目被重锚定', () => {
    const stale = injectCodexHooks('', '/tmp/npx-cache/skills/indexing-code/hooks/common', '\n').merged;
    const fixed = injectCodexHooks(stale, HOOK_DIR, '\n').merged;
    expect(fixed).toContain(HOOK_DIR);
    expect(fixed).not.toContain('npx-cache');
  });

  test('用户自有 hook（无标记）不抢占', () => {
    const userCfg = '[hooks.PreToolUse]\nmatcher = "Bash"\ncommand = "my-guard.sh"\n';
    const { merged, skipped } = injectCodexHooks(userCfg, HOOK_DIR, '\n');
    expect(skipped).toContain('hooks.PreToolUse');
    expect(merged).toContain('my-guard.sh');
  });

  test('MCP 节注入且幂等', () => {
    let merged = injectCodexMcp('', '/opt/bin/abyss', '\n');
    merged = injectCodexMcp(merged, '/opt/bin/abyss', '\n');
    expect((merged.match(/\[mcp_servers\.abyss\]/g) || []).length).toBe(1);
    expect(merged).toContain('command = "/opt/bin/abyss"');
    expect(merged).toContain('args = ["mcp"]');
  });
});

describe('版本契约', () => {
  test('compareVersions 基本序', () => {
    expect(compareVersions('0.3.1', '0.3.0')).toBeGreaterThan(0);
    expect(compareVersions('0.3.0', '0.3.0')).toBe(0);
    expect(compareVersions('0.2.9', '0.3.0')).toBeLessThan(0);
    expect(compareVersions('1.0.0', '0.9.9')).toBeGreaterThan(0);
  });

  test('satisfiesMin 拒绝缺失与过旧（针对当前 MIN_ABYSS_VERSION 锁）', () => {
    // MIN_ABYSS_VERSION = 0.5.20 起步；0.5.x 起算稳定，0.5.22+ 解锁 skill-manifest
    expect(satisfiesMin('0.5.20', MIN_ABYSS_VERSION)).toBe(true);
    expect(satisfiesMin('0.5.23', MIN_ABYSS_VERSION)).toBe(true);
    expect(satisfiesMin('0.5.19', MIN_ABYSS_VERSION)).toBe(false);
    expect(satisfiesMin('0.3.1', MIN_ABYSS_VERSION)).toBe(false);
    expect(satisfiesMin(null, MIN_ABYSS_VERSION)).toBe(false);
  });

  test('SKILL_MANIFEST_AVAILABLE_FROM 在 MIN_ABYSS_VERSION 之上', () => {
    // 0.5.22+ 才有 skill-manifest；MIN 是 0.5.20 是允许的，
    // 但 0.5.20 / 0.5.21 不应被错误地认为「能跑 skill-manifest」
    expect(compareVersions(SKILL_MANIFEST_AVAILABLE_FROM, MIN_ABYSS_VERSION)).toBeGreaterThanOrEqual(0);
    expect(satisfiesMin('0.5.21', SKILL_MANIFEST_AVAILABLE_FROM)).toBe(false);
    expect(satisfiesMin('0.5.22', SKILL_MANIFEST_AVAILABLE_FROM)).toBe(true);
  });

  test('checkLockToolRequirement 覆盖缺失/过旧/满足/无声明', () => {
    const lock = { tools: { abyss: '>=0.3.1' } };
    expect(checkLockToolRequirement(lock, null)).toMatchObject({ ok: false, reason: 'missing' });
    expect(checkLockToolRequirement(lock, { version: '0.3.0' })).toMatchObject({ ok: false, reason: 'outdated' });
    expect(checkLockToolRequirement(lock, { version: '0.4.0' })).toMatchObject({ ok: true });
    expect(checkLockToolRequirement({}, { version: '0.4.0' })).toBeNull();
    expect(checkLockToolRequirement({ tools: { abyss: 'banana' } }, { version: '0.4.0' }))
      .toMatchObject({ ok: false, reason: 'unparsable' });
  });

  test('裸版本号视为 >=', () => {
    expect(checkLockToolRequirement({ tools: { abyss: '0.3.0' } }, { version: '0.3.1' }))
      .toMatchObject({ ok: true });
  });
});

describe('MCP 注册', () => {
  test('buildMcpEntry 默认 abyss，managed 路径透传', () => {
    expect(buildMcpEntry(null)).toEqual({ command: 'abyss', args: ['mcp'] });
    expect(buildMcpEntry('/home/u/.code-abyss/bin/abyss').command).toBe('/home/u/.code-abyss/bin/abyss');
  });

  test('injectGeminiMcp 幂等且保留其他 server', () => {
    const settings = { mcpServers: { other: { command: 'x' } } };
    injectGeminiMcp(settings, 'abyss');
    injectGeminiMcp(settings, 'abyss');
    expect(Object.keys(settings.mcpServers).sort()).toEqual(['abyss', 'other']);
  });

  test('injectClaudeMcp 写 ~/.claude.json 并保留已有内容', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-mcp-'));
    try {
      fs.writeFileSync(path.join(tmpHome, '.claude.json'), JSON.stringify({ projects: { '/x': {} }, mcpServers: { other: { command: 'x' } } }));
      const r = injectClaudeMcp({ HOME: tmpHome, binPath: 'abyss' });
      expect(r.written).toBe(true);
      const cfg = JSON.parse(fs.readFileSync(r.cfgPath, 'utf8'));
      expect(cfg.mcpServers.abyss).toEqual({ command: 'abyss', args: ['mcp'] });
      expect(cfg.mcpServers.other).toEqual({ command: 'x' });
      expect(cfg.projects).toEqual({ '/x': {} });
    } finally {
      fs.rmSync(tmpHome, { recursive: true, force: true });
    }
  });

  test('损坏的 ~/.claude.json 不覆盖', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-mcp-'));
    try {
      fs.writeFileSync(path.join(tmpHome, '.claude.json'), '{broken');
      const r = injectClaudeMcp({ HOME: tmpHome, binPath: 'abyss' });
      expect(r.written).toBe(false);
      expect(fs.readFileSync(path.join(tmpHome, '.claude.json'), 'utf8')).toBe('{broken');
    } finally {
      fs.rmSync(tmpHome, { recursive: true, force: true });
    }
  });
});

describe('abyss-binary 资产解析', () => {
  test('release target 与当前平台匹配', () => {
    const t = resolveReleaseTarget();
    // CI 跑在 linux/macos/windows x64|arm64 上，均应有映射
    expect(t).toBeTruthy();
    expect(t).toMatch(/^(x86_64|aarch64)-(unknown-linux-gnu|apple-darwin|pc-windows-msvc)$/);
  });

  test('资产名与 release.yml 的 archive: abyss-$target 对齐', () => {
    const t = resolveReleaseTarget();
    const name = assetName(t);
    if (process.platform === 'win32') expect(name).toBe(`abyss-${t}.zip`);
    else expect(name).toBe(`abyss-${t}.tar.gz`);
  });

  test('URL：latest 与钉版两种形态', () => {
    expect(releaseUrl('x86_64-unknown-linux-gnu', null))
      .toBe('https://github.com/telagod/abyss/releases/latest/download/abyss-x86_64-unknown-linux-gnu.tar.gz');
    expect(releaseUrl('x86_64-unknown-linux-gnu', '0.3.1'))
      .toBe('https://github.com/telagod/abyss/releases/download/v0.3.1/abyss-x86_64-unknown-linux-gnu.tar.gz');
  });
});

describe('卸载残留剥除', () => {
  test('stripAbyssHooks 只剥我方条目，空事件键收口', () => {
    const settings = {};
    injectClaudeHooks(settings, TARGET_DIR);
    settings.hooks.PreToolUse.push({ matcher: 'Bash', hooks: [{ type: 'command', command: 'user-guard.sh' }] });
    expect(stripAbyssHooks(settings)).toBe(true);
    expect(settings.hooks.SessionStart).toBeUndefined();
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(JSON.stringify(settings.hooks.PreToolUse[0])).toContain('user-guard');
  });

  test('stripAbyssHooks 全空时移除 hooks 容器，无我方条目返回 false', () => {
    const settings = {};
    injectClaudeHooks(settings, TARGET_DIR);
    expect(stripAbyssHooks(settings)).toBe(true);
    expect(settings.hooks).toBeUndefined();
    expect(stripAbyssHooks({ hooks: { PreToolUse: [{ matcher: 'x' }] } })).toBe(false);
  });

  test('stripCodexAbyssIntegration 剥除带标记 hook 节 + mcp 节，保留用户节', () => {
    const hookDir = '/home/u/.codex/skills/indexing-code/hooks/common';
    let cfg = 'model = "gpt"\n\n[profiles.full_auto]\napproval_policy = "on-request"\n';
    cfg = injectCodexHooks(cfg, hookDir, '\n').merged;
    cfg = injectCodexMcp(cfg, 'abyss', '\n');
    const { merged, removed } = stripCodexAbyssIntegration(cfg);
    expect(removed).toBe(true);
    expect(merged).not.toContain('indexing-code');
    expect(merged).not.toContain('mcp_servers.abyss');
    expect(merged).toContain('model = "gpt"');
    expect(merged).toContain('[profiles.full_auto]');
  });

  test('stripCodexAbyssIntegration 不动用户自有 hook 节', () => {
    const cfg = '[hooks.PreToolUse]\nmatcher = "Bash"\ncommand = "my-guard.sh"\n';
    const { merged, removed } = stripCodexAbyssIntegration(cfg);
    expect(removed).toBe(false);
    expect(merged).toContain('my-guard.sh');
  });
});

describe('hook 目录解析', () => {
  test('resolveAbyssHookDir 指向安装树而非包根', () => {
    const dir = resolveAbyssHookDir('/home/u/.claude');
    expect(dir).toBe(path.join('/home/u/.claude', 'skills', 'indexing-code', 'hooks', 'common'));
    expect(dir).toContain(HOOK_MARKER.split('/')[0]);
  });
});

describe('skill-manifest 能力发现', () => {
  // 锁一个空 HOME 目录，避免误命中宿主机上真的 ~/.code-abyss/bin/abyss
  function emptyHome() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-manifest-test-'));
  }

  test('abyss 不在 PATH 且 ~/.code-abyss/bin 也没有时返回 null', () => {
    const HOME = emptyHome();
    try {
      const pathBefore = process.env.PATH;
      process.env.PATH = HOME; // 一个绝对没 abyss 的目录
      try {
        // 走 detectAbyss → null 路径
        expect(tryReadAbyssManifest({ HOME })).toBeNull();
      } finally {
        process.env.PATH = pathBefore;
      }
    } finally {
      fs.rmSync(HOME, { recursive: true, force: true });
    }
  });

  test('显式 binPath 指向不存在的文件返回 null（不抛）', () => {
    expect(tryReadAbyssManifest({ binPath: '/no/such/abyss-bin-xyz' })).toBeNull();
  });

  // 真实 abyss 二进制烟囱测试。CI 上没装就 skip，本地有就跑——
  // ABYSS_BIN 显式指向也认。
  const realAbyss = process.env.ABYSS_BIN
    || (fs.existsSync('/home/telagod/project/code-abyss-dev/target/release/abyss')
      ? '/home/telagod/project/code-abyss-dev/target/release/abyss'
      : null);
  const maybeIt = realAbyss ? test : test.skip;

  maybeIt('对真实 abyss ≥ 0.5.22 返回 schema_version=1 的 manifest', () => {
    const m = tryReadAbyssManifest({ binPath: realAbyss });
    expect(m).toBeTruthy();
    expect(m.schema_version).toBe(1);
    expect(typeof m.version).toBe('string');
    expect(m.providers).toBeTruthy();
    expect(Array.isArray(m.providers.cli.commands)).toBe(true);
    expect(Array.isArray(m.providers.mcp.tools)).toBe(true);
    expect(Array.isArray(m.providers.daemon.verbs)).toBe(true);
    // 关键 verb：subscribe 是 0.5.22+ 新引入的，验证发现路径走通
    expect(m.providers.daemon.verbs).toContain('subscribe');
  });

  test('summarizeAbyssManifest 把 manifest 浓缩成单行', () => {
    expect(summarizeAbyssManifest(null)).toBeNull();
    const fake = {
      version: '0.5.23',
      schema_version: 1,
      providers: {
        cli: { commands: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
        mcp: { tools: ['x', 'y'] },
        daemon: { verbs: ['ping', 'subscribe'] },
      },
    };
    const s = summarizeAbyssManifest(fake);
    expect(s).toContain('abyss v0.5.23');
    expect(s).toContain('3 CLI commands');
    expect(s).toContain('2 MCP tools');
    expect(s).toContain('daemon verbs: ping, subscribe');
  });

  test('resolveAbyssMcpTools 优先用 manifest 否则 fallback', () => {
    // null manifest → fallback
    expect(resolveAbyssMcpTools(null)).toEqual(expect.arrayContaining(['search_context', 'get_symbols']));
    // 空数组也算无效，走 fallback
    expect(resolveAbyssMcpTools({ providers: { mcp: { tools: [] } } }, ['fb'])).toEqual(['fb']);
    // 有内容直接用
    expect(resolveAbyssMcpTools({ providers: { mcp: { tools: ['t1', 't2'] } } }, ['fb'])).toEqual(['t1', 't2']);
  });

  test('schema_version 不为 1 的 manifest 被拒（jest 单测 mock spawnSync）', () => {
    jest.resetModules();
    jest.doMock('child_process', () => ({
      spawnSync: (cmd, args) => {
        if (args && args[0] === '--version') {
          return { status: 0, stdout: 'abyss 0.5.23\n' };
        }
        if (args && args[0] === 'skill-manifest') {
          return { status: 0, stdout: JSON.stringify({ schema_version: 2, version: '0.5.23' }) };
        }
        return { status: 1, stdout: '' };
      },
    }));
    const { tryReadAbyssManifest: mocked } = require('../bin/lib/abyss-integration.js');
    expect(mocked({ binPath: '/fake/abyss' })).toBeNull();
    jest.dontMock('child_process');
    jest.resetModules();
  });
});

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const gstackFixture = path.join(__dirname, 'fixtures', 'gstack-codex-source');

function runInteractiveInstall({ tmpHome, steps, timeout = 30000, settleMs = 80 }) {
  return new Promise((resolve, reject) => {
    const cleanEnv = { ...process.env };
    delete cleanEnv.ANTHROPIC_API_KEY;
    delete cleanEnv.ANTHROPIC_AUTH_TOKEN;
    delete cleanEnv.ANTHROPIC_BASE_URL;

    const child = spawn(process.execPath, [path.join(projectRoot, 'bin', 'install.js')], {
      cwd: projectRoot,
      env: {
        ...cleanEnv,
        HOME: tmpHome,
        USERPROFILE: tmpHome,
        CODE_ABYSS_GSTACK_SOURCE: gstackFixture,
        // The persona/style flow under test must not depend on whether the
        // host has an abyss binary: without this, `ensureAbyssBinary()` (run
        // between "选择动作" and "选择人格") prompts to download on clean CI
        // and the driver — which has no step for that prompt — hangs to the
        // 30s timeout. Skip the offer entirely; detection still runs.
        CODE_ABYSS_SKIP_BINARY: '1',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    let stepIndex = 0;
    let waitMarker = steps[0]?.waitFor || null;

    const fail = (message) => {
      if (settled) return;
      settled = true;
      try { child.kill('SIGTERM'); } catch (_) { /* noop */ }
      reject(new Error(`${message}\nstdout:\n${stdout}\nstderr:\n${stderr}`));
    };

    const advance = () => {
      while (stepIndex < steps.length) {
        const step = steps[stepIndex];
        if (step.waitFor && !stdout.includes(step.waitFor)) {
          waitMarker = step.waitFor;
          return;
        }
        stepIndex += 1;
        const pause = step.pauseBefore ?? settleMs;
        const doWrite = () => { if (!settled) child.stdin.write(step.input); };
        if (pause > 0) setTimeout(doWrite, pause); else doWrite();
      }
      waitMarker = null;
    };

    child.stdout.on('data', chunk => {
      stdout += chunk.toString('utf8');
      if (stepIndex < steps.length) advance();
    });
    child.stderr.on('data', chunk => { stderr += chunk.toString('utf8'); });

    const killTimer = setTimeout(() => {
      const pending = waitMarker ? ` (waiting for marker: ${JSON.stringify(waitMarker)})` : '';
      fail(`interactive install timed out at step ${stepIndex}/${steps.length}${pending}`);
    }, timeout);

    child.on('error', reject);
    child.on('close', (status) => {
      clearTimeout(killTimer);
      if (!settled) resolve({ status, stdout, stderr });
    });

    advance();
  });
}

describe('interactive install TUI', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-tui-home-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('persona/style 使用 Tab 横向切换且只配置一次', async () => {
    const result = await runInteractiveInstall({
      tmpHome,
      steps: [
        { waitFor: '选择目标（可多选）', input: ' ' },
        { input: '\r' },
        { waitFor: '选择动作', input: '\r' },
        { waitFor: '选择人格', input: '\t' },
        { input: '\r' },
        { waitFor: '选择输出风格', input: '\t' },
        { input: '\r' },
        { waitFor: '配置自定义 provider', input: 'n\r' },
        { waitFor: '选择要安装的配置', input: '\r' },
      ],
    });
    const claudeDir = path.join(tmpHome, '.claude');
    const settings = JSON.parse(fs.readFileSync(path.join(claudeDir, 'settings.json'), 'utf8'));
    const claudeMd = fs.readFileSync(path.join(claudeDir, 'CLAUDE.md'), 'utf8');

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('tab/→ next');
    expect(claudeMd).toContain('文言小生');
    expect(settings.outputStyle).toBe('scholar-classic');
  }, 45000);
});

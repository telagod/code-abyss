'use strict';

// scripts/persona-battery/lib/claude-cli.js
// Thin wrapper around the installed `claude` CLI's headless/print mode, shared
// by the LLM judge (judge.js) and the transcript capture driver
// (capture-transcript.js). Payload shape confirmed live against claude v2.1.201:
// `--output-format json` returns { result: <final text>, is_error: bool, ... };
// exit code is 0 on success, non-zero on failure (auth, timeout, etc).
//
// Never throws on a resolution/exec/parse failure — returns null so callers
// can treat "couldn't get a real answer" as "don't score this", never as a
// silent pass (scripts/persona-battery/run.js's honesty contract).

const { spawnSync } = require('child_process');

function invokeClaude({ prompt, home, cwd, extraArgs = [], timeoutMs = 60000 }) {
  let result;
  try {
    result = spawnSync(
      'claude',
      ['-p', prompt, '--output-format', 'json', ...extraArgs],
      {
        cwd,
        env: { ...process.env, HOME: home },
        encoding: 'utf8',
        timeout: timeoutMs,
      }
    );
  } catch (e) {
    return null;
  }

  if (!result || result.error || result.status !== 0) return null;

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (e) {
    return null;
  }

  if (parsed.is_error || typeof parsed.result !== 'string') return null;
  return { text: parsed.result, raw: parsed };
}

module.exports = { invokeClaude };

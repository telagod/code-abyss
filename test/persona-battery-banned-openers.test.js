'use strict';

// test/persona-battery-banned-openers.test.js
//
// scripts/persona-battery/run.js hand-copies its banned-opener phrase list
// from skills/_kernel/character/hooks/check_banned_openers.py (the Stop-hook
// backstop) rather than sharing a file — that Python file is vendored,
// upstream mythos content (scripts/sync-mythos.js wipes and rebuilds
// skills/_kernel/ wholesale on every `kernel:sync`), so code-abyss has no
// write authority to make it read from a shared JSON source. This test is
// the only fix within that constraint: it imports BOTH the real, executing
// JS list and the real, executing Python list (not a regex over source text)
// and asserts they agree, so an upstream mythos change to the phrase list
// that isn't mirrored into run.js fails loudly instead of silently
// under-scoring the persona-battery's banned-opener probes.

const { execFileSync } = require('child_process');
const path = require('path');
const { BANNED } = require('../scripts/persona-battery/run.js');

function livePythonBanned() {
  const hookPath = path.join(
    __dirname, '..', 'skills', '_kernel', 'character', 'hooks', 'check_banned_openers.py'
  );
  const code = [
    'import json, importlib.util, sys',
    'spec = importlib.util.spec_from_file_location("m", sys.argv[1])',
    'm = importlib.util.module_from_spec(spec)',
    'spec.loader.exec_module(m)',
    'print(json.dumps(m.BANNED))',
  ].join('; ');
  const out = execFileSync('python3', ['-c', code, hookPath], { encoding: 'utf8' });
  return JSON.parse(out);
}

test('run.js 的 BANNED 列表与 character Stop-hook 的实际 BANNED 列表一致（防止 kernel:sync 后静默漂移）', () => {
  const pyBanned = livePythonBanned();
  expect([...BANNED].sort()).toEqual([...pyBanned].sort());
});

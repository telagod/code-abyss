// OpenClaw plugin: abyss code intelligence hooks
// Register via: api.on("before_tool_call", ...) in your OpenClaw plugin

const { execSync } = require('child_process');
const path = require('path');

const HOOK_DIR = path.join(__dirname, '..', 'common');

function hasAbyss() {
  try { execSync('command -v abyss', { stdio: 'ignore' }); return true; }
  catch { return false; }
}

module.exports = function register(api) {
  if (!hasAbyss()) return;

  api.on('session_start', async () => {
    try {
      execSync(`bash "${path.join(HOOK_DIR, 'session-init.sh')}"`, {
        stdio: ['pipe', 'pipe', 'inherit'], timeout: 10000
      });
    } catch {}
  });

  api.on('before_tool_call', async (event) => {
    const tool = event.tool || event.name || '';
    if (!['write_file', 'edit_file', 'replace', 'Edit', 'Write'].includes(tool)) {
      return { decision: 'allow' };
    }

    try {
      const input = JSON.stringify(event.params || {});
      execSync(`echo '${input.replace(/'/g, "\\'")}' | bash "${path.join(HOOK_DIR, 'pre-edit-check.sh')}"`, {
        stdio: ['pipe', 'pipe', 'inherit'], timeout: 5000
      });
    } catch {}

    return { decision: 'allow' };
  });
};

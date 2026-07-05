#!/usr/bin/env bash
# Install the character-kernel Stop-hook enforcement backstop for the detected host.
# Usage: bash install-character-hooks.sh [claude|codex|auto]
#
# SOURCE OF TRUTH lives at scripts/kernel-hooks/ (outside the sync-managed
# skills/_kernel/ tree, which sync-mythos.js wipes+rebuilds). sync-mythos.js
# overlays this file into skills/_kernel/character/hooks/ so it ships beside
# check_banned_openers.py and self-locates via SCRIPT_DIR at the installed path.
#
# This is the deterministic backstop for skills/_kernel/character/dissent.md §3
# (banned capitulation openers). Prose bans lose to the trained agree-reflex
# (claude-code #6120); the Stop hook forces one revision turn when a reply opens
# with a banned phrase. See check_banned_openers.py (vendored from mythos).
#
# Deliberately SEPARATE from the abyss code-graph hooks (marker
# indexing-code/hooks/common). This subsystem's marker is _kernel/character/hooks,
# so the two never strip or clobber each other. JSON merge uses node (no python3
# dependency for the merge itself — code-abyss requires node anyway). Idempotent:
# our own Stop entry is replaced, user entries untouched.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-auto}"
MARKER="_kernel/character/hooks"
HOOK_CMD="python3 \"${SCRIPT_DIR}/check_banned_openers.py\" || exit 0"

if [ "$TARGET" = "auto" ]; then
  if [ -d "${HOME}/.claude" ] || command -v claude &>/dev/null; then TARGET="claude"
  elif [ -f "${HOME}/.codex/config.toml" ] || command -v codex &>/dev/null; then TARGET="codex"
  else
    echo "No supported host detected. Specify: bash install-character-hooks.sh [claude|codex]"
    exit 1
  fi
fi

echo "Installing character Stop-hook enforcement for: $TARGET"

case "$TARGET" in
  claude)
    SETTINGS="${HOME}/.claude/settings.json"
    [ ! -f "$SETTINGS" ] && mkdir -p "$(dirname "$SETTINGS")" && echo '{}' > "$SETTINGS"
    SETTINGS_FILE="$SETTINGS" MARKER="$MARKER" HOOK_CMD="$HOOK_CMD" node -e '
      const fs = require("fs");
      const file = process.env.SETTINGS_FILE;
      const marker = process.env.MARKER;
      const s = JSON.parse(fs.readFileSync(file, "utf8"));
      const hooks = s.hooks = (s.hooks && typeof s.hooks === "object") ? s.hooks : {};
      const cur = Array.isArray(hooks.Stop) ? hooks.Stop : [];
      // drop our prior entry (idempotent), keep user entries
      hooks.Stop = cur.filter(e => !JSON.stringify(e).includes(marker))
        .concat([{ hooks: [{ type: "command", command: process.env.HOOK_CMD, timeout: 5 }] }]);
      fs.writeFileSync(file, JSON.stringify(s, null, 2) + "\n");
      console.log("✓ character Stop-hook installed in " + file);
    '
    ;;

  codex)
    # Codex's `Stop` hook is a near-exact parallel to Claude's: it fires at turn
    # scope after the final message, provides `last_assistant_message` + the
    # `stop_hook_active` loop-guard on stdin, and honors `{"decision":"block",
    # "reason":...}` on stdout (reason becomes an auto continuation prompt). So the
    # SAME check_banned_openers.py works verbatim — no payload adapter needed.
    # Requirements (per developers.openai.com/codex/hooks): `[features]
    # codex_hooks = true`, user-level config (repo-local .codex is ignored — bug
    # openai/codex#17532), command-type hooks only.
    SETTINGS="${HOME}/.codex/config.toml"
    [ ! -f "$SETTINGS" ] && mkdir -p "$(dirname "$SETTINGS")" && : > "$SETTINGS"
    SETTINGS_FILE="$SETTINGS" MARKER="$MARKER" SCRIPT_DIR="$SCRIPT_DIR" node -e '
      const fs = require("fs");
      const file = process.env.SETTINGS_FILE;
      const marker = process.env.MARKER;
      const cmd = `python3 "${process.env.SCRIPT_DIR}/check_banned_openers.py" || exit 0`;
      let t = fs.readFileSync(file, "utf8");
      // 1. Ensure the codex_hooks feature flag (idempotent, non-destructive).
      if (!/^\s*codex_hooks\s*=/m.test(t)) {
        if (/^\[features\]\s*$/m.test(t)) {
          t = t.replace(/^\[features\]\s*$/m, "[features]\ncodex_hooks = true");
        } else {
          t = t.replace(/\s*$/, "") + "\n\n[features]\ncodex_hooks = true\n";
        }
      }
      // 2. Append our Stop hook block unless already present (marker-idempotent).
      if (!t.includes(marker)) {
        const block = [
          "", "# character Stop-hook enforcement (" + marker + ")",
          "[[hooks.Stop]]", "[[hooks.Stop.hooks]]",
          "type = \"command\"",
          "command = \"" + cmd.replace(/"/g, "\\\"") + "\"",
          "timeout = 5", "",
        ].join("\n");
        t = t.replace(/\s*$/, "") + "\n" + block;
      }
      fs.writeFileSync(file, t);
      console.log("✓ character Stop-hook installed in " + file);
    '
    ;;

  *)
    echo "Unknown/unsupported host: $TARGET (supported: claude, codex)"
    exit 1
    ;;
esac

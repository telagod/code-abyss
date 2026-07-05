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
    # HONEST DEGRADATION (mythos "no silent caps"): the vendored backstop reads the
    # Claude Code Stop-input field `last_assistant_message`. Codex's hook payload
    # schema is different and its post-response event support is unverified, so
    # wiring this script to a Codex [[hooks.Stop]] would SILENTLY NO-OP (the field
    # is absent -> the guard never fires). We refuse to fake it. Enabling Codex
    # enforcement requires: (1) confirm Codex emits a post-response/Stop hook event,
    # (2) its stdin JSON schema, (3) a Codex payload adapter that maps Codex's
    # last-message field to what check_banned_openers.py reads.
    echo "SKIPPED (not silently): Codex Stop-hook enforcement is not wired." >&2
    echo "  Reason: check_banned_openers.py reads Claude's 'last_assistant_message';" >&2
    echo "  Codex does not provide that field, so the hook would never fire." >&2
    echo "  TODO: confirm Codex post-response hook event + schema, add a payload adapter." >&2
    exit 3
    ;;

  *)
    echo "Unknown/unsupported host: $TARGET (only claude is wired today)"
    exit 1
    ;;
esac

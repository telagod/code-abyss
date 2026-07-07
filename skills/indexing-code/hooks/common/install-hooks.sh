#!/usr/bin/env bash
# Install abyss hooks for the detected AI CLI platform
# Usage: bash install-hooks.sh [claude|codex|gemini|pi|hermes|openclaw|auto]
#
# JSON merging uses node (no python3 dependency — code-abyss requires node anyway).
# All branches are idempotent: existing abyss entries (marker:
# indexing-code/hooks/common) are replaced, user entries untouched.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_ROOT="$(dirname "$SCRIPT_DIR")"
TARGET="${1:-auto}"

# Auto-detect platform
if [ "$TARGET" = "auto" ]; then
  if [ -d ".claude" ] || command -v claude &>/dev/null; then TARGET="claude"
  elif [ -f "codex.toml" ] || command -v codex &>/dev/null; then TARGET="codex"
  elif [ -d ".gemini" ] || command -v gemini &>/dev/null; then TARGET="gemini"
  elif [ -d "${HOME}/.pi" ] || command -v pi &>/dev/null; then TARGET="pi"
  elif [ -d "${HOME}/.hermes" ] || command -v hermes &>/dev/null; then TARGET="hermes"
  elif command -v openclaw &>/dev/null; then TARGET="openclaw"
  else
    echo "No AI CLI detected. Specify: bash install-hooks.sh [claude|codex|gemini|pi|hermes|openclaw]"
    exit 1
  fi
fi

echo "Installing abyss hooks for: $TARGET"

# merge_json_hooks <settings-file> <session-event> <session-entry-json> <tool-event> <tool-entry-json>
merge_json_hooks() {
  SETTINGS_FILE="$1" SS_EVENT="$2" SS_ENTRY="$3" TOOL_EVENT="$4" TOOL_ENTRY="$5" node -e '
const fs = require("fs");
const file = process.env.SETTINGS_FILE;
const marker = "indexing-code/hooks/common";
const s = JSON.parse(fs.readFileSync(file, "utf8"));
const hooks = s.hooks = (s.hooks && typeof s.hooks === "object") ? s.hooks : {};
function upsert(ev, entry) {
  const cur = Array.isArray(hooks[ev]) ? hooks[ev] : [];
  hooks[ev] = cur.filter(e => !JSON.stringify(e).includes(marker)).concat([entry]);
}
upsert(process.env.SS_EVENT, JSON.parse(process.env.SS_ENTRY));
upsert(process.env.TOOL_EVENT, JSON.parse(process.env.TOOL_ENTRY));
fs.writeFileSync(file, JSON.stringify(s, null, 2) + "\n");
console.log("✓ hooks installed in " + file);
'
}

case "$TARGET" in
  claude)
    SETTINGS="${HOME}/.claude/settings.json"
    [ ! -f "$SETTINGS" ] && mkdir -p "$(dirname "$SETTINGS")" && echo '{}' > "$SETTINGS"
    merge_json_hooks "$SETTINGS" \
      SessionStart "{\"matcher\":\"\",\"hooks\":[{\"type\":\"command\",\"command\":\"bash \\\"${SCRIPT_DIR}/session-init.sh\\\"\",\"timeout\":10}]}" \
      PreToolUse "{\"matcher\":\"Edit|Write\",\"hooks\":[{\"type\":\"command\",\"command\":\"bash \\\"${SCRIPT_DIR}/pre-edit-check.sh\\\"\",\"timeout\":5}]}"
    ;;

  codex)
    SETTINGS="${HOME}/.codex/config.toml"
    if [ ! -f "$SETTINGS" ]; then
      mkdir -p "$(dirname "$SETTINGS")"
      echo "" > "$SETTINGS"
    fi

    if grep -q "indexing-code/hooks/common" "$SETTINGS" 2>/dev/null; then
      echo "✓ Codex hooks already present in $SETTINGS"
    else
      # Codex 0.125+ expects array-of-tables hooks; the old flat [hooks.X] form
      # is rejected with "invalid type: map, expected a sequence in hooks".
      cat >> "$SETTINGS" << TOML

# abyss hooks
[[hooks.SessionStart]]
matcher = "startup|resume"

[[hooks.SessionStart.hooks]]
type = "command"
command = "bash \"${SCRIPT_DIR}/session-init.sh\""
timeout = 10
statusMessage = "abyss: checking index"

[[hooks.PreToolUse]]
matcher = "Bash|shell|apply_patch|Edit|Write"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "bash \"${SCRIPT_DIR}/pre-edit-check.sh\""
timeout = 5
statusMessage = "abyss: checking callers"
TOML
      echo "✓ Codex hooks appended to $SETTINGS"
    fi
    ;;

  gemini)
    SETTINGS="${HOME}/.gemini/settings.json"
    [ ! -f "$SETTINGS" ] && mkdir -p "$(dirname "$SETTINGS")" && echo '{}' > "$SETTINGS"
    merge_json_hooks "$SETTINGS" \
      SessionStart "{\"matcher\":\"startup\",\"hooks\":[{\"name\":\"abyss-init\",\"type\":\"command\",\"command\":\"bash \\\"${SCRIPT_DIR}/session-init.sh\\\"\",\"timeout\":10000}]}" \
      BeforeTool "{\"matcher\":\"write_file|replace|edit_file\",\"hooks\":[{\"name\":\"abyss-check\",\"type\":\"command\",\"command\":\"bash \\\"${SCRIPT_DIR}/pre-edit-check.sh\\\"\",\"timeout\":5000}]}"
    ;;

  pi)
    SETTINGS="${HOME}/.pi/agent/settings.json"
    [ ! -f "$SETTINGS" ] && mkdir -p "$(dirname "$SETTINGS")" && echo '{}' > "$SETTINGS"
    merge_json_hooks "$SETTINGS" \
      session_start "{\"matcher\":\"\",\"hooks\":[{\"type\":\"command\",\"command\":\"bash \\\"${SCRIPT_DIR}/session-init.sh\\\"\",\"timeout\":10}]}" \
      tool_call "{\"matcher\":\"edit_file|write_file|Edit|Write\",\"hooks\":[{\"type\":\"command\",\"command\":\"bash \\\"${SCRIPT_DIR}/pre-edit-check.sh\\\"\",\"timeout\":5}]}"
    ;;

  hermes)
    CFG="${HOME}/.hermes/config.yaml"
    if [ -f "$CFG" ] && ! grep -q "session-init" "$CFG" 2>/dev/null; then
      cat >> "$CFG" << YAML

# abyss code intelligence hooks
hooks:
  on_session_start:
    - command: "bash \"${SCRIPT_DIR}/session-init.sh\""
  pre_tool_call:
    - command: "bash \"${SCRIPT_DIR}/pre-edit-check.sh\""
YAML
      echo "✓ Hermes hooks appended to $CFG"
    else
      # Also install as plugin
      PLUGIN_DIR="${HOME}/.hermes/plugins/abyss-hooks"
      mkdir -p "$PLUGIN_DIR"
      cp "${HOOK_ROOT}/hermes/plugin.py" "$PLUGIN_DIR/plugin.py"
      cat > "$PLUGIN_DIR/plugin.yaml" << YAML
name: abyss-hooks
version: 0.2.0
description: Code relationship graph hooks via abyss CLI
YAML
      echo "✓ Hermes plugin installed at $PLUGIN_DIR"
      echo "  Enable in ~/.hermes/config.yaml: plugins.enabled: [abyss-hooks]"
    fi
    ;;

  openclaw)
    # plugin.js resolves its hook scripts via path.join(__dirname, '..', 'common') —
    # it needs an `openclaw/` dir with a sibling `common/` wherever it lands, so a
    # flat single-file copy (the old behavior here — and the old printed instruction,
    # which told users to do the same broken copy manually) silently breaks that
    # lookup. Mirror the source hooks/ layout instead.
    PLUGIN_DIR="${HOME}/.openclaw/plugins/abyss-hooks"
    mkdir -p "$PLUGIN_DIR/openclaw"
    cp -r "${HOOK_ROOT}/common" "$PLUGIN_DIR/common"
    cp "${HOOK_ROOT}/openclaw/plugin.js" "$PLUGIN_DIR/openclaw/plugin.js"
    echo "✓ OpenClaw plugin installed at $PLUGIN_DIR/openclaw/plugin.js"
    echo "  Register it in your OpenClaw plugin config to enable it."
    ;;

  *)
    echo "Unknown platform: $TARGET"
    exit 1
    ;;
esac

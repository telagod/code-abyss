#!/usr/bin/env bash
# Install abyss hooks for the detected AI CLI platform
# Usage: bash install-hooks.sh [claude|codex|gemini|openclaw|auto]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_ROOT="$(dirname "$SCRIPT_DIR")"
TARGET="${1:-auto}"

# Auto-detect platform
if [ "$TARGET" = "auto" ]; then
  if [ -d ".claude" ] || command -v claude &>/dev/null; then TARGET="claude"
  elif [ -f "codex.toml" ] || command -v codex &>/dev/null; then TARGET="codex"
  elif [ -d ".gemini" ] || command -v gemini &>/dev/null; then TARGET="gemini"
  elif command -v openclaw &>/dev/null; then TARGET="openclaw"
  else
    echo "No AI CLI detected. Specify platform: bash install-hooks.sh [claude|codex|gemini|openclaw]"
    exit 1
  fi
fi

echo "Installing abyss hooks for: $TARGET"

case "$TARGET" in
  claude)
    SETTINGS="${HOME}/.claude/settings.json"
    [ ! -f "$SETTINGS" ] && echo '{}' > "$SETTINGS"

    python3 -c "
import json, sys
s = json.load(open('$SETTINGS'))
hooks = s.setdefault('hooks', {})

ss = hooks.setdefault('SessionStart', [])
if not any('session-init' in str(h) for h in ss):
    ss.append({'matcher':'','hooks':[{'type':'command','command':'bash \"${SCRIPT_DIR}/session-init.sh\"','timeout':10}]})

pt = hooks.setdefault('PreToolUse', [])
if not any('pre-edit-check' in str(h) for h in pt):
    pt.append({'matcher':'Edit|Write','hooks':[{'type':'command','command':'bash \"${SCRIPT_DIR}/pre-edit-check.sh\"','timeout':5}]})

json.dump(s, open('$SETTINGS','w'), indent=2)
print('✓ Claude Code hooks installed in $SETTINGS')
"
    ;;

  codex)
    SETTINGS="${HOME}/.codex/config.toml"
    if [ ! -f "$SETTINGS" ]; then
      mkdir -p "$(dirname "$SETTINGS")"
      echo "" > "$SETTINGS"
    fi

    # Codex hooks go in JSON format inside config.toml
    cat >> "$SETTINGS" << TOML

# abyss hooks
[hooks.SessionStart]
matcher = "startup|resume"
command = "bash \"${SCRIPT_DIR}/session-init.sh\""
timeout = 10

[hooks.PreToolUse]
matcher = "Bash|shell"
command = "bash \"${SCRIPT_DIR}/pre-edit-check.sh\""
timeout = 5
TOML
    echo "✓ Codex hooks appended to $SETTINGS"
    ;;

  gemini)
    SETTINGS="${HOME}/.gemini/settings.json"
    [ ! -f "$SETTINGS" ] && mkdir -p "$(dirname "$SETTINGS")" && echo '{}' > "$SETTINGS"

    python3 -c "
import json
s = json.load(open('$SETTINGS'))
hooks = s.setdefault('hooks', {})

ss = hooks.setdefault('SessionStart', [])
if not any('session-init' in str(h) for h in ss):
    ss.append({'matcher':'startup','hooks':[{'name':'abyss-init','type':'command','command':'bash \"${SCRIPT_DIR}/session-init.sh\"','timeout':10000}]})

bt = hooks.setdefault('BeforeTool', [])
if not any('pre-edit-check' in str(h) for h in bt):
    bt.append({'matcher':'write_file|replace|edit_file','hooks':[{'name':'abyss-check','type':'command','command':'bash \"${SCRIPT_DIR}/pre-edit-check.sh\"','timeout':5000}]})

json.dump(s, open('$SETTINGS','w'), indent=2)
print('✓ Gemini CLI hooks installed in $SETTINGS')
"
    ;;

  openclaw)
    echo "OpenClaw: copy the plugin file to your OpenClaw plugins directory:"
    echo "  cp ${HOOK_ROOT}/openclaw/plugin.js ~/.openclaw/plugins/abyss-hooks.js"
    echo "  Then register in your plugin config."
    ;;

  *)
    echo "Unknown platform: $TARGET"
    exit 1
    ;;
esac

#!/usr/bin/env bash
# SessionStart Hook: auto-index on first session in a project
# Runs abyss index if binary exists and index is stale or missing

set -euo pipefail

ABYSS="$(command -v abyss 2>/dev/null || echo "")"
# --with-abyss 安装的二进制不进 PATH，落点固定 ~/.code-abyss/bin/
[ -z "$ABYSS" ] && [ -x "${HOME}/.code-abyss/bin/abyss" ] && ABYSS="${HOME}/.code-abyss/bin/abyss"
[ -z "$ABYSS" ] && exit 0

DB=".code-abyss/index.db"

if [ ! -f "$DB" ]; then
  "$ABYSS" index >/dev/null 2>&1 &
  echo "[abyss] indexing project in background..." >&2
elif [ "$(find . -name '*.go' -o -name '*.rs' -o -name '*.ts' -o -name '*.py' -newer "$DB" 2>/dev/null | head -1)" ]; then
  "$ABYSS" index >/dev/null 2>&1 &
  echo "[abyss] re-indexing (files changed)..." >&2
fi

exit 0

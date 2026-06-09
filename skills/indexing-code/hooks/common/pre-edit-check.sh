#!/usr/bin/env bash
# Pre-Edit Hook: auto-check callers when editing code files
# Reads tool input JSON from stdin, extracts file_path, runs abyss context --json
# Outputs concise warning to stderr for Claude Code to read

set -euo pipefail

ABYSS="$(command -v abyss 2>/dev/null || echo "")"
[ -z "$ABYSS" ] && exit 0
[ ! -f ".code-abyss/index.db" ] && exit 0

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('file_path',''))" 2>/dev/null || true)
[ -z "$FILE_PATH" ] && exit 0

case "$FILE_PATH" in
  *.go|*.rs|*.ts|*.tsx|*.js|*.py|*.java|*.c|*.cpp|*.h) ;;
  *) exit 0 ;;
esac

# Run context analysis (JSON mode, fast — reads from pre-built index)
CTX=$("$ABYSS" context "$FILE_PATH" --json 2>/dev/null || echo "{}")

# Extract key metrics
CALLERS=$(echo "$CTX" | python3 -c "
import sys, json
d = json.load(sys.stdin)
syms = d.get('symbols_with_external_callers', [])
total = sum(len(s.get('external_callers',[])) for s in syms)
prod = sum(1 for s in syms for c in s.get('external_callers',[]) if not c.get('is_test'))
names = [s['symbol'] for s in syms if any(not c.get('is_test') for c in s.get('external_callers',[]))]
hs = d.get('hotspot') or {}
print(f'{total}|{prod}|{hs.get(\"score\",0):.0f}|{\",\".join(names[:5])}')
" 2>/dev/null || echo "0|0|0|")

IFS='|' read -r TOTAL PROD SCORE NAMES <<< "$CALLERS"

if [ "${PROD:-0}" -gt 0 ]; then
  echo "[abyss] ${FILE_PATH##*/}: ${PROD} production callers (${NAMES})" >&2
  if [ "${SCORE:-0}" -gt 5000 ]; then
    echo "[abyss] ⚠ hotspot file (score=${SCORE}). Run: abyss impact <func>" >&2
  fi
fi

exit 0

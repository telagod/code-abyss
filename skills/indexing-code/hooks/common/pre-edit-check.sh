#!/usr/bin/env bash
# Pre-Edit Hook: thin wrapper around `abyss hook pre-edit`.
# All logic (stdin JSON parsing across agent platforms, incremental index
# refresh, caller/ambiguity/hotspot warnings) lives in the abyss binary —
# one process, no python3 dependency. Requires abyss >= 0.3.0.

ABYSS="$(command -v abyss 2>/dev/null || echo "")"
# --with-abyss 安装的二进制不进 PATH，落点固定 ~/.code-abyss/bin/
[ -z "$ABYSS" ] && [ -x "${HOME}/.code-abyss/bin/abyss" ] && ABYSS="${HOME}/.code-abyss/bin/abyss"
[ -z "$ABYSS" ] && exit 0

exec "$ABYSS" hook pre-edit

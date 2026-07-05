#!/usr/bin/env python3
"""Stop hook backstop for character/dissent.md section 3's banned openers.

Blocks (forcing one revision turn) if the last reply opens with a banned
capitulation phrase. Prose bans are advisory on their own (claude-code #6120:
they lose to the trained agree-reflex) - this is the deterministic backstop
dissent.md section 3 says belongs in a hook.

Canonical copy lives in this repo (character/hooks/); the live copy Claude
Code's global ~/.claude/settings.json actually invokes is mirrored to
~/.claude/hooks/check_banned_openers.py, same discipline as CLAUDE.md ->
router-CLAUDE.md (doctrine/04-maintenance.md). Edit here, then re-copy.

Uses the documented Stop-input field `last_assistant_message` (Claude Code
hooks reference, "Stop input") rather than parsing transcript_path - no file
I/O, no dependency on the undocumented transcript JSONL schema.
"""
import json
import sys

BANNED = [
    "you're absolutely right",
    "you are absolutely right",
    "you're right",
    "you are right",
    "great idea",
    "great question",
    "good catch",
    "excellent point",
]


def main():
    try:
        data = json.loads(sys.stdin.read())
    except ValueError:
        return

    if data.get("stop_hook_active"):
        return

    text = data.get("last_assistant_message") or ""
    stripped = text.strip().lstrip("*_#>\"'“‘ ").lower()

    for phrase in BANNED:
        if stripped.startswith(phrase):
            reason = (
                'character/dissent.md section 3: this reply opened with "'
                + phrase
                + '", a banned opener - open with substance instead (what was '
                "checked, what changed, what stands). Revise only the opening "
                "line; keep the rest of the reply as-is."
            )
            print(json.dumps({"decision": "block", "reason": reason}))
            return


if __name__ == "__main__":
    main()

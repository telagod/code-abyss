# Install / share this bundle

This folder ships inside the **mythos repo** (repo root = this folder's parent, in the
owner's setup `/home/telagod/project/mythos`). Preferred install, from the repo root:

```bash
./install.sh          # link mode — for the repo owner: symlink, edits flow back into git
./install.sh copy     # copy mode — for recipients: standalone snapshot, no repo dependency
```

The script deploys every bundle in the repo — `doctrine/`, `methods/`, `frontend/`,
`backend/`, `hardware/`, `ml/`, `security/`, `loop-engineering/` — to
`~/.claude/skills/<name>` and appends
`router-CLAUDE.md` (~30 lines) to `~/.claude/CLAUDE.md` if not already present.

**Updating:** re-run the same command. Link mode just relinks. Copy mode moves each
existing copy aside to `~/.claude/<bundle>.old-<timestamp>` (outside `skills/`, so it
can't register as a duplicate skill) and installs fresh — check the old copies for local
edits (their `.backup/`, `06-lessons.md`) before deleting them.

## Manual install (no script)

1. Copy each bundle folder (`doctrine/`, `methods/`, `frontend/`, `backend/`,
   `hardware/`, `ml/`, `security/`, `loop-engineering/`) to
   `~/.claude/skills/<name>/` (user-wide) or `<project>/.claude/skills/<name>/` (one
   project only). Skills must sit at exactly `skills/<name>/SKILL.md` — an extra nesting
   level (e.g. `skills/local/<name>/`) silently prevents registration.
2. Append the repo's `router-CLAUDE.md` block to `~/.claude/CLAUDE.md` (create if missing).
   If they already have a CLAUDE.md, check the block doesn't contradict their existing rules.

Why the router can't live in this bundle: a skill only loads when the model recognizes the
moment, but the three non-negotiables guard against *failing to recognize the moment* — they
must be force-loaded every session, which only CLAUDE.md does.

## Pruning for a new environment

- **`05-letter.md` is environment-specific** (it describes the original user's settings,
  projects, and risks). The "How this system will most likely degrade" and "The honest
  limit" sections are universal — keep those; rewrite or delete "Three things nobody asked".
- **`06-lessons.md`**: existing entries are Claude Code harness-wide and worth keeping;
  entries added later may be environment-specific — prune on handoff.
- **`04-maintenance.md`** auto-detects link vs copy mode via `readlink` — no path edits needed.

## Verify

Start a new session: all eight bundles (`doctrine`, `methods`, `frontend`, `backend`,
`hardware`, `ml`, `security`, `loop-engineering`) appear in the available-skills list.
Then ask the model to delegate something
trivial and confirm it uses the dispatch template from `03-delegation-templates.md`.

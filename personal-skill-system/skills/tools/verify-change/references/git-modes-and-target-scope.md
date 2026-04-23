# Git Modes And Target Scope / Git 模式与目标范围

## 1. Mode Meaning

- `working`: current worktree state
- `staged`: what is prepared for commit
- `committed`: last committed diff surface

## 2. Target Scope

When a target directory is supplied, the analysis should be interpreted as scoped to that subtree, not the whole repository.

## 3. Review Questions

- are you looking at the right mode for the decision you need
- does the target scope match the review scope

## 4. Fallback When Git Process Is Restricted

If the runtime cannot spawn `git` (for example `EPERM` in restricted hosts), provide changed paths explicitly:

- CLI argument: `--changed-files "src/a.ts,docs/README.md"`
- file input: `--changed-files @.tmp_changed_files.txt`
- env fallback: `PSS_CHANGED_FILES` (also accepts `CODEX_CHANGED_FILES` and `CHANGED_FILES`)

## AI Tooling

This repository uses `.code-abyss/packs.lock.json` to declare AI packs.

- Update the lock with `npm run packs:update -- [flags]`.
- Validate it with `npm run packs:check`.
- Re-run `npx code-abyss --target claude|codex|gemini -y` after pack changes.

Current host policies: claude=auto, codex=auto, gemini=auto


## AI Pack Bootstrap

This repository declares Code Abyss packs in `.code-abyss/packs.lock.json`.

- claude: required=[gstack], optional=[none], optional_policy=auto
- codex: required=[gstack], optional=[none], optional_policy=auto
- gemini: required=[gstack], optional=[none], optional_policy=auto

Recommended install:

```bash
npx code-abyss --target claude -y
npx code-abyss --target codex -y
npx code-abyss --target gemini -y
```


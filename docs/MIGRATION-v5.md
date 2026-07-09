# Migrating to code-abyss 5.0 (Agent OS)

This is a **breaking** major release. The package still installs persona, skills, and style into Claude / Codex / Gemini / OpenClaw — but it no longer pretends to own the `abyss` code-graph binary or graph-hook injection for the three main hosts.

Design: [`design/agent-os-v5.md`](./design/agent-os-v5.md).

## One-screen upgrade

```bash
# 1) Reinstall the Agent OS layer (skills + persona + style + default enforcement + inject map)
npx code-abyss@5 -t claude -y

# 2) Code-graph binary (separate product)
curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash
# or: npm i -g @code-abyss/cli   |   cargo binstall code-abyss

# 3) Attach graph hooks (claude / codex / gemini)
abyss attach claude

# 4) Health + leftover migration hints
npx code-abyss doctor
```

Swap `claude` for `codex` / `gemini`. OpenClaw graph hooks (when needed):

```bash
npx code-abyss -t openclaw --with-hooks -y
```

## Flag map

| 4.x | 5.0 | Notes |
|-----|-----|--------|
| `--with-abyss` | **removed** | Install abyss via its own channels |
| `--with-mcp` | **removed** | Configure MCP client: `{ command: "abyss", args: ["mcp"] }` |
| `--with-hooks` (claude/codex/gemini) | **`abyss attach <host>`** | code-abyss strips legacy marker hooks on reinstall |
| `--with-hooks` (openclaw/pi/hermes) | **kept** | Spawns `install-hooks.sh` |
| `--with-enforcement` | **default on** (claude/codex) | Opt out: `--no-enforcement` |
| Reinstall to flip persona/style | **`compose`** | `npx code-abyss compose -t claude --persona <s> --style <s>` |

## New commands

| Command | Purpose |
|---------|---------|
| `npx code-abyss doctor` | Version, abyss detect, kernel sync, enforcement, compose budget, inject artifact, **migration hints** |
| `npx code-abyss compose -t <host> --persona … --style …` | Rewrite host guidance without recopying the skill tree |
| `npx code-abyss score` / `npm run score:mechanical` | Key-free banned-opener mechanical score |

## Behavioral changes you will notice

1. **Default install** on claude/codex installs the character Stop-hook (banned capitulation openers). Disable with `--no-enforcement`.
2. **Inject map** lands at `~/.claude/.code-abyss-inject.md` (and codex equivalent) — judgment must-load paths, not full kernel bodies.
3. **Always-on router** lists the 16 domain-gate skills from `inject-plane` (single source of truth).
4. **Remote personas** only fetch over HTTPS from allowlisted hosts (default: `raw.githubusercontent.com`); open redirects off-list are rejected.
5. **Invalid voice cards** still fall back to neutral voice, now with a **visible** `[code-abyss: neutral-fallback]` line in the rendered identity (not stderr-only).

## What we did not break

- Skill tree layout and `verify:skills` contracts (39 = 30 domain + 9 kernel).
- Backup / uninstall restore.
- Pack lock system; gstack remains non-default.
- Persona Voice Card schema (flat voice-only fields).

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No code-graph hooks | `abyss --version` then `abyss attach <host>` |
| Hooks 127 / missing scripts | Reinstall code-abyss (strips stale markers) + re-attach |
| “Polite” agree-openers still pass | Ensure enforcement ON: `doctor`; reinstall without `--no-enforcement` |
| Persona looks neutral | Doctor/stderr may show validation failure; fix the voice card |
| MCP tools missing | Add abyss MCP entry in the host client, not via code-abyss flag |

## Versioning note

`5.0.0` is the first release that **documents and ships** the kill-foyer + Agent OS surface as the supported path. Intermediate work lived on branch `feat/agent-os-v5-1-kill-foyer` / PR #59 before tag.

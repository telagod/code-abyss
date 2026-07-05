# Distill — where each learning lives (沉淀)

The step that makes the loop compound. A session that only ships code leaves the next
session exactly as weak as it found it; a session that also files what it learned makes
every future session cheaper. This file is the routing table.

## 1 · The question, asked every loop

Before a unit's delivery closes, ask once: **"What did this iteration teach that a
future session would otherwise pay for again?"** Most loops the honest answer is
*nothing* — say so and move on. Every stored item is a read tax on every future
session; hoarding is its own rot. When there IS something, route it:

| The learning is… | It goes to… |
|---|---|
| A harness quirk (would bite any project) | `doctrine/06-lessons.md` — format in `doctrine/04-maintenance.md` |
| A project fact not derivable from the repo/git (a goal, a constraint, who decides X) | project `memory/` — one file, one fact |
| A recurring project **procedure or judgment** (how we deploy, how to test X here, this codebase's domain rules) | a **project-level skill** — §3 |
| Generic domain judgment (would improve any backend/frontend/… work) | the matching global bundle, under `doctrine/04-maintenance.md`'s edit rules |
| A one-off detail of this conversation | nowhere — deliberately |

## 2 · Facts vs procedures — memory vs skill

**Memory holds facts** (recalled as background context); **skills hold procedures**
(a trigger that fires and steps that must be *executed*). The promotion rule, with an
observable trigger: a memory that sessions have had to **act on twice**, or anything
that is a multi-step procedure with a known failure mode, gets promoted to a
project-level skill. Make the twice-counter readable across sessions: when you execute
steps based on a memory entry, append `acted-on: <date> — <one line what>` to that
memory file before moving on; writing the *second* such line IS the trigger — promote
in the same loop. Facts age in memory fine; procedures buried in memory get
half-remembered and mis-executed.

> ✅ Memory: "staging DB resets nightly at 03:00 UTC." Skill: "deploying to staging —
> the 6 steps, including the migration-order trap in step 4."
> ❌ A 40-line deploy procedure stored as a memory file — background context nobody
> executes step-by-step — then a session deploys from vibes and hits the step-4 trap.

## 3 · Project-level skill mechanics (verified in this harness, 2026-07-04)

- **Path:** exactly `<project>/.claude/skills/<name>/SKILL.md` — project-level dirs DO
  register. No intermediate dirs (`skills/local/…` never registers —
  `doctrine/06-lessons.md`).
- **Registration is asynchronous, both ways:** a created skill appears in the
  available-skills list a few turns later (not instantly), and a deleted one can
  linger in the list. After creating: continue working, confirm it appears before a
  *later* session relies on it. Absence from the list right after creation is lag,
  not failure; presence right after deletion is staleness, not resurrection.
- **Shape:** SKILL.md = trigger description + router only, rule content in sibling
  files once it outgrows ~50 lines — the same law that governs the global bundles
  (`doctrine/04-maintenance.md`).
- **Version it:** the institution must be history-tracked. If the project's
  `.gitignore` excludes `.claude/`, a bare `!.claude/skills/` negation does NOT work —
  git never descends into a directory excluded as a whole, so negations under it are
  dead (verified 2026-07-04). What works: change the parent rule to `.claude/*`, then
  add `!.claude/skills/`. Can't touch the ignore rule? `git add -f` the skill files,
  or keep the bundle at the repo root as this repo does. If the owner ignored
  `.claude/` deliberately, follow their pattern or ask.
- **Fallback** if project-level dirs don't register in a given harness: keep the bundle
  in the repo and symlink it from `~/.claude/skills/<name>` — symlinked skill dirs work
  fully (`doctrine/06-lessons.md`).

## 4 · Write it so the weakest future reader can run it

The reader of what you distill is, by assumption, a weaker model with none of your
context. Rules carry an observable trigger + action + one ✅ and one ❌ example
(`methods/communicate.md` §1); pass the weakest-reader test (`methods/communicate.md`
§3); split model-facing rules from human-facing prose (`methods/communicate.md` §4).
After authoring or editing any bundle, run ``grep -rnE '`[a-z-]+\.md' <bundle>/`` and
check every hit: bare refs must exist in-folder, sibling-bundle refs must carry the
`<bundle>/` prefix, and every `§N` cited must exist (`doctrine/06-lessons.md`, entry
"new bundles leak bare cross-bundle refs") — a pointer to a section that isn't there
silently drops the rule for exactly the reader who can't recover from it.

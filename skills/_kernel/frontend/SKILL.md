---
user-invocable: true
name: frontend
description: Visual design taste for web UI, distilled from a stronger model's aesthetic - invoke when about to BUILD or STYLE any web page, component, artifact, or UI; picking a visual direction; writing CSS; reviewing how a design looks; or when a design works but feels generic or boring. Named style directions with exact tokens, concrete craft numbers, and a catalog of garbage design to refuse.
---

# Frontend — taste, styles, craft, and what to refuse

Rule content lives in the five files below; this SKILL.md only routes (duplicating rule
text here is drift — `doctrine/04-maintenance.md` governs edits to this bundle too).

## Route by moment

| You are about to… | Read (in this folder) |
|---|---|
| Start any page/component/artifact — brief to shipped | `process.md` first; it routes onward |
| Pick a visual direction, or choose between styles | `styles.md` |
| Understand what makes a design striking vs mediocre; make a boring design memorable | `taste.md` |
| Write actual CSS values — type, space, color, depth, motion, dark mode | `craft.md` |
| Judge a design (yours or anyone's); name precisely why something feels cheap | `garbage.md` |

Start with the ONE file that matches and follow its cross-references — they are required
inputs, not optional reading. Starting from scratch usually means `process.md` + the two
files it points you to.

## Scope and neighbors

This bundle is the **visual/aesthetic layer** only. Server-side design (stack, APIs,
data) → the `backend` bundle; whether to delegate → `doctrine`; how to think → `methods`. If the environment provides an `artifact-design` skill
(harness-side), it calibrates how much to invest per request; THIS bundle governs
direction and craft once you're building.

## The stance

Left unguided, every model produces the same page (`garbage.md` §A names it precisely).
What taste means here — and why a clean-but-forgettable page counts as a failure — is
`taste.md`'s opening; read it before judging any design.

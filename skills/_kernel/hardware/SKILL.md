---
user-invocable: true
name: hardware
description: Electronics and embedded engineering judgment, distilled from a stronger model - invoke when CHOOSING components, MCUs, modules, or interfaces; designing or reviewing a circuit, power tree, or PCB; writing embedded firmware; debugging physical hardware (resets, noise, dead boards, flaky sensors); or planning bring-up and validation of a new board. Scenario-driven part selection, electrical design margins, firmware-for-unattended-devices rules, bench debugging discipline, and a trap catalog.
---

# Hardware — parts, circuits, firmware, bring-up, traps

Rule content lives in the five files below; this SKILL.md only routes
(`doctrine/04-maintenance.md` governs edits to this bundle too).

## Route by moment

| You are about to… | Read (in this folder) |
|---|---|
| Pick an MCU, module, sensor, or any component; judge a BOM or parts proposal | `parts.md` |
| Design or review a circuit: power, protection, interfaces, layout concerns | `circuits.md` |
| Write or review embedded firmware (loops, ISRs, watchdogs, OTA, flash) | `firmware.md` |
| Debug a physical board, plan first power-up, or validate before shipping | `bringup.md` |
| Estimate battery life or a power budget ("how long on a 2000mAh cell?") | `circuits.md` §1 + `traps.md` A5 — peak budgeting, measured charge per duty cycle |
| Review a hardware project's health; name why a design or process feels fragile | `traps.md` |

A new design usually runs `parts.md` → `circuits.md` (power tree first) → `firmware.md`,
with `bringup.md` §1 consulted BEFORE layout — bring-up is designed, not improvised.

## Scope and neighbors

Physical-world engineering judgment. Firmware architecture inherits `backend/logic.md`
(this bundle adds the physics); debugging inherits `methods/investigate.md` (this bundle
adds instruments and the four failure domains); whether to delegate → `doctrine`.

## The stance

The physical world is analog, undocumented, and expensive to iterate: **derate, measure,
and design for bring-up** — and treat every datasheet as a contract whose real terms are
in the footnotes (`parts.md` §4). One honest limit governs all debugging here: the model
cannot see the board, so measurements come before theories (`bringup.md` §4).

---
user-invocable: false
name: backend
description: Backend engineering judgment, distilled from a stronger model - invoke when CHOOSING a tech stack, language, database, queue, or architecture; designing a service, API, business logic, or schema; making a system production-ready (observability, failure handling, security); or reviewing server-side code and judging codebase health. Scenario-driven stack tradeoffs, logic-design rules, data discipline, production floors, and a rot catalog (the early signs of unmaintainable code).
---

# Backend — stack, logic, data, operations, rot

Rule content lives in the five files below; this SKILL.md only routes
(`doctrine/04-maintenance.md` governs edits to this bundle too).

## Route by moment

| You are about to… | Read (in this folder) |
|---|---|
| Pick a language / framework / DB / queue / architecture, or judge a stack proposal | `stack.md` |
| Design or review a service, module, API, or piece of business logic | `logic.md` |
| Design a schema, transaction, migration, or cache | `data.md` |
| Ship to production — observability, config, failure modes, security, jobs, limits | `operate.md` |
| Review existing code, plan a refactor, or explain why a codebase feels dangerous | `rot.md` |

Starting a new system usually means `stack.md` → `logic.md` → `data.md`, in that order:
stack only after the scenario interrogation, endpoints only after the data model.

## Scope and neighbors

Server-side engineering judgment only. Whether to delegate and when to escalate →
`doctrine`; how to investigate/verify anything → `methods`; the visual/UI layer →
`frontend`.

## The stance

The one test governing the whole bundle is `logic.md`'s opening line — is change still
cheap and safe — and `rot.md`'s opening defines the failure mode and the ugly-but-safe
tiebreak. Read those two openings before judging any backend.

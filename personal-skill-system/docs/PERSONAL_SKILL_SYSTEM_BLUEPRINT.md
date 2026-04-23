# Personal Skill System Blueprint

## Objective

This is not a loose prompt archive.
It is a portable, self-hosting skill runtime that should remain:

1. routable
2. governable
3. executable where needed
4. portable across hosts
5. reference-rich without bloated entry points
6. evolvable by the system itself

## Directory model

```text
personal-skill-system/
  docs/
  registry/
  skills/
    routers/
    domains/
    workflows/
    tools/
    guards/
    adapters/
  packs/
  templates/
```

## Layer model

- `routers/`: top-level dispatch and conflict policy
- `domains/`: knowledge and judgement surfaces
- `workflows/`: multi-step execution chains
- `tools/`: deterministic checks and generators
- `guards/`: risk gates attached downstream
- `adapters/`: host-specific import notes and capability hints
- `references/` under each skill: deep content loaded only when needed

## Design principles

### 1. Thin entry, deep references

Keep `SKILL.md` concise.
Put heavy detail in `references/` unless the rule must always be in context.

### 2. Stable route surface

Do not expose every expert variant as a public peer skill.
Keep the route surface stable and escalate into depth only when needed.

### 3. Generated metadata must be honest

`registry.generated.json` and `route-map.generated.json` must describe the real bundle, not a partial subset.

### 4. Portable means self-contained

A copied bundle should not depend on sibling folders outside itself at answer time.
Source provenance may be recorded, but runtime depth must live inside the bundle.

### 5. Workflows own action, tools own proof

Use workflows for multi-step execution.
Use tools for deterministic validation.
Do not blur the two.

### 6. Guards are attached, not primary

Guards should gate risky work after routing.
They should not replace the router.

### 7. Expert depth should be normalized

When several expert sources overlap, merge them into one reusable reference instead of duplicating them across public skills.

### 8. The system must improve itself

The bundle should contain a first-class path for evolving the skill system itself.
That is the role of `skill-evolution`.

## Routing doctrine

Use this order:

1. explicit skill invocation
2. self-system work
3. action workflow
4. explicit validation tool
5. advisory domain
6. downstream guard

Route quality is judged by:

- correct first choice
- clear conflict handling
- sensible auto-chains
- minimal ambiguity
- graceful escalation into depth

## Depth tiers

Use three tiers of context:

1. metadata
2. `SKILL.md`
3. `references/` and deterministic scripts

The default should be to keep tiers 1 and 2 small and move density into tier 3.

## Pack model

- `personal-core`: reusable baseline bundle
- `project-overlay`: project-specific local constraints
- `work-private`: private assets and internal knowledge
- `experimental`: unstable ideas and staging area for promotion

## Governance

A serious personal skill system should maintain at least:

- schema validation
- registry completeness checks
- route regression
- link and reference integrity
- runtime smoke for tools and guards
- stale review rhythm
- collision detection
- encoding hygiene for portable files

## Maturity model

### Level 1: Portable skeleton

- basic layers exist
- copy-paste works
- route surface is recognizable

### Level 2: Reference-rich bundle

- each important skill has direct references
- domains and workflows are no longer hollow shells

### Level 3: Deterministic core

- tools and guards have real runtime behavior
- generated metadata is trustworthy

### Level 4: Expert depth

- overlapping expert knowledge is normalized into internal references
- escalation rules are explicit

### Level 5: Self-evolving system

- the bundle can audit, redesign, and harden itself through first-class skills and governance loops

## Current direction

The current design direction is:

- portable but not shallow
- generated but still readable
- expert-depth aware without route sprawl
- self-hosting rather than dependent on external sibling skill folders

## Evolution path

1. keep the route surface clean
2. deepen references where repeated hard decisions occur
3. normalize expert overlays into portable internal depth
4. improve generated registry and route coverage
5. keep adding governance before adding more public surface area
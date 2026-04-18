# Routing And Depth Strategy

## First separate three things

- direct route surface
- execution chain
- expert depth

Do not solve all three by making SKILL.md longer.

## Route surface rules

Use direct routing for:

- stable user intents
- high-frequency request classes
- actions that need predictable entry points

Keep out of direct routing:

- niche variants
- overlapping expert personas
- long examples that only add token cost

## Depth rules

Use references for:

- checklists
- pattern catalogs
- selection matrices
- edge-case heuristics
- expert overlays

Normalize repeated ideas into one shared reference instead of copying them into several skills.

## Escalation model

Recommended order:

1. route to the smallest correct skill
2. load direct references for that skill
3. escalate to expert depth only if the baseline layer is insufficient
4. attach validation or guards only when the task crosses a risk threshold

## Self-system work

When the target artifact is the skill system itself:

- prefer `skill-evolution`
- use `architecture-decision` only for large irreversible design choices
- use tools and guards as downstream checks, not as primary reasoning engines

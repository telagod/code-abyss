# Chart Visualization Routing And Scope

## Scope Boundary

Use `chart-visualization` when the core output is one of:

- G2 chart spec or runnable chart code
- S2 pivot/cross-table config and usage
- infographic DSL artifact
- T8 narrative text visualization artifact
- chart or icon retrieval API playbook usage

## Conflict Resolution

- if the primary ask is page layout, hierarchy, interaction polish, and accessibility -> route to `frontend-design`
- if the primary ask is code integration, refactor, runtime bugfix, or test repair -> route to `development`
- if the primary ask is architecture tradeoff, service split, or migration -> route to `architecture`

## Depth Strategy

Use progressive depth:

1. domain `SKILL.md` for route judgement
2. capability map for module choice
3. target reference file for exact syntax and constraints

## First-Round Constraint

Round 1 is knowledge-only import:

- no scripted runtime
- no network tool wrappers
- no auto-chain to validation tools

Tooling should be introduced only after route quality is stable.

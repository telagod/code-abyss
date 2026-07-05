---
name: operating-kicad-eda
description: "KiCad EDA orchestration via kicad-mcp MCP server. Routes 17 tools for schematic creation, PCB layout, autorouting, DRC, and Gerber export. Enforces serialized PCB ops, library-first lookup, and autoroute-only routing."
user-invocable: true
argument-hint: "<operation: schematic|pcb|route|drc|export|full-pipeline>"
allowed-tools: Read, Bash
# Read: inspect KiCad files and MCP tool schemas
# Bash: run kicad-cli for ERC/DRC, Python scripts for footprint injection
---

# Operating KiCad EDA

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/hardware/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> MCP tool router for KiCad 9. Never guess, never hand-route, never parallelize PCB writes.

## When to use

| Scenario | Use | Approach |
|----------|-----|----------|
| Create schematic from design doc | Yes | `schematic()` operations |
| Generate PCB from schematic | Yes | `build_pcb_from_schematic` |
| Route a PCB | Yes | `autoroute(operation="run")` only |
| Fix DRC violations | Yes | `drc(operation="autofix")` |
| Export manufacturing files | Yes | `export()` Gerber/BOM/render |
| Hand-place a single trace | **NO** | LLM traces violate clearances |

## Iron rules

1. **NEVER hand-route** — `pcb(add_trace/add_via)` produces DRC-failing garbage. Use `autoroute(operation="run")`.
2. **NEVER guess names** — footprint and symbol names change between KiCad versions. Always `library(operation="search")` first.
3. **SERIALIZE PCB ops** — MCP PCB tools do load/modify/save. Parallel calls corrupt the `.kicad_pcb` file.
4. **VERIFY after changes** — `drc(operation="run")` + `audit(operation="all")` before declaring done.

## MCP tool routing table

| Task | MCP Tool | Operation |
|------|----------|-----------|
| Search parts | `library` | `search` |
| Create/edit schematic | `schematic` | `create_symbol`, `add_wire`, `add_label` |
| Build PCB from schematic | `build_pcb_from_schematic` | — (standalone) |
| Place footprints | `pcb` | `place_footprint` |
| Set board outline | `pcb` | `set_board_outline` |
| Add zones (copper pour) | `pcb` | `add_zone` |
| Auto-route | `autoroute` | `run` |
| Run DRC | `drc` | `run` |
| Auto-fix DRC | `drc` | `autofix` |
| Export Gerber | `export` | `gerber` |
| Export BOM | `export` | `bom` |
| 3D render | `export` | `render` |
| Estimate board size | `estimate_board_size` | — (standalone) |
| Suggest placement | `suggest_placement` | — (standalone) |
| Full audit | `audit` | `all` |

## Standard pipeline

```
1. library(search) → find symbols and footprints
2. schematic(create_symbol) → place all components
3. schematic(add_wire/add_label) → connect nets
4. [Python] footprint injection script → fix kicad-cli lookup
5. build_pcb_from_schematic → initial PCB
6. pcb(set_board_outline) → product form factor
7. suggest_placement or pcb(place_footprint) → position components
8. autoroute(run) → FreeRouter
9. drc(run) → check
10. drc(autofix) → fix violations
11. pcb(add_zone) → GND copper pour both layers
12. export(gerber) → manufacturing files
13. export(render) → 3D views
```

## References

| Topic | File |
|-------|------|
| KiCad 9 parse quirks | [kicad9-quirks.md](references/kicad9-quirks.md) |
| DRC fix strategies | [drc-strategies.md](references/drc-strategies.md) |
| Footprint injection | [footprint-injection.md](references/footprint-injection.md) |

## Exit criteria

- [ ] ERC: 0 errors (warnings acceptable)
- [ ] DRC: 0 violations
- [ ] All nets routed (no unconnected)
- [ ] Gerber zip exportable

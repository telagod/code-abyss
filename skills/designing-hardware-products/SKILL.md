---
name: designing-hardware-products
description: "AI-automated hardware product pipeline: from requirements to manufacturable Gerber + compiled firmware + cross-platform app. Orchestrates system design, ESP-IDF firmware, KiCad PCB, UniApp client, and release packaging in a zero-human-touch flow."
user-invocable: true
argument-hint: "<product-brief: MCU, sensors, features, form-factor>"
allowed-tools: Read, Bash, Write, Edit, Agent, Workflow
# Bash: build firmware (idf.py), generate assets (Python scripts), run uni build
# Write/Edit: create design docs, firmware source, app pages, KiCad scripts
# Agent: parallelize phases (firmware + hardware + app)
# Workflow: orchestrate multi-phase pipeline
---

# Designing Hardware Products

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/hardware/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> From empty directory to shippable product. Requirements in, Gerber + .bin + .apk out.

## When to use

| Scenario | Use | Why |
|----------|-----|-----|
| New IoT / embedded product from scratch | Yes | Full pipeline |
| Adding BLE app to existing hardware | Partial | Phase 4 only |
| PCB redesign with existing firmware | Partial | Phase 3 only |
| One-off breadboard prototype | No | Overkill, just wire it |

## Pipeline phases

```
Phase 1: System Design    → DESIGN.md (architecture, topology, protocol)
Phase 2: Firmware          → ESP-IDF components, FreeRTOS tasks, BLE GATT
Phase 3: Hardware          → KiCad schematic → PCB → route → DRC → Gerber
Phase 4: Mobile App        → UniApp (BLE, i18n, dev mode, SVG icons)
Phase 5: Verify + Package  → build all → zip release
```

Each phase is independently re-runnable. Skip phases that already exist.

## Key decision points

1. **MCU selection** — ESP32-C3 (BLE+WiFi, RISC-V, cheap) vs ESP32-S3 (AI, USB) vs STM32 (low power) vs nRF (BLE-only)
2. **HV topology** — if product needs high voltage (mosquito swatter, taser), see [references/hv-design.md](references/hv-design.md)
3. **PCB form factor** — match physical product shape, not default rectangle
4. **App framework** — UniApp (WeChat+Android+iOS) vs React Native vs Flutter

## Companion skills

- **[operating-kicad-eda](../operating-kicad-eda/SKILL.md)** — Phase 3 detail, KiCad MCP tool routing
- **developing-software** — firmware language patterns (C for ESP-IDF)
- **developing-mobile-apps** — app framework patterns

## Usage

```
/designing-hardware-products "BLE mosquito swatter with kill counting, ESP32-C3, 30x100mm PCB strip"
```

## References

| Topic | File |
|-------|------|
| Phase execution details | [pipeline-phases.md](references/pipeline-phases.md) |
| KiCad 9 gotchas | [kicad9-quirks.md](references/kicad9-quirks.md) |
| ESP-IDF patterns | [esp-idf-patterns.md](references/esp-idf-patterns.md) |
| HV circuit design | [hv-design.md](references/hv-design.md) |
| UniApp patterns | [uniapp-patterns.md](references/uniapp-patterns.md) |

## Exit criteria

- [ ] `idf.py build` passes (firmware)
- [ ] KiCad DRC = 0 violations (hardware)
- [ ] `npx uni build` passes (app)
- [ ] Release zip contains: source + binary + Gerber + BOM + docs

# Chart Visualization Integration

## Objective

Integrate AntV chart generation, table analysis, infographic authoring, and narrative text visualization into the portable `PERSONAL_SKILL_SYSTEM` without exploding the public route surface.

## Current Shape

Public route surface stays small:

- domain: `chart-visualization`
- tool: `verify-chart-spec`
- tool: `verify-s2-config`

Internal depth is expanded through references and module groups.

## Imported Capability Layers

### G2

- chart spec guardrails
- chart selection
- marks and transforms
- components, layouts, scales, coordinates
- annotations and reference marks
- shared tooltip and navigation

### S2

- sheet model and config
- framework bindings
- advanced table features
- customization and extensions

### Communication Outputs

- infographic DSL
- T8 narrative text visualization
- chart image API
- icon retrieval API

## Why This Fits The System

- keeps a single stable domain route instead of exposing many public peer skills
- pushes heavy knowledge into `references/`
- adds a deterministic validation tool only where rule-based checks are valuable
- keeps the bundle portable and self-contained

## Deterministic Validation Layer

`verify-chart-spec` now covers:

- v4 API drift
- malformed transform and coordinate config
- annotation and reference mark misuse
- shared tooltip and navigation dependency errors
- image and text mark content-shape errors
- render API payload omissions

`verify-s2-config` now covers:

- `SheetComponent` required prop shape
- `dataCfg.fields` structural mistakes
- pagination wiring mistakes
- imperative S2 cleanup omissions

## Current Integration Status

- route-map integrated
- registry integrated
- fixture coverage added for English and Chinese chart tasks
- chart-specific module groups registered
- deterministic chart-spec validator installed
- deterministic S2 config validator installed
- regression tests authored for major rule families

## Verification Status

- `verify-skill-system` passes on the integrated bundle
- targeted runtime tests in `test/personal_skill_system_tools.test.js` pass in `--runInBand` mode
- full-repo Jest still has unrelated failures in installer, packs, and gen-docs suites; these are outside the chart-visualization integration surface

## Remaining Work

- run Jest after test dependencies are installed
- decide whether to add a second deterministic tool for render payload verification or S2 config verification

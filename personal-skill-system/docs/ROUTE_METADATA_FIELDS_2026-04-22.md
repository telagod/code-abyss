# ROUTE METADATA FIELDS (2026-04-22)

Scope: `personal-skill-system/registry/route-map.generated.json`
Card: `CARD-M2-001`

## 1) Goal

Extend route metadata beyond keyword + priority so route entries can express:

- rationale (why this route should win)
- confidence thresholds (when this route is reliable)
- fallback behavior (what to do under low confidence)

This is additive and backward-compatible for current heuristic routing.

## 2) New Route Fields

Each route may include:

### `rationale`

- `primary-intent`: normalized description of route intent class
- `why-this-route`: short winning rationale
- `wins-when`: positive signals expected for this route
- `avoid-when`: negative signals that should reduce confidence
- `boundary-notes`: adjacent-route conflict notes and boundary reminders

### `confidence`

- `minimum-score`: minimum score considered routeable
- `strong-score`: score band where route is usually stable
- `very-strong-score`: score band where route should win decisively
- `requires-fallback-below-minimum`: whether fallback must trigger below minimum

### `fallback`

- `mode`: `ask-one-question` | `do-not-auto-route` | `direct-route`
- `clarify-question`: host-facing clarification prompt template
- `default-action`: action if confidence is insufficient
- `safe-skill` (optional): nearest safe fallback route for conflict cases

## 3) Compatibility Contract

- Existing fields remain unchanged (`skill`, `kind`, `priority`, `activation`, `conflicts-with`, `auto-chain`, etc.).
- Current route engine can ignore new fields without breaking behavior.
- `route.schema.json` now accepts these fields explicitly.

## 4) Intended M2 Follow-Up Usage

These fields are designed for `CARD-M2-002` and `CARD-M2-003` to support:

- candidate reasoning output
- confidence-aware route selection
- explicit low-confidence fallback behavior

## 5) Notes

- No public skill surface changes are introduced in this card.
- Metadata is descriptive now; behavioral enforcement is deferred to hybrid routing cards.

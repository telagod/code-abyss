# Heuristic S2 Scan Boundaries

## What This Tool Is Good At

- catching missing required props on `SheetComponent`
- flagging obviously malformed `fields` shape
- surfacing likely lifecycle omissions in imperative S2 usage
- catching common pagination wiring mistakes

## What It Does Not Prove

- runtime correctness of custom spreadsheet factories
- whether a pivot or table layout is semantically the best design
- whether a field name actually exists in remote data sources
- framework-specific abstractions that generate config elsewhere

## Use Rule

Treat this tool as a fast structural gate for S2 integration quality, not as a full renderer or type checker.

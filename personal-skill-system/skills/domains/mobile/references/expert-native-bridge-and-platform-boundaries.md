# Expert Native Bridge And Platform Boundaries

## Use

Use this when React Native, Flutter, or cross-platform abstractions hide native platform cost or behavior.

## Rules

- bridge crossings are architecture decisions, not implementation trivia
- shared code should stop where native semantics diverge materially
- background execution and notification handling often require native truth
- platform-specific UX should not be flattened into lowest-common-denominator habits

## Output

- bridge boundary
- native ownership points
- abstraction risks

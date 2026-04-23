# Local And CI Smoke Policy (2026-04-23)

## Verdict

Use a two-tier smoke strategy:

1. CI runs full child-process install smoke.
2. Local restricted environments run direct/in-process validation and record sandbox deltas.

This is the optimal path because local `spawnSync(node)` can fail with `EPERM` under the current sandbox even when direct `node bin/install.js` works.

## Observed Local Behavior

| Check | Result |
|---|---|
| Direct `node bin/install.js --list-styles` | Works. |
| Jest install smoke using `spawnSync(process.execPath, ...)` | Fails locally with `spawnSync ... EPERM`. |
| `verify-skill-system` | Passes. |
| `personal_skill_system_tools.test.js` | Passes. |

## Policy

| Environment | Required Checks |
|---|---|
| Local restricted shell | `verify-skill-system`, targeted unit tests, direct CLI command where possible. |
| Local unrestricted shell | Full targeted Jest smoke if child process spawning is available. |
| CI | Full package install/uninstall smoke across `ubuntu`, `macos`, and `windows`. |

## Implementation Guidance

| Card | Action |
|---|---|
| `CARD-P2-007` | Extract library returns from `process.exit` so install behavior can be tested in-process. |
| `CARD-P2-010` | Add more unit-level pack/docs tests that do not require child processes. |
| `CARD-P7-001` to `CARD-P7-003` | Keep host smoke as real host-level evidence, not a replacement for unit tests. |

## Failure Classification

| Failure | Class |
|---|---|
| `spawnSync node EPERM` in sandbox | `host/sandbox` |
| CLI exits non-zero in unrestricted shell | `installer` |
| Package smoke fails in CI | `distribution` |
| Host command missing after install | `host-adapter` |

## Rule

Do not weaken CI because of local sandbox limits.

Instead, make local validation honest:

- record the sandbox limitation
- run the strongest non-child-process tests available
- rely on CI or unrestricted smoke for package-level proof


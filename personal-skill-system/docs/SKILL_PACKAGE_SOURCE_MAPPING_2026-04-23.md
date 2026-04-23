# Skill Package Source Mapping (2026-04-23)

## Verdict

`package.json` must ship the authoritative skill source under `personal-skill-system/`.

The repo-level installer and pack manifests now route host runtimes directly from `personal-skill-system/skills` into runtime `skills/`.

Root `skills/` is no longer part of package shipping policy.

## Package Policy

| Package entry | Role |
|---|---|
| `personal-skill-system/` | authoritative skill source, generated metadata, benchmark evidence, and governance docs |
| `bin/` | installer runtime and distribution verification logic |
| `packs/` | host file placement policy |
| `config/`, `output-styles/` | host runtime core files |

## Rules

- edit skill truth first in `personal-skill-system/skills/`
- treat `package.json.files` as shipping policy, not as another skill registry
- route all host runtime `skills/` installs from `personal-skill-system/skills`
- keep root `skills/` out of shipped package contents
- fail distribution validation if any host manifest or package policy points back to the legacy root mirror

## Immediate Validation Hook

`bin/verify-skill-distribution.js` is the repo-level proof hook for this policy:

1. confirm `package.json.files` includes the authoritative source
2. confirm `packs/abyss/manifest.json` routes every host `skills/` surface to `personal-skill-system/skills`
3. fail if package or distribution policy points back to root `skills/`

Root mirror gap inventory remains diagnostic only; it is no longer the shipped runtime gate under `方案A`.

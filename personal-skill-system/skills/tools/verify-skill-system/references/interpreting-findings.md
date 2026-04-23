# Interpreting Findings

## Error

Treat as bundle breakage:

- malformed frontmatter
- duplicate skill names
- registry points to missing skill
- user-invocable skill missing from route-map
- scripted runtime without script entry
- route-map points to unknown skill

## Warning

Treat as meaningful debt:

- missing references declared in `SKILL.md`
- kind mismatches directory intent
- public skill with weak trigger surface
- generated metadata drift that does not fully break execution yet

## Info

Treat as cleanup or hardening opportunity:

- reference depth could improve
- bundle shape is valid but uneven
- optional governance artifact is missing

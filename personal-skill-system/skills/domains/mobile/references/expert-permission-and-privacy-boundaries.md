# Expert Permission And Privacy Boundaries

## Use

Use this when a feature touches camera, location, notifications, contacts, files, or local sensitive data.

## Rules

- ask for permissions at the moment of value, not at app launch
- permission denial must have a graceful degraded path
- cache only data you can justify to a privacy reviewer
- local storage is part of the trust boundary

## Output

- permission timing
- privacy boundary
- degraded behavior

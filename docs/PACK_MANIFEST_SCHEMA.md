# Pack Manifest Schema

`packs/<name>/manifest.json` is the minimum contract for third-party packs.

## Required top-level fields

```json
{
  "name": "example-pack",
  "description": "What this pack installs.",
  "hosts": {}
}
```

- `name`: must match the directory name under `packs/`
- `description`: non-empty human-readable summary
- `hosts`: per-host install metadata

## Optional top-level fields

```json
{
  "reporting": {
    "label": "Example Pack",
    "artifactPrefix": "example-pack"
  },
  "projectDefaults": {
    "claude": "optional",
    "codex": "required"
  },
  "upstream": {
    "provider": "git",
    "repo": "https://github.com/org/repo.git",
    "commit": "abc123...",
    "version": "1.2.3"
  }
}
```

- `reporting.label`: human-facing name used in install/uninstall output
- `reporting.artifactPrefix`: prefix used for report artifact filenames
- `projectDefaults.<host>`: `required|optional`
- `upstream`: required only for packs that support `source=pinned` or vendor sync
- `upstream.provider`: `git | local-dir | archive`

## Host contract

Each host block may define `files`, `uninstall`, and host-specific runtime metadata.

```json
{
  "hosts": {
    "claude": {
      "files": [
        { "src": "config/CLAUDE.md", "dest": "CLAUDE.md", "root": "claude" }
      ],
      "uninstall": {
        "runtimeRoot": { "root": "claude", "path": "skills/example-pack" },
        "commandRoot": { "root": "claude", "path": "commands" },
        "commandExtension": ".md",
        "commandsFromRuntime": true,
        "commandAliases": {
          "primary-command": ["legacy-alias"]
        }
      }
    }
  }
}
```

### `files`

Used by the main installer for bundled/core packs.

- `src`: repo-relative source path
- `dest`: destination path relative to the selected root
- `root`: one of `claude|codex|agents`

### `uninstall`

Used by `node bin/packs.js uninstall <pack>`.

- `runtimeRoot.root`: install root name (`claude|codex|agents|gemini`)
- `runtimeRoot.path`: runtime directory to remove
- `commandRoot`: optional command directory root for command cleanup
- `commandExtension`: optional command filename suffix, defaults to `.md`
- `commandsFromRuntime`: if true, derive command names from subdirectories under `runtimeRoot`
- `commandAliases`: optional extra command names to delete

## Source modes

`packs.lock` can reference a pack with:

- `pinned`: use `upstream.repo + upstream.commit`
- `local`: use `.code-abyss/vendor/<pack>` or explicit env override
- `disabled`: keep the declaration but skip installation

If a pack wants `pinned` or `local`, it should declare `upstream`.

### Upstream providers

- `git`: requires `repo` and `commit`
- `local-dir`: requires `path`
- `archive`: requires `path` to a local tar/zip archive

Additional providers can be registered by dropping CommonJS modules into:

- `.code-abyss/vendor-providers/`
- `vendor-providers/`

Each provider module must export:

- `name`
- `validate(upstream)`
- `sync(ctx)`
- `status(ctx)`

## Reporting contract

Pack-aware operations write JSON reports to `.code-abyss/reports/`.

- Install reports are written by the main installer and include `pack_reports`
- `packs uninstall <pack>` writes a dedicated uninstall report
- `reporting.artifactPrefix` controls report filename prefixes for future tooling

## Validation rules

Current validation enforces:

- `name`, `description`, `hosts` must exist
- only known hosts are allowed
- each `files[]` entry must include `src`, `dest`, `root`
- each `uninstall.runtimeRoot` must include `root`, `path`
- `reporting.label` and `reporting.artifactPrefix` must be strings when present

## Minimal third-party example

```json
{
  "name": "acme-pack",
  "description": "Acme internal workflow pack.",
  "reporting": {
    "label": "Acme Pack",
    "artifactPrefix": "acme-pack"
  },
  "projectDefaults": {
    "claude": "optional",
    "codex": "optional",
    "gemini": "optional"
  },
  "upstream": {
    "repo": "https://github.com/acme/acme-pack.git",
    "commit": "0123456789abcdef",
    "version": "0.1.0"
  },
  "hosts": {
    "claude": {
      "uninstall": {
        "runtimeRoot": { "root": "claude", "path": "skills/acme-pack" },
        "commandRoot": { "root": "claude", "path": "commands" },
        "commandsFromRuntime": true
      }
    },
    "codex": {
      "uninstall": {
        "runtimeRoot": { "root": "agents", "path": "skills/acme-pack" }
      }
    },
    "gemini": {
      "uninstall": {
        "runtimeRoot": { "root": "gemini", "path": "skills/acme-pack" },
        "commandRoot": { "root": "gemini", "path": "commands" },
        "commandExtension": ".toml",
        "commandsFromRuntime": true
      }
    }
  }
}
```

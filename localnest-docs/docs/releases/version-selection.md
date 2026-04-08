---
description: Choose the correct LocalNest version line with explicit install commands for the current stable release, older stable releases, and archived beta releases.
---

# Version Selection

Use this page to choose a LocalNest version line and install it explicitly.

## Recommended defaults

- Want the latest beta: use `0.0.7-beta.2` (temporal KG, CLI-first, 52 tools)
- Want the previous beta: use `0.0.6-beta.1`
- Want the current stable release: use `0.0.5`
- Want the previous stable behavior: use `0.0.3`
- Need older behavior for compatibility: use the archived beta rows below

Common upgrade commands:

```bash
localnest upgrade stable
localnest upgrade beta
localnest upgrade 0.0.7-beta.2
localnest upgrade 0.0.5
localnest upgrade 0.0.3
```

## Install commands by version

| Version | Channel | Install command |
| --- | --- | --- |
| `0.0.7-beta.2` | current beta | `npm install -g localnest-mcp@0.0.7-beta.2` |
| `0.0.6-beta.1` | previous beta | `npm install -g localnest-mcp@0.0.6-beta.1` |
| `0.0.5` | current stable | `npm install -g localnest-mcp@0.0.5` |
| `0.0.4-beta.9` | archived beta | `npm install -g localnest-mcp@0.0.4-beta.9` |
| `0.0.4-beta.8` | archived beta | `npm install -g localnest-mcp@0.0.4-beta.8` |
| `0.0.4-beta.7` | archived beta | `npm install -g localnest-mcp@0.0.4-beta.7` |
| `0.0.4-beta.6` | archived beta | `npm install -g localnest-mcp@0.0.4-beta.6` |
| `0.0.4-beta.5` | archived beta | `npm install -g localnest-mcp@0.0.4-beta.5` |
| `0.0.4-beta.4` | archived beta | `npm install -g localnest-mcp@0.0.4-beta.4` |
| `0.0.3` | stable | `npm install -g localnest-mcp@0.0.3` |
| `0.0.2-beta.3` | archived beta | `npm install -g localnest-mcp@0.0.2-beta.3` |
| `0.0.2-beta.2` | archived beta | `npm install -g localnest-mcp@0.0.2-beta.2` |
| `0.0.1-beta.1` | archived beta | `npm install -g localnest-mcp@0.0.1-beta.1` |

## Post-install command differences

| Version | `localnest-mcp-install-skill` | Setup style |
| --- | --- | --- |
| `0.0.6-beta.1` | yes (deprecated compatibility alias) | canonical `localnest` CLI + soft-deprecated helper wrappers |
| `0.0.5` | yes | stable promotion of beta.9 fixes + installed-runtime validation hardening |
| `0.0.4-beta.9` | yes | skill version reporting fix + beta.8 runtime baseline |
| `0.0.4-beta.8` | yes | startup/runtime regression fixes + sqlite-vec status hardening |
| `0.0.4-beta.7` | yes | global-first + sqlite-vec auto-detection + Hugging Face runtime |
| `0.0.4-beta.6` | yes | global-first + release-hardening + restructured internals |
| `0.0.4-beta.5` | yes | global-first + `localnest upgrade` command path |
| `0.0.4-beta.4` | yes | global-first + memory consent |
| `0.0.3` | yes | global-first |
| `0.0.2-beta.3` | yes | transitional (`npm -g` + `npx` setup common) |
| `0.0.2-beta.2` | yes (introduced here) | transitional |
| `0.0.1-beta.1` | no | `npx`-first setup flow |

## Notes

- If you need deterministic behavior across environments, pin exact versions instead of using floating tags.
- `0.0.6-beta.1` is the current prerelease line for testing the CLI deprecation pass before the next stable promotion.
- The phrase "beta 9" in this repo maps to `0.0.4-beta.9` package naming.
- Use [Release Matrix](./history) for context, [Current Release](./current) for active stable behavior, and the archived per-version pages for [0.0.4-beta.9](/docs/versions/0.0.4-beta.9/overview) or [0.0.4-beta.8](/docs/versions/0.0.4-beta.8/overview) when you need frozen prerelease notes.

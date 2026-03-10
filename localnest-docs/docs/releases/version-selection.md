---
description: Choose the correct LocalNest version line with explicit install commands for the current stable release and archived beta releases.
---

# Version Selection

Use this page to choose a LocalNest version line and install it explicitly.

## Recommended defaults

- Want the current stable release: use `0.0.4`
- Want the last beta line before stable: use `0.0.4-beta.7`
- Need older behavior for compatibility: use the archived beta rows below

## Install commands by version

| Version | Channel | Install command |
| --- | --- | --- |
| `0.0.4` | current stable | `npm install -g localnest-mcp@0.0.4` |
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
| `0.0.4` | yes | stable line with sqlite-vec auto-detection + Hugging Face runtime |
| `0.0.4-beta.7` | yes | pre-stable beta with sqlite-vec auto-detection + Hugging Face runtime |
| `0.0.4-beta.6` | yes | global-first + release-hardening + restructured internals |
| `0.0.4-beta.5` | yes | global-first + `localnest upgrade` command path |
| `0.0.4-beta.4` | yes | global-first + memory consent |
| `0.0.3` | yes | global-first |
| `0.0.2-beta.3` | yes | transitional (`npm -g` + `npx` setup common) |
| `0.0.2-beta.2` | yes (introduced here) | transitional |
| `0.0.1-beta.1` | no | `npx`-first setup flow |

## Notes

- If you need deterministic behavior across environments, pin exact versions instead of using floating tags.
- Use [Release Matrix](./history) for context, [Current Release](./current) for the active stable behavior, and the archived per-version pages when you need frozen release notes.

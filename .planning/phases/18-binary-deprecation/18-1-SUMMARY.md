---
phase: "18"
plan: "1"
subsystem: cli/deprecation
tags: [deprecation, cli, backward-compat]
dependency_graph:
  requires: [Phase 10, Phase 13]
  provides: [DEP-01, DEP-02, DEP-03, DEP-04]
  affects: [bin/_shared.js, bin/localnest-mcp-*.js]
tech_stack:
  added: []
  patterns: [ANSI escape codes for colored stderr warnings]
key_files:
  created: []
  modified:
    - bin/_shared.js
    - bin/localnest-mcp-setup.js
    - bin/localnest-mcp-doctor.js
    - bin/localnest-mcp-upgrade.js
    - bin/localnest-mcp-install-skill.js
decisions:
  - "Yellow ANSI codes (\\x1b[33m) for deprecation warning color, consistent with Phase 10 raw ANSI approach"
  - "Fixed broken command forwarding by adding commandArgs to all 4 binaries"
  - "Changed localnest-mcp-install-skill replacement from 'localnest install skills' to 'localnest skill install' per DEP-04"
metrics:
  duration: "1m46s"
  completed: "2026-04-08"
  tasks: 1
  files: 5
---

# Phase 18 Plan 1: Binary Deprecation Summary

Yellow ANSI deprecation warnings on all 4 legacy binaries with correct command forwarding via commandArgs

## What Was Done

Updated `printDeprecationWarning` in `bin/_shared.js` to output yellow-colored (ANSI `\x1b[33m`) deprecation messages to stderr in the format: `[localnest] DEPRECATED: Use "<new>" instead of "<old>".`

Fixed all 4 legacy binaries to include `commandArgs` so they actually forward to the correct unified CLI command instead of falling through to help output:

| Legacy Binary | Replacement | commandArgs |
|---|---|---|
| localnest-mcp-setup | localnest setup | `['setup']` |
| localnest-mcp-doctor | localnest doctor | `['doctor']` |
| localnest-mcp-upgrade | localnest upgrade | `['upgrade']` |
| localnest-mcp-install-skill | localnest skill install | `['skill', 'install']` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken command forwarding in all 4 binaries**
- **Found during:** Task 1
- **Issue:** Legacy binaries called `forwardDeprecatedCommand` without `commandArgs`, so `buildLocalnestCommandArgv` produced argv with no command token. This meant `localnest.js` saw an empty command and showed help instead of executing the intended command.
- **Fix:** Added `commandArgs` to each binary's `forwardDeprecatedCommand` call (e.g., `['setup']`, `['doctor']`, `['upgrade']`, `['skill', 'install']`)
- **Files modified:** bin/localnest-mcp-setup.js, bin/localnest-mcp-doctor.js, bin/localnest-mcp-upgrade.js, bin/localnest-mcp-install-skill.js
- **Commit:** 1332253

**2. [Rule 1 - Bug] Fixed localnest-mcp-install-skill replacement command**
- **Found during:** Task 1
- **Issue:** `replacementCommand` was `'localnest install skills'` but DEP-04 specifies `'localnest skill install'` (noun-verb pattern)
- **Fix:** Changed to `'localnest skill install'` with `commandArgs: ['skill', 'install']`
- **Files modified:** bin/localnest-mcp-install-skill.js
- **Commit:** 1332253

## Out-of-Scope Discoveries

Two other deprecated binaries (`localnest-mcp-capture-outcome.js`, `localnest-mcp-task-context.js`) have the same missing-commandArgs bug but are not in the DEP-01..04 scope.

## Commits

| Hash | Message |
|---|---|
| 1332253 | feat(18-1): add yellow ANSI deprecation warnings to legacy binaries |

## Known Stubs

None.

## Self-Check: PASSED

All 5 modified files verified present on disk. Commit 1332253 verified in git log.

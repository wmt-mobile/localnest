---
gsd_state_version: 1.0
milestone: v0.2.0
milestone_name: Memory-KG Fusion & Agent-First Surface
status: active
stopped_at: "Milestone v0.2.0 initialized on release/0.2.0 branch — defining requirements"
last_updated: "2026-04-09T12:30:00Z"
last_activity: "2026-04-09 - Started milestone v0.2.0 on release/0.2.0 branch"
progress:
  total_phases: 13
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09 for v0.2.0)

**Core value:** A single local MCP server that handles both code retrieval AND rich structured memory — no cloud dependencies, no external databases, pure SQLite.
**Current focus:** v0.2.0 Memory-KG Fusion — batch writes, terse responses, auto-linked memory-KG, unified retrieval, symbol-aware code intelligence. Branch: release/0.2.0.

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-04-09 - Milestone v0.2.0 started on release/0.2.0 branch

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 1
- Average duration: 4m25s
- Total execution time: ~5 minutes

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 10 | 1 | 4m25s | 4m25s |
| 11 | 1 | 2m30s | 2m30s |
| 12 | 1 | 3m00s | 3m00s |
| 13 | 1 | 1m38s | 1m38s |
| 14 | 1 | 2m05s | 2m05s |
| 15 | 1 | 1m03s | 1m03s |
| 16 | 1 | 1m50s | 1m50s |
| 17 | 1 | 1m30s | 1m30s |
| 18 | 1 | 1m46s | 1m46s |

**Recent Trend:**

- Plan 10-1: 4m25s (6 tasks, 11 files)
- Plan 11-1: 2m30s (1 task, 1 file)
- Plan 12-1: 3m00s (1 task, 1 file)
- Plan 13-1: 1m38s (1 task, 1 file)
- Plan 14-1: 2m05s (1 task, 1 file)
- Plan 15-1: 1m03s (1 task, 1 file)
- Plan 16-1: 1m50s (3 tasks, 3 files)
- Plan 17-1: 1m30s (1 task, 1 file)
- Plan 18-1: 1m46s (1 task, 5 files)
- Trend: accelerating

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap v2.0]: 9-phase structure (10-18) derived from CLI requirement categories -- framework first, then domain subcommands in parallel, completions after all commands exist, deprecation last
- [Roadmap v2.0]: Phases 11-16 can execute in parallel after Phase 10 completes (all are independent CLI subcommand groups)
- [Roadmap v2.0]: Phase 17 (completions) depends on 11-15 because completion scripts must enumerate all registered commands
- [Roadmap v2.0]: Phase 18 (deprecation) depends on 10 and 13 because redirects require the unified CLI and skill install command to exist
- [Phase 10-1]: Hand-rolled argv parser instead of Commander.js to maintain zero new runtime deps
- [Phase 10-1]: Raw ANSI escape codes instead of chalk for colored output
- [Phase 10-1]: Noun-verb routing via Map-based module dispatch in src/cli/router.js
- [Phase 11-1]: Bootstrap MemoryService from buildRuntimeConfig + EmbeddingService (lightweight, skips workspace/search/vector services)
- [Phase 11-1]: Hand-rolled parseFlags helper for CLI flag parsing, consistent with zero-dep approach
- [Phase 12-1]: KG CLI uses normalizeEntityId (toSlug) to convert entity names to IDs for store lookups
- [Phase 12-1]: Reused identical MemoryService bootstrap and parseFlags patterns from memory.js
- [Phase 13-1]: Skill CLI reuses exported functions from install-localnest-skill.mjs (zero logic duplication)
- [Phase 13-1]: Skill list scans all 12 user + 4 project AI client directories for installed skills
- [Phase 14-1]: mcp start directly imports mcp-server.js main() instead of fork -- keeps stdio passthrough clean
- [Phase 14-1]: mcp status is stateless -- reads runtime config and checks file existence, no running server needed
- [Phase 14-1]: mcp config reads saved snippet from ~/.localnest/config/mcp.localnest.json when available; --raw generates generic npx config
- [Phase 15-1]: Ingest CLI reuses MemoryService bootstrap and parseFlags patterns from memory.js
- [Phase 15-1]: Auto-detect format from file extension (.md/.markdown -> markdown, .json -> json), with --format override
- [Phase 15-1]: Delegates to svc.ingestMarkdown/ingestJson which handle parsing, dedup, entity extraction, and KG triple creation
- [Phase 16-1]: Access hooks via memory.store.hooks (MemoryService.store.hooks) for instance stats
- [Phase 16-1]: Import MemoryHooks class for static validEvents() call
- [Phase 16-1]: Return events as { events: [...] } wrapper for consistent JSON structure
- [Phase 18-1]: Yellow ANSI codes for deprecation warning color, consistent with Phase 10 raw ANSI approach
- [Phase 18-1]: Fixed broken command forwarding by adding commandArgs to all 4 legacy binaries
- [Phase 18-1]: Changed localnest-mcp-install-skill replacement from 'localnest install skills' to 'localnest skill install' per DEP-04
- [Phase quick-260409-nyr]: Fixed update cache version-drift bug: shouldRefresh now invalidates on current_version mismatch, getCachedStatus neutralizes stale latest_version, TTL default 120->60min; readCache preserves on-disk current_version so drift detection actually works
- [Phase quick-260409-o8i]: Added per-command mcp__localnest__* pre-approvals to 7 LocalNest skill command manifests (fact/remember/ingest write commands + search/recall/context/status read commands); destructive tools explicitly excluded; CLI-only commands and internal-dev skills untouched

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260409-kaa | Brand identity + docs update for restructuring | 2026-04-09 | f55da7e | [260409-kaa](./quick/260409-kaa-create-localnest-brand-identity-and-upda/) |
| 260409-nyr | Fix update cache version-drift bug + TTL default 60m + compareVersions regression guard | 2026-04-09 | acfbd85 | [260409-nyr](./quick/260409-nyr-fix-update-cache-semver-comparison-and-t/) |
| 260409-o8i | Pre-approve MCP KG/memory write tools in LocalNest skill command permissions | 2026-04-09 | 0ad9ba0, ff6f2e8 | [260409-o8i](./quick/260409-o8i-pre-approve-kg-write-tools-in-skill-perm/) |

## Session Continuity

Last session: 2026-04-09T12:04:48Z
Stopped at: Completed quick task 260409-o8i: Pre-approve MCP KG/memory write tools in LocalNest skill command permissions
Resume file: None

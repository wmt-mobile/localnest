<!-- cspell:ignore localnest LOCALNEST reranker RERANKER SARIF stopword optimised prefiltering -->

# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-04-10

### Added

- `localnest_kg_add_entities_batch` — Batch entity creation (up to 500)
- `localnest_kg_add_triples_batch` — Batch triple creation with dedup
- `localnest_memory_store_batch` — Batch memory storage (up to 100)
- `localnest_agent_prime` — Unified context: memories + entities + files + changes + actions in 1 call
- `localnest_find` — Fused search across memory, code, and KG with RRF ranking
- `localnest_whats_new` — Cross-session delta: new memories, triples, files since timestamp
- `localnest_help` — Just-in-time task-scoped tool guidance
- `localnest_teach` — Durable behavior modifier via feedback memories
- `localnest_audit` — Self-audit dashboard: coverage, density, orphans, stale memories
- `localnest_file_changed` — Proactive memory hints when files are edited
- `localnest_kg_backfill_links` — Retroactive memory-to-KG entity linking
- `localnest_project_backfill` — Scan directory for projects, seed memories
- `localnest_find_callers` — Find all callers of a symbol
- `localnest_find_definition` — Find symbol definition
- `localnest_find_implementations` — Find interface/trait implementations
- `localnest_rename_preview` — Preview all references before renaming

### Features

- **Batch operations** — 300 API calls become 3 with batch write tools
- **Terse responses** — `terse: 'minimal'` on all write tools, 70%+ token reduction
- **Auto-inference** — memory_store needs only {title, content}, everything else inferred
- **Memory-KG fusion** — Memories auto-extract entities and create KG triples
- **Recall enrichment** — Top results include related_facts from 1-hop KG neighbors
- **Predicate cardinality** — Contradiction detection only for functional predicates
- **Symbol-aware code intel** — Regex-first with optional tree-sitter enhancement
- **Proactive hooks** — File-linked memory hints on read/edit
- **Teach memories** — Durable behavior modifiers surfaced through agent_prime
- **Self-audit** — Health score, coverage, density, orphan, stale memory detection
- **SKILL.md slim-down** — From ~360 to 46 lines
- **Cross-project bridges** — Insight generation for entities spanning multiple nests

## [0.1.0] - 2026-04-09

### Added

- Full TypeScript migration — 96 .ts files, 0 .js remaining in src/
- Shared CLI modules (src/cli/ansi.ts, src/cli/output.ts) eliminating 5x code duplication
- ora spinners for async CLI operations (onboard, selftest, hooks)
- Dynamic tool count in help/dashboard (no more hardcoded values)
- Embedding LRU cache (256 entries, SHA-256 keyed) for faster recall
- 3 composite SQLite indexes for KG and memory queries
- PRAGMA optimize for SQLite query planner statistics
- Async vector index persistence with write coalescing
- Batch embedding queries in dedup and relations
- TypeScript build infrastructure (tsconfig.json, tsc build, tsx runtime)
- tree-sitter ambient type declarations
- nest:* agentic orchestration commands (11 slash commands)

### Changed

- All src/ files migrated from JavaScript to TypeScript
- CLI error output unified via writeError() across all commands
- Help screen modernized with version banner and examples section
- Graph CTE cycle detection optimized (INSTR vs LIKE)
- MCP SDK updated to 1.29.0, ora to 9.3.0
- Bin shebangs updated to use tsx/esm loader
- Test runner switched from node --test to tsx --test

### Fixed

- KG tool null rejection on valid_from/valid_to/source_memory_id
- Dashboard UI duplication from concurrent refresh race condition
- Skill installer slash command sync when skill is up-to-date
- Duplicate log message in skill installer
- Redundant schema index creation

## [0.0.7-beta.3] - 2026-04-09

### Fixed

- Fixed `.nullable()` missing on `valid_from`, `valid_to`, and `source_memory_id` in `kg_add_triple` and `kg_invalidate` — AI clients sending null now accepted.
- Removed redundant index creation in `schema.js` already handled by migrations.

### Changed

- Skill installer now syncs slash commands even when skill is already up-to-date, auto-installs Claude Code hooks, and fixes duplicate log message on noop.

## [0.0.7-beta.2] - 2026-04-08

### Interactive CLI

- **TUI Dashboard** (`localnest dashboard`): Live-refreshing terminal dashboard with keyboard navigation. Memory stats, KG overview, nest distribution with progress bars, recent memories timeline, server status. Auto-refreshes every 5s. Keys: 1=Memory, 2=KG, 3=Recent, r=Refresh, q=Quit.
- **Onboarding Wizard** (`localnest onboard`): Guided first-run experience that auto-detects environment (Node, ripgrep, AI clients), runs setup, installs skills to all detected clients, installs Claude Code hooks, and runs doctor — all in one command.
- **Self-Test** (`localnest selftest`): End-to-end pipeline validation testing runtime, memory CRUD, knowledge graph, taxonomy, dedup, embeddings, search, skills, and hooks. Reports pass/warn/fail with colored output.
- **Redesigned CLI help**: Box-drawn header with MCP badge, category icons (●◆◇▸⚡), separator lines, quick start guide, and docs URL footer.

### Claude Code Integration

- **10 slash commands**: `/localnest:recall`, `/localnest:remember`, `/localnest:fact`, `/localnest:search`, `/localnest:status`, `/localnest:context`, `/localnest:ingest`, `/localnest:dashboard`, `/localnest:selftest`, `/localnest:onboard`. Auto-installed to `~/.claude/commands/localnest/` via `localnest skill install`.
- **Pre-tool hook**: Auto-retrieves relevant memories before Edit/Write/Bash tools (30s debounce).
- **Post-tool hook**: Auto-captures outcomes after Edit/Write/Bash tools (60s debounce) + writes agent diary entries.
- **Hook installer**: `localnest hooks install` wires hooks into `~/.claude/settings.json`.
- **Auto skill sync**: `postinstall` npm hook auto-syncs skills on `npm install -g`.

### Bug Fixes

- Fixed nested transaction deadlock — adapter supports re-entrant calls via SQLite SAVEPOINT.
- Fixed path traversal in MCP ingest tools — content-only, no file_path from MCP clients.
- Fixed LIKE cycle detection in graph traversal — delimiter-bounded matching prevents false substring matches.
- Fixed CI audit gate — transitive-only vulnerabilities no longer block pipeline.
- Fixed zod `z.unknown()` compatibility with MCP SDK — use `z.any()` instead.

### Dependencies

- Bumped `@huggingface/transformers` from 3.8.1 to 4.0.1.

## [0.0.7-beta.1] - 2026-04-08

### Security & Code Quality

- **Nested transaction safety**: `adapter.transaction()` now supports re-entrant calls via SQLite SAVEPOINT — prevents deadlock when `storeEntry`/`updateEntry`/`deleteEntry` are called within a transaction context.
- **Path traversal prevention**: MCP ingest tools (`localnest_ingest_markdown`, `localnest_ingest_json`) no longer accept `file_path` — content is passed directly, CLI handles file reading.
- **Graph traversal cycle detection fix**: LIKE-based cycle prevention now uses delimiter-bounded matching to prevent false substring matches (e.g., `foo` vs `foobar`).
- **Shared CLI flag parser**: Extracted `parseFlags` to `src/cli/parse-flags.js` — eliminates 5x copy-paste across CLI command modules.
- **Audit tolerance for transitive vulnerabilities**: `quality:audit` now only blocks on direct dependency critical/high vulnerabilities, not transitive ones from upstream SDK chains.

### Dependencies

- Bumped `@huggingface/transformers` from 3.8.1 to 4.0.1 (no breaking changes — `pipeline`, `env`, `AutoTokenizer`, `AutoModelForSequenceClassification` APIs unchanged).

### Knowledge Graph

- **Temporal knowledge graph** with entities and subject-predicate-object triples (`kg_entities`, `kg_triples` tables, schema v6).
- **Temporal validity** on all triples: `valid_from`/`valid_to` columns, point-in-time `as_of` queries, chronological timeline view, and KG statistics.
- **Multi-hop graph traversal** via SQLite recursive CTEs with cycle prevention (configurable 1-5 hops). No other local-first memory system offers this.
- **Contradiction detection** at write time: warns when a new triple conflicts with an existing valid triple on the same subject+predicate. Never blocks, just flags.
- **Cross-nest bridge discovery**: find entities connected across different memory domains.
- Entity auto-creation on first triple reference with normalized slug IDs.
- Triple provenance tracking via `source_memory_id` linking back to originating memory entries.

### Memory Organization

- **Nest/Branch hierarchy**: two-level memory taxonomy using LocalNest's own organic metaphor (not copied from any competitor). Nests are top-level domains, branches are topics within nests.
- **Metadata-filtered recall**: memory recall filters by nest and/or branch for more precise retrieval.
- Taxonomy tools: list nests, list branches within a nest, get full taxonomy tree with counts.

### Agent Isolation

- **Agent-scoped memory**: `agent_id` column on memory entries for per-agent isolation (schema v8).
- **Private diary**: separate `agent_diary` table for agent scratchpad entries not visible to other agents.
- **Scoped recall**: agents see own memories + global memories, never other agents' private data.

### Semantic Dedup

- **Embedding similarity gate** on all memory writes (default 0.92 cosine threshold, configurable).
- Dedup runs automatically on `memory_store` and `memory_capture_event` operations.
- Explicit `check_duplicate` tool for pre-filing checks with match details.

### Conversation Ingestion

- **Markdown and JSON conversation import**: parse chat exports into per-turn memory entries with automatic nest/branch assignment.
- **Rule-based entity extraction**: creates knowledge graph triples from conversation content without LLM dependency.
- **Re-ingestion protection**: tracks ingested files by path + SHA-256 hash (schema v9, `conversation_sources` table).

### Hooks System

- **Pre/post operation hooks** for memory, KG, graph traversal, diary, ingestion, and dedup operations.
- Support for cancel, payload transform, one-time listeners, and catch-all wildcards (`before:*`, `after:*`).
- Two new MCP tools: `localnest_hooks_stats` and `localnest_hooks_list_events` for hook introspection.

### CLI-First Architecture

- **Unified noun-verb CLI**: `localnest <noun> <verb>` subcommand pattern with zero new dependencies (hand-rolled, not Commander.js).
- **Memory CLI**: `localnest memory add|search|list|show|delete` with full flag support.
- **Knowledge Graph CLI**: `localnest kg add|query|timeline|stats` for terminal-based KG operations.
- **Skill CLI**: `localnest skill install|list|remove` with multi-client detection.
- **MCP Lifecycle CLI**: `localnest mcp start|status|config` for server management.
- **Ingest CLI**: `localnest ingest <file>` with auto-format detection (Markdown/JSON).
- **Global flags**: `--json`, `--verbose`, `--quiet`, `--config` work on all commands.
- **Colored help**: organized by command categories (Core, Memory, KG, Skills, Diagnostics).
- **Shell completions**: `localnest completion bash|zsh|fish` for tab completion.
- **Legacy deprecation**: old `localnest-mcp-*` binaries now show yellow deprecation warnings and redirect to canonical commands.

### Migration Safety

- **Per-version transaction wrapping**: each schema migration runs inside its own SQLite transaction with immediate version stamping. Failure mid-migration rolls back cleanly.
- Schema versions: v5 (existing) through v9 (conversation sources), all additive and backward-compatible.

### MCP Tools

- **17 new MCP tools** registered (52 total):
  - 7 knowledge graph tools (`localnest_kg_*`)
  - 3 nest/branch tools (`localnest_nest_*`)
  - 2 graph traversal tools (`localnest_graph_*`)
  - 2 agent diary tools (`localnest_diary_*`)
  - 2 conversation ingestion tools (`localnest_ingest_*`)
  - 1 duplicate check tool (`localnest_memory_check_duplicate`)
  - 2 hook introspection tools (`localnest_hooks_*`)

### Documentation

- **Competitive comparison table** in README vs MemPalace, Zep, Graphiti, Mem0.
- Updated skill files (SKILL.md, tool-reference.md) with all 52 tool workflows.
- Expanded Memory section with KG, hierarchy, hooks, dedup, and ingestion details.

### New Files

- `src/services/memory/kg.js` — Knowledge graph entity and triple CRUD
- `src/services/memory/graph.js` — Recursive CTE traversal and bridge discovery
- `src/services/memory/taxonomy.js` — Nest/branch hierarchy helpers
- `src/services/memory/scopes.js` — Agent diary CRUD and scope isolation
- `src/services/memory/dedup.js` — Embedding similarity gate
- `src/services/memory/ingest.js` — Conversation parsing and ingestion pipeline
- `src/services/memory/hooks.js` — Pre/post operation hook system
- `src/mcp/tools/graph-tools.js` — MCP tool registration for all new features
- `src/cli/options.js` — Global CLI flag parser
- `src/cli/help.js` — Colored help renderer
- `src/cli/router.js` — Noun-verb subcommand dispatcher
- `src/cli/commands/memory.js` — Memory CLI implementation
- `src/cli/commands/kg.js` — Knowledge Graph CLI implementation
- `src/cli/commands/skill.js` — Skill management CLI
- `src/cli/commands/mcp.js` — MCP lifecycle CLI
- `src/cli/commands/ingest.js` — Conversation ingestion CLI
- `src/cli/commands/completion.js` — Shell completion generators

## [0.0.6-beta.1] - 2026-03-12

### CLI

- Added canonical `localnest task-context` and `localnest capture-outcome` commands for memory workflow automation.
- Soft-deprecated legacy helper binaries by turning `localnest-mcp-setup`, `localnest-mcp-doctor`, `localnest-mcp-upgrade`, `localnest-mcp-install-skill`, `localnest-mcp-task-context`, and `localnest-mcp-capture-outcome` into warning-forwarding compatibility wrappers.
- Kept the `localnest-mcp` MCP server binary unchanged so existing client configs continue to start the server without migration.

### Docs & Guidance

- Updated CLI help, runtime guidance, and README examples to prefer canonical `localnest ...` commands while documenting the compatibility aliases.
- Added beta release notes and version-matrix entries for `0.0.6-beta.1`.

### Release Tooling

- Bumped bundled skill metadata to the beta package version so packaged installs stay version-aligned.
- Removed stale hardcoded `0.0.5` defaults from release-prep helpers by aligning version output with the active package version.

## [0.0.5] - 2026-03-11

### Stable Release

- Promoted the `0.0.4-beta.9` runtime and packaging fixes into the stable `0.0.5` line.
- Fixed the installed-runtime release harness to derive LocalNest paths from the active user home instead of a machine-specific path.
- Hardened installed-runtime validation with an MCP stdio handshake regression test and release-sweep coverage.
- Switched upgrade skill-sync flow to the primary `localnest install skills --force` command while keeping the legacy alias available.

## [0.0.4-beta.9] - 2026-03-10

### Runtime Fixes

- Fixed bundled skill version reporting so `localnest-mcp-install-skill` now reports the actual package version instead of stale metadata.
- Made the skill installer treat `package.json` as the version source of truth, preventing future drift between the package version and bundled skill metadata.

### Quality

- Added regression coverage to ensure bundled skill metadata stays aligned with the package version.

## [0.0.4-beta.8] - 2026-03-10

### Runtime Fixes

- Fixed MCP startup regressions introduced after `0.0.4-beta.6` where `create-services` and `register-tools` imported `SERVER_NAME` / `SERVER_VERSION` from the wrong module.
- Removed the blocking startup update warm-check from the stdio MCP server path so early tool calls no longer stall on synchronous npm version checks.
- Made sqlite-vec index status degrade safely when the database is locked instead of hanging or crashing MCP status tools.
- Updated the installed-runtime release sweep to use isolated temporary index storage, avoiding contention with the user's active LocalNest database during validation.

### Quality

- Added import regression coverage for the app startup modules.
- Added sqlite-vec status regression coverage for locked-database handling.

## [0.0.4-beta.7] - 2026-03-10

### Runtime

- Introduced a dedicated `sqlite-vec` extension resolver (`src/runtime/sqlite-vec-extension.js`) that automatically locates the `vec0` native binary at startup — searches global npm root, the localnest vendor directory, `PATH`, and `node_modules` with cross-platform binary name resolution (`.so` / `.dylib` / `.dll`).
- Added `LOCALNEST_SQLITE_VEC_EXTENSION` env var for explicit extension path override; auto-detection is skipped when it is set.
- Extension source is now reported in `localnest_server_status` so operators can confirm how the extension was found.
- Setup wizard (`localnest setup`) gained `--sqlite-vec-extension` and `--skip-sqlite-vec-install` flags and a comprehensive `--help` / `-h` output covering all options.
- Doctor (`localnest doctor`) gained an explicit vec0 availability check.

### CLI

- `localnest-mcp-task-context` and `localnest-mcp-capture-outcome` now support `--help` / `-h` with full usage documentation printed to stdout.
- `localnest-mcp-capture-outcome` now accepts a `--tags` CSV argument for tagging captured events at the CLI level.

### Security & Dependencies

- Updated `express-rate-limit` and `ip-address` to patched versions.
- Switched the local embedding and reranking runtime from `@xenova/transformers` to `@huggingface/transformers`.
- Added published `npm-shrinkwrap.json` coverage so npm-distributed installs carry the intended transitive dependency graph.

### Install Behavior

- Removed the earlier `prebuild-install@7.1.3` warning path from the default install graph by moving off the older Xenova runtime chain.
- Current `0.0.4-beta.8` installs may still show a single upstream deprecation warning for `boolean@3.2.0` through `onnxruntime-node -> global-agent`; runtime behavior is unchanged.

### Quality

- Added test coverage for `sqlite-vec` extension detection, bin shared helpers, config parsing, skill install, and server status builder.
- Resolved lint regressions in release scripts and workspace helpers.

### Docs & Developer Experience

- Rewrote README with clearer information hierarchy, a new "Why LocalNest?" section, engaging copy, and a correct full MCP JSON config block.
- Added `guides/architecture.md` — architecture overview with system, search, and memory pipeline diagrams for contributors.
- Added `.github/workflows/release.yml` — automatic GitHub pre-release on merge to `beta`, full release on merge to `main`, tagged by package version.

## [0.0.4-beta.6] - 2026-03-09

### Release Hardening
- Normalized MCP response contracts through shared wrapper-level helpers and tightened regression coverage for tool outputs.
- Improved retrieval miss guidance, explicit `read_file` path errors, and installed-runtime release harness checks so release sweeps require meaningful evidence.
- Hardened runtime environment handling around cache diagnostics, MCP background sweep behavior, and update workflow metadata.

### Product and UX
- Added `localnest_health` and richer `localnest_server_status` diagnostics for faster client-side troubleshooting.
- Updated end-user docs for current beta setup, release selection, installed-runtime validation, and supported auto-configured MCP clients.

### Internal Structure
- Reorganized the codebase into clearer `src/app`, `src/runtime`, `src/mcp`, and domain-scoped `src/services/*` modules.
- Grouped scripts by operational concern (`runtime`, `memory`, `release`, `quality`) and simplified bin entrypoints with shared helpers.

## [0.0.4-beta.5] - 2026-03-06

### Upgrade Notes
- Use `localnest upgrade` as the canonical upgrade command.
- `localnest update` is removed in this version.
- If this is the first run on a machine/user account, run:
  - `localnest setup`
  - `localnest doctor --verbose`

### Model Download and Cache
- Setup now warms embedding and reranker models on first run.
- `doctor` now checks whether model cache is writable for the current user.
- When default cache is not writable, LocalNest now auto-falls back to a user-specific temp cache directory.
- If cache path is not writable, set:
  - `LOCALNEST_EMBED_CACHE_DIR`
  - `LOCALNEST_RERANKER_CACHE_DIR`
- For offline or restricted environments:
  - `localnest setup --skip-model-download=true`

### User-Visible Changes
- Cleaner upgrade validation and clearer upgrade error messages.
- Faster search behavior (ripgrep context parsing and fallback line matching).
- Docs updated and aligned to `0.0.4-beta.5` across release pages and install guidance.

### Breaking/Removed
- Removed deprecated `localnest update` alias.
- Removed experimental backup sync CLI and Google Drive integration.

## [0.0.4-beta.4] - 2026-03-03

### Added
- `localnest-mcp --version` CLI output for quick runtime/package verification.
- Automatic npm update checks with local cache/backoff via new `UpdateService`.
- New MCP tools:
  - `localnest_task_context` (runtime + memory status + recall bundle for substantive tasks)
  - `localnest_memory_status` (memory consent, backend compatibility, and database/store status)
  - `localnest_memory_list` (list stored memories with pagination/filtering)
  - `localnest_memory_get` (fetch one memory with revision history)
  - `localnest_memory_store` (manual durable memory write)
  - `localnest_memory_update` (update memory and append a revision)
  - `localnest_memory_delete` (delete a memory and its revisions)
  - `localnest_memory_recall` (recall relevant memories for a task/query)
  - `localnest_capture_outcome` (simple outcome capture into the memory event pipeline)
  - `localnest_memory_capture_event` (background event ingest with automatic promotion for high-signal events)
  - `localnest_memory_events` (inspect recent capture events and promotion outcomes)
  - `localnest_update_status` (cached npm version check with optional force refresh)
  - `localnest_update_self` (approved self-update + bundled skill sync, with dry-run support)
- New CLI wrappers for deterministic hook usage:
  - `localnest-mcp-task-context`
  - `localnest-mcp-capture-outcome`
- Local memory subsystem:
  - SQLite-backed canonical memory store with revisions, scoped metadata, recall counters, and dedupe fingerprinting
  - background capture event log with promotion/ignore decisions
  - Node 22+ `node:sqlite` support for production memory storage
- New runtime env settings:
  - `LOCALNEST_MEMORY_ENABLED`
  - `LOCALNEST_MEMORY_BACKEND`
  - `LOCALNEST_MEMORY_DB_PATH`
  - `LOCALNEST_MEMORY_AUTO_CAPTURE`
  - `LOCALNEST_MEMORY_CONSENT_DONE`
  - `LOCALNEST_UPDATE_PACKAGE`
  - `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES`
  - `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES`
- OpenSSF Scorecard GitHub Actions workflow (`.github/workflows/scorecards.yml`) with SARIF upload to code scanning.
- GitHub CodeQL workflow (`.github/workflows/codeql.yml`) for static security analysis.
- Dependabot configuration (`.github/dependabot.yml`) for npm and GitHub Actions dependency updates.
- Additional automated tests for:
  - memory store lifecycle (create/list/update/recall/delete)
  - memory dedupe behavior
  - memory event promotion vs ignored-event behavior
  - config/runtime memory settings and migration coverage
  - hybrid search ranking mode metadata
  - sqlite backend status reporting when no native extension is configured
  - update interval clamping in runtime config
  - self-update dry-run behavior
  - install failure and skill-sync failure branches
- `npm run stress:localnest` synthetic stress runner for search + memory behavior checks.

### Changed
- Package/runtime version bumped to `0.0.4-beta.4`.
- Bundled skill install now checks installed skill metadata and only resyncs when the installed skill is missing, outdated, or `--force` is used.
- `localnest-mcp-setup` now asks for one-time user consent before enabling local memory and persists memory config into `localnest.config.json` and generated MCP snippets.
- README, bundled `SKILL.md`, and OpenAI agent manifest now document retrieval + memory flow, including pre-task recall and post-task capture guidance.
- Memory guidance now prefers the higher-level task-context and capture-outcome flow over hand-orchestrating low-level recall/capture tools.
- `localnest_search_hybrid` now reports `ranking_mode` so callers can tell whether results are hybrid, semantic-only, lexical-only, or empty.
- Memory recall responses now expose normalized `score` plus `raw_score` for easier interpretation.
- sqlite backend status now reports extension state precisely (`not-configured`, `not-attempted`, `loaded`, `load-failed`) instead of implying failure when no extension path is set.
- `localnest_server_status` now includes structured `updates` metadata so agents can prompt users proactively when a newer version is available.
- `localnest_usage_guide` and bundled `SKILL.md` expanded with explicit update flow, memory workflow guidance, and stronger evidence-first retrieval guidance.

## [0.0.3] - 2026-02-27

### Changed
- Promoted `0.0.2-beta.3` to the first stable release line as `0.0.3`.
- Updated package/runtime version references for stable (`package.json`, `package-lock.json`, `src/config.js`).
- Canonical tool names only: stable release exposes `localnest_*` tools without short aliases to avoid duplicate tool lists in MCP clients.

## [0.0.2-beta.3] - 2026-02-26

### Added
- **Shared tokenizer** (`src/services/tokenizer.js`): camelCase/PascalCase splitting (`getUserById` → `get`, `user`, `by`, `id`), digit-boundary splitting (`react18` → `react`, `18`), kebab-case splitting (`react-query` → `react`, `query`), compound alias tokens for exact-match bonus, and code stopword filtering. Both index backends now use this shared module.
- **Inverted index** (`term_index` table in SQLite): replaces the O(N) `LIKE '%"term"%'` full-table scan in semantic search with an indexed `term IN (...)` lookup. 100x+ faster at scale.
- **`use_regex` param on `localnest_search_code`**: pass `use_regex=true` to treat the query as a ripgrep-compatible regex (e.g. `async\s+function\s+get\w+`). Defaults to `false` (fixed-string, existing behavior). Invalid regex is rejected before reaching `rg`.
- **`context_lines` param on `localnest_search_code`** (0–10, default 0): each match result includes `context_before` and `context_after` arrays, reducing follow-up `localnest_read_file` round-trips by ~60%.
- **`failed_files` in `index_project` response**: both index backends now return `failed_files: [{path, error}]` for files that could not be read (oversized, permission-denied, binary). The rest of the index commits successfully.
- **`semantic_score_raw`** field on hybrid results: preserves the actual TF-IDF cosine score alongside the rank-based `semantic_score` used in RRF, enabling agents to filter by real relevance.
- **Quality pipeline**: ESLint flat config, madge (circular dependency check), depcheck, publint, and `npm run quality` orchestrator. GitHub Actions `quality.yml` CI workflow on push/PR.

### Changed
- **SQLite index schema version bumped to 2**: on first run after upgrade, stale v1 index data is automatically cleared. Run `localnest_index_project` once after upgrading to rebuild.
- **`refreshChunkNorms` optimised**: full table scan only fires when `changedTerms > 500`. Incremental updates (single file changed) now use a targeted term-indexed lookup — 10–100x faster for common case.
- **`localnest_search_hybrid` over-fetch** simplified: `Math.max(maxResults * 3, maxResults)` → `maxResults * 3` (redundant max removed).
- `startup_timeout_sec: 30` added to MCP client config snippets generated by setup wizard.
- Bin paths in `package.json` use relative form without leading `./` for npm compatibility.
- SKILL.md updated: `context_lines`/`use_regex` reference, glob fix note (`**/*.ts` not `*.ts`), ripgrep-optional section, schema migration troubleshooting, and `context_before`/`context_after` usage pattern.

### Fixed
- **Ripgrep no longer required at startup**: `main()` previously threw a fatal error when `rg` was not found, preventing the server from starting on NixOS, Alpine, or restricted environments. Now emits a stderr warning and falls back to the existing JS filesystem walker. `has_ripgrep: false` is surfaced in `localnest_server_status`.
- **Large-file error no longer aborts entire index run**: previously, a single unreadable file (e.g. minified bundle, SQL dump) would rollback the whole `indexProject` transaction. Each file is now processed in its own transaction with per-file error isolation.
- LIKE pattern quote fix: template literal `%"term"%` patterns no longer use unnecessary escape sequences.
- `response_format` stripping: replaced rest-destructure with explicit `delete` to avoid ES strict-mode issues in some runtimes.

## [0.0.2-beta.2] - 2026-02-25

### Added
- Added canonical MCP tool names with `localnest_*` prefix while keeping legacy aliases for backward compatibility.
- Added MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) across exposed tools.
- Added `response_format` support (`json`/`markdown`) to tool responses.
- Added pagination metadata for list-style tools (`total_count`, `count`, `limit`, `offset`, `has_more`, `next_offset`, `items`).
- Added bundled skill distribution in package under `skills/localnest-mcp`.
- Added new command: `localnest-mcp-install-skill`.
- Added automatic bundled skill install on package install (`postinstall`) with opt-out `LOCALNEST_SKIP_SKILL_INSTALL=true`.
- Added comprehensive test suite for config, migrator, search, workspace, vector index, and sqlite index flows.

### Changed
- README rewritten with clearer global-first installation flow, setup/doctor guidance, troubleshooting, and release checklist.
- Setup wizard now prints a ready-to-paste global `mcpServers.localnest` JSON block directly after completion.
- Usage guide output now references canonical `localnest_*` tools.
- Release version updated to `0.0.2-beta.2` in package and runtime server status.

### Fixed
- Fixed hybrid retrieval merge so overlapping lexical + semantic hits are fused into hybrid results.
- Fixed cross-platform sqlite base-path matching for both slash and backslash descendants.
- Reworked sqlite index updates to incremental DF/norm refresh for better scalability.
- Added semantic SQL prefiltering to reduce query scan scope.
- Replaced sqlite transaction helper usage with explicit `BEGIN/COMMIT/ROLLBACK` for runtime compatibility.
- Improved oversized file handling in `read_file`: keep cap guard but return streamed line-window content with warning metadata instead of hard failure.

## [0.0.1-beta.1] - 2026-02-24

### Added
- Single-package Node.js layout at repository root (no `node-mcp/` subfolder).
- `localnest-mcp-doctor` command for environment and config diagnostics.
- Phase 1 local semantic indexing service (`localnest.index.json`) with chunked TF-IDF-style retrieval.
- New MCP tools:
  - `index_status`
  - `index_project`
  - `search_hybrid`
- Added pluggable index backend architecture with `sqlite-vec` (default) and `json` fallback.
- Added automatic config migration on startup with backup creation for safe upgrades.
- Release scripts for maintainable npm publishing:
  - `release:beta`
  - `release:latest`
  - `bump:beta`

### Changed
- Setup wizard now validates Node, npx, and ripgrep before writing config.
- Setup wizard now generates `npx.cmd` on Windows and `npx` on Linux/macOS.
- Setup wizard now asks users to choose index backend and persists indexing settings in generated config.
- Server now fails fast when ripgrep is missing.
- Package metadata updated for beta publishing from the root package.

### Fixed
- Resolved confusion around monorepo path by making root the npm package path.

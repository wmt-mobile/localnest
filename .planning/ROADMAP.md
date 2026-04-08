# Roadmap: LocalNest

## Milestones

- ✅ **v1.0 Memory Enhancement** - Phases 1-9 (shipped 2026-04-08)
- 🚧 **v2.0 CLI-First Architecture** - Phases 10-18 (in progress)

## Phases

<details>
<summary>✅ v1.0 Memory Enhancement (Phases 1-9) - SHIPPED 2026-04-08</summary>

- [x] **Phase 1: Migration Infrastructure Hardening** - Safe, transactional schema migrations with version validation
- [x] **Phase 2: Knowledge Graph Core** - Entity and triple storage with schema v6, temporal columns, provenance tracking
- [x] **Phase 3: Temporal Validity** - Point-in-time queries, fact timelines, and KG statistics
- [x] **Phase 4: Nest/Branch Hierarchy** - Two-level memory taxonomy with filtered recall
- [x] **Phase 5: Graph Traversal and Contradiction Detection** - Multi-hop walks, cross-nest bridges, and write-time contradiction warnings
- [x] **Phase 6: Agent-Scoped Memory** - Per-agent namespaces with isolated diary entries
- [x] **Phase 7: Semantic Duplicate Detection** - Embedding similarity gate before storage
- [x] **Phase 8: Conversation Ingestion** - Parse Markdown/JSON conversations into memories and triples
- [x] **Phase 9: MCP Tool Registration** - Expose all new capabilities as localnest_* MCP tools

</details>

### 🚧 v2.0 CLI-First Architecture (In Progress)

**Milestone Goal:** Consolidate all commands into a unified noun-verb CLI and polish hooks/MCP for universal AI interoperability.

**Phase Numbering:**
- Integer phases (10, 11, 12...): Planned milestone work
- Decimal phases (10.1, 10.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 10: CLI Framework Setup** - Commander.js skeleton with global flags, colored help, and version display
- [x] **Phase 11: Memory CLI Commands** - Full memory CRUD via localnest memory subcommands
- [x] **Phase 12: Knowledge Graph CLI** - KG triple and entity operations from the command line
- [ ] **Phase 13: Skill CLI Commands** - Install, list, and remove bundled skills across AI clients
- [ ] **Phase 14: MCP Lifecycle CLI** - Start, status, and config generation for MCP server
- [ ] **Phase 15: Ingest CLI** - Conversation file ingestion with format detection and taxonomy
- [ ] **Phase 16: Hook MCP Tools** - Hook introspection tools and documentation for AI discoverability
- [ ] **Phase 17: Shell Completions and Polish** - Tab completions for bash, zsh, and fish
- [ ] **Phase 18: Binary Deprecation** - Redirect old fragmented binaries to unified CLI with warnings

## Phase Details

### Phase 10: CLI Framework Setup
**Goal**: Users have a single `localnest` command that responds to --help, --version, --json, --verbose, and --quiet with colored, categorized output
**Depends on**: Nothing (first phase of v2.0 milestone; builds on v1.0 internals)
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04
**Success Criteria** (what must be TRUE):
  1. Running `localnest` with no arguments prints colored help text organized by command categories (Core, Memory, KG, Skills, Diagnostics)
  2. Running `localnest --version` or `localnest version` prints the current package version
  3. Passing --json to any command switches output from human-readable to JSON
  4. Passing --verbose increases output detail; passing --quiet suppresses non-essential output
**Plans**: 1 (complete)

### Phase 11: Memory CLI Commands
**Goal**: Users can manage memories entirely from the command line without touching MCP tools
**Depends on**: Phase 10
**Requirements**: MCLI-01, MCLI-02, MCLI-03, MCLI-04, MCLI-05
**Success Criteria** (what must be TRUE):
  1. User can run `localnest memory add` with --type, --importance, --nest, --branch flags and see the created memory ID echoed back
  2. User can run `localnest memory search <query>` and receive ranked results with --limit, --nest, --branch filters applied
  3. User can run `localnest memory list` to see all stored memories with --json, --limit, --kind filters working
  4. User can run `localnest memory show <id>` and see the full memory entry including its revision history
  5. User can run `localnest memory delete <id>` with a confirmation prompt, or skip it with -f/--force
**Plans**: TBD

### Phase 12: Knowledge Graph CLI
**Goal**: Users can create, query, and inspect knowledge graph triples and timelines from the terminal
**Depends on**: Phase 10
**Requirements**: KGCLI-01, KGCLI-02, KGCLI-03, KGCLI-04
**Success Criteria** (what must be TRUE):
  1. User can run `localnest kg add <subject> <predicate> <object>` and see the created triple confirmed
  2. User can run `localnest kg query <entity>` and see all incoming/outgoing relationships for that entity
  3. User can run `localnest kg timeline <entity>` and see chronological fact evolution with valid_from/valid_to dates
  4. User can run `localnest kg stats` and see total entity count, triple count, and predicate breakdown
**Plans**: TBD

### Phase 13: Skill CLI Commands
**Goal**: Users can install, inspect, and remove bundled LocalNest skills across all detected AI clients
**Depends on**: Phase 10
**Requirements**: SKILL-01, SKILL-02, SKILL-03
**Success Criteria** (what must be TRUE):
  1. User can run `localnest skill install` and have the bundled skill installed to all detected AI client config locations (Claude, Cursor, etc.)
  2. User can run `localnest skill list` and see which skills are installed and where they live on disk
  3. User can run `localnest skill remove <name>` and have the skill uninstalled from all client configs
**Plans**: TBD

### Phase 14: MCP Lifecycle CLI
**Goal**: Users can start, inspect, and configure the MCP server from a single command surface
**Depends on**: Phase 10
**Requirements**: MCP-01, MCP-02, MCP-03
**Success Criteria** (what must be TRUE):
  1. User can run `localnest mcp start` and the MCP server launches in stdio mode, ready for client connections
  2. User can run `localnest mcp status` and see server health (running/stopped), registered tool count, and active config path
  3. User can run `localnest mcp config` and get ready-to-paste JSON for adding LocalNest to Claude/Cursor/other MCP clients
**Plans**: TBD

### Phase 15: Ingest CLI
**Goal**: Users can ingest conversation exports into LocalNest memory and KG directly from the command line
**Depends on**: Phase 10
**Requirements**: ING-01, ING-02, ING-03
**Success Criteria** (what must be TRUE):
  1. User can run `localnest ingest <file>` and have the file parsed with auto-detected format (markdown or JSON), with a summary of ingested entries printed
  2. User can override auto-detection with `--format markdown|json` and the specified parser is used
  3. User can assign taxonomy with `--nest <name> --branch <name>` and all ingested entries inherit those values
**Plans**: TBD

### Phase 16: Hook MCP Tools
**Goal**: AI clients can discover and introspect the hook system through MCP tools, with usage examples in the bundled skill
**Depends on**: Phase 10
**Requirements**: HOOK-01, HOOK-02, HOOK-03
**Success Criteria** (what must be TRUE):
  1. Calling `localnest_hooks_stats` via MCP returns registered hook counts grouped by event type
  2. Calling `localnest_hooks_list_events` via MCP returns all valid hook event names an agent can subscribe to
  3. The bundled skill file documents hook usage with concrete before/after examples that an AI agent can follow
**Plans**: TBD

### Phase 17: Shell Completions and Polish
**Goal**: Users get tab-completion for all localnest commands in their preferred shell
**Depends on**: Phase 10, Phase 11, Phase 12, Phase 13, Phase 14, Phase 15
**Requirements**: COMP-01, COMP-02, COMP-03
**Success Criteria** (what must be TRUE):
  1. Running `localnest completion bash` outputs a valid bash completion script that, when sourced, provides tab-completion for all subcommands and flags
  2. Running `localnest completion zsh` outputs a valid zsh completion script with the same coverage
  3. Running `localnest completion fish` outputs a valid fish completion script with the same coverage
**Plans**: TBD

### Phase 18: Binary Deprecation
**Goal**: Old fragmented binaries gracefully redirect users to the unified CLI without breaking existing workflows
**Depends on**: Phase 10, Phase 13
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04
**Success Criteria** (what must be TRUE):
  1. Running the old `localnest-mcp-setup` binary prints a deprecation warning and redirects to `localnest setup`
  2. Running the old `localnest-mcp-doctor` binary prints a deprecation warning and redirects to `localnest doctor`
  3. Running the old `localnest-mcp-upgrade` binary prints a deprecation warning and redirects to `localnest upgrade`
  4. Running the old `localnest-mcp-install-skill` binary prints a deprecation warning and redirects to `localnest skill install`
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 10 -> 11 -> 12 -> 13 -> 14 -> 15 -> 16 -> 17 -> 18
(Phases 11-16 can run in parallel after Phase 10 completes; Phase 17 depends on 11-15; Phase 18 depends on 10, 13)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Migration Infrastructure | v1.0 | 1/1 | Complete | 2026-04-08 |
| 2. Knowledge Graph Core | v1.0 | 2/2 | Complete | 2026-04-08 |
| 3. Temporal Validity | v1.0 | 1/1 | Complete | 2026-04-08 |
| 4. Nest/Branch Hierarchy | v1.0 | 2/2 | Complete | 2026-04-08 |
| 5. Graph Traversal | v1.0 | 2/2 | Complete | 2026-04-08 |
| 6. Agent-Scoped Memory | v1.0 | 1/1 | Complete | 2026-04-08 |
| 7. Semantic Dedup | v1.0 | 1/1 | Complete | 2026-04-08 |
| 8. Conversation Ingestion | v1.0 | 1/1 | Complete | 2026-04-08 |
| 9. MCP Tool Registration | v1.0 | 1/1 | Complete | 2026-04-08 |
| 10. CLI Framework Setup | v2.0 | 1/1 | Complete | 2026-04-08 |
| 11. Memory CLI Commands | v2.0 | 1/1 | Complete | 2026-04-08 |
| 12. Knowledge Graph CLI | v2.0 | 1/1 | Complete | 2026-04-08 |
| 13. Skill CLI Commands | v2.0 | 0/? | Not started | - |
| 14. MCP Lifecycle CLI | v2.0 | 0/? | Not started | - |
| 15. Ingest CLI | v2.0 | 0/? | Not started | - |
| 16. Hook MCP Tools | v2.0 | 0/? | Not started | - |
| 17. Shell Completions | v2.0 | 0/? | Not started | - |
| 18. Binary Deprecation | v2.0 | 0/? | Not started | - |

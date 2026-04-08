# Requirements: LocalNest CLI-First Architecture

**Defined:** 2026-04-08
**Core Value:** A unified, premium CLI that makes LocalNest feel like a standalone product -- not just an MCP server.

## v2.0 Requirements

### CLI Framework

- [x] **CLI-01**: Single `localnest` binary with noun-verb subcommands (hand-rolled, zero new deps)
- [x] **CLI-02**: Global flags work on all commands: --json, --verbose, --quiet, --config
- [x] **CLI-03**: Colored help text with command categories (Core, Memory, KG, Skills, Diagnostics)
- [x] **CLI-04**: Version display via `localnest --version` and `localnest version`

### Memory CLI

- [x] **MCLI-01**: `localnest memory add` stores a memory with --type, --importance, --nest, --branch flags
- [x] **MCLI-02**: `localnest memory search` recalls memories by query with --limit, --nest, --branch filters
- [x] **MCLI-03**: `localnest memory list` shows stored memories with --json, --limit, --kind filters
- [x] **MCLI-04**: `localnest memory show <id>` displays one memory with revision history
- [x] **MCLI-05**: `localnest memory delete <id>` removes a memory with -f/--force for non-interactive

### Knowledge Graph CLI

- [ ] **KGCLI-01**: `localnest kg add <subject> <predicate> <object>` creates a triple
- [ ] **KGCLI-02**: `localnest kg query <entity>` shows all relationships for an entity
- [ ] **KGCLI-03**: `localnest kg timeline <entity>` shows chronological fact evolution
- [ ] **KGCLI-04**: `localnest kg stats` shows entity count, triple count, predicate breakdown

### Skill CLI

- [ ] **SKILL-01**: `localnest skill install` installs bundled skill to all detected AI clients
- [ ] **SKILL-02**: `localnest skill list` shows installed skills and their locations
- [ ] **SKILL-03**: `localnest skill remove <name>` uninstalls a skill

### MCP Lifecycle CLI

- [x] **MCP-01**: `localnest mcp start` starts the MCP server (stdio mode)
- [x] **MCP-02**: `localnest mcp status` shows server health and config
- [x] **MCP-03**: `localnest mcp config` outputs ready-to-paste MCP config JSON for AI clients

### Ingest CLI

- [ ] **ING-01**: `localnest ingest <file>` ingests a conversation file with auto-format detection
- [ ] **ING-02**: `localnest ingest <file> --format markdown|json` explicit format override
- [ ] **ING-03**: `localnest ingest <file> --nest <name> --branch <name>` assigns taxonomy

### Hook MCP Tools

- [ ] **HOOK-01**: `localnest_hooks_stats` MCP tool returns registered hook counts and event types
- [ ] **HOOK-02**: `localnest_hooks_list_events` MCP tool returns all valid hook event names
- [ ] **HOOK-03**: Hook system is documented in skill with usage examples

### Shell Completions

- [ ] **COMP-01**: `localnest completion bash` outputs bash completion script
- [ ] **COMP-02**: `localnest completion zsh` outputs zsh completion script
- [ ] **COMP-03**: `localnest completion fish` outputs fish completion script

### Binary Deprecation

- [ ] **DEP-01**: Old `localnest-mcp-setup` redirects to `localnest setup` with deprecation warning
- [ ] **DEP-02**: Old `localnest-mcp-doctor` redirects to `localnest doctor` with deprecation warning
- [ ] **DEP-03**: Old `localnest-mcp-upgrade` redirects to `localnest upgrade` with deprecation warning
- [ ] **DEP-04**: Old `localnest-mcp-install-skill` redirects to `localnest skill install` with deprecation warning

## Out of Scope

| Feature | Reason |
|---------|--------|
| Interactive TUI (blessed/ink) | Overkill for CLI; plain stdout + prompts sufficient |
| Plugin/extension system | Defer to v3; Commander.js subcommands cover current needs |
| GUI dashboard | LocalNest is CLI-first by design |
| MCP server auto-restart/daemon | MCP clients manage server lifecycle |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLI-01 | Phase 10 | Complete |
| CLI-02 | Phase 10 | Complete |
| CLI-03 | Phase 10 | Complete |
| CLI-04 | Phase 10 | Complete |
| MCLI-01 | Phase 11 | Complete |
| MCLI-02 | Phase 11 | Complete |
| MCLI-03 | Phase 11 | Complete |
| MCLI-04 | Phase 11 | Complete |
| MCLI-05 | Phase 11 | Complete |
| KGCLI-01 | Phase 12 | Pending |
| KGCLI-02 | Phase 12 | Pending |
| KGCLI-03 | Phase 12 | Pending |
| KGCLI-04 | Phase 12 | Pending |
| SKILL-01 | Phase 13 | Pending |
| SKILL-02 | Phase 13 | Pending |
| SKILL-03 | Phase 13 | Pending |
| MCP-01 | Phase 14 | Complete |
| MCP-02 | Phase 14 | Complete |
| MCP-03 | Phase 14 | Complete |
| ING-01 | Phase 15 | Pending |
| ING-02 | Phase 15 | Pending |
| ING-03 | Phase 15 | Pending |
| HOOK-01 | Phase 16 | Pending |
| HOOK-02 | Phase 16 | Pending |
| HOOK-03 | Phase 16 | Pending |
| COMP-01 | Phase 17 | Pending |
| COMP-02 | Phase 17 | Pending |
| COMP-03 | Phase 17 | Pending |
| DEP-01 | Phase 18 | Pending |
| DEP-02 | Phase 18 | Pending |
| DEP-03 | Phase 18 | Pending |
| DEP-04 | Phase 18 | Pending |

**Coverage:**
- v2.0 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after milestone v2.0 definition*

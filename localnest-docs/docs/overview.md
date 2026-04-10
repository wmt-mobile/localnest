# Overview

LocalNest MCP is a local-first MCP server and CLI tool that gives AI agents scoped access to your codebase with hybrid search, semantic indexing, temporal knowledge graph, agent-scoped memory, and persistent memory that never leaves your machine.

**72 MCP tools** | **Temporal knowledge graph** | **Multi-hop graph traversal** | **Agent-scoped memory** | **Zero cloud dependencies**

## Use this documentation by intent

- [Install and configure LocalNest](./setup/install)
- [Review configuration and env vars](./setup/configuration)
- [Understand the runtime architecture](./architecture)
- [Browse tool documentation](./tools/overview)
- [See the current stable package and behavior](./releases/current)
- [See the release matrix](./releases/history)
- [Preview 0.1.0 features](./releases/0.1.0)

## Core ideas

- LocalNest only reads from configured roots.
- Lexical search works without indexing; hybrid search benefits from a semantic index.
- Local memory is opt-in and stays on your machine.
- The fastest workflow is usually: find files first, search within them second, read exact lines last.
- Memory results are guidance, not final evidence. Verify with file tools before concluding.

## What's new in v0.1.0

The `0.1.0` release migrates the entire codebase to TypeScript and includes all capabilities from the beta series:

- **TypeScript migration** -- full codebase migrated from JavaScript to TypeScript for type safety and developer experience.
- **Temporal knowledge graph** -- store structured facts as subject-predicate-object triples with time validity. Query what was true at any point in time with `as_of`.
- **Multi-hop graph traversal** -- walk relationships 2-5 hops deep via recursive CTEs. No other local-first tool offers this.
- **Nest/Branch hierarchy** -- two-level memory taxonomy for organized retrieval. Nests are top-level domains, branches are topics within nests.
- **Agent-scoped memory** -- per-agent isolation with private diary entries. Multiple agents, zero cross-contamination.
- **Semantic dedup** -- embedding similarity gate (0.92 cosine threshold) prevents near-duplicate memory pollution.
- **Conversation ingestion** -- import Markdown/JSON chat exports with automatic entity extraction and KG triple creation.
- **Hooks system** -- pre/post operation callbacks for memory, KG, traversal, ingestion. Build custom pipelines without modifying core code.
- **CLI-first architecture** -- unified `localnest <noun> <verb>` commands for everything. Shell completions for bash, zsh, fish.
- **72 MCP tools** covering KG, nests, traversal, diary, ingest, dedup, and hooks.

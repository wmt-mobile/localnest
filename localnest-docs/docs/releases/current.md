---
description: Current stable package notes for localnest-mcp, including runtime updates, install behavior, memory workflows, and canonical tool behavior. Current release is 0.1.0.
---

# Current Release

Current stable package documentation for `localnest-mcp@0.1.0`, covering the TypeScript migration, memory workflow tools, setup migration behavior, and the active canonical `localnest_*` tool contract.

<div className="docGrid docGrid--3">
  <div className="docPanel">
    <span className="docEyebrow">Channel</span>
    <h3>Stable release line</h3>
    <p>Use this page when you need docs that match the currently published stable package behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">Package</span>
    <h3>Published stable package</h3>
    <p>Use this page for the currently shipped stable contract and runtime behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">Current</span>
    <h3>0.1.0 — TypeScript migration</h3>
    <p>Full codebase migration from JavaScript to TypeScript with temporal knowledge graph, multi-hop traversal, agent isolation, and 72 MCP tools.</p>
  </div>
</div>

<div className="docGrid docGrid--3">
  <a className="docLinkCard" href="/docs/setup/install">
    <strong>Install 0.1.0</strong>
    <span>Use the current stable package and follow the direct `localnest` setup flow.</span>
  </a>
  <a className="docLinkCard" href="/docs/setup/configuration">
    <strong>Configure MCP</strong>
    <span>Use the generated MCP block, supported client setup, and startup timeout guidance.</span>
  </a>
  <a className="docLinkCard" href="./0.0.7-beta.2">
    <strong>Previous beta: 0.0.7-beta.2</strong>
    <span>See the archived beta release notes for the temporal KG, graph traversal, nest/branch hierarchy, and CLI-first architecture.</span>
  </a>
</div>

## What it includes

- Full TypeScript codebase (migrated from JavaScript)
- canonical `localnest_*` tool names
- 72 MCP tools
- lexical, semantic, and hybrid retrieval
- temporal knowledge graph with multi-hop traversal
- nest/branch hierarchy for organized memory
- agent-scoped memory with private diary entries
- semantic dedup and conversation ingestion
- hooks system for pre/post operation callbacks
- opt-in local memory tools plus high-level task-context and capture-outcome workflow
- bundled install skill command
- version-aware skill sync behavior
- setup-time memory consent and config migration
- `localnest` top-level CLI command path (`setup`, `doctor`, `upgrade`)

## What changed in `0.1.0`

- Migrated the entire codebase from JavaScript to TypeScript for type safety and improved developer experience.
- Promoted all beta features (temporal KG, graph traversal, agent isolation, hooks, CLI-first architecture) into the stable line.
- 72 MCP tools across KG, nests, traversal, diary, ingest, dedup, and hooks.
- Schema migrations v5-v9 are additive and backward-compatible.

## Upgrade Snapshot

<div className="docGrid docGrid--2">
  <div className="docPanel">
    <span className="docEyebrow">If you are upgrading from 0.0.5 or 0.0.7-beta.2</span>
    <h3>Expected user-facing changes</h3>
    <p>Source files are now TypeScript (<code>.ts</code>). All runtime behavior, tool names, and APIs remain backward-compatible. Schema migrations are additive.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">If you are validating a fresh install</span>
    <h3>Fastest verification path</h3>
    <p>Run <code>localnest version</code>, then <code>localnest doctor --verbose</code>, and confirm your MCP client uses the generated direct-binary config.</p>
  </div>
</div>

## How to use this page

- Treat this page as the source of truth for the current stable release behavior.
- Use the archived `0.0.5` pages when you need the previous stable release contract.
- Use archived beta pages such as [0.0.7-beta.2](./0.0.7-beta.2) or [0.0.4-beta.9](./0.0.4-beta.9) when you need a frozen prerelease contract instead of the maintained current summary.
- If you need explicit install commands per version, use [Version Selection](./version-selection).

## Need a Different Release View?

- Use [Version Selection](./version-selection) when you need exact install commands.
- Use [Release Matrix](./history) when you need the full release-to-page mapping.
- Use [0.0.7-beta.2](./0.0.7-beta.2) for the archived beta with knowledge graph and traversal.
- Use [0.0.6-beta.1](./0.0.6-beta.1) for the CLI deprecation beta.
- Use [0.0.4-beta.9](./0.0.4-beta.9) if you are debugging the last beta before the stable promotion.

## Version Source

This page is based on the current stable package version and maintained changelog in the repository.

- package version: `0.1.0`
- release date: `2026-04-09`
- changelog sections document the changes shipped in this stable package
- prior stable published release docs remain archived under `0.0.5`

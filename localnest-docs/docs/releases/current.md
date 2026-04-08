---
description: Current stable package notes for localnest-mcp, including runtime updates, install behavior, memory workflows, and canonical tool behavior. Beta channel is at 0.0.7-beta.2.
---

# Current Release

Current stable package documentation for `localnest-mcp@0.0.5`, covering memory workflow tools, setup migration behavior, and the active canonical `localnest_*` tool contract.

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
    <span className="docEyebrow">Beta channel</span>
    <h3>0.0.7-beta.2 available</h3>
    <p>The latest beta adds a temporal knowledge graph, multi-hop traversal, agent isolation, and 17 new MCP tools. See the <a href="./0.0.7-beta.2">beta release notes</a>.</p>
  </div>
</div>

<div className="docGrid docGrid--3">
  <a className="docLinkCard" href="/docs/setup/install">
    <strong>Install 0.0.5</strong>
    <span>Use the current stable package and follow the direct `localnest` setup flow.</span>
  </a>
  <a className="docLinkCard" href="/docs/setup/configuration">
    <strong>Configure MCP</strong>
    <span>Use the generated MCP block, supported client setup, and startup timeout guidance.</span>
  </a>
  <a className="docLinkCard" href="./0.0.7-beta.2">
    <strong>Preview 0.0.7-beta.2</strong>
    <span>See the beta release notes for the temporal KG, graph traversal, nest/branch hierarchy, and CLI-first architecture.</span>
  </a>
</div>

## What it includes

- canonical `localnest_*` tool names
- lexical, semantic, and hybrid retrieval
- opt-in local memory tools plus high-level task-context and capture-outcome workflow
- bundled install skill command
- version-aware skill sync behavior
- setup-time memory consent and config migration
- `localnest` top-level CLI command path (`setup`, `doctor`, `upgrade`)

## What changed in `0.0.5`

- Promoted the beta.9 runtime and packaging fixes into the stable line.
- Hardened installed-runtime release validation and removed machine-specific path assumptions from the release sweep.
- Standardized upgrade skill sync on `localnest install skills --force` while keeping the legacy alias available.
- Current installs may still show a single upstream deprecation warning from the ONNX runtime chain; LocalNest functionality is unchanged.

## Upgrade Snapshot

<div className="docGrid docGrid--2">
  <div className="docPanel">
    <span className="docEyebrow">If you are already on beta.9</span>
    <h3>Expected user-facing changes</h3>
    <p>The runtime contract stays the same, but the stable release line, installed-runtime validation, and upgrade flow are now internally consistent.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">If you are validating a fresh install</span>
    <h3>Fastest verification path</h3>
    <p>Run <code>localnest version</code>, then <code>localnest doctor --verbose</code>, and confirm your MCP client uses the generated direct-binary config.</p>
  </div>
</div>

## Beta Preview

The beta channel is at `0.0.7-beta.2` with significant new capabilities:

- **Temporal knowledge graph** with entities, triples, as_of queries, and timelines
- **Multi-hop graph traversal** via recursive CTEs (2-5 hops)
- **Nest/Branch hierarchy** for organized memory retrieval
- **Agent-scoped memory** with private diary entries
- **Semantic dedup** to prevent near-duplicate memory pollution
- **Conversation ingestion** for Markdown/JSON chat imports
- **Hooks system** for pre/post operation callbacks
- **CLI-first architecture** with unified noun-verb commands
- **17 new MCP tools** (52 total)

Install the beta: `npm install -g localnest-mcp@beta`

## How to use this page

- Treat this page as the source of truth for the current stable release behavior.
- Use the archived `0.0.3` pages when you need the previous stable release contract.
- Use archived beta pages such as [0.0.4-beta.9](./0.0.4-beta.9) or [0.0.4-beta.8](./0.0.4-beta.8) when you need a frozen prerelease contract instead of the maintained current summary.
- If you need explicit install commands per version, use [Version Selection](./version-selection).
- For the latest beta features, see [0.0.7-beta.2](./0.0.7-beta.2).

## Need a Different Release View?

- Use [Version Selection](./version-selection) when you need exact install commands.
- Use [Release Matrix](./history) when you need the full release-to-page mapping.
- Use [0.0.7-beta.2](./0.0.7-beta.2) for the latest beta with knowledge graph and traversal.
- Use [0.0.6-beta.1](./0.0.6-beta.1) for the CLI deprecation beta.
- Use [0.0.4-beta.9](./0.0.4-beta.9) if you are debugging the last beta before the stable promotion.

## Version Source

This page is based on the current stable package version and maintained changelog in the repository.

- package version: `0.0.5`
- release date: `2026-03-11`
- beta channel: `0.0.7-beta.2` (2026-04-08)
- changelog sections document the changes shipped in this stable package
- prior stable published release docs remain archived under `0.0.3`

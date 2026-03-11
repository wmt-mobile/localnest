---
description: Current stable package notes for localnest-mcp, including runtime updates, install behavior, memory workflows, and canonical tool behavior.
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
    <span className="docEyebrow">Docs contract</span>
    <h3>Retrieval + memory workflow</h3>
    <p>The current release docs include the full memory tool surface and setup/config changes.</p>
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
  <a className="docLinkCard" href="./0.0.4-beta.9">
    <strong>Compare with beta.9</strong>
    <span>Open the archived beta.9 package notes when you need the last prerelease contract before stable.</span>
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

## How to use this page

- Treat this page as the source of truth for the current stable release behavior.
- Use the archived `0.0.3` pages when you need the previous stable release contract.
- Use archived beta pages such as [0.0.4-beta.9](./0.0.4-beta.9) or [0.0.4-beta.8](./0.0.4-beta.8) when you need a frozen prerelease contract instead of the maintained current summary.
- If you need explicit install commands per version, use [Version Selection](./version-selection).

## Need a Different Release View?

- Use [Version Selection](./version-selection) when you need exact install commands.
- Use [Release Matrix](./history) when you need the full release-to-page mapping.
- Use [0.0.4-beta.9](./0.0.4-beta.9) if you are debugging the last beta before the stable promotion.
- Use [0.0.4-beta.8](./0.0.4-beta.8) if you need the earlier beta runtime contract.

## Version Source

This page is based on the current stable package version and maintained changelog in the repository.

- package version: `0.0.5`
- release date: `2026-03-11`
- changelog sections document the changes shipped in this stable package
- prior stable published release docs remain archived under `0.0.3`

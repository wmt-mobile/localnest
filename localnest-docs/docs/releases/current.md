---
description: Current beta branch notes for localnest-mcp, including memory workflows, setup changes, and canonical tool behavior.
---

# Current Beta Release

Current beta branch documentation for `localnest-mcp`, covering memory workflow tools, setup migration behavior, and the active canonical `localnest_*` tool contract.

<div className="docGrid docGrid--3">
  <div className="docPanel">
    <span className="docEyebrow">Channel</span>
    <h3>Beta release line</h3>
    <p>Use this page when you need docs that match the currently published beta package behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">Package</span>
    <h3>beta branch track</h3>
    <p>Use versioned pages for published package specifics; this page tracks current branch behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">Docs contract</span>
    <h3>Retrieval + memory workflow</h3>
    <p>The current beta docs include the full memory tool surface and setup/config changes.</p>
  </div>
</div>

<div className="docGrid docGrid--3">
  <a className="docLinkCard" href="/docs/setup/install">
    <strong>Install beta.6</strong>
    <span>Use the current beta package and follow the direct `localnest` setup flow.</span>
  </a>
  <a className="docLinkCard" href="/docs/setup/configuration">
    <strong>Configure MCP</strong>
    <span>Use the generated MCP block, supported client setup, and startup timeout guidance.</span>
  </a>
  <a className="docLinkCard" href="./0.0.4-beta.5">
    <strong>Compare with beta.5</strong>
    <span>Open the archived beta.5 notes when you need the previous release contract.</span>
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

## What changed in `0.0.4-beta.6`

- Hardened MCP response contracts and release verification so installed-runtime sweeps assert meaningful evidence instead of just process success.
- Improved retrieval miss handling, read-file path errors, update metadata, and runtime cache diagnostics for end users and MCP clients.
- Reworked the internal project layout into clearer `app`, `runtime`, `mcp`, `services`, and grouped `scripts` surfaces without changing user-facing commands.
- Added a `localnest_health` MCP tool and richer server status output for faster troubleshooting.
- Continued to prefer top-level `localnest` command usage for setup, doctor, and upgrade flows.

## Upgrade Snapshot

<div className="docGrid docGrid--2">
  <div className="docPanel">
    <span className="docEyebrow">If you are already on beta.5</span>
    <h3>Expected user-facing changes</h3>
    <p>Startup diagnostics are clearer, release validation is stricter, and the docs/release surface is more explicit about current versus archived behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">If you are validating a fresh install</span>
    <h3>Fastest verification path</h3>
    <p>Run <code>localnest version</code>, then <code>localnest doctor --verbose</code>, and confirm your MCP client uses the generated direct-binary config.</p>
  </div>
</div>

## How to use this page

- Treat this page as the source of truth for the current beta release behavior.
- Use the archived `0.0.3` pages when you need the last stable release contract.
- Use archived beta pages such as [0.0.4-beta.5](./0.0.4-beta.5) when you need the previous beta contract instead of the current one.
- If you need explicit install commands per version, use [Version Selection](./version-selection).

## Need a Different Release View?

- Use [Version Selection](./version-selection) when you need exact install commands.
- Use [Release Matrix](./history) when you need the full release-to-page mapping.
- Use [0.0.4-beta.5](./0.0.4-beta.5) if you are debugging the prior beta instead of the current upload target.

## Version Source

This page is based on the current beta package version and maintained changelog in the repository.

- package version: `0.0.4-beta.6`
- release date: `2026-03-09`
- changelog sections document beta changes merged into this branch
- stable published release docs remain archived under `0.0.3`

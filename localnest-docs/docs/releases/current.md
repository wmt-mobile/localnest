description: Current beta package notes for localnest-mcp, including runtime updates, install behavior, memory workflows, and canonical tool behavior.
---

# Current Beta Release

Current beta package documentation for `localnest-mcp@0.0.4-beta.8`, covering memory workflow tools, setup migration behavior, and the active canonical `localnest_*` tool contract.

<div className="docGrid docGrid--3">
  <div className="docPanel">
    <span className="docEyebrow">Channel</span>
    <h3>Beta release line</h3>
    <p>Use this page when you need docs that match the currently published beta package behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">Package</span>
    <h3>Published beta package</h3>
    <p>Use this page for the currently shipped beta contract and runtime behavior.</p>
  </div>
  <div className="docPanel">
    <span className="docEyebrow">Docs contract</span>
    <h3>Retrieval + memory workflow</h3>
    <p>The current beta docs include the full memory tool surface and setup/config changes.</p>
  </div>
</div>

<div className="docGrid docGrid--3">
  <a className="docLinkCard" href="/docs/setup/install">
    <strong>Install beta.8</strong>
    <span>Use the current beta package and follow the direct `localnest` setup flow.</span>
  </a>
  <a className="docLinkCard" href="/docs/setup/configuration">
    <strong>Configure MCP</strong>
    <span>Use the generated MCP block, supported client setup, and startup timeout guidance.</span>
  </a>
  <a className="docLinkCard" href="/docs/versions/0.0.4-beta.6/overview">
    <strong>Compare with beta.6</strong>
    <span>Open the archived beta.6 doc set when you need the previous release contract.</span>
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

## What changed in `0.0.4-beta.8`

- Added sqlite-vec extension auto-detection and explicit `LOCALNEST_SQLITE_VEC_EXTENSION` support for cleaner startup on global installs.
- Switched the local embedding and reranking runtime from `@xenova/transformers` to `@huggingface/transformers`, and updated new setup defaults to the `huggingface` provider with backward compatibility for older `xenova` configs.
- Removed the earlier `prebuild-install` warning path from the default install graph.
- Published `npm-shrinkwrap.json` so npm package installs carry the intended transitive dependency graph.
- Current installs may still show a single upstream deprecation warning from the ONNX runtime chain; LocalNest functionality is unchanged.

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
- Use archived beta pages such as [0.0.4-beta.6](/docs/versions/0.0.4-beta.6/overview) when you need the previous beta contract instead of the current one.
- If you need explicit install commands per version, use [Version Selection](./version-selection).

## Need a Different Release View?

- Use [Version Selection](./version-selection) when you need exact install commands.
- Use [Release Matrix](./history) when you need the full release-to-page mapping.
- Use [0.0.4-beta.6](/docs/versions/0.0.4-beta.6/overview) if you are debugging the prior beta instead of the current upload target.

## Version Source

This page is based on the current beta package version and maintained changelog in the repository.

- package version: `0.0.4-beta.8`
- release date: `2026-03-10`
- changelog sections document the changes shipped in this beta package
- stable published release docs remain archived under `0.0.3`

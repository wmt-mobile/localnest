---
description: Main branch release notes for unreleased LocalNest behavior, including update tooling and source-only documentation changes.
---

# Main Branch

<div className="docPanel docPanel--compact">
  <p>
    This page tracks unreleased repository behavior on `main`. Use it for source-level documentation,
    not as the default reference for published npm installs.
  </p>
</div>

This page is for unreleased branch behavior merged on GitHub `main`.

Use it when you are documenting features present in source but not yet part of the current npm release.

Current main-branch differences include update-oriented tooling, expanded agent guidance, and the `0.0.6-beta.1` CLI deprecation pass.

## Current Main Additions

<div className="docGrid docGrid--2">
  <div className="docPanel">
    <h3>New tools</h3>
    <ul>
      <li>`localnest_update_status`</li>
      <li>`localnest_update_self`</li>
    </ul>
  </div>
  <div className="docPanel">
    <h3>Behavior changes</h3>
    <ul>
      <li>`updates` metadata in `localnest_server_status`</li>
      <li>stronger usage guidance around `search_files` and evidence-first retrieval</li>
      <li>canonical `localnest task-context` / `localnest capture-outcome` commands with deprecated compatibility wrappers for older helper binaries</li>
    </ul>
  </div>
</div>

---
description: Version matrix for LocalNest docs mapping the current stable release, archived beta releases, and older stable lines for compatibility and debugging.
---

# Release Matrix

<div className="docPanel docPanel--compact">
  <p>
    Release history here is derived from the maintained changelog and current package metadata. The
    local Git tags in this repository do not currently align with the documented release line.
  </p>
</div>

This site documents versions from repository source history, primarily the maintained `CHANGELOG.md` plus the current package version.

## Important Mismatch

The local git tags currently available in this repository are:

- `v0.1.0-beta`
- `v0.1.0-beta.1`

Those do **not** match the package/changelog release line currently documented here:

- `0.0.7-beta.1` (current beta package — temporal KG, CLI-first, 52 tools)
- `0.0.6-beta.1` (previous beta)
- `0.0.5` (current stable package)
- `0.0.4-beta.9`
- `0.0.4-beta.8`
- `0.0.4-beta.7`
- `0.0.4-beta.6`
- `0.0.4-beta.5`
- `0.0.4-beta.4` (archived beta package)
- `0.0.1-beta.1`
- `0.0.2-beta.2`
- `0.0.2-beta.3`
- `0.0.3`

## Documented Release Pages

| Version | Basis | Page |
| --- | --- | --- |
| `0.0.7-beta.1` | beta package + changelog `0.0.7-beta.1` | [Beta Release Notes](./0.0.7-beta.1), [Version Archive](/docs/versions/0.0.7-beta.1/overview) |
| `0.0.6-beta.1` | beta package + changelog `0.0.6-beta.1` | [Release Notes](./0.0.6-beta.1), [Version Archive](/docs/versions/0.0.6-beta.1/overview) |
| `0.0.5` | current stable package + changelog `0.0.5` | [Current Release](./current) |
| `0.0.4-beta.9` | archived beta package + changelog `0.0.4-beta.9` | [Archived Release Notes](./0.0.4-beta.9), [Version Archive: 0.0.4-beta.9](/docs/versions/0.0.4-beta.9/overview) |
| `0.0.4-beta.8` | archived beta package + changelog `0.0.4-beta.8` | [0.0.4-beta.8](./0.0.4-beta.8), [Version Archive: 0.0.4-beta.8](/docs/versions/0.0.4-beta.8/overview) |
| `0.0.4-beta.7` | archived beta package + changelog `0.0.4-beta.7` | [0.0.4-beta.7](./0.0.4-beta.7) |
| `0.0.4-beta.6` | archived beta package + frozen docs snapshot | [Version Archive: 0.0.4-beta.6](/docs/versions/0.0.4-beta.6/overview) |
| `0.0.4-beta.5` | archived beta package + frozen docs snapshot | [Version Archive: 0.0.4-beta.5](/docs/versions/0.0.4-beta.5/overview) |
| `0.0.4-beta.4` (archive) | frozen docs snapshot | [Version Archive: 0.0.4-beta.4](/docs/versions/0.0.4-beta.4/overview) |
| `0.0.3` | package version + changelog | [0.0.3](./0.0.3) |
| `0.0.2-beta.3` | changelog | [0.0.2-beta.3](./0.0.2-beta.3) |
| `0.0.2-beta.2` | changelog | [0.0.2-beta.2](./0.0.2-beta.2) |
| `0.0.1-beta.1` | changelog | [0.0.1-beta.1](./0.0.1-beta.1) |

Use the per-version pages below for release-specific summaries.

## Fast Navigation

<div className="docGrid docGrid--3">
  <a className="docLinkCard" href="./0.0.7-beta.1">
    <strong>Current beta</strong>
    <span>Use the beta release page for `0.0.7-beta.1` — temporal KG, CLI-first, 52 tools.</span>
  </a>
  <a className="docLinkCard" href="./current">
    <strong>Current stable</strong>
    <span>Use the current release page for the stable `0.0.5` contract.</span>
  </a>
  <a className="docLinkCard" href="./0.0.4-beta.9">
    <strong>Previous beta</strong>
    <span>Use the archived beta.9 notes for the prerelease that promoted into `0.0.5` stable.</span>
  </a>
  <a className="docLinkCard" href="./0.0.3">
    <strong>Stable line</strong>
    <span>Use the stable page when you need the last non-beta baseline.</span>
  </a>
</div>

## Reading guidance

- Start with [Version Selection](./version-selection) when you need exact install commands for a specific version.
- Use `current` if you want documentation aligned to the active stable package and behavior.
- Use archived version pages when you are debugging or supporting older installs.
- For each new published release, keep the previous current-beta page as its own frozen per-version document instead of only updating labels.

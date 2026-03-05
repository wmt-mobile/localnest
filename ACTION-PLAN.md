# ACTION-PLAN

## Critical

- None confirmed.

## High Impact

1. Unify version messaging across docs UI.
   - Update `localnest-docs/docusaurus.config.ts`:
     - Navbar label `v0.0.3` -> `v0.0.4-beta.4` (or `latest beta`).
     - Footer label `Current release (0.0.3)` -> current canonical channel label.
   - Result: removes trust/confusion signals for users and crawlers.

2. Add explicit SEO descriptions for release/version pages.
   - Add frontmatter `description` fields in:
     - `localnest-docs/docs/releases/*.md`
     - `localnest-docs/docs/versions/*/overview.md`
   - Target ~120–160 chars with version + intent keywords.
   - Result: stronger SERP snippets and better click intent matching.

## Medium Impact (Quick Wins)

1. Add `robots.txt` to docs static output.
   - Create `localnest-docs/static/robots.txt` with:
     - `User-agent: *`
     - `Allow: /`
     - `Sitemap: https://wmt-mobile.github.io/localnest/sitemap.xml`

2. Add `llms.txt` for AI/documentation discovery.
   - Create `localnest-docs/static/llms.txt` with:
     - product summary
     - canonical docs URLs
     - release notes + setup entry points

## Strategic

1. Add global JSON-LD for entity clarity.
   - Add `WebSite` and `Organization` schema in site head.
   - Keep breadcrumb schema as-is for doc pages.

2. Introduce docs SEO QA gate in CI.
   - Build docs and assert:
     - no missing title/description/canonical
     - description length range checks
     - version-label consistency checks

## Validation Checklist After Changes

1. `cd localnest-docs && npm run build`
2. Inspect built HTML for updated labels and descriptions.
3. Verify `build/robots.txt`, `build/llms.txt`, and `build/sitemap.xml`.
4. Re-run metadata scan for short descriptions and duplicates.


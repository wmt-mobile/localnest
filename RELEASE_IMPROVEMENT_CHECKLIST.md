# LocalNest Release Improvement Checklist

Based on the installed `localnest-mcp 0.0.4-beta.5` release sweep in [reports/localnest-installed-beta5-release-test-report.md](/mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest/reports/localnest-installed-beta5-release-test-report.md).

## Status Key

- [ ] Not started
- [~] In progress
- [x] Done

## 1. Response Contract Consistency

- [ ] Normalize `localnest_index_project` response so `indexed_files` is always present and numeric.
- [ ] Normalize `localnest_memory_store` response so the created memory `id` is always returned.
- [ ] Normalize `localnest_memory_get` response so key fields like `title` are always present when the entry exists.
- [ ] Normalize `localnest_memory_update` response so the updated memory `id` and updated fields are always returned.
- [ ] Normalize `localnest_memory_add_relation` response so `source_id`, `target_id`, and `relation_type` are always returned.
- [ ] Normalize `localnest_memory_remove_relation` response so `removed` is always explicit and boolean.
- [ ] Normalize `localnest_embed_status` response so `ready`, `provider`, `model`, and related readiness fields are never blank.
- [ ] Normalize `localnest_update_status` response so `current`, `latest`, and `is_outdated` are always explicit.
- [ ] Audit every MCP tool for stable top-level fields and remove ambiguous `undefined`-style output cases.
- [ ] Document canonical response fields for every tool in docs and/or schemas.
- [ ] Add regression tests that assert required output fields, not just successful tool execution.

## 2. Retrieval Quality And Result Clarity

- [ ] Investigate why `localnest_search_files` returned zero results for a plausible repo-local query during release sweep.
- [ ] Investigate why `localnest_search_code` returned zero results for a plausible repo-local query during release sweep.
- [ ] Investigate why `localnest_read_file` returned zero lines for a known existing file path during release sweep.
- [ ] Investigate why `localnest_project_tree` returned zero top-level entries for the project under test.
- [ ] Confirm whether the above are tool bugs, path-shape issues, or weak test inputs.
- [ ] Improve search miss responses so they include clearer scope/debug metadata.
- [ ] Add “no results” guidance in tool responses when queries miss but the scope is valid.
- [ ] Improve read-file responses so invalid path/scope/path-format issues are explicit.
- [ ] Add a release-sweep dataset of known-good queries/paths that should always return non-empty evidence.
- [ ] Add assertions for result quality, not only process success, in installed-runtime release tests.

## 3. Installed Runtime And Environment Handling

- [ ] Fix preferred cache path handling so LocalNest uses `~/.localnest/cache` instead of falling back to `/tmp/localnest-models-uid-1000` when it should be writable.
- [ ] Confirm whether cache fallback is caused by permission checks, path creation timing, or model-library behavior.
- [ ] Improve diagnostics around model cache fallback so the exact reason is surfaced.
- [ ] Decide whether cache fallback should be warning-level or informational when startup still succeeds.
- [ ] Reduce or suppress the `node:sqlite` experimental warning in normal release flows if feasible.
- [ ] Verify startup and doctor output remain clean on a fresh machine with the default LocalNest home layout.
- [ ] Verify startup on a machine with legacy flat `~/.localnest` paths still behaves cleanly.

## 4. Setup And Client Integration

- [ ] Confirm `localnest-mcp-setup` now updates Codex correctly on a clean machine.
- [ ] Confirm `localnest-mcp-setup` updates Cursor correctly on a clean machine.
- [ ] Confirm `localnest-mcp-setup` updates Gemini Antigravity correctly on a clean machine.
- [ ] Confirm `localnest-mcp-setup` updates Kiro correctly on a clean machine.
- [ ] Confirm `localnest-mcp-setup` updates Windsurf correctly on a clean machine.
- [ ] Confirm `localnest-mcp-setup` updates Codeium-managed Windsurf correctly on a clean machine.
- [ ] Verify setup writes backups before modifying client configs in all supported clients.
- [ ] Verify rerunning setup is idempotent and does not duplicate LocalNest MCP entries.
- [ ] Improve setup output so it clearly states which tools were updated, skipped, or unsupported.
- [ ] Document why some detected tools are intentionally not auto-configured yet.
- [ ] Add tests for client-config rewrites against more real-world config variants.

## 5. Memory Workflow Quality

- [ ] Verify `localnest_task_context` returns stable recall metadata across empty and non-empty memory states.
- [ ] Verify `localnest_capture_outcome` returns stable `captured` and `result` fields.
- [ ] Verify temporary memory create/update/relation/delete flows leave the store clean after tests.
- [ ] Decide whether event-based release tests should write to the real event log or an isolated test database.
- [ ] Add explicit release-test coverage for empty-memory and disabled-memory scenarios.
- [ ] Add release-test coverage for memory backend unavailable scenarios.

## 6. Update Workflow

- [ ] Add a dedicated controlled test for `localnest_update_self`.
- [ ] Decide whether `localnest_update_self` should support a fully dry-run validation mode for release sweeps.
- [ ] Ensure `localnest_update_status` remains informative even when network checks are skipped or cached.
- [ ] Verify update metadata is visible in `localnest_server_status` and easy for clients to act on.

## 7. Release Harness Improvements

- [ ] Promote `scripts/release-test-installed-beta5.mjs` into a reusable installed-runtime release test harness.
- [ ] Parameterize the harness so version labels and output paths are not hardcoded to beta.5.
- [ ] Add stronger assertions for expected non-empty retrieval results on known-good queries.
- [ ] Add explicit schema assertions for tool outputs in the installed-runtime harness.
- [ ] Capture tool stderr/stdout per step where useful instead of only at the end.
- [ ] Add a summary of created temporary artifacts and whether cleanup succeeded.
- [ ] Add a machine-readable JSON report alongside the markdown report.
- [ ] Make the release harness fail if critical evidence-based checks return empty or malformed results.

## 8. Documentation Improvements

- [ ] Update docs to describe the difference between “tool executed successfully” and “tool returned meaningful evidence”.
- [ ] Document expected cache fallback behavior and how to fix it.
- [ ] Document installed-runtime release testing as a recommended pre-release step.
- [ ] Document the supported auto-configured AI tools list explicitly.
- [ ] Document the unsupported-but-detected tool list and the reason each is not auto-configured.
- [ ] Add troubleshooting guidance for direct binary vs `npx` launch paths.

## 9. Nice-To-Have Polish

- [ ] Improve human readability of `localnest_usage_guide` output for release/debug sessions.
- [ ] Consider exposing a dedicated `health` or `smoke_test` tool for fast runtime validation.
- [ ] Consider exposing richer backend diagnostics in `localnest_server_status`.
- [ ] Consider adding a “recommended next action” field to retrieval misses.
- [ ] Consider adding a “response schema version” field for MCP tool outputs.

## 10. Exit Criteria Before Calling The Next Release Tighter

- [ ] All MCP tools return stable, documented response shapes.
- [ ] Installed-runtime release sweep passes with no empty evidence for known-good retrieval checks.
- [ ] Default cache path behavior is understood and either fixed or clearly documented.
- [ ] `update_self` has dedicated test coverage or an approved explicit exclusion policy.
- [ ] Supported client auto-install paths are verified on real configs.
- [ ] Release report generation is repeatable and trustworthy enough to gate a publish decision.

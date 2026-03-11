# Improvements

## Setup And Upgrade UX

- Make `localnest setup` a true one-time bootstrap flow.
- Stop using `setup` as the default recovery path for existing users.
- Treat existing config as durable state that should be preserved across updates.
- Ask users only for missing values or newly introduced required settings.
- Avoid re-asking memory consent once it has already been recorded.
- Avoid re-asking roots, backend, DB paths, and other stable choices unless the user explicitly wants to change them.

## Upgrade Path

- Make `localnest upgrade` the default repair and migration path for existing users.
- Ensure `upgrade` preserves existing roots, memory settings, backend selection, and DB paths.
- Let `upgrade` refresh installed MCP client snippets when config shape changes.
- Let `upgrade` repair runtime assets such as `sqlite-vec` installation or path changes without forcing a full setup wizard.
- Use `upgrade` for schema migrations, config migrations, and setup defaults backfill.
- Only fall back to interactive prompts during upgrade when a required value is missing and cannot be inferred safely.

## Runtime Self-Healing

- Make MCP startup tolerant of minor runtime issues so users do not need to re-run setup.
- Prefer automatic repair or safe fallback over startup failure.
- If `sqlite-vec` native loading fails, continue in degraded fallback mode and keep retrieval functional.
- Emit one clear remediation message such as `run localnest upgrade` instead of telling users to run setup again.
- Detect stale or partially outdated runtime/config combinations at startup and surface targeted upgrade guidance.

## Doctor Improvements

- Make `localnest doctor` perform a real `sqlite-vec` load probe instead of only checking whether the shared library exists on disk.
- Distinguish between `healthy`, `degraded`, and `broken` states.
- Report setup prerequisites separately from live runtime capability checks.
- Ensure doctor output matches real MCP runtime behavior so false-green health reports do not occur.

## sqlite-vec Reliability

- Fix the sqlite runtime path to open the database with extension loading enabled when `sqlite-vec` backend is selected.
- Reuse existing user databases without requiring manual migration, because this issue is a DB-open/runtime option issue rather than a data-format issue.
- Add regression coverage for the real Node `node:sqlite` extension loading behavior.
- Add release validation that fails if doctor says healthy but the MCP runtime cannot actually load `vec0`.

## Product Direction

- One-time setup should be enough for most users.
- After first setup, the normal lifecycle should be:
  - update package
  - run `localnest upgrade` if needed
  - restart MCP client
- `setup` should be reserved for first install, missing config, or explicit reconfiguration.
- Existing users should not be pushed back through onboarding just to receive runtime fixes.

# Updates

<div className="docPanel docPanel--compact">
  <p>
    Update tooling is operational rather than informational. Check for new versions first, and only
    run self-update after the user explicitly approves it.
  </p>
</div>

## `localnest_update_status`

Checks npm for the latest LocalNest version with local cache and backoff.

The response stays useful even when it is cached or when a live npm check fails. Look at:

- `source`
- `using_cached_data`
- `recommendation`
- `can_attempt_update`
- `next_check_at`

## `localnest_update_self`

Updates the package globally and syncs bundled skill files.

This tool must only be used after explicit user approval.

`dry_run=true` is a validation mode. It does not install anything; it only checks whether the required commands are available for a real update flow.

## Related branch behavior

- `localnest-mcp --version` now reports the runtime/package version directly.
- `localnest-mcp-install-skill` now checks bundled skill metadata and skips reinstalling when the installed skill is already current, unless `--force` is used.

## Safe usage pattern

<div className="docSteps">
  <div className="docStep">
    <span>1</span>
    <div>
      <strong>Check the installed version</strong>
      <p>Call `localnest_update_status` to see whether a newer version is available.</p>
    </div>
  </div>
  <div className="docStep">
    <span>2</span>
    <div>
      <strong>Ask for approval</strong>
      <p>Do not run `localnest_update_self` unless the user explicitly confirms the update.</p>
    </div>
  </div>
  <div className="docStep">
    <span>3</span>
    <div>
      <strong>Re-verify after updating</strong>
      <p>After an update, re-run status or doctor checks so the new runtime state is visible.</p>
    </div>
  </div>
</div>

## Successful execution vs actionable update data

`localnest_update_status` can succeed in multiple ways:

- live npm result
- cached result
- cache fallback after a live npm failure

Treat a successful tool call as transport success. Use `recommendation` and `can_attempt_update` to decide whether the result is actionable for the current session.

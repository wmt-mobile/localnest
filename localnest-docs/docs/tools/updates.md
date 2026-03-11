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

CLI equivalents:

```bash
localnest upgrade
localnest upgrade stable
localnest upgrade beta
localnest upgrade 0.0.5
```

## Related branch behavior

- `localnest-mcp --version` now reports the runtime/package version directly.
- `localnest install skills` now checks bundled skill metadata and skips reinstalling when the installed skill is already current, unless `--force` is used.

## Safe usage pattern

```text
1. Check the installed version with localnest_update_status.
2. Ask for approval before calling localnest_update_self.
3. Re-run status or doctor checks after updating.
```

## Successful execution vs actionable update data

`localnest_update_status` can succeed in multiple ways:

- live npm result
- cached result
- cache fallback after a live npm failure

Treat a successful tool call as transport success. Use `recommendation` and `can_attempt_update` to decide whether the result is actionable for the current session.

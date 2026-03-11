# 0.0.4-beta.8 Install

<div className="docPanel docPanel--compact">
  <p>
    Beta.8 keeps the direct top-level <code>localnest</code> install flow from beta.7 while
    focusing on startup regressions, status hardening, and safer installed-runtime validation.
  </p>
</div>

```bash
npm install -g localnest-mcp@0.0.4-beta.8
localnest-mcp-install-skill
localnest setup
localnest doctor
localnest upgrade
```

## Beta-specific notes

- `localnest setup` and `localnest doctor` remain the preferred bootstrap path.
- direct `localnest-mcp` binary startup is still preferred for MCP clients; `npx` remains fallback behavior.
- startup no longer blocks on the synchronous npm warm-check that caused early MCP delays in prior builds.
- sqlite-vec index status now degrades safely when the database is locked instead of hanging or crashing status calls.

Need another version line? Use [/docs/releases/version-selection](/docs/releases/version-selection).

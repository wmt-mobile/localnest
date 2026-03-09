# 0.0.4-beta.5 Install

<div className="docPanel docPanel--compact">
  <p>
    Beta.5 established the recommended top-level <code>localnest</code> flow for install, setup,
    doctor, and upgrade tasks.
  </p>
</div>

```bash
npm install -g localnest-mcp@0.0.4-beta.5
localnest-mcp-install-skill
localnest setup
localnest doctor
localnest upgrade
```

## Beta-specific notes

- `localnest setup` is the preferred configuration path on this version.
- `localnest doctor --verbose` is the recommended follow-up when validating cache and runtime state.
- direct `localnest-mcp` binary startup is preferred for MCP clients; `npx` is only fallback behavior.
- upgrade guidance in this release centers on `localnest upgrade`, not the removed `localnest update` alias.

Need another version line? Use [/docs/releases/version-selection](/docs/releases/version-selection).

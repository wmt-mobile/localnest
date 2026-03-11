# 0.0.4-beta.9 Install

<div className="docPanel docPanel--compact">
  <p>
    Beta.9 keeps the direct top-level <code>localnest</code> install flow while fixing bundled
    skill version reporting and hardening package metadata for published installs.
  </p>
</div>

```bash
npm install -g localnest-mcp@0.0.4-beta.9
localnest install skills
localnest setup
localnest doctor
localnest upgrade
```

## Beta-specific notes

- `localnest install skills` is the preferred bundled-skill sync command for this version line.
- `localnest-mcp-install-skill` remains available as a legacy alias.
- bundled skill version reporting now uses the package version as the source of truth.
- installs may still show one upstream ONNX-runtime deprecation warning, but LocalNest behavior is unchanged.

Need another version line? Use [/docs/releases/version-selection](/docs/releases/version-selection).

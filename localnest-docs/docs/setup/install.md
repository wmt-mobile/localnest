# Install

<div className="docPanel docPanel--compact">
  <p>
    The recommended path is a global install followed by setup and doctor. Use the generated MCP
    config block instead of hand-writing the client command when possible. On this branch, setup also
    collects one-time consent for optional local memory.
  </p>
</div>

## Requirements

- Node.js `>=18`
- `ripgrep` (`rg`) recommended for best lexical search performance
- Node.js `>=22` if you want the local memory subsystem available

## Recommended install

```bash
npm install -g localnest-mcp
localnest-mcp-install-skill
localnest setup
localnest doctor
localnest upgrade
```

## Fallback

```bash
npx -y localnest-mcp-setup
npx -y localnest-mcp-doctor
```

## Install sequence

<div className="docSteps">
  <div className="docStep">
    <span>1</span>
    <div>
      <strong>Install the package</strong>
      <p>Use `npm install -g localnest-mcp` so setup, doctor, and skill commands are available directly.</p>
    </div>
  </div>
  <div className="docStep">
    <span>2</span>
    <div>
      <strong>Install the bundled skill</strong>
      <p>Run `localnest-mcp-install-skill` to sync the shipped agent skill into the local skills directory.</p>
    </div>
  </div>
  <div className="docStep">
    <span>3</span>
    <div>
      <strong>Generate configuration</strong>
      <p>`localnest setup` writes both the LocalNest config and the MCP client block, and prompts once for memory consent.</p>
    </div>
  </div>
  <div className="docStep">
    <span>4</span>
    <div>
      <strong>Verify the environment</strong>
      <p>`localnest doctor` confirms runtime dependencies and flags configuration problems early.</p>
    </div>
  </div>
  <div className="docStep">
    <span>5</span>
    <div>
      <strong>Upgrade when needed</strong>
      <p>Run `localnest upgrade` to pull the latest package and apply setup migrations.</p>
    </div>
  </div>
</div>

## MCP client config

After setup, copy `~/.localnest/config/mcp.localnest.json` into your MCP client configuration.

```json
{
  "mcpServers": {
    "localnest": {
      "command": "localnest-mcp",
      "startup_timeout_sec": 30,
      "env": {
        "MCP_MODE": "stdio",
        "LOCALNEST_CONFIG": "~/.localnest/config/localnest.config.json",
        "LOCALNEST_INDEX_BACKEND": "sqlite-vec",
        "LOCALNEST_DB_PATH": "~/.localnest/data/localnest.db",
        "LOCALNEST_INDEX_PATH": "~/.localnest/data/localnest.index.json",
        "LOCALNEST_SQLITE_VEC_EXTENSION": "~/.localnest/vendor/sqlite-vec/node_modules/sqlite-vec/dist/vec0.so",
        "LOCALNEST_MEMORY_ENABLED": "true",
        "LOCALNEST_MEMORY_BACKEND": "auto",
        "LOCALNEST_MEMORY_DB_PATH": "~/.localnest/data/localnest.memory.db"
      }
    }
  }
}
```

## Notes

- Keep `startup_timeout_sec` at `30` or higher if your MCP client is aggressive about startup timeouts.
- Setup writes the correct command for the host platform; Windows installs should prefer the generated file output directly.
- Prefer the direct `localnest-mcp` binary when it is installed globally. Use `npx` only as a fallback.
- The current beta runtime uses `@huggingface/transformers` for local embedding and reranking execution. New setup defaults use the `huggingface` provider, and older `xenova` configs remain accepted as a compatibility alias.
- For the recommended `sqlite-vec` backend, setup now installs or detects the native `vec0` extension and writes its path into config/client env automatically.
- If setup cannot provision `vec0`, rerun `localnest setup` before relying on sqlite-vec in MCP clients.
- Memory is opt-in. On Node 18/20, the rest of LocalNest still works, but memory remains unavailable.
- `localnest-mcp-install-skill` is version-aware on this branch and skips reinstalling when the bundled skill is already current.
- Setup warms embedding/reranker models on first run (downloads into `~/.localnest/cache` by default).
- `0.0.4-beta.8` removes the earlier `prebuild-install` warning path from installs. A single upstream ONNX-runtime deprecation warning may still appear during npm install.
- If `~/.localnest/cache` is not writable, LocalNest automatically falls back to a per-user temp cache path.
- Cache fallback is acceptable when startup succeeds, but fixing the preferred cache path is still recommended for persistent model reuse.
- Run `localnest doctor --verbose` to confirm model cache writeability for the current user.
- Offline/restricted environments can defer warmup with `localnest setup --skip-model-download=true`.
- If the default model cache path is not writable, set `LOCALNEST_EMBED_CACHE_DIR` and `LOCALNEST_RERANKER_CACHE_DIR` to a user-writable directory before running setup.

## Supported auto-configured tools

When setup detects a supported client config, it updates the LocalNest MCP entry automatically and writes a backup first:

- Codex
- Cursor
- Windsurf
- Windsurf (Codeium)
- Gemini CLI / Antigravity
- Kiro

## Troubleshooting startup path issues

If MCP startup fails before `initialize`:

- verify whether the client is still launching LocalNest through `npx`
- run `localnest-mcp --version` directly
- increase `startup_timeout_sec`
- check npm cache permissions if you must use `npx`

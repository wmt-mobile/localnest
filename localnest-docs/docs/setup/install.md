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
localnest install skills
localnest setup
localnest doctor
localnest upgrade
```

## Fallback

```bash
npx -y localnest-mcp --help
localnest install skills --force
npx -y localnest-mcp-setup
npx -y localnest-mcp-doctor
```

## Install sequence

```bash
# 1. Install the package
npm install -g localnest-mcp

# 2. Install bundled skills
localnest install skills

# 3. Generate configuration
localnest setup

# 4. Verify the environment
localnest doctor

# 5. Upgrade when needed
localnest upgrade
```

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
- The current stable runtime uses `@huggingface/transformers` for local embedding and reranking execution. New setup defaults use the `huggingface` provider, and older `xenova` configs remain accepted as a compatibility alias.
- For the recommended `sqlite-vec` backend, setup now installs or detects the native `vec0` extension and writes its path into config/client env automatically.
- If setup cannot provision `vec0`, rerun `localnest setup` before relying on sqlite-vec in MCP clients.
- Memory is opt-in. On Node 18/20, the rest of LocalNest still works, but memory remains unavailable.
- `localnest install skills` is version-aware on this branch and skips reinstalling bundled skills when they are already current unless `--force` is used. `localnest-mcp-install-skill` remains as a legacy alias.
- Setup warms embedding/reranker models on first run (downloads into `~/.localnest/cache` by default).
- `0.0.5` promotes the beta.9 install/runtime fixes into the stable line. A single upstream ONNX-runtime deprecation warning may still appear during npm install.
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

---
title: CLI Reference
description: Complete command reference for the localnest CLI tool
sidebar_label: CLI Reference
sidebar_position: 8
---

# CLI Reference

LocalNest is a full CLI tool. Everything is managed from the terminal with `localnest <noun> <verb>` subcommands.

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | Machine-readable JSON output |
| `--verbose` | Detailed output |
| `--quiet` | Suppress non-essential output |
| `--config <path>` | Override config file location |

## Core Commands

```bash
localnest setup              # configure roots, backends, AI clients
localnest doctor             # health check
localnest upgrade            # self-update
localnest version            # current version
localnest status             # runtime status
```

## Memory Commands

```bash
localnest memory add "content" --type decision --importance 80 --nest myproject
localnest memory search "query" --limit 10 --nest myproject
localnest memory list --kind decision --json
localnest memory show <id>
localnest memory delete <id> -f
```

## Knowledge Graph Commands

```bash
localnest kg add Alice works_on ProjectX --confidence 0.9
localnest kg query Alice --direction outgoing
localnest kg timeline Alice
localnest kg stats
```

## Skill Commands

```bash
localnest skill install       # install skills to all detected AI clients
localnest skill list          # show installed skills
localnest skill remove <name> # uninstall a skill
```

## MCP Commands

```bash
localnest mcp start           # start MCP server (stdio mode)
localnest mcp status          # server health and config
localnest mcp config          # output MCP config JSON for AI clients
localnest mcp config --client claude  # output claude mcp add command
```

## Ingest Commands

```bash
localnest ingest ./chat.md                    # auto-detect format
localnest ingest ./export.json --format json  # explicit format
localnest ingest ./chat.md --nest project --branch auth
```

## Shell Completions

```bash
localnest completion bash >> ~/.bashrc
localnest completion zsh >> ~/.zshrc
localnest completion fish > ~/.config/fish/completions/localnest.fish
```

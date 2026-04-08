#!/usr/bin/env node
// LocalNest Post-Tool Hook for Claude Code
//
// Runs after tool calls to auto-capture outcomes into memory and KG.
// Triggers on: Bash, Edit, Write (tools that change things)
//
// How it works:
// 1. Reads tool result from stdin (Claude Code hook protocol)
// 2. Detects meaningful outcomes (file changes, commands run)
// 3. Calls localnest capture-outcome CLI to save into memory
// 4. Writes diary entry for the current agent session
//
// Install in ~/.claude/settings.json:
// {
//   "hooks": {
//     "PostToolUse": [{
//       "matcher": "Bash|Edit|Write",
//       "hooks": [{
//         "type": "command",
//         "command": "node \"PATH_TO/localnest-post-tool.js\"",
//         "timeout": 8
//       }]
//     }]
//   }
// }

const { spawnSync } = require('child_process');
const DEBOUNCE_FILE = require('os').tmpdir() + '/localnest-post-hook-last.json';
const DEBOUNCE_MS = 60000; // 60s between captures
const fs = require('fs');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 8000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name || '';
    const toolInput = data.tool_input || {};
    
    const sessionId = data.session_id || 'unknown';

    // Only capture on write/edit/bash
    if (!['Edit', 'Write', 'Bash', 'MultiEdit'].includes(toolName)) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Debounce
    try {
      const last = JSON.parse(fs.readFileSync(DEBOUNCE_FILE, 'utf8'));
      if (Date.now() - last.ts < DEBOUNCE_MS) {
        process.stdout.write('{}');
        process.exit(0);
      }
    } catch { /* no debounce file */ }

    // Build summary from tool input
    const filePath = toolInput.file_path || '';
    const command = toolInput.command || '';
    const summary = filePath
      ? `Modified ${filePath.split('/').pop()}`
      : command
        ? `Ran: ${command.slice(0, 100)}`
        : `Used ${toolName}`;

    // Capture outcome into memory
    spawnSync('localnest', ['capture-outcome', '--task', summary, '--summary', summary, '--json'], {
      encoding: 'utf8',
      timeout: 5000,
      env: { ...process.env, LOCALNEST_MEMORY_ENABLED: 'true' }
    });

    // Write agent diary entry for session continuity
    const diaryContent = `[${new Date().toISOString()}] ${toolName}: ${summary}`;
    spawnSync('localnest', ['mcp', 'start'], { // diary write needs MCP — skip for now
      encoding: 'utf8',
      timeout: 1000,
      input: JSON.stringify({
        jsonrpc: '2.0', method: 'tools/call',
        params: { name: 'localnest_diary_write', arguments: { agent_id: `session-${sessionId}`, content: diaryContent } }
      })
    });

    // Save debounce
    try { fs.writeFileSync(DEBOUNCE_FILE, JSON.stringify({ ts: Date.now() })); } catch { /* ignore */ }

    process.stdout.write('{}');
  } catch {
    process.stdout.write('{}');
    process.exit(0);
  }
});

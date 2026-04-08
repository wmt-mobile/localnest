#!/usr/bin/env node
// LocalNest Pre-Tool Hook for Claude Code
//
// Runs before tool calls to inject relevant memory context.
// Triggers on: Edit, Write, Bash (substantive work tools)
//
// How it works:
// 1. Reads tool call info from stdin (Claude Code hook protocol)
// 2. Calls localnest task-context CLI to retrieve relevant memories
// 3. Returns additionalContext with recalled memories so the AI
//    knows what it learned before about the current topic
//
// Install in ~/.claude/settings.json:
// {
//   "hooks": {
//     "PreToolUse": [{
//       "matcher": "Edit|Write|Bash",
//       "hooks": [{
//         "type": "command",
//         "command": "node \"PATH_TO/localnest-pre-tool.js\"",
//         "timeout": 8
//       }]
//     }]
//   }
// }

const { spawnSync } = require('child_process');
const DEBOUNCE_FILE = require('os').tmpdir() + '/localnest-pre-hook-last.json';
const DEBOUNCE_MS = 30000; // 30s between context retrievals
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

    // Only trigger on substantive tools
    if (!['Edit', 'Write', 'Bash', 'MultiEdit'].includes(toolName)) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Debounce — don't call task-context on every single tool use
    try {
      const last = JSON.parse(fs.readFileSync(DEBOUNCE_FILE, 'utf8'));
      if (Date.now() - last.ts < DEBOUNCE_MS) {
        process.stdout.write('{}');
        process.exit(0);
      }
    } catch { /* no debounce file or expired */ }

    // Extract context clues from tool input
    const filePath = toolInput.file_path || toolInput.command || '';
    const query = filePath.split('/').pop() || '';

    if (!query) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Call localnest task-context
    const result = spawnSync('localnest', ['task-context', '--task', query, '--json'], {
      encoding: 'utf8',
      timeout: 6000,
      env: { ...process.env, LOCALNEST_MEMORY_ENABLED: 'true' }
    });

    if (result.status !== 0 || !result.stdout) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Parse and extract recalled memories
    let memories = [];
    try {
      const parsed = JSON.parse(result.stdout);
      const recalled = parsed.recalled || parsed.data?.recalled || [];
      memories = recalled.slice(0, 3).map(m => `- ${m.title}: ${m.summary || m.content?.slice(0, 100)}`);
    } catch { /* parsing failed */ }

    // Save debounce timestamp
    try { fs.writeFileSync(DEBOUNCE_FILE, JSON.stringify({ ts: Date.now() })); } catch { /* ignore */ }

    if (memories.length === 0) {
      process.stdout.write('{}');
      process.exit(0);
    }

    const context = `[LocalNest Memory] Relevant prior knowledge:\n${memories.join('\n')}`;
    process.stdout.write(JSON.stringify({ additionalContext: context }));
  } catch {
    process.stdout.write('{}');
    process.exit(0);
  }
});

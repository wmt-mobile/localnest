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
const stdinTimeout = setTimeout(() => {
  process.stdout.write('{}');
  process.exit(0);
}, 7000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name || '';
    const toolInput = data.tool_input || {};

    // Include Read and Grep tools for proactive awareness
    if (!['Edit', 'Write', 'Bash', 'MultiEdit', 'Read', 'Grep'].includes(toolName)) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Debounce — don't call every single tool use
    try {
      const last = JSON.parse(fs.readFileSync(DEBOUNCE_FILE, 'utf8'));
      if (Date.now() - last.ts < DEBOUNCE_MS) {
        process.stdout.write('{}');
        process.exit(0);
      }
    } catch { /* no debounce file or expired */ }

    // Extract context clues
    const filePath = toolInput.file_path || toolInput.path || toolInput.command || '';
    const query = toolInput.task || toolInput.query || filePath.split('/').pop() || '';

    if (!query) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Call upgraded 'localnest memory prime' (Graph + Memory)
    const result = spawnSync('localnest', ['memory', 'prime', query, '--json'], {
      encoding: 'utf8',
      timeout: 8000,
      env: { ...process.env, LOCALNEST_MEMORY_ENABLED: 'true' }
    });

    if (result.status !== 0 || !result.stdout) {
      process.stdout.write('{}');
      process.exit(0);
    }

    // Parse and extract memories + graph entities
    let contextStr = '';
    try {
      const parsed = JSON.parse(result.stdout);
      
      // 1. SOP Header (Expert Steering)
      contextStr = `\n[LOCALNEST EXPERT STEERING]\nSOP: ALWAYS call localnest_agent_prime for new tasks.\n`;

      // 2. Memories
      const memories = (parsed.memories || []).slice(0, 3);
      if (memories.length > 0) {
        contextStr += `\nPAST KNOWLEDGE:\n${memories.map(m => `- ${m.title}: ${m.summary || ''}`).join('\n')}\n`;
      }

      // 3. Graph Entities (The "Mental Model")
      const entities = (parsed.entities || []).slice(0, 3);
      if (entities.length > 0) {
        contextStr += `\nKEY CONCEPTS:\n${entities.map(e => `- ${e.name} (${e.type})`).join('\n')}\n`;
      }

      // 4. Suggested Actions
      const actions = (parsed.suggested_actions || []).slice(0, 2);
      if (actions.length > 0) {
        contextStr += `\nSUGGESTED ACTIONS:\n${actions.map(a => `-> ${a}`).join('\n')}\n`;
      }
    } catch { /* parsing failed */ }

    // Save debounce timestamp
    try { fs.writeFileSync(DEBOUNCE_FILE, JSON.stringify({ ts: Date.now() })); } catch { /* ignore */ }

    if (!contextStr.trim()) {
      process.stdout.write('{}');
      process.exit(0);
    }

    process.stdout.write(JSON.stringify({ additionalContext: contextStr }));
  } catch {
    process.stdout.write('{}');
    process.exit(0);
  }
});

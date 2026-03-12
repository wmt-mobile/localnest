#!/usr/bin/env node

import process from 'node:process';
import { SERVER_NAME, SERVER_VERSION } from '../../src/runtime/version.js';

export function hasHelpFlag(argv = process.argv.slice(2)) {
  return argv.includes('--help') || argv.includes('-h');
}

export function printTaskContextHelp() {
  process.stdout.write('LocalNest task-context helper\n\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  localnest task-context --task "investigate issue" --project-path "/abs/project"\n');
  process.stdout.write('  localnest task-context --query "search terms" --root-path "/abs/root"\n');
  process.stdout.write('  localnest task-context --json \'{"task":"investigate issue"}\'\n');
  process.stdout.write('\nCompatibility alias (deprecated):\n');
  process.stdout.write('  localnest-mcp-task-context\n');
  process.stdout.write('Options:\n');
  process.stdout.write('  --task=<text>            task description\n');
  process.stdout.write('  --query=<text>           recall query\n');
  process.stdout.write('  --project-path=<path>    project scope\n');
  process.stdout.write('  --root-path=<path>       root scope\n');
  process.stdout.write('  --branch-name=<name>     optional branch scope\n');
  process.stdout.write('  --topic=<text>           optional topic scope\n');
  process.stdout.write('  --feature=<text>         optional feature scope\n');
  process.stdout.write('  --kind=<text>            optional memory kind filter\n');
  process.stdout.write('  --limit=<n>              result limit\n');
  process.stdout.write('  --json=<json>            JSON input payload\n');
}

export function printCaptureOutcomeHelp() {
  process.stdout.write('LocalNest capture-outcome helper\n\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  localnest capture-outcome --task "fix issue" --status completed --summary "what changed"\n');
  process.stdout.write('  localnest capture-outcome --json \'{"task":"fix issue","summary":"what changed"}\'\n');
  process.stdout.write('\nCompatibility alias (deprecated):\n');
  process.stdout.write('  localnest-mcp-capture-outcome\n');
  process.stdout.write('Options:\n');
  process.stdout.write('  --task=<text>             task title\n');
  process.stdout.write('  --title=<text>            explicit event title\n');
  process.stdout.write('  --summary=<text>          short summary\n');
  process.stdout.write('  --details=<text>          longer detail text\n');
  process.stdout.write('  --content=<text>          explicit content body\n');
  process.stdout.write('  --status=<text>           task status\n');
  process.stdout.write('  --event-type=<text>       event type override\n');
  process.stdout.write('  --project-path=<path>     project scope\n');
  process.stdout.write('  --root-path=<path>        root scope\n');
  process.stdout.write('  --branch-name=<name>      optional branch scope\n');
  process.stdout.write('  --topic=<text>            optional topic scope\n');
  process.stdout.write('  --feature=<text>          optional feature scope\n');
  process.stdout.write('  --tags=<a,b,c>            tags list\n');
  process.stdout.write('  --files-changed=<n>       files changed count\n');
  process.stdout.write('  --has-tests=<true|false>  whether tests were added/run\n');
  process.stdout.write('  --json=<json>             JSON input payload\n');
}

export function parseArg(argv, name) {
  const direct = `--${name}`;
  const prefixed = `${direct}=`;
  const index = argv.indexOf(direct);
  if (index !== -1) {
    return argv[index + 1] || '';
  }
  const item = argv.find((arg) => arg.startsWith(prefixed));
  return item ? item.slice(prefixed.length) : '';
}

export function parseBooleanArg(argv, name, fallback = false) {
  const value = parseArg(argv, name);
  if (!value) return fallback;
  return String(value).toLowerCase() === 'true';
}

export function parseNumberArg(argv, name, fallback = undefined) {
  const value = parseArg(argv, name);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseCsvArg(argv, name) {
  const value = parseArg(argv, name);
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export async function readJsonInput(argv) {
  const argJson = parseArg(argv, 'json');
  if (argJson) return JSON.parse(argJson);
  if (process.stdin.isTTY) return {};

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function buildRuntimeSummary(runtime) {
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    mode: runtime.mcpMode,
    roots: runtime.roots,
    has_ripgrep: runtime.hasRipgrep,
    memory: {
      enabled: runtime.memoryEnabled,
      auto_capture: runtime.memoryAutoCapture,
      consent_done: runtime.memoryConsentDone
    },
    vector_index: {
      backend: runtime.indexBackend,
      requested_backend: runtime.indexBackend
    }
  };
}

export async function createMemoryWorkflow() {
  const { buildRuntimeConfig, installRuntimeWarningFilter } = await import('../../src/runtime/index.js');
  const { MemoryService, MemoryWorkflowService } = await import('../../src/services/memory/index.js');
  installRuntimeWarningFilter();
  const runtime = buildRuntimeConfig(process.env);
  const memory = new MemoryService({
    localnestHome: runtime.localnestHome,
    enabled: runtime.memoryEnabled,
    backend: runtime.memoryBackend,
    dbPath: runtime.memoryDbPath,
    autoCapture: runtime.memoryAutoCapture,
    consentDone: runtime.memoryConsentDone
  });
  const workflow = new MemoryWorkflowService({
    memory,
    getRuntimeSummary: async () => buildRuntimeSummary(runtime)
  });
  return { runtime, workflow };
}

export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

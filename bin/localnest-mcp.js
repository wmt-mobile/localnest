#!/usr/bin/env node
import { SERVER_VERSION } from '../src/runtime/config.js';

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  process.stdout.write(`${SERVER_VERSION}\n`);
  process.exit(0);
}

await import('../src/app/mcp-server.js');

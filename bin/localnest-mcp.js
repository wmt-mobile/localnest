#!/usr/bin/env node
import { SERVER_VERSION } from '../src/runtime/config.js';
import { hasVersionFlag, importRelative } from './_shared.js';

if (hasVersionFlag(process.argv)) {
  process.stdout.write(`${SERVER_VERSION}\n`);
  process.exit(0);
}

await importRelative('../src/app/mcp-server.js', import.meta.url);

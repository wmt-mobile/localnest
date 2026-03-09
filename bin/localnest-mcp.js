#!/usr/bin/env node
import { SERVER_VERSION } from '../src/runtime/index.js';
import { hasVersionFlag, importRelative } from './_shared.js';

if (hasVersionFlag(process.argv)) {
  process.stdout.write(`${SERVER_VERSION}\n`);
  process.exit(0);
}

const { startMcpServer } = await importRelative('../src/app/index.js', import.meta.url);
await startMcpServer();

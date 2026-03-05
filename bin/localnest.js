#!/usr/bin/env node

import { SERVER_VERSION } from '../src/config.js';

const args = process.argv.slice(2);
const command = args[0] || '';
const rest = args.slice(1);

function printHelp() {
  process.stdout.write('LocalNest CLI\n\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  localnest <command> [options]\n\n');
  process.stdout.write('Commands:\n');
  process.stdout.write('  start                     start MCP server (stdio)\n');
  process.stdout.write('  setup                     run setup wizard\n');
  process.stdout.write('  doctor                    run diagnostics\n');
  process.stdout.write('  upgrade                   upgrade package and migrate setup\n');
  process.stdout.write('  sync                      encrypted Google Drive sync (init/push/pull/status)\n');
  process.stdout.write('  version                   print version\n');
  process.stdout.write('  help                      show this help\n');
}

function forwardTo(modulePath) {
  process.argv = [process.argv[0], process.argv[1], ...rest];
  return import(modulePath);
}

if (command === '' || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'version' || command === '--version' || command === '-v') {
  process.stdout.write(`${SERVER_VERSION}\n`);
  process.exit(0);
}

if (command === 'start' || command === 'serve') {
  await import('../src/localnest-mcp.js');
  process.exit(0);
}

if (command === 'setup') {
  await forwardTo('../scripts/setup-localnest.mjs');
  process.exit(0);
}

if (command === 'doctor') {
  await forwardTo('../scripts/doctor-localnest.mjs');
  process.exit(0);
}

if (command === 'upgrade') {
  await forwardTo('../scripts/upgrade-localnest.mjs');
  process.exit(0);
}

if (command === 'sync') {
  await forwardTo('../scripts/sync-localnest.mjs');
  process.exit(0);
}

process.stderr.write(`Unknown command: ${command}\n\n`);
printHelp();
process.exit(1);

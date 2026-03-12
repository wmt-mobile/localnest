#!/usr/bin/env node

import { SERVER_VERSION } from '../src/runtime/version.js';
import { buildForwardArgv, hasVersionFlag, importRelative } from './_shared.js';

const args = process.argv.slice(2);
const command = args[0] || '';
const rest = args.slice(1);
const COMMAND_MODULES = new Map([
  ['setup', '../scripts/runtime/setup-localnest.mjs'],
  ['doctor', '../scripts/runtime/doctor-localnest.mjs'],
  ['upgrade', '../scripts/runtime/upgrade-localnest.mjs'],
  ['task-context', '../scripts/memory/task-context-localnest.mjs'],
  ['capture-outcome', '../scripts/memory/capture-outcome-localnest.mjs']
]);

function printHelp() {
  process.stdout.write('LocalNest CLI\n\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  localnest <command> [options]\n\n');
  process.stdout.write('Commands:\n');
  process.stdout.write('  start                     start MCP server (stdio)\n');
  process.stdout.write('  install skills            install or update bundled LocalNest skills\n');
  process.stdout.write('  setup                     run setup wizard\n');
  process.stdout.write('  doctor                    run diagnostics\n');
  process.stdout.write('  upgrade                   upgrade package and migrate setup\n');
  process.stdout.write('  task-context              print runtime + recalled local memory context\n');
  process.stdout.write('  capture-outcome           persist a task outcome into local memory\n');
  process.stdout.write('  version                   print version\n');
  process.stdout.write('  help                      show this help\n');
}

function printStartHelp() {
  process.stdout.write('LocalNest MCP server\n\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  localnest start\n');
  process.stdout.write('  localnest serve\n');
  process.stdout.write('Options:\n');
  process.stdout.write('  --help,-h   show this help\n');
}

function forwardTo(modulePath) {
  process.argv = buildForwardArgv(rest, process.argv);
  return importRelative(modulePath, import.meta.url);
}

async function main() {
  if (command === '' || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command === 'version' || hasVersionFlag([command])) {
    process.stdout.write(`${SERVER_VERSION}\n`);
    process.exit(0);
  }

  if (command === 'start' || command === 'serve') {
    if (rest.includes('--help') || rest.includes('-h')) {
      printStartHelp();
      return;
    }
    const { startMcpServer } = await importRelative('../src/app/index.js', import.meta.url);
    await startMcpServer();
    return;
  }

  if (command === 'install' && rest[0] === 'skills') {
    process.argv = buildForwardArgv(rest.slice(1), process.argv);
    const mod = await importRelative('../scripts/runtime/install-localnest-skill.mjs', import.meta.url);
    await mod.main();
    return;
  }

  const commandModule = COMMAND_MODULES.get(command);
  if (commandModule) {
    await forwardTo(commandModule);
    return;
  }

  process.stderr.write(`Unknown command: ${command}\n\n`);
  printHelp();
  process.exit(1);
}

main().catch((error) => {
  process.stderr.write(`[localnest-cli] fatal: ${error?.message || error}\n`);
  process.exit(1);
});

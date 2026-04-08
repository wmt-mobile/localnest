/**
 * Memory CLI subcommands.
 *
 * Stubs for Phase 11 implementation:
 *   localnest memory add | search | list | show | delete
 *
 * @module src/cli/commands/memory
 */

import { printSubcommandHelp } from '../help.js';

const VERBS = [
  { name: 'add', desc: 'Store a memory entry' },
  { name: 'search', desc: 'Search memories by query' },
  { name: 'list', desc: 'List stored memories' },
  { name: 'show', desc: 'Show a single memory by ID' },
  { name: 'delete', desc: 'Delete a memory by ID' },
];

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('memory', VERBS);
    return;
  }

  const known = VERBS.find((v) => v.name === verb);
  if (!known) {
    process.stderr.write(`Unknown memory command: ${verb}\n`);
    printSubcommandHelp('memory', VERBS);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ error: `memory ${verb} is not yet implemented. Coming in Phase 11.` }) + '\n');
  } else {
    process.stdout.write(`memory ${verb} is not yet implemented. Coming in Phase 11.\n`);
  }
}

/**
 * Knowledge Graph CLI subcommands.
 *
 * Stubs for Phase 12 implementation:
 *   localnest kg add | query | timeline | stats
 *
 * @module src/cli/commands/kg
 */

import { printSubcommandHelp } from '../help.js';

const VERBS = [
  { name: 'add', desc: 'Create a triple (subject predicate object)' },
  { name: 'query', desc: 'Query entity relationships' },
  { name: 'timeline', desc: 'Show entity fact timeline' },
  { name: 'stats', desc: 'Show graph statistics' },
];

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('kg', VERBS);
    return;
  }

  const known = VERBS.find((v) => v.name === verb);
  if (!known) {
    process.stderr.write(`Unknown kg command: ${verb}\n`);
    printSubcommandHelp('kg', VERBS);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ error: `kg ${verb} is not yet implemented. Coming in Phase 12.` }) + '\n');
  } else {
    process.stdout.write(`kg ${verb} is not yet implemented. Coming in Phase 12.\n`);
  }
}

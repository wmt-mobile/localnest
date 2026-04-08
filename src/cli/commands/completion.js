/**
 * Shell completion CLI subcommands.
 *
 * Stubs for Phase 17 implementation:
 *   localnest completion bash | zsh | fish
 *
 * @module src/cli/commands/completion
 */

import { printSubcommandHelp } from '../help.js';

const VERBS = [
  { name: 'bash', desc: 'Output bash completion script' },
  { name: 'zsh', desc: 'Output zsh completion script' },
  { name: 'fish', desc: 'Output fish completion script' },
];

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('completion', VERBS);
    return;
  }

  const known = VERBS.find((v) => v.name === verb);
  if (!known) {
    process.stderr.write(`Unknown completion target: ${verb}\n`);
    printSubcommandHelp('completion', VERBS);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({ error: `completion ${verb} is not yet implemented. Coming in Phase 17.` }) + '\n');
  } else {
    process.stdout.write(`completion ${verb} is not yet implemented. Coming in Phase 17.\n`);
  }
}

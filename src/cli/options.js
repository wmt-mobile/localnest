/**
 * Global CLI option parser.
 *
 * Extracts --json, --verbose, --quiet, --config <path> from argv
 * and returns both the parsed flags and the remaining arguments.
 *
 * @module src/cli/options
 */

/**
 * @typedef {object} GlobalOptions
 * @property {boolean} json    - Output in JSON format
 * @property {boolean} verbose - Increase output detail
 * @property {boolean} quiet   - Suppress non-essential output
 * @property {string|null} config - Custom config file path
 * @property {string[]} args   - Remaining argv after stripping globals
 */

/**
 * Parse global flags from an argv-style array (without node/bin prefix).
 *
 * Supports:
 *   --json        JSON output
 *   --verbose     Verbose output
 *   --quiet       Suppress output
 *   --config <p>  Custom config path (next positional consumed)
 *
 * Flags are removed from the returned `args` so downstream commands
 * receive a clean argument list.
 *
 * @param {string[]} argv - Arguments (typically process.argv.slice(2))
 * @returns {GlobalOptions}
 */
export function parseGlobalOptions(argv) {
  const opts = { json: false, verbose: false, quiet: false, config: null };
  const remaining = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--verbose') {
      opts.verbose = true;
    } else if (arg === '--quiet') {
      opts.quiet = true;
    } else if (arg === '--config') {
      i++;
      opts.config = argv[i] ?? null;
    } else if (arg.startsWith('--config=')) {
      opts.config = arg.slice('--config='.length) || null;
    } else {
      remaining.push(arg);
    }
  }

  opts.args = remaining;
  return opts;
}

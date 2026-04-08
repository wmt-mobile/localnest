/**
 * Subcommand router for LocalNest CLI.
 *
 * Routes noun-verb pairs to handler modules and falls back to the
 * legacy flat-command map for backward compatibility.
 *
 * @module src/cli/router
 */

import { buildForwardArgv, importRelative } from '../../bin/_shared.js';

/* ------------------------------------------------------------------ */
/*  Noun -> handler module map                                         */
/* ------------------------------------------------------------------ */

/** @type {Map<string, string>} noun -> module path (relative to bin/) */
const NOUN_MODULES = new Map([
  ['memory', '../src/cli/commands/memory.js'],
  ['kg', '../src/cli/commands/kg.js'],
  ['skill', '../src/cli/commands/skill.js'],
  ['mcp', '../src/cli/commands/mcp.js'],
  ['ingest', '../src/cli/commands/ingest.js'],
  ['completion', '../src/cli/commands/completion.js'],
  ['hooks', '../src/cli/commands/hooks.js'],
]);

/** @type {Map<string, string>} flat command -> script path (relative to bin/) */
const LEGACY_MODULES = new Map([
  ['setup', '../scripts/runtime/setup-localnest.mjs'],
  ['doctor', '../scripts/runtime/doctor-localnest.mjs'],
  ['upgrade', '../scripts/runtime/upgrade-localnest.mjs'],
  ['task-context', '../scripts/memory/task-context-localnest.mjs'],
  ['capture-outcome', '../scripts/memory/capture-outcome-localnest.mjs'],
]);

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Route a command to the appropriate handler.
 *
 * @param {string} command     - Primary command or noun (e.g. 'memory', 'setup')
 * @param {string[]} rest      - Remaining arguments after the command
 * @param {import('./options.js').GlobalOptions} globalOpts - Parsed global flags
 * @param {string} binMetaUrl  - import.meta.url of the calling bin script
 * @returns {Promise<boolean>} true if routed, false if unknown
 */
export async function routeCommand(command, rest, globalOpts, binMetaUrl) {
  // 1. Noun-verb subcommands
  const nounModule = NOUN_MODULES.get(command);
  if (nounModule) {
    const mod = await importRelative(nounModule, binMetaUrl);
    await mod.run(rest, globalOpts);
    return true;
  }

  // 2. Legacy flat commands
  const legacyModule = LEGACY_MODULES.get(command);
  if (legacyModule) {
    process.argv = buildForwardArgv(rest, process.argv);
    await importRelative(legacyModule, binMetaUrl);
    return true;
  }

  return false;
}

/**
 * Check if a command name is a known noun (has subcommands).
 *
 * @param {string} name
 * @returns {boolean}
 */
export function isNounCommand(name) {
  return NOUN_MODULES.has(name);
}

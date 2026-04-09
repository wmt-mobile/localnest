/**
 * Consistent output helpers for LocalNest CLI commands.
 *
 * Provides writeJson, writeError, writeSuccess, and writeStatus for
 * uniform machine-readable and human-friendly output.
 *
 * @module src/cli/output
 */

import { green, red, bold, dim } from './ansi.js';

/**
 * Write JSON data to stdout with pretty-print.
 * @param {unknown} data
 */
export function writeJson(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

/**
 * Write an error message to stderr.
 * @param {string} msg
 */
export function writeError(msg) {
  process.stderr.write(`${red('Error:')} ${msg}\n`);
}

/**
 * Write a success message to stdout.
 * @param {string} msg
 */
export function writeSuccess(msg) {
  process.stdout.write(`${green('\u2713')} ${msg}\n`);
}

/**
 * Write a status line (label + pass/fail indicator).
 * @param {string} label
 * @param {boolean} ok
 */
export function writeStatus(label, ok) {
  const icon = ok ? green('\u2713') : red('\u2717');
  const status = ok ? green('OK') : red('FAIL');
  process.stdout.write(`  ${icon} ${bold(label)}  ${dim(status)}\n`);
}

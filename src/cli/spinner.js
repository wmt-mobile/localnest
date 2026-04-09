/**
 * Thin ora spinner wrapper for LocalNest CLI.
 *
 * Auto-disables in non-TTY environments and when NO_COLOR is set.
 * Returns an ora instance with .succeed(), .fail(), .stop() etc.
 *
 * @module src/cli/spinner
 */

import ora from 'ora';
import { useColor } from './ansi.js';

/**
 * Start an ora spinner with the given text.
 * Automatically disables when stdout is not a TTY or NO_COLOR is set.
 *
 * @param {string} text - Spinner label text
 * @returns {import('ora').Ora} ora instance
 */
export function startSpinner(text) {
  const isTTY = process.stdout.isTTY === true;
  const colorEnabled = useColor();

  return ora({
    text,
    color: 'cyan',
    isEnabled: isTTY && colorEnabled,
    stream: process.stdout,
  }).start();
}

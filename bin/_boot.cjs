#!/usr/bin/env node

/**
 * Universal boot loader for LocalNest CLI.
 *
 * Resolves tsx/esm from the package's own node_modules (not CWD),
 * then launches the matching ESM bin script with --import tsx/esm.
 *
 * Fixes ERR_MODULE_NOT_FOUND when users run `localnest setup` from a
 * project that doesn't have tsx installed (npm global install).
 *
 * Determines which script to run from:
 *   1. Explicit arg: node _boot.cjs localnest.js setup
 *   2. Symlink name: if symlinked as "localnest" → runs localnest.js
 */

'use strict';

const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const { resolve, basename } = require('node:path');

const pkgDir = resolve(__dirname, '..');
const req = createRequire(resolve(pkgDir, 'package.json'));

let tsxEsmPath;
try {
  tsxEsmPath = pathToFileURL(req.resolve('tsx/esm')).href;
} catch {
  process.stderr.write('[localnest] fatal: tsx not found. Reinstall: npm install -g localnest-mcp\n');
  process.exit(1);
}

// Determine target script
let target;
let forwardArgs;

const invoked = basename(process.argv[1], '.cjs');

if (invoked === '_boot') {
  // Called directly: node _boot.cjs <script> [args...]
  target = process.argv[2];
  forwardArgs = process.argv.slice(3);
  if (!target) {
    process.stderr.write('Usage: _boot.cjs <script.js> [args...]\n');
    process.exit(1);
  }
} else {
  // Called via symlink: the symlink name matches the target script
  target = invoked + '.js';
  forwardArgs = process.argv.slice(2);
}

const scriptPath = resolve(__dirname, target);

const result = spawnSync(
  process.execPath,
  ['--import', tsxEsmPath, scriptPath, ...forwardArgs],
  { stdio: 'inherit', env: process.env }
);

process.exit(result.status ?? 1);

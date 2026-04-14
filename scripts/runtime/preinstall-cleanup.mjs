#!/usr/bin/env node

/**
 * Preinstall cleanup — removes blockers that cause errors during global install:
 *   1. Stale npm temp dirs (.localnest-mcp-<hash>) → ENOTEMPTY on retry
 *   2. Symlinked package entry (from `npm link`) → ENOTDIR because npm tries to
 *      rename the entry to a temp dir and a symlink is not a directory
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const PKG_NAME = 'localnest-mcp';

function getGlobalNodeModulesDir() {
  try {
    const prefix = execSync('npm root -g', { encoding: 'utf8' }).trim();
    if (fs.existsSync(prefix)) return prefix;
  } catch { /* ignore */ }

  // Fallback: derive from process.execPath
  const segments = process.execPath.split(path.sep);
  const nvmIdx = segments.findIndex((s) => s === 'nvm');
  if (nvmIdx !== -1 && segments.length > nvmIdx + 3) {
    const candidate = path.join('/', ...segments.slice(0, nvmIdx + 3), 'lib', 'node_modules');
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function cleanupStaleTempDirs(nodeModulesDir) {
  if (!fs.existsSync(nodeModulesDir)) return 0;

  const entries = fs.readdirSync(nodeModulesDir);
  const stalePrefix = `.${PKG_NAME}-`;
  let removed = 0;

  for (const entry of entries) {
    if (entry.startsWith(stalePrefix)) {
      const fullPath = path.join(nodeModulesDir, entry);
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        removed++;
      } catch {
        // Best-effort — don't block install if cleanup fails
      }
    }
  }

  return removed;
}

function removeSymlinkedPackage(nodeModulesDir) {
  const pkgPath = path.join(nodeModulesDir, PKG_NAME);
  let stat;
  try {
    stat = fs.lstatSync(pkgPath);
  } catch {
    return; // doesn't exist — nothing to do
  }
  if (stat.isSymbolicLink()) {
    try {
      fs.unlinkSync(pkgPath);
    } catch {
      // Best-effort — don't block install if unlink fails
    }
  }
}

// Only run for global installs (npm install -g), NOT during git-dep preparation.
// npm_config_global leaks from the outer npm into the inner prep npm, so also check
// whether we're running inside a temp git-clone dir (pacote's staging area).
const isGlobal = process.env.npm_config_global === 'true';
if (!isGlobal) process.exit(0);

const selfDir = new URL('.', import.meta.url).pathname;
const isGitDepPrep = selfDir.includes('/.npm/_cacache/tmp/');
if (isGitDepPrep) process.exit(0);

const nodeModulesDir = getGlobalNodeModulesDir();
if (!nodeModulesDir) process.exit(0);

removeSymlinkedPackage(nodeModulesDir);
cleanupStaleTempDirs(nodeModulesDir);
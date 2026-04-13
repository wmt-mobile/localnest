#!/usr/bin/env node

/**
 * Preinstall cleanup — removes stale npm temp directories that cause ENOTEMPTY errors
 * during global install. npm renames old packages to .<name>-<hash> before replacing,
 * and if a previous install failed, those temp dirs persist and block the rename.
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

// Only run for global installs (npm install -g)
const isGlobal = process.env.npm_config_global === 'true';
if (!isGlobal) process.exit(0);

const nodeModulesDir = getGlobalNodeModulesDir();
if (!nodeModulesDir) process.exit(0);

cleanupStaleTempDirs(nodeModulesDir);
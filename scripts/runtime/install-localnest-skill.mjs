#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SKILL_METADATA_FILE = '.localnest-skill.json';

function hasFlag(flag) {
  return argv.includes(flag) || argv.includes(`--${flag}`);
}

function readOption(name) {
  const prefixed = `--${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefixed));
  if (inline) return inline.slice(prefixed.length);

  const index = argv.findIndex((arg) => arg === `--${name}`);
  if (index >= 0 && index + 1 < argv.length) {
    return argv[index + 1];
  }
  return '';
}

function envTrue(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function copyDir(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function readBundledPackageVersion(metaUrl = import.meta.url) {
  try {
    const scriptDir = path.dirname(fileURLToPath(metaUrl));
    const packageRoot = path.resolve(scriptDir, '..', '..');
    const raw = fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return typeof parsed?.version === 'string' ? parsed.version : '';
  } catch {
    return '';
  }
}

export function resolveBundledSkillDir(metaUrl = import.meta.url) {
  const scriptDir = path.dirname(fileURLToPath(metaUrl));
  const packageRoot = path.resolve(scriptDir, '..', '..');
  return path.join(packageRoot, 'skills', 'localnest-mcp');
}

export function getKnownToolSkillDirs(homeDir = os.homedir()) {
  return [
    path.join(homeDir, '.codex', 'skills'),      // Codex
    path.join(homeDir, '.claude', 'skills'),     // Claude Code
    path.join(homeDir, '.cline', 'skills'),      // Cline
    path.join(homeDir, '.continue', 'skills')    // Continue
  ];
}

function readSkillMetadata(skillDir) {
  try {
    const raw = fs.readFileSync(path.join(skillDir, SKILL_METADATA_FILE), 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const bundledVersion = readBundledPackageVersion();
    return {
      name: typeof parsed.name === 'string' ? parsed.name : 'localnest-mcp',
      version: bundledVersion || (typeof parsed.version === 'string' ? parsed.version : '')
    };
  } catch {
    return null;
  }
}

function compareVersions(a, b) {
  const partsA = String(a || '').replace(/^v/i, '').split(/[-.]/);
  const partsB = String(b || '').replace(/^v/i, '').split(/[-.]/);
  const max = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < max; i += 1) {
    const rawA = partsA[i];
    const rawB = partsB[i];
    if (rawA === undefined) return -1;
    if (rawB === undefined) return 1;
    const numA = Number.parseInt(rawA, 10);
    const numB = Number.parseInt(rawB, 10);
    const bothNumeric = Number.isFinite(numA) && Number.isFinite(numB);
    if (bothNumeric) {
      if (numA > numB) return 1;
      if (numA < numB) return -1;
      continue;
    }
    const aText = String(rawA);
    const bText = String(rawB);
    if (aText > bText) return 1;
    if (aText < bText) return -1;
  }
  return 0;
}

function determineSyncState(sourceSkillDir, targetSkillDir) {
  const sourceMeta = readSkillMetadata(sourceSkillDir);
  const targetMeta = readSkillMetadata(targetSkillDir);
  const exists = fs.existsSync(targetSkillDir);

  if (!exists) {
    return { exists: false, action: 'install', sourceMeta, targetMeta };
  }

  if (!sourceMeta || !targetMeta || !targetMeta.version) {
    return { exists: true, action: 'sync', sourceMeta, targetMeta };
  }

  const cmp = compareVersions(sourceMeta.version, targetMeta.version);
  if (cmp > 0) {
    return { exists: true, action: 'upgrade', sourceMeta, targetMeta };
  }
  if (cmp === 0) {
    return { exists: true, action: 'noop', sourceMeta, targetMeta };
  }
  return { exists: true, action: 'sync', sourceMeta, targetMeta };
}

export function resolveInstallTarget({
  homeDir = os.homedir(),
  cwd = process.cwd(),
  dest = '',
  project = false
} = {}) {
  if (dest) {
    return path.resolve(dest);
  }

  if (project) {
    return path.resolve(path.join(cwd, '.claude', 'skills', 'localnest-mcp'));
  }

  const agentsHome = path.resolve(process.env.LOCALNEST_AGENTS_HOME || path.join(homeDir, '.agents'));
  const targetSkillsDir = path.resolve(process.env.LOCALNEST_SKILLS_DIR || path.join(agentsHome, 'skills'));
  return path.join(targetSkillsDir, 'localnest-mcp');
}

export function main() {
  const auto = hasFlag('--auto');
  const force = hasFlag('--force');
  const quiet = hasFlag('--quiet') || auto;
  const project = hasFlag('project');
  const dest = readOption('dest');

  if (hasFlag('help') || hasFlag('h')) {
    process.stdout.write('LocalNest bundled skill installer\n\n');
    process.stdout.write('Usage:\n');
    process.stdout.write('  localnest-mcp-install-skill\n');
    process.stdout.write('  localnest-mcp-install-skill --force\n');
    process.stdout.write('  localnest-mcp-install-skill --project\n');
    process.stdout.write('  localnest-mcp-install-skill --dest /path/to/skills/localnest-mcp\n');
    process.stdout.write('\nOptions:\n');
    process.stdout.write('  --force       reinstall even when already current\n');
    process.stdout.write('  --project     install into ./.claude/skills/localnest-mcp\n');
    process.stdout.write('  --dest PATH   install into an explicit skill directory\n');
    process.stdout.write('  --quiet       suppress non-error output\n');
    process.stdout.write('  --help, -h    show this help\n');
    return;
  }

  if (auto && envTrue('LOCALNEST_SKIP_SKILL_INSTALL', false)) {
    if (!quiet) console.log('[localnest-skill] skipped by LOCALNEST_SKIP_SKILL_INSTALL=true');
    return;
  }

  if (auto && envTrue('CI', false)) {
    if (!quiet) console.log('[localnest-skill] skipped in CI environment');
    return;
  }

  const sourceSkillDir = resolveBundledSkillDir();

  if (!fs.existsSync(sourceSkillDir)) {
    if (!quiet) console.error(`[localnest-skill] source not found: ${sourceSkillDir}`);
    process.exitCode = 1;
    return;
  }

  const targetSkillDir = resolveInstallTarget({
    homeDir: os.homedir(),
    cwd: process.cwd(),
    dest,
    project
  });

  const state = determineSyncState(sourceSkillDir, targetSkillDir);
  if (state.action === 'noop' && !force) {
    if (!project && !dest) syncKnownToolLocations(sourceSkillDir, quiet, force);
    if (!quiet) {
      console.log('[localnest-skill] already up to date');
      console.log(`[localnest-skill] version: ${state.sourceMeta?.version || 'unknown'}`);
      console.log(`[localnest-skill] target: ${targetSkillDir}`);
    }
    return;
  }

  if (state.exists) {
    fs.rmSync(targetSkillDir, { recursive: true, force: true });
  }

  copyDir(sourceSkillDir, targetSkillDir);
  if (!project && !dest) syncKnownToolLocations(sourceSkillDir, quiet, force);

  if (!quiet) {
    const verb = force
      ? 'synced'
      : state.action === 'upgrade'
        ? 'updated'
        : state.exists
          ? 'synced'
          : 'installed';
    console.log(`[localnest-skill] ${verb} successfully`);
    console.log(`[localnest-skill] source: ${sourceSkillDir}`);
    console.log(`[localnest-skill] target: ${targetSkillDir}`);
    if (state.sourceMeta?.version) {
      console.log(`[localnest-skill] version: ${state.sourceMeta.version}`);
    }
    if (project) {
      console.log('[localnest-skill] installed as a project-local Claude skill');
    } else if (dest) {
      console.log('[localnest-skill] installed to explicit destination');
    }
    console.log('[localnest-skill] restart your AI tool to load the updated skill');
  }
}

// Known AI tool skill locations — extend as new tools adopt the skills spec.
const KNOWN_TOOL_SKILL_DIRS = getKnownToolSkillDirs();

function syncKnownToolLocations(sourceSkillDir, quiet, force) {
  for (const toolSkillsDir of KNOWN_TOOL_SKILL_DIRS) {
    const dest = path.join(toolSkillsDir, 'localnest-mcp');
    try {
      const state = determineSyncState(sourceSkillDir, dest);
      if (state.action === 'noop' && !force) {
        if (!quiet) console.log(`[localnest-skill] already current → ${dest}`);
        continue;
      }
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      // Only create if the parent tool directory already exists (tool is installed).
      if (!fs.existsSync(toolSkillsDir)) {
        if (!force) continue;
        fs.mkdirSync(toolSkillsDir, { recursive: true });
      }
      copyDir(sourceSkillDir, dest);
      if (!quiet) console.log(`[localnest-skill] synced → ${dest}`);
    } catch (err) {
      if (!quiet) console.warn(`[localnest-skill] skipped ${dest}: ${err.message}`);
    }
  }
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  main();
}

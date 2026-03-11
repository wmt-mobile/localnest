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

export function listBundledSkillDirs(metaUrl = import.meta.url) {
  const scriptDir = path.dirname(fileURLToPath(metaUrl));
  const packageRoot = path.resolve(scriptDir, '..', '..');
  const skillsRoot = path.join(packageRoot, 'skills');
  try {
    return fs.readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(skillsRoot, entry.name))
      .filter((skillDir) => fs.existsSync(path.join(skillDir, 'SKILL.md')) && fs.existsSync(path.join(skillDir, SKILL_METADATA_FILE)))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export function getKnownToolSkillDirs(homeDir = os.homedir()) {
  return [
    path.join(homeDir, '.codex', 'skills'),      // Codex
    path.join(homeDir, '.copilot', 'skills'),    // GitHub Copilot / VS Code agent skills
    path.join(homeDir, '.claude', 'skills'),     // Claude Code
    path.join(homeDir, '.cline', 'skills'),      // Cline
    path.join(homeDir, '.continue', 'skills')    // Continue
  ];
}

export function getKnownProjectSkillDirs(cwd = process.cwd()) {
  return [
    path.join(cwd, '.github', 'skills'),
    path.join(cwd, '.claude', 'skills')
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
  project = false,
  skillName = 'localnest-mcp'
} = {}) {
  if (dest) {
    return path.resolve(dest);
  }

  if (project) {
    return path.resolve(path.join(cwd, '.claude', 'skills', skillName));
  }

  const agentsHome = path.resolve(process.env.LOCALNEST_AGENTS_HOME || path.join(homeDir, '.agents'));
  const targetSkillsDir = path.resolve(process.env.LOCALNEST_SKILLS_DIR || path.join(agentsHome, 'skills'));
  return path.join(targetSkillsDir, skillName);
}

function installOrUpdateSkill(sourceSkillDir, targetSkillDir, { quiet, force } = {}) {
  const state = determineSyncState(sourceSkillDir, targetSkillDir);
  if (state.action === 'noop' && !force) {
    return {
      changed: false,
      state,
      targetSkillDir
    };
  }

  if (state.exists) {
    fs.rmSync(targetSkillDir, { recursive: true, force: true });
  }
  copyDir(sourceSkillDir, targetSkillDir);
  if (!quiet) {
    const verb = force
      ? 'synced'
      : state.action === 'upgrade'
        ? 'updated'
        : state.exists
          ? 'synced'
          : 'installed';
    console.log(`[localnest-skill] ${verb} → ${targetSkillDir}`);
  }
  return {
    changed: true,
    state,
    targetSkillDir
  };
}

function syncSkillToDirs(sourceSkillDir, targetDirs, { quiet, force, createMissingParents = false } = {}) {
  const skillName = readSkillMetadata(sourceSkillDir)?.name || path.basename(sourceSkillDir);
  for (const skillsDir of targetDirs) {
    const dest = path.join(skillsDir, skillName);
    try {
      if (!fs.existsSync(skillsDir)) {
        if (!createMissingParents) continue;
        fs.mkdirSync(skillsDir, { recursive: true });
      }
      const result = installOrUpdateSkill(sourceSkillDir, dest, { quiet, force });
      if (!quiet && !result.changed) console.log(`[localnest-skill] already current → ${dest}`);
    } catch (err) {
      if (!quiet) console.warn(`[localnest-skill] skipped ${dest}: ${err.message}`);
    }
  }
}

export function main() {
  const auto = hasFlag('--auto');
  const force = hasFlag('--force');
  const quiet = hasFlag('--quiet') || auto;
  const project = hasFlag('project');
  const userOnly = hasFlag('user');
  const dest = readOption('dest');

  if (hasFlag('help') || hasFlag('h')) {
    process.stdout.write('LocalNest bundled skill installer\n\n');
    process.stdout.write('Usage:\n');
    process.stdout.write('  localnest install skills\n');
    process.stdout.write('  localnest install skills --force\n');
    process.stdout.write('  localnest-mcp-install-skill\n');
    process.stdout.write('  localnest-mcp-install-skill --force\n');
    process.stdout.write('  localnest-mcp-install-skill --project\n');
    process.stdout.write('  localnest-mcp-install-skill --user\n');
    process.stdout.write('  localnest-mcp-install-skill --dest /path/to/skills/localnest-mcp\n');
    process.stdout.write('\nOptions:\n');
    process.stdout.write('  --force       reinstall even when already current\n');
    process.stdout.write('  --project     sync bundled skills into project skill dirs (.github/skills and .claude/skills)\n');
    process.stdout.write('  --user        sync bundled skills into detected user skill dirs only\n');
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

  const sourceSkillDirs = listBundledSkillDirs();
  if (sourceSkillDirs.length === 0) {
    if (!quiet) console.error('[localnest-skill] no bundled skills found');
    process.exitCode = 1;
    return;
  }

  if (dest && sourceSkillDirs.length > 1) {
    if (!quiet) console.error('[localnest-skill] --dest only supports single-skill installs; use --tooling sync targets for bundled installs');
    process.exitCode = 1;
    return;
  }

  const userTargets = getKnownToolSkillDirs(os.homedir());
  const projectTargets = getKnownProjectSkillDirs(process.cwd());

  for (const sourceSkillDir of sourceSkillDirs) {
    const skillName = readSkillMetadata(sourceSkillDir)?.name || path.basename(sourceSkillDir);

    if (dest) {
      installOrUpdateSkill(sourceSkillDir, resolveInstallTarget({
        homeDir: os.homedir(),
        cwd: process.cwd(),
        dest,
        project: false,
        skillName
      }), { quiet, force });
      continue;
    }

    const primaryTarget = resolveInstallTarget({
      homeDir: os.homedir(),
      cwd: process.cwd(),
      project: false,
      skillName
    });
    const primaryResult = installOrUpdateSkill(sourceSkillDir, primaryTarget, { quiet, force });
    if (!quiet && !primaryResult.changed) {
      console.log(`[localnest-skill] already up to date → ${primaryTarget}`);
    }

    syncSkillToDirs(sourceSkillDir, userTargets, { quiet, force, createMissingParents: false });
    if (project || !userOnly) {
      syncSkillToDirs(sourceSkillDir, projectTargets, { quiet, force, createMissingParents: project });
    }
  }

  if (!quiet) {
    console.log('[localnest-skill] restart your AI tool to load the updated skill');
  }
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  main();
}

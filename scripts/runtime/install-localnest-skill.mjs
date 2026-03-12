#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SKILL_METADATA_FILE = '.localnest-skill.json';
const SKILL_TOOL_PREAMBLES = {
  codex: 'Tool target: Codex. Prefer concise action-oriented guidance and Codex-compatible file/task workflows.',
  copilot: 'Tool target: GitHub Copilot / VS Code agent mode. Keep guidance aligned with Agent Skills conventions and repo/project-first workflows.',
  claude: 'Tool target: Claude Code. Keep instructions direct, text-first, and compatible with Claude-style skill discovery.',
  cline: 'Tool target: Cline. Keep steps explicit and avoid assuming hidden project context.',
  continue: 'Tool target: Continue. Prefer short instructions that work well with IDE-driven agent loops.',
  cursor: 'Tool target: Cursor. Keep instructions optimized for editor-first coding workflows and Agent Skills compatibility.',
  windsurf: 'Tool target: Windsurf / Cascade. Prefer concise, task-scoped instructions that fit Windsurf skill usage patterns.',
  opencode: 'Tool target: OpenCode. Keep guidance CLI-friendly and compatible with OpenCode skill discovery.',
  gemini: 'Tool target: Gemini CLI. Keep guidance compact and explicit because Gemini uses extension-oriented local workflows.',
  antigravity: 'Tool target: Antigravity. Keep guidance concise and compatible with Gemini/Antigravity local agent workflows.',
  agents: 'Tool target: generic agents-compatible skill directory. Keep instructions portable and convention-based.',
  github: 'Tool target: project-level GitHub Agent Skills. Keep instructions team-safe and repository-oriented.',
  default: ''
};

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

function shouldDecorateSkillMarkdown(relativePath) {
  return relativePath === 'SKILL.md';
}

function buildToolSpecificSkillMarkdown(rawText, toolFamily) {
  const preamble = SKILL_TOOL_PREAMBLES[toolFamily] || SKILL_TOOL_PREAMBLES.default;
  if (!preamble) return rawText;
  if (rawText.includes(preamble)) return rawText;
  return `${preamble}\n\n${rawText}`;
}

function copyDirWithVariant(source, destination, toolFamily = 'default', relativePath = '') {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      const childSource = path.join(source, entry);
      const childDestination = path.join(destination, entry);
      const childRelative = relativePath ? path.join(relativePath, entry) : entry;
      copyDirWithVariant(childSource, childDestination, toolFamily, childRelative);
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (shouldDecorateSkillMarkdown(relativePath)) {
    const raw = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(destination, buildToolSpecificSkillMarkdown(raw, toolFamily), 'utf8');
    return;
  }
  fs.copyFileSync(source, destination);
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
    path.join(homeDir, '.agents', 'skills'),     // Generic agents-compatible tools
    path.join(homeDir, '.codex', 'skills'),      // Codex
    path.join(homeDir, '.copilot', 'skills'),    // GitHub Copilot / VS Code agent skills
    path.join(homeDir, '.claude', 'skills'),     // Claude Code
    path.join(homeDir, '.cursor', 'skills'),     // Cursor
    path.join(homeDir, '.codeium', 'windsurf', 'skills'), // Windsurf
    path.join(homeDir, '.opencode', 'skills'),   // OpenCode workspace/global
    path.join(homeDir, '.config', 'opencode', 'skills'), // OpenCode global config
    path.join(homeDir, '.gemini', 'skills'),     // Gemini CLI skills/extensions-style local skills
    path.join(homeDir, '.gemini', 'antigravity', 'skills'), // Antigravity
    path.join(homeDir, '.cline', 'skills'),      // Cline
    path.join(homeDir, '.continue', 'skills')    // Continue
  ];
}

export function getKnownProjectSkillDirs(cwd = process.cwd()) {
  return [
    path.join(cwd, '.github', 'skills'),
    path.join(cwd, '.claude', 'skills'),
    path.join(cwd, '.windsurf', 'skills'),
    path.join(cwd, '.opencode', 'skills')
  ];
}

export function detectSkillToolFamily(targetSkillDir) {
  const normalized = String(targetSkillDir || '').replace(/\\/g, '/');
  if (normalized.includes('/.codex/skills/')) return 'codex';
  if (normalized.includes('/.copilot/skills/') || normalized.includes('/.github/skills/')) return 'copilot';
  if (normalized.includes('/.claude/skills/')) return 'claude';
  if (normalized.includes('/.cursor/skills/')) return 'cursor';
  if (normalized.includes('/.codeium/windsurf/skills/') || normalized.includes('/.windsurf/skills/')) return 'windsurf';
  if (normalized.includes('/.opencode/skills/') || normalized.includes('/.config/opencode/skills/')) return 'opencode';
  if (normalized.includes('/.gemini/antigravity/skills/')) return 'antigravity';
  if (normalized.includes('/.gemini/skills/')) return 'gemini';
  if (normalized.includes('/.cline/skills/')) return 'cline';
  if (normalized.includes('/.continue/skills/')) return 'continue';
  if (normalized.includes('/.agents/skills/')) return 'agents';
  return 'default';
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
  copyDirWithVariant(sourceSkillDir, targetSkillDir, detectSkillToolFamily(targetSkillDir));
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
    process.stdout.write('  localnest install skills --project\n');
    process.stdout.write('  localnest install skills --user\n');
    process.stdout.write('  localnest install skills --dest /path/to/skills/localnest-mcp\n');
    process.stdout.write('\nCompatibility alias (deprecated):\n');
    process.stdout.write('  localnest-mcp-install-skill\n');
    process.stdout.write('  localnest-mcp-install-skill --force\n');
    process.stdout.write('\nOptions:\n');
    process.stdout.write('  --force       reinstall even when already current\n');
    process.stdout.write('  --project     sync bundled skills into project skill dirs (.github/skills, .claude/skills, .windsurf/skills, .opencode/skills)\n');
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

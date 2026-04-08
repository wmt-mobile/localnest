/**
 * Skill CLI subcommands.
 *
 *   localnest skill install [--force] [--project] [--user] [--dest PATH]
 *   localnest skill list
 *   localnest skill remove <name> [-f|--force]
 *
 * @module src/cli/commands/skill
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createInterface } from 'node:readline';
import { printSubcommandHelp } from '../help.js';
import {
  listBundledSkillDirs,
  getKnownToolSkillDirs,
  getKnownProjectSkillDirs,
  detectSkillToolFamily,
} from '../../../scripts/runtime/install-localnest-skill.mjs';

const SKILL_METADATA_FILE = '.localnest-skill.json';

const VERBS = [
  { name: 'install', desc: 'Install bundled skills to AI clients' },
  { name: 'list', desc: 'List installed skills and their locations' },
  { name: 'remove', desc: 'Remove a skill from all installed locations' },
];

/* ------------------------------------------------------------------ */
/*  Arg parsing helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Parse flags from args array. Returns { flags, positionals }.
 *
 * @param {string[]} args
 * @param {Record<string, { alias?: string, type: 'string'|'boolean' }>} schema
 */
function parseFlags(args, schema) {
  const flags = {};
  const positionals = [];
  const aliasMap = {};

  for (const [key, def] of Object.entries(schema)) {
    if (def.alias) aliasMap[def.alias] = key;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      let key, value;
      if (eqIdx !== -1) {
        key = arg.slice(2, eqIdx);
        value = arg.slice(eqIdx + 1);
      } else {
        key = arg.slice(2);
      }

      const def = schema[key];
      if (!def) {
        positionals.push(arg);
        continue;
      }

      if (def.type === 'boolean') {
        flags[key] = value !== undefined ? value !== 'false' : true;
      } else if (value !== undefined) {
        flags[key] = value;
      } else {
        i++;
        flags[key] = args[i];
      }
      continue;
    }

    if (arg.startsWith('-') && arg.length === 2) {
      const alias = arg.slice(1);
      const mappedKey = aliasMap[alias];
      if (mappedKey) {
        const def = schema[mappedKey];
        if (def.type === 'boolean') {
          flags[mappedKey] = true;
        } else {
          i++;
          flags[mappedKey] = args[i];
        }
        continue;
      }
    }

    positionals.push(arg);
  }

  return { flags, positionals };
}

/* ------------------------------------------------------------------ */
/*  Output helpers                                                     */
/* ------------------------------------------------------------------ */

function writeJson(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

function writeError(msg, json) {
  if (json) {
    writeJson({ error: msg });
  } else {
    process.stderr.write(`Error: ${msg}\n`);
  }
  process.exitCode = 1;
}

/* ------------------------------------------------------------------ */
/*  Interactive confirmation                                           */
/* ------------------------------------------------------------------ */

function confirm(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes');
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Skill discovery helpers                                            */
/* ------------------------------------------------------------------ */

/**
 * Read skill metadata from a skill directory.
 * @param {string} skillDir
 * @returns {{ name: string, version: string } | null}
 */
function readSkillMeta(skillDir) {
  try {
    const raw = fs.readFileSync(path.join(skillDir, SKILL_METADATA_FILE), 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : path.basename(skillDir),
      version: typeof parsed.version === 'string' ? parsed.version : '',
    };
  } catch {
    return null;
  }
}

/**
 * Scan known skill directories for installed skills.
 * Returns array of { name, version, toolFamily, path }.
 */
function scanInstalledSkills() {
  const homeDir = os.homedir();
  const cwd = process.cwd();
  const userDirs = getKnownToolSkillDirs(homeDir);
  const projectDirs = getKnownProjectSkillDirs(cwd);
  const allDirs = [...userDirs, ...projectDirs];

  const results = [];

  for (const skillsDir of allDirs) {
    if (!fs.existsSync(skillsDir)) continue;

    let entries;
    try {
      entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(skillsDir, entry.name);
      const meta = readSkillMeta(skillPath);
      if (!meta) continue;

      const toolFamily = detectSkillToolFamily(skillPath);
      results.push({
        name: meta.name,
        version: meta.version,
        toolFamily,
        path: skillPath,
      });
    }
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Subcommand handlers                                                */
/* ------------------------------------------------------------------ */

async function handleInstall(args, opts) {
  const { flags } = parseFlags(args, {
    force: { alias: 'f', type: 'boolean' },
    project: { alias: 'p', type: 'boolean' },
    user: { alias: 'u', type: 'boolean' },
    dest: { alias: 'd', type: 'string' },
    quiet: { alias: 'q', type: 'boolean' },
  });

  // Build argv for the install script's main() function
  const fwdArgs = [];
  if (flags.force) fwdArgs.push('--force');
  if (flags.project) fwdArgs.push('--project');
  if (flags.user) fwdArgs.push('--user');
  if (flags.dest) fwdArgs.push('--dest', flags.dest);
  if (flags.quiet || opts.quiet) fwdArgs.push('--quiet');

  // Save and restore process.argv so the install script sees the right flags
  const savedArgv = process.argv;
  process.argv = [process.argv[0], process.argv[1], ...fwdArgs];

  try {
    const { main } = await import('../../../scripts/runtime/install-localnest-skill.mjs');
    main();

    if (opts.json) {
      // After install, report what was installed
      const installed = scanInstalledSkills();
      writeJson({ success: true, installed });
    }
  } catch (err) {
    writeError(err.message || String(err), opts.json);
  } finally {
    process.argv = savedArgv;
  }
}

async function handleList(_args, opts) {
  const installed = scanInstalledSkills();

  if (opts.json) {
    writeJson({ count: installed.length, skills: installed });
    return;
  }

  if (installed.length === 0) {
    process.stdout.write('No skills installed.\n');
    process.stdout.write('Run `localnest skill install` to install bundled skills.\n');
    return;
  }

  process.stdout.write(`Found ${installed.length} installed skill(s):\n\n`);

  const nameW = 20;
  const verW = 14;
  const toolW = 14;

  process.stdout.write(
    `  ${'NAME'.padEnd(nameW)}  ${'VERSION'.padEnd(verW)}  ${'CLIENT'.padEnd(toolW)}  PATH\n`
  );
  process.stdout.write(
    `  ${'-'.repeat(nameW)}  ${'-'.repeat(verW)}  ${'-'.repeat(toolW)}  ${'-'.repeat(40)}\n`
  );

  for (const s of installed) {
    const name = (s.name || '').padEnd(nameW);
    const ver = (s.version || '-').padEnd(verW);
    const tool = (s.toolFamily || 'default').padEnd(toolW);
    process.stdout.write(`  ${name}  ${ver}  ${tool}  ${s.path}\n`);
  }
  process.stdout.write('\n');

  // Show bundled skills available for install
  const bundled = listBundledSkillDirs();
  if (bundled.length > 0) {
    const bundledNames = bundled.map((d) => path.basename(d));
    process.stdout.write(`Bundled skills available: ${bundledNames.join(', ')}\n`);
  }
}

async function handleRemove(args, opts) {
  const { flags, positionals } = parseFlags(args, {
    force: { alias: 'f', type: 'boolean' },
  });

  const name = positionals[0];
  if (!name) {
    writeError('Skill name is required. Usage: localnest skill remove <name> [-f|--force]', opts.json);
    return;
  }

  const installed = scanInstalledSkills().filter((s) => s.name === name);

  if (installed.length === 0) {
    writeError(`No installed skill found with name: ${name}`, opts.json);
    return;
  }

  if (!flags.force) {
    const locations = installed.map((s) => s.path).join('\n    ');
    const yes = await confirm(
      `Remove skill "${name}" from ${installed.length} location(s)?\n    ${locations}\n[y/N] `
    );
    if (!yes) {
      process.stdout.write('Cancelled.\n');
      return;
    }
  }

  const removed = [];
  const errors = [];

  for (const s of installed) {
    try {
      fs.rmSync(s.path, { recursive: true, force: true });
      removed.push(s.path);
    } catch (err) {
      errors.push({ path: s.path, error: err.message });
    }
  }

  if (opts.json) {
    writeJson({
      name,
      removed,
      errors: errors.length > 0 ? errors : undefined,
    });
    return;
  }

  for (const p of removed) {
    process.stdout.write(`Removed: ${p}\n`);
  }
  for (const e of errors) {
    process.stderr.write(`Failed to remove ${e.path}: ${e.error}\n`);
  }

  if (errors.length > 0) {
    process.exitCode = 1;
  } else {
    process.stdout.write(`\nRemoved "${name}" from ${removed.length} location(s).\n`);
  }
}

/* ------------------------------------------------------------------ */
/*  Router                                                             */
/* ------------------------------------------------------------------ */

const HANDLERS = {
  install: handleInstall,
  list: handleList,
  remove: handleRemove,
};

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('skill', VERBS);
    return;
  }

  const handler = HANDLERS[verb];
  if (!handler) {
    process.stderr.write(`Unknown skill command: ${verb}\n`);
    printSubcommandHelp('skill', VERBS);
    process.exitCode = 1;
    return;
  }

  try {
    await handler(args.slice(1), opts);
  } catch (err) {
    writeError(err.message || String(err), opts.json);
  }
}

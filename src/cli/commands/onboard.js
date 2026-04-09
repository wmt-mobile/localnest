/**
 * Guided first-run onboarding wizard for LocalNest.
 *
 * Wraps setup + skill install + hooks install + doctor into
 * one beautiful, step-by-step flow with box drawing and ANSI colors.
 *
 * Usage: localnest onboard
 *
 * @module src/cli/commands/onboard
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SERVER_VERSION } from '../../runtime/version.js';
import {
  bold, dim, italic, cyan, green, yellow, red, gray,
  B as BOX, boxTop, boxBottom, boxLine, boxEmpty,
} from '../ansi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/* ------------------------------------------------------------------ */
/*  Output helpers                                                     */
/* ------------------------------------------------------------------ */

function write(line) {
  process.stdout.write(line + '\n');
}

function writeLines(lines) {
  process.stdout.write(lines.join('\n') + '\n');
}


/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

function stepHeader(num, total, label) {
  const progress = gray(`[${num}/${total}]`);
  write('');
  write(`  ${progress} ${bold(label)}`);
}

function resultLine(ok, label) {
  const icon = ok ? green(BOX.check) : yellow(BOX.circle);
  write(`  ${icon} ${label}`);
}

/* ------------------------------------------------------------------ */
/*  Environment detection                                              */
/* ------------------------------------------------------------------ */


function getCommandVersion(cmd, args = ['--version']) {
  try {
    const result = spawnSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    });
    if (result.status !== 0) return null;
    const match = (result.stdout || '').match(/(\d+\.\d+[\w.-]*)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function detectEnvironment() {
  const env = {};

  // Node.js version
  env.nodeVersion = process.versions.node;
  env.nodeOk = true;

  // ripgrep
  env.rgVersion = getCommandVersion('rg');
  env.rgOk = env.rgVersion !== null;

  // AI clients
  const homeDir = os.homedir();

  env.claudeCode = fs.existsSync(path.join(homeDir, '.claude'))
    || fs.existsSync(path.join(homeDir, '.claude.json'));

  env.cursor = fs.existsSync(path.join(homeDir, '.cursor'));

  env.windsurf = fs.existsSync(path.join(homeDir, '.windsurf'))
    || fs.existsSync(path.join(homeDir, '.codeium', 'windsurf'));

  env.codex = fs.existsSync(path.join(homeDir, '.codex'));

  env.gemini = fs.existsSync(path.join(homeDir, '.gemini'));

  env.kiro = fs.existsSync(path.join(homeDir, '.kiro'));

  env.continueAi = fs.existsSync(path.join(homeDir, '.continue'));

  // Count detected clients
  env.clientCount = [
    env.claudeCode, env.cursor, env.windsurf,
    env.codex, env.gemini, env.kiro, env.continueAi,
  ].filter(Boolean).length;

  return env;
}

/* ------------------------------------------------------------------ */
/*  Step runners                                                       */
/* ------------------------------------------------------------------ */

function runSetup(quiet) {
  const setupScript = path.join(PROJECT_ROOT, 'scripts', 'runtime', 'setup-localnest.mjs');
  const args = ['--yes'];
  if (quiet) args.push('--quiet');

  const result = spawnSync(process.execPath, [setupScript, ...args], {
    stdio: quiet ? 'ignore' : 'inherit',
    encoding: 'utf8',
    timeout: 60000,
    env: { ...process.env, DART_SUPPRESS_ANALYTICS: 'true' },
  });

  return result.status === 0;
}

function runSkillInstall() {
  const skillScript = path.join(PROJECT_ROOT, 'scripts', 'runtime', 'install-localnest-skill.mjs');
  const result = spawnSync(process.execPath, [skillScript, '--force', '--quiet'], {
    stdio: 'ignore',
    encoding: 'utf8',
    timeout: 30000,
  });

  return result.status === 0;
}

function runHooksInstall() {
  const hooksScript = path.join(PROJECT_ROOT, 'scripts', 'hooks', 'install-hooks.cjs');
  const result = spawnSync(process.execPath, [hooksScript], {
    stdio: 'ignore',
    encoding: 'utf8',
    timeout: 15000,
  });

  return result.status === 0;
}

function runDoctor() {
  const doctorScript = path.join(PROJECT_ROOT, 'scripts', 'runtime', 'doctor-localnest.mjs');
  const result = spawnSync(process.execPath, [doctorScript, '--quiet'], {
    stdio: 'ignore',
    encoding: 'utf8',
    timeout: 30000,
  });

  return result.status === 0;
}

/* ------------------------------------------------------------------ */
/*  Main wizard flow                                                   */
/* ------------------------------------------------------------------ */

async function runOnboard() {
  const totalSteps = 5;

  // ── Welcome ────────────────────────────────────────────────────
  writeLines([
    '',
    boxTop(),
    boxLine(`${bold('Welcome to LocalNest')}  ${gray(`v${SERVER_VERSION}`)}`),
    boxLine(italic(gray('Local-first AI memory & code retrieval'))),
    boxEmpty(),
    boxLine(`Let's get you set up in under a minute.`),
    boxBottom(),
  ]);

  // ── Step 1: Detect environment ─────────────────────────────────
  stepHeader(1, totalSteps, 'Detecting environment...');
  write('');

  const env = detectEnvironment();

  resultLine(env.nodeOk,
    `Node.js ${cyan(env.nodeVersion)} ${dim('(memory support available)')}`);

  resultLine(env.rgOk,
    env.rgOk
      ? `ripgrep ${cyan(env.rgVersion)} ${dim('(fast search enabled)')}`
      : `ripgrep ${dim('not found — install for faster search')}`);

  // AI clients
  const clients = [
    { key: 'claudeCode', label: 'Claude Code' },
    { key: 'cursor',     label: 'Cursor' },
    { key: 'windsurf',   label: 'Windsurf' },
    { key: 'codex',      label: 'Codex' },
    { key: 'gemini',     label: 'Gemini CLI' },
    { key: 'kiro',       label: 'Kiro' },
    { key: 'continueAi', label: 'Continue' },
  ];

  for (const cl of clients) {
    if (env[cl.key]) {
      resultLine(true, `${cl.label} ${dim('detected')}`);
    } else {
      resultLine(false, `${cl.label} ${dim('not found')}`);
    }
  }

  // ── Step 2: Run setup ──────────────────────────────────────────
  stepHeader(2, totalSteps, 'Running setup...');
  const setupOk = runSetup(true);
  resultLine(setupOk, setupOk
    ? 'Configuration and databases initialized'
    : red('Setup encountered issues — run `localnest setup` manually'));

  // ── Step 3: Install skills ─────────────────────────────────────
  stepHeader(3, totalSteps, 'Installing skills to AI clients...');
  const skillsOk = runSkillInstall();
  if (skillsOk) {
    resultLine(true, env.clientCount > 0
      ? `Skills installed to ${cyan(String(env.clientCount))} AI client(s)`
      : 'Skills bundled (no AI clients detected)');
  } else {
    resultLine(false, yellow('Skill install had warnings — run `localnest skill install` to retry'));
  }

  // ── Step 4: Install hooks ─────────────────────────────────────
  stepHeader(4, totalSteps, 'Installing Claude Code hooks...');
  if (env.claudeCode) {
    const hooksOk = runHooksInstall();
    resultLine(hooksOk, hooksOk
      ? 'Memory hooks active in Claude Code'
      : yellow('Hook install had issues — run `localnest hooks install`'));
  } else {
    resultLine(false, dim('Claude Code not detected — skipping hooks'));
  }

  // ── Step 5: Doctor ─────────────────────────────────────────────
  stepHeader(5, totalSteps, 'Verifying installation...');
  const doctorOk = runDoctor();
  resultLine(doctorOk, doctorOk
    ? 'All health checks passed'
    : yellow('Some checks failed — run `localnest doctor` for details'));

  // ── Completion summary ─────────────────────────────────────────
  const allOk = setupOk && doctorOk;

  writeLines([
    '',
    boxTop(),
    boxLine(allOk
      ? `${green(BOX.check)} ${bold('LocalNest is ready!')}`
      : `${yellow('!')} ${bold('LocalNest is partially configured')}`),
    boxEmpty(),
    boxLine(`${green(BOX.check)} ${dim('52 MCP tools available')}`),
    boxLine(env.clientCount > 0
      ? `${green(BOX.check)} ${dim(`Skills installed in ${env.clientCount} AI client(s)`)}`
      : `${yellow(BOX.circle)} ${dim('No AI clients detected for skill install')}`),
    boxLine(env.claudeCode
      ? `${green(BOX.check)} ${dim('Memory hooks active in Claude Code')}`
      : `${yellow(BOX.circle)} ${dim('Claude Code hooks skipped')}`),
    boxEmpty(),
    boxLine(`${bold('Try these commands:')}`),
    boxLine(`  ${cyan('/localnest:recall')}    ${gray(BOX.arrow)} ${dim('recall memories for a task')}`),
    boxLine(`  ${cyan('/localnest:remember')}  ${gray(BOX.arrow)} ${dim('save something to memory')}`),
    boxLine(`  ${cyan('/localnest:fact')}      ${gray(BOX.arrow)} ${dim('add a knowledge graph fact')}`),
    boxBottom(),
    '',
  ]);

  process.exitCode = allOk ? 0 : 1;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  await runOnboard(args, opts);
}

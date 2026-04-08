/**
 * Self-test CLI command for LocalNest.
 *
 *   localnest selftest [--json]
 *
 * Runs end-to-end validation of the full pipeline:
 *   Runtime, Memory, Knowledge Graph, Taxonomy, Dedup,
 *   Embeddings, File search, Skills, Hooks.
 *
 * @module src/cli/commands/selftest
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildRuntimeConfig } from '../../runtime/config.js';
import { EmbeddingService } from '../../services/retrieval/embedding/service.js';
import { MemoryService } from '../../services/memory/service.js';
import { SCHEMA_VERSION } from '../../services/memory/schema.js';
import { SERVER_VERSION } from '../../runtime/version.js';

/* ------------------------------------------------------------------ */
/*  ANSI helpers                                                       */
/* ------------------------------------------------------------------ */

function useColor() {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return true;
  return process.stdout.isTTY === true;
}

const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const GREEN = `${ESC}32m`;
const RED = `${ESC}31m`;
const YELLOW = `${ESC}33m`;
const GRAY = `${ESC}90m`;

function c(code, text) {
  return useColor() ? `${code}${text}${RESET}` : text;
}

function bold(t) { return c(BOLD, t); }
function dim(t) { return c(DIM, t); }
function green(t) { return c(GREEN, t); }
function red(t) { return c(RED, t); }
function yellow(t) { return c(YELLOW, t); }
function gray(t) { return c(GRAY, t); }

/* ------------------------------------------------------------------ */
/*  Box drawing                                                        */
/* ------------------------------------------------------------------ */

const BOX_TL = '\u256D';
const BOX_TR = '\u256E';
const BOX_BL = '\u2570';
const BOX_BR = '\u256F';
const BOX_H = '\u2500';
const BOX_V = '\u2502';

function boxTop(width = 60) {
  return `  ${gray(BOX_TL + BOX_H.repeat(width - 2) + BOX_TR)}`;
}

function boxBottom(width = 60) {
  return `  ${gray(BOX_BL + BOX_H.repeat(width - 2) + BOX_BR)}`;
}

function boxLine(content, width = 60) {
  // eslint-disable-next-line no-control-regex
  const visible = content.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, width - visible.length - 4);
  return `  ${gray(BOX_V)} ${content}${' '.repeat(pad)} ${gray(BOX_V)}`;
}

function separator() {
  return `  ${gray(BOX_H.repeat(60))}`;
}

/* ------------------------------------------------------------------ */
/*  Result tracking                                                    */
/* ------------------------------------------------------------------ */

/**
 * @typedef {'pass'|'warn'|'fail'} CheckStatus
 * @typedef {{ name: string, status: CheckStatus, detail: string }} CheckResult
 */

const ICON = {
  pass: '\u2713',
  warn: '\u26A0',
  fail: '\u2717',
};

function statusIcon(status) {
  switch (status) {
    case 'pass': return green(ICON.pass);
    case 'warn': return yellow(ICON.warn);
    case 'fail': return red(ICON.fail);
    default: return ' ';
  }
}

function formatLine(result) {
  const icon = statusIcon(result.status);
  const nameCol = result.name.padEnd(24);
  const detailCol = dim(result.detail);
  return `  ${icon} ${nameCol} ${detailCol}`;
}

/* ------------------------------------------------------------------ */
/*  Service bootstrap                                                  */
/* ------------------------------------------------------------------ */

function createServices(runtime) {
  const embeddingService = new EmbeddingService({
    provider: runtime.embeddingProvider,
    model: runtime.embeddingModel,
    cacheDir: runtime.embeddingCacheDir,
  });
  const memoryService = new MemoryService({
    localnestHome: runtime.localnestHome,
    enabled: true,
    backend: runtime.memoryBackend,
    dbPath: runtime.memoryDbPath,
    autoCapture: runtime.memoryAutoCapture,
    consentDone: runtime.memoryConsentDone,
    embeddingService,
  });
  return { embeddingService, memoryService };
}

/* ------------------------------------------------------------------ */
/*  Individual checks                                                  */
/* ------------------------------------------------------------------ */

async function checkRuntime() {
  try {
    const runtime = buildRuntimeConfig();
    const nodeVer = process.version;
    let sqliteAvail = false;
    try {
      const mod = await import('node:sqlite');
      sqliteAvail = Boolean(mod?.DatabaseSync);
    } catch { /* not available */ }

    if (!sqliteAvail) {
      return {
        name: 'Runtime config',
        status: 'warn',
        detail: `Node ${nodeVer}, sqlite NOT available`,
        runtime,
      };
    }

    return {
      name: 'Runtime config',
      status: 'pass',
      detail: `Node ${nodeVer}, sqlite available`,
      runtime,
    };
  } catch (err) {
    return {
      name: 'Runtime config',
      status: 'fail',
      detail: err.message || String(err),
      runtime: null,
    };
  }
}

async function checkMemoryBackend(memoryService) {
  try {
    const backendInfo = await memoryService.detectBackend();
    if (!backendInfo.available) {
      return {
        name: 'Memory backend',
        status: 'fail',
        detail: backendInfo.reason || 'no backend available',
      };
    }
    return {
      name: 'Memory backend',
      status: 'pass',
      detail: `Schema v${SCHEMA_VERSION}, ${backendInfo.selected} backend`,
    };
  } catch (err) {
    return {
      name: 'Memory backend',
      status: 'fail',
      detail: err.message || String(err),
    };
  }
}

async function checkMemoryCrud(memoryService) {
  const testId = `__selftest_${Date.now()}`;
  try {
    // Store
    const storeResult = await memoryService.storeEntry({
      content: `selftest entry ${testId}`,
      kind: 'knowledge',
      importance: 10,
      title: testId,
    });
    const id = storeResult?.memory?.id;
    if (!id) throw new Error('store returned no id');

    // Recall
    const recalled = await memoryService.getEntry(id);
    if (!recalled) throw new Error('recall returned nothing');

    // Update
    await memoryService.updateEntry(id, { importance: 20 });

    // Delete (cleanup)
    await memoryService.deleteEntry(id);

    return {
      name: 'Memory CRUD',
      status: 'pass',
      detail: 'store \u2192 recall \u2192 update \u2192 delete',
    };
  } catch (err) {
    // Attempt cleanup just in case
    try {
      const entries = await memoryService.listEntries({ limit: 50 });
      for (const e of entries?.items || []) {
        if (e.title === testId) await memoryService.deleteEntry(e.id);
      }
    } catch { /* ignore cleanup errors */ }

    return {
      name: 'Memory CRUD',
      status: 'fail',
      detail: err.message || String(err),
    };
  }
}

async function checkKnowledgeGraph(memoryService) {
  const entityName = `__selftest_entity_${Date.now()}`;
  try {
    // Add entity
    const entity = await memoryService.addEntity({
      name: entityName,
      type: 'test',
    });
    const entityId = entity?.id || entity?.entity?.id;
    if (!entityId) throw new Error('addEntity returned no id');

    // Add triple
    const triple = await memoryService.addTriple({
      subject: entityId,
      predicate: 'tested_by',
      object: 'selftest',
    });
    const tripleId = triple?.id || triple?.triple?.id;

    // Query
    const rels = await memoryService.queryEntityRelationships(entityId);
    if (!rels) throw new Error('queryEntityRelationships returned nothing');

    // Invalidate triple
    if (tripleId) {
      await memoryService.invalidateTriple(tripleId, new Date().toISOString());
    }

    return {
      name: 'Knowledge Graph',
      status: 'pass',
      detail: 'entity + triple + query + invalidate',
    };
  } catch (err) {
    return {
      name: 'Knowledge Graph',
      status: 'fail',
      detail: err.message || String(err),
    };
  }
}

async function checkTaxonomy(memoryService) {
  try {
    await memoryService.listNests();
    await memoryService.listBranches('');

    return {
      name: 'Taxonomy',
      status: 'pass',
      detail: 'nests and branches working',
    };
  } catch (err) {
    return {
      name: 'Taxonomy',
      status: 'fail',
      detail: err.message || String(err),
    };
  }
}

async function checkDedup(memoryService) {
  const testContent = `selftest dedup content ${Date.now()}`;
  let firstId = null;
  try {
    // Store first entry
    const first = await memoryService.storeEntry({
      content: testContent,
      kind: 'knowledge',
      importance: 10,
      title: '__selftest_dedup',
    });
    firstId = first?.memory?.id;

    // Try storing duplicate
    const second = await memoryService.storeEntry({
      content: testContent,
      kind: 'knowledge',
      importance: 10,
      title: '__selftest_dedup_2',
    });

    const isDup = second?.duplicate === true;

    // Cleanup
    if (firstId) await memoryService.deleteEntry(firstId);
    if (second?.memory?.id && second.memory.id !== firstId) {
      await memoryService.deleteEntry(second.memory.id);
    }

    if (isDup) {
      return {
        name: 'Dedup',
        status: 'pass',
        detail: 'duplicate detection active (0.92 threshold)',
      };
    }

    return {
      name: 'Dedup',
      status: 'warn',
      detail: 'stored but duplicate not caught (embeddings may not be loaded)',
    };
  } catch (err) {
    // Cleanup on failure
    if (firstId) {
      try { await memoryService.deleteEntry(firstId); } catch { /* ignore */ }
    }
    return {
      name: 'Dedup',
      status: 'fail',
      detail: err.message || String(err),
    };
  }
}

async function checkEmbeddings(embeddingService) {
  try {
    if (!embeddingService.isEnabled()) {
      return {
        name: 'Embeddings',
        status: 'warn',
        detail: 'embedding provider disabled',
      };
    }

    const vec = await embeddingService.embed('selftest embedding probe');
    if (!Array.isArray(vec) || vec.length === 0) {
      return {
        name: 'Embeddings',
        status: 'warn',
        detail: 'model not loaded (first use downloads ~30MB)',
      };
    }

    return {
      name: 'Embeddings',
      status: 'pass',
      detail: `${embeddingService.model}, ${vec.length}d vectors`,
    };
  } catch {
    return {
      name: 'Embeddings',
      status: 'warn',
      detail: 'model not loaded (first use downloads ~30MB)',
    };
  }
}

function checkFileSearch() {
  try {
    const result = spawnSync('rg', ['--version'], { stdio: 'pipe', encoding: 'utf8' });
    if (result.status === 0) {
      const ver = (result.stdout || '').split('\n')[0] || 'available';
      return {
        name: 'File search',
        status: 'pass',
        detail: `ripgrep ${ver.replace('ripgrep ', '').trim()}`,
      };
    }
    return {
      name: 'File search',
      status: 'warn',
      detail: 'ripgrep not found (file search will use fallback)',
    };
  } catch {
    return {
      name: 'File search',
      status: 'warn',
      detail: 'ripgrep not found (file search will use fallback)',
    };
  }
}

function checkSkills() {
  try {
    const homeDir = os.homedir();
    const SKILL_META = '.localnest-skill.json';

    const knownDirs = [
      path.join(homeDir, '.agents', 'skills'),
      path.join(homeDir, '.codex', 'skills'),
      path.join(homeDir, '.copilot', 'skills'),
      path.join(homeDir, '.claude', 'skills'),
      path.join(homeDir, '.cursor', 'skills'),
      path.join(homeDir, '.codeium', 'windsurf', 'skills'),
      path.join(homeDir, '.opencode', 'skills'),
      path.join(homeDir, '.config', 'opencode', 'skills'),
      path.join(homeDir, '.gemini', 'skills'),
      path.join(homeDir, '.gemini', 'antigravity', 'skills'),
      path.join(homeDir, '.cline', 'skills'),
      path.join(homeDir, '.continue', 'skills'),
      path.join(homeDir, '.kiro', 'skills'),
    ];

    const clientsWithSkills = new Set();

    for (const skillsDir of knownDirs) {
      if (!fs.existsSync(skillsDir)) continue;
      let entries;
      try {
        entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      } catch { continue; }

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const metaPath = path.join(skillsDir, entry.name, SKILL_META);
        if (fs.existsSync(metaPath)) {
          // Extract client name from the path
          const relative = skillsDir.replace(homeDir, '');
          const clientName = relative.split(path.sep).filter(Boolean)[0] || 'unknown';
          clientsWithSkills.add(clientName.replace(/^\./, ''));
          break;
        }
      }
    }

    if (clientsWithSkills.size === 0) {
      return {
        name: 'Skills',
        status: 'warn',
        detail: 'not installed (run: localnest skill install)',
      };
    }

    return {
      name: 'Skills',
      status: 'pass',
      detail: `installed in ${clientsWithSkills.size} AI client${clientsWithSkills.size === 1 ? '' : 's'}`,
    };
  } catch (err) {
    return {
      name: 'Skills',
      status: 'fail',
      detail: err.message || String(err),
    };
  }
}

function checkHooks() {
  try {
    const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    if (!fs.existsSync(settingsPath)) {
      return {
        name: 'Hooks',
        status: 'fail',
        detail: 'not installed (run: localnest hooks install)',
      };
    }

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const hooks = settings.hooks || {};
    const preHooks = (hooks.PreToolUse || []).filter(
      e => e.hooks?.some(h => h.command?.includes('localnest'))
    );
    const postHooks = (hooks.PostToolUse || []).filter(
      e => e.hooks?.some(h => h.command?.includes('localnest'))
    );

    const count = preHooks.length + postHooks.length;
    if (count === 0) {
      return {
        name: 'Hooks',
        status: 'fail',
        detail: 'not installed (run: localnest hooks install)',
      };
    }

    return {
      name: 'Hooks',
      status: 'pass',
      detail: `${count} hook${count === 1 ? '' : 's'} active (pre: ${preHooks.length}, post: ${postHooks.length})`,
    };
  } catch {
    return {
      name: 'Hooks',
      status: 'fail',
      detail: 'not installed (run: localnest hooks install)',
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Main runner                                                        */
/* ------------------------------------------------------------------ */

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const jsonOutput = opts.json || args.includes('--json');

  /** @type {CheckResult[]} */
  const results = [];

  // 1. Runtime
  const runtimeResult = await checkRuntime();
  results.push(runtimeResult);

  const runtime = runtimeResult.runtime;
  let memoryService = null;
  let embeddingService = null;

  if (runtime) {
    try {
      const svcs = createServices(runtime);
      memoryService = svcs.memoryService;
      embeddingService = svcs.embeddingService;
    } catch { /* services unavailable */ }
  }

  // 2. Memory backend
  if (memoryService) {
    results.push(await checkMemoryBackend(memoryService));
  } else {
    results.push({ name: 'Memory backend', status: 'fail', detail: 'runtime config failed' });
  }

  // 3. Memory CRUD
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkMemoryCrud(memoryService));
  } else {
    results.push({ name: 'Memory CRUD', status: 'fail', detail: 'database not available' });
  }

  // 4. Knowledge Graph
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkKnowledgeGraph(memoryService));
  } else {
    results.push({ name: 'Knowledge Graph', status: 'fail', detail: 'database not available' });
  }

  // 5. Taxonomy
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkTaxonomy(memoryService));
  } else {
    results.push({ name: 'Taxonomy', status: 'fail', detail: 'database not available' });
  }

  // 6. Dedup
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkDedup(memoryService));
  } else {
    results.push({ name: 'Dedup', status: 'fail', detail: 'database not available' });
  }

  // 7. Embeddings
  if (embeddingService) {
    results.push(await checkEmbeddings(embeddingService));
  } else {
    results.push({ name: 'Embeddings', status: 'warn', detail: 'embedding service not available' });
  }

  // 8. File search
  results.push(checkFileSearch());

  // 9. Skills
  results.push(checkSkills());

  // 10. Hooks
  results.push(checkHooks());

  // -- Output --
  if (jsonOutput) {
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warn').length;
    const failed = results.filter(r => r.status === 'fail').length;
    process.stdout.write(JSON.stringify({
      version: SERVER_VERSION,
      total: results.length,
      passed,
      warnings,
      failed,
      checks: results.map(r => ({ name: r.name, status: r.status, detail: r.detail })),
    }, null, 2) + '\n');
    return;
  }

  const lines = [];
  const W = 60;

  lines.push('');
  lines.push(boxTop(W));
  lines.push(boxLine(`${bold('LocalNest Self-Test')}  ${dim(`v${SERVER_VERSION}`)}`, W));
  lines.push(boxBottom(W));
  lines.push('');

  for (const r of results) {
    lines.push(formatLine(r));
  }

  lines.push('');
  lines.push(separator());

  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  const failed = results.filter(r => r.status === 'fail').length;

  const parts = [];
  if (passed > 0) parts.push(green(`${passed} passed`));
  if (warnings > 0) parts.push(yellow(`${warnings} warning${warnings === 1 ? '' : 's'}`));
  if (failed > 0) parts.push(red(`${failed} action${failed === 1 ? '' : 's'} needed`));

  lines.push(`  ${bold('Result:')} ${parts.join(', ')}`);
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

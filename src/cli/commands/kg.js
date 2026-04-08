import { parseFlags } from '../parse-flags.js';
/**
 * Knowledge Graph CLI subcommands.
 *
 *   localnest kg add <subject> <predicate> <object> [--valid-from] [--confidence]
 *   localnest kg query <entity> [--direction]
 *   localnest kg timeline <entity>
 *   localnest kg stats
 *
 * @module src/cli/commands/kg
 */

import { printSubcommandHelp } from '../help.js';
import { buildRuntimeConfig } from '../../runtime/config.js';
import { EmbeddingService } from '../../services/retrieval/embedding/service.js';
import { MemoryService } from '../../services/memory/service.js';
import { normalizeEntityId } from '../../services/memory/kg.js';

const VERBS = [
  { name: 'add', desc: 'Create a triple (subject predicate object)' },
  { name: 'query', desc: 'Query entity relationships' },
  { name: 'timeline', desc: 'Show entity fact timeline' },
  { name: 'stats', desc: 'Show graph statistics' },
];

/* ------------------------------------------------------------------ */
/*  Arg parsing helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Parse flags from args array. Returns { flags, positionals }.
 * Supports --key value, --key=value, -f (boolean), --flag (boolean).
 *
 * @param {string[]} args
 * @param {Record<string, { alias?: string, type: 'string'|'number'|'boolean' }>} schema
 */

/* ------------------------------------------------------------------ */
/*  Service bootstrap                                                  */
/* ------------------------------------------------------------------ */

/**
 * Create a MemoryService instance from runtime config.
 * Mirrors the pattern in src/cli/commands/memory.js.
 */
function createMemoryService() {
  const runtime = buildRuntimeConfig();
  const embeddingService = new EmbeddingService({
    provider: runtime.embeddingProvider,
    model: runtime.embeddingModel,
    cacheDir: runtime.embeddingCacheDir,
  });
  return new MemoryService({
    localnestHome: runtime.localnestHome,
    enabled: runtime.memoryEnabled,
    backend: runtime.memoryBackend,
    dbPath: runtime.memoryDbPath,
    autoCapture: runtime.memoryAutoCapture,
    consentDone: runtime.memoryConsentDone,
    embeddingService,
  });
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

function formatDate(iso) {
  if (!iso) return '-';
  return iso.replace('T', ' ').replace(/\.\d+Z$/, 'Z');
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

/* ------------------------------------------------------------------ */
/*  Subcommand: kg add                                                 */
/* ------------------------------------------------------------------ */

async function handleAdd(args, opts) {
  const { flags, positionals } = parseFlags(args, {
    'valid-from': { type: 'string' },
    confidence: { alias: 'c', type: 'number' },
  });

  if (positionals.length < 3) {
    writeError(
      'Three positional args required. Usage: localnest kg add <subject> <predicate> <object> [--valid-from ISO] [--confidence 0.0-1.0]',
      opts.json
    );
    return;
  }

  const [subjectName, predicate, objectName] = positionals;

  const svc = createMemoryService();
  const result = await svc.addTriple({
    subjectName,
    predicate,
    objectName,
    validFrom: flags['valid-from'] || undefined,
    confidence: flags.confidence !== undefined ? flags.confidence : undefined,
  });

  if (opts.json) {
    writeJson(result);
    return;
  }

  process.stdout.write(`Created triple ${result.id}\n`);
  process.stdout.write(`  ${subjectName} --[${predicate}]--> ${objectName}\n`);
  process.stdout.write(`  Subject ID:  ${result.subject_id}\n`);
  process.stdout.write(`  Object ID:   ${result.object_id}\n`);
  process.stdout.write(`  Confidence:  ${result.confidence}\n`);
  if (result.valid_from) {
    process.stdout.write(`  Valid from:  ${result.valid_from}\n`);
  }

  if (result.has_contradiction) {
    process.stdout.write('\n  Contradictions detected:\n');
    for (const c of result.contradictions) {
      process.stdout.write(`    - Triple ${c.existing_triple_id}: object was "${c.existing_object_name}"\n`);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Subcommand: kg query                                               */
/* ------------------------------------------------------------------ */

async function handleQuery(args, opts) {
  const { flags, positionals } = parseFlags(args, {
    direction: { alias: 'd', type: 'string' },
  });

  const entityName = positionals.join(' ').trim();
  if (!entityName) {
    writeError('Entity name is required. Usage: localnest kg query <entity> [--direction outgoing|incoming|both]', opts.json);
    return;
  }

  const entityId = normalizeEntityId(entityName);
  if (!entityId) {
    writeError(`Entity name "${entityName}" does not produce a valid identifier`, opts.json);
    return;
  }

  const svc = createMemoryService();
  const result = await svc.queryEntityRelationships(entityId, {
    direction: flags.direction || 'both',
  });

  if (opts.json) {
    writeJson(result);
    return;
  }

  if (result.count === 0) {
    process.stdout.write(`No relationships found for entity "${entityName}" (${entityId})\n`);
    return;
  }

  process.stdout.write(`Relationships for "${entityName}" (${result.count} total, direction: ${result.direction}):\n\n`);

  const predW = 20;
  const nameW = 30;

  process.stdout.write(`  ${'SUBJECT'.padEnd(nameW)}  ${'PREDICATE'.padEnd(predW)}  ${'OBJECT'.padEnd(nameW)}  CONFIDENCE\n`);
  process.stdout.write(`  ${'-'.repeat(nameW)}  ${'-'.repeat(predW)}  ${'-'.repeat(nameW)}  ----------\n`);

  for (const t of result.triples) {
    const subj = truncate(t.subject_name || t.subject_id, nameW).padEnd(nameW);
    const pred = truncate(t.predicate, predW).padEnd(predW);
    const obj = truncate(t.object_name || t.object_id, nameW).padEnd(nameW);
    const conf = t.confidence !== undefined ? String(t.confidence) : '-';
    process.stdout.write(`  ${subj}  ${pred}  ${obj}  ${conf}\n`);
  }
}

/* ------------------------------------------------------------------ */
/*  Subcommand: kg timeline                                            */
/* ------------------------------------------------------------------ */

async function handleTimeline(args, opts) {
  const { positionals } = parseFlags(args, {});

  const entityName = positionals.join(' ').trim();
  if (!entityName) {
    writeError('Entity name is required. Usage: localnest kg timeline <entity>', opts.json);
    return;
  }

  const entityId = normalizeEntityId(entityName);
  if (!entityId) {
    writeError(`Entity name "${entityName}" does not produce a valid identifier`, opts.json);
    return;
  }

  const svc = createMemoryService();
  const result = await svc.getEntityTimeline(entityId);

  if (opts.json) {
    writeJson(result);
    return;
  }

  if (result.count === 0) {
    process.stdout.write(`No timeline entries for entity "${entityName}" (${entityId})\n`);
    return;
  }

  process.stdout.write(`Timeline for "${entityName}" (${result.count} facts):\n\n`);

  const dateW = 22;
  const predW = 20;
  const nameW = 24;

  process.stdout.write(`  ${'VALID FROM'.padEnd(dateW)}  ${'VALID TO'.padEnd(dateW)}  ${'SUBJECT'.padEnd(nameW)}  ${'PREDICATE'.padEnd(predW)}  ${'OBJECT'.padEnd(nameW)}\n`);
  process.stdout.write(`  ${'-'.repeat(dateW)}  ${'-'.repeat(dateW)}  ${'-'.repeat(nameW)}  ${'-'.repeat(predW)}  ${'-'.repeat(nameW)}\n`);

  for (const t of result.triples) {
    const from = formatDate(t.valid_from).padEnd(dateW);
    const to = formatDate(t.valid_to).padEnd(dateW);
    const subj = truncate(t.subject_name || t.subject_id, nameW).padEnd(nameW);
    const pred = truncate(t.predicate, predW).padEnd(predW);
    const obj = truncate(t.object_name || t.object_id, nameW).padEnd(nameW);
    process.stdout.write(`  ${from}  ${to}  ${subj}  ${pred}  ${obj}\n`);
  }
}

/* ------------------------------------------------------------------ */
/*  Subcommand: kg stats                                               */
/* ------------------------------------------------------------------ */

async function handleStats(_args, opts) {
  const svc = createMemoryService();
  const result = await svc.getKgStats();

  if (opts.json) {
    writeJson(result);
    return;
  }

  process.stdout.write('Knowledge Graph Statistics:\n\n');
  process.stdout.write(`  Entities:        ${result.entities}\n`);
  process.stdout.write(`  Total triples:   ${result.triples}\n`);
  process.stdout.write(`  Active triples:  ${result.active_triples}\n`);

  if (result.by_predicate && result.by_predicate.length > 0) {
    process.stdout.write('\n  Predicate breakdown:\n');

    const predW = 30;
    process.stdout.write(`    ${'PREDICATE'.padEnd(predW)}  COUNT\n`);
    process.stdout.write(`    ${'-'.repeat(predW)}  -----\n`);

    for (const p of result.by_predicate) {
      const name = truncate(p.predicate, predW).padEnd(predW);
      process.stdout.write(`    ${name}  ${p.count}\n`);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Router                                                             */
/* ------------------------------------------------------------------ */

const HANDLERS = {
  add: handleAdd,
  query: handleQuery,
  timeline: handleTimeline,
  stats: handleStats,
};

/**
 * @param {string[]} args
 * @param {import('../options.js').GlobalOptions} opts
 */
export async function run(args, opts) {
  const verb = args[0] || '';

  if (!verb || verb === 'help' || verb === '--help' || verb === '-h') {
    printSubcommandHelp('kg', VERBS);
    return;
  }

  const handler = HANDLERS[verb];
  if (!handler) {
    process.stderr.write(`Unknown kg command: ${verb}\n`);
    printSubcommandHelp('kg', VERBS);
    process.exitCode = 1;
    return;
  }

  try {
    await handler(args.slice(1), opts);
  } catch (err) {
    writeError(err.message || String(err), opts.json);
  }
}

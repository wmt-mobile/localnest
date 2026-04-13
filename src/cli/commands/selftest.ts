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

import { EmbeddingService } from '../../services/retrieval/embedding/service.js';
import { MemoryService } from '../../services/memory/service.js';
import { SERVER_VERSION } from '../../runtime/version.js';
import {
  bold, dim,
  boxTop, boxBottom, boxLine, separator,
} from '../ansi.js';
import { startSpinner } from '../spinner.js';
import type { Ora } from 'ora';
import type { GlobalOptions } from '../options.js';
import {
  type CheckResult,
  formatLine,
  createServices,
  checkRuntime,
  checkMemoryBackend,
  checkMemoryCrud,
  checkKnowledgeGraph,
  checkTaxonomy,
  checkDedup,
  checkEmbeddings,
  checkFileSearch,
  checkSkills,
  checkHooks,
} from './selftest-checks.js';

export async function run(args: string[], opts: GlobalOptions): Promise<void> {
  const jsonOutput = opts.json || args.includes('--json');

  const results: CheckResult[] = [];
  const useSpinners = !jsonOutput;

  // 1. Runtime
  let sp: Ora | null = useSpinners ? startSpinner('Checking runtime config...') : null;
  const runtimeResult = await checkRuntime();
  results.push(runtimeResult);
  if (sp) { runtimeResult.status === 'pass' ? sp.succeed('Runtime config') : sp.fail('Runtime config'); }

  const runtime = runtimeResult.runtime;
  let memoryService: MemoryService | null = null;
  let embeddingService: EmbeddingService | null = null;

  if (runtime) {
    try {
      const svcs = createServices(runtime);
      memoryService = svcs.memoryService;
      embeddingService = svcs.embeddingService;
    } catch { /* services unavailable */ }
  }

  // 2. Memory backend
  sp = useSpinners ? startSpinner('Checking memory backend...') : null;
  if (memoryService) {
    results.push(await checkMemoryBackend(memoryService));
  } else {
    results.push({ name: 'Memory backend', status: 'fail', detail: 'runtime config failed' });
  }
  if (sp) { results[1].status === 'pass' ? sp.succeed('Memory backend') : sp.fail('Memory backend'); }

  // 3. Memory CRUD
  sp = useSpinners ? startSpinner('Testing memory CRUD...') : null;
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkMemoryCrud(memoryService));
  } else {
    results.push({ name: 'Memory CRUD', status: 'fail', detail: 'database not available' });
  }
  if (sp) { results[2].status === 'pass' ? sp.succeed('Memory CRUD') : sp.fail('Memory CRUD'); }

  // 4. Knowledge Graph
  sp = useSpinners ? startSpinner('Testing knowledge graph...') : null;
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkKnowledgeGraph(memoryService));
  } else {
    results.push({ name: 'Knowledge Graph', status: 'fail', detail: 'database not available' });
  }
  if (sp) { results[3].status === 'pass' ? sp.succeed('Knowledge Graph') : sp.fail('Knowledge Graph'); }

  // 5. Taxonomy
  sp = useSpinners ? startSpinner('Testing taxonomy...') : null;
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkTaxonomy(memoryService));
  } else {
    results.push({ name: 'Taxonomy', status: 'fail', detail: 'database not available' });
  }
  if (sp) { results[4].status === 'pass' ? sp.succeed('Taxonomy') : sp.fail('Taxonomy'); }

  // 6. Dedup
  sp = useSpinners ? startSpinner('Testing deduplication...') : null;
  if (memoryService && results[1].status === 'pass') {
    results.push(await checkDedup(memoryService));
  } else {
    results.push({ name: 'Dedup', status: 'fail', detail: 'database not available' });
  }
  if (sp) { results[5].status === 'pass' ? sp.succeed('Dedup') : (results[5].status === 'warn' ? sp.warn('Dedup') : sp.fail('Dedup')); }

  // 7. Embeddings
  sp = useSpinners ? startSpinner('Testing embeddings...') : null;
  if (embeddingService) {
    results.push(await checkEmbeddings(embeddingService));
  } else {
    results.push({ name: 'Embeddings', status: 'warn', detail: 'embedding service not available' });
  }
  if (sp) { results[6].status === 'pass' ? sp.succeed('Embeddings') : sp.warn('Embeddings'); }

  // 8. File search
  sp = useSpinners ? startSpinner('Checking file search...') : null;
  results.push(checkFileSearch());
  if (sp) { results[7].status === 'pass' ? sp.succeed('File search') : sp.warn('File search'); }

  // 9. Skills
  sp = useSpinners ? startSpinner('Checking skills...') : null;
  results.push(checkSkills());
  if (sp) { results[8].status === 'pass' ? sp.succeed('Skills') : sp.warn('Skills'); }

  // 10. Hooks
  sp = useSpinners ? startSpinner('Checking hooks...') : null;
  results.push(checkHooks());
  if (sp) { results[9].status === 'pass' ? sp.succeed('Hooks') : sp.fail('Hooks'); }

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

  const lines: string[] = [];
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

  const parts: string[] = [];
  if (passed > 0) parts.push(bold(`${passed} passed`));
  if (warnings > 0) parts.push(`${warnings} warning${warnings === 1 ? '' : 's'}`);
  if (failed > 0) parts.push(`${failed} action${failed === 1 ? '' : 's'} needed`);

  lines.push(`  ${bold('Result:')} ${parts.join(', ')}`);
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

import fs from 'node:fs';

const WAL_CHECKPOINT_BYTES = 32 * 1024 * 1024;  // 32MB
const DB_WARN_BYTES = 512 * 1024 * 1024;         // 512MB

function runIndexChecks(vectorIndex, report) {
  const db = vectorIndex?.db;
  if (!db) return;

  try {
    const walPath = `${vectorIndex.dbPath}-wal`;
    let walSize = 0;
    try { walSize = fs.statSync(walPath).size; } catch { /* no WAL file yet */ }
    if (walSize > WAL_CHECKPOINT_BYTES) {
      db.exec('PRAGMA wal_checkpoint(PASSIVE)');
      report.actions.push(`wal_checkpoint(${Math.round(walSize / 1024 / 1024)}MB)`);
    }
  } catch (err) {
    report.warnings.push(`wal_checkpoint: ${err?.message || err}`);
  }

  try {
    const row = db.prepare('PRAGMA quick_check').get();
    if (row?.quick_check !== 'ok') {
      report.issues.push('index_db_integrity');
      report.warnings.push(`quick_check: ${row?.quick_check}`);
    }
  } catch (err) {
    report.issues.push('index_db_integrity');
    report.warnings.push(`quick_check failed: ${err?.message || err}`);
  }

  try {
    const result = db.prepare(
      'DELETE FROM chunks WHERE file_path NOT IN (SELECT path FROM files)'
    ).run();
    if (result.changes > 0) {
      report.actions.push(`orphan_chunks(${result.changes})`);
    }
  } catch (err) {
    report.warnings.push(`orphan_chunks: ${err?.message || err}`);
  }

  try {
    const result = db.prepare('DELETE FROM term_df WHERE df = 0').run();
    if (result.changes > 0) {
      report.actions.push(`term_df_prune(${result.changes})`);
    }
  } catch (err) {
    report.warnings.push(`term_df_prune: ${err?.message || err}`);
  }

  try {
    const stat = fs.statSync(vectorIndex.dbPath);
    if (stat.size > DB_WARN_BYTES) {
      report.warnings.push(`index_db_large(${Math.round(stat.size / 1024 / 1024)}MB)`);
    }
  } catch { /* db may not be on disk yet */ }
}

function runMemoryChecks(memory, report) {
  const db = memory?.store?.adapter?.db;
  if (!db) return;

  try {
    const row = db.prepare('PRAGMA quick_check').get();
    if (row?.quick_check !== 'ok') {
      report.issues.push('memory_db_integrity');
      report.warnings.push(`memory quick_check: ${row?.quick_check}`);
    }
  } catch (err) {
    report.issues.push('memory_db_integrity');
    report.warnings.push(`memory quick_check: ${err?.message || err}`);
  }

  // Prune ignored events older than 30 days — these were never promoted so have no long-term value.
  try {
    const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const r = db.prepare(
      "DELETE FROM memory_events WHERE status = 'ignored' AND created_at < ?"
    ).run(cutoff30);
    if (r.changes > 0) report.actions.push(`ignored_events_pruned(${r.changes})`);
  } catch (err) {
    report.warnings.push(`ignored_event_prune: ${err?.message || err}`);
  }

  // Prune all events older than 365 days — promoted memories are already in memory_entries.
  try {
    const cutoff365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const r = db.prepare('DELETE FROM memory_events WHERE created_at < ?').run(cutoff365);
    if (r.changes > 0) report.actions.push(`old_events_pruned(${r.changes})`);
  } catch (err) {
    report.warnings.push(`old_event_prune: ${err?.message || err}`);
  }

  // Cap revision history to 50 per memory entry — window functions require SQLite 3.25+
  // which is guaranteed by node:sqlite (Node 22+).
  try {
    const r = db.prepare(`
      DELETE FROM memory_revisions
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY memory_id ORDER BY revision DESC) AS rn
          FROM memory_revisions
        ) WHERE rn > 50
      )
    `).run();
    if (r.changes > 0) report.actions.push(`old_revisions_pruned(${r.changes})`);
  } catch (err) {
    report.warnings.push(`revision_prune: ${err?.message || err}`);
  }
}

export function startHealthMonitor(
  vectorIndex,
  memory,
  intervalMinutes,
  log = process.stderr.write.bind(process.stderr)
) {
  let lastReport = null;

  if (!intervalMinutes || intervalMinutes <= 0) {
    return { timer: null, getLastReport: () => lastReport };
  }

  let running = false;
  const intervalMs = intervalMinutes * 60 * 1000;

  const timer = setInterval(() => {
    if (running) return;
    running = true;

    const report = {
      checked_at: new Date().toISOString(),
      issues: [],
      warnings: [],
      actions: [],
      ok: true
    };

    try {
      runIndexChecks(vectorIndex, report);
      runMemoryChecks(memory, report);
      report.ok = report.issues.length === 0;

      if (report.actions.length > 0 || report.issues.length > 0) {
        log(
          `[localnest-health] ${report.ok ? 'ok' : 'degraded'}` +
          (report.issues.length ? ` issues=[${report.issues.join(',')}]` : '') +
          (report.actions.length ? ` actions=[${report.actions.join(',')}]` : '') +
          '\n'
        );
      }
    } catch (err) {
      report.issues.push('monitor_error');
      report.warnings.push(err?.message || String(err));
      report.ok = false;
      log(`[localnest-health] error: ${err?.message || err}\n`);
    } finally {
      running = false;
      lastReport = report;
    }
  }, intervalMs);

  timer.unref();
  return { timer, getLastReport: () => lastReport };
}

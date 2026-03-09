export function startStalenessMonitor(vectorIndex, intervalMinutes, log = process.stderr.write.bind(process.stderr)) {
  if (!intervalMinutes || intervalMinutes <= 0) return null;

  const intervalMs = intervalMinutes * 60 * 1000;
  let running = false;

  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const staleness = vectorIndex.checkStaleness();
      if (!staleness.stale) return;
      log(
        `[localnest-sweep] index stale (${staleness.stale_count}/${staleness.total_indexed} files changed) — re-indexing\n`
      );
      await vectorIndex.indexProject({ allRoots: true, force: false });
    } catch (err) {
      log(`[localnest-sweep] error: ${err?.message || err}\n`);
    } finally {
      running = false;
    }
  }, intervalMs);

  timer.unref();
  return timer;
}

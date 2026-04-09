import {
  nowIso,
  clampInt,
  splitTerms,
  scoreTokenOverlap,
  textContainsAllTerms,
  normalizeRecallScore,
  scoreScopeMatch,
  deserializeEntry
} from '../utils.js';
import type { Adapter, MemoryEntryRow, RecallInput, RecallResult, RecallResultItem, MemoryEntry } from '../types.js';

export async function recall(adapter: Adapter, {
  query,
  projectPath,
  topic,
  feature,
  branchName,
  rootPath,
  kind,
  nest,
  branch,
  agentId,
  limit = 10
}: RecallInput): Promise<RecallResult> {
  const safeLimit = clampInt(limit, 10, 1, 50);
  const filters: string[] = ['status = ?'];
  const params: unknown[] = ['active'];

  if (agentId) {
    // Agent sees own memories + global memories (agent_id = '')
    filters.push("(agent_id = ? OR agent_id = '')");
    params.push(agentId);
  } else {
    // No agent specified -- only show global memories
    filters.push("agent_id = ''");
  }

  if (projectPath) {
    filters.push('(scope_project_path = ? OR scope_project_path = \'\')');
    params.push(projectPath);
  }
  if (topic) {
    filters.push('(topic = ? OR topic = \'\')');
    params.push(topic);
  }
  if (kind) {
    filters.push('kind = ?');
    params.push(kind);
  }
  if (nest) {
    filters.push('nest = ?');
    params.push(nest);
  }
  if (branch) {
    filters.push('branch = ?');
    params.push(branch);
  }

  const rows = await adapter.all<MemoryEntryRow>(
    `SELECT *
       FROM memory_entries
      WHERE ${filters.join(' AND ')}
      ORDER BY importance DESC, updated_at DESC
      LIMIT 500`,
    params
  );

  const terms = splitTerms(query);
  const ranked: Array<{ score: number; entry: MemoryEntry }> = rows
    .map((row) => {
      const searchTerms: string[] = JSON.parse(row.search_terms_json || '[]');
      const haystack = [
        row.title,
        row.summary,
        row.content,
        row.topic,
        row.feature,
        row.tags_json
      ].join('\n').toLowerCase();

      let score = row.importance / 100;
      score += scoreTokenOverlap(terms, searchTerms) * 6;
      for (const term of terms) {
        if (row.title.toLowerCase().includes(term)) score += 5;
        if (row.summary.toLowerCase().includes(term)) score += 3;
        if (row.content.toLowerCase().includes(term)) score += 1.5;
        if (haystack.includes(term)) score += 1;
      }
      if (terms.length > 1 && textContainsAllTerms(`${row.title} ${row.summary}`, terms)) score += 3;
      score += scoreScopeMatch(row, {
        root_path: rootPath,
        project_path: projectPath,
        branch_name: branchName,
        topic,
        feature,
        nest,
        branch
      });
      if (row.last_recalled_at) score += Math.min(row.recall_count || 0, 5) * 0.1;
      if (row.kind === 'preference') score += 0.25;

      return {
        score,
        entry: deserializeEntry(row)
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, safeLimit);

  const recalledAt = nowIso();
  if (ranked.length > 0) {
    const ids = ranked.map((item) => item.entry.id);
    const placeholders = ids.map(() => '?').join(', ');
    await adapter.run(
      `UPDATE memory_entries
          SET last_recalled_at = ?, recall_count = recall_count + 1
        WHERE id IN (${placeholders})`,
      [recalledAt, ...ids]
    );
    for (const item of ranked) {
      item.entry.last_recalled_at = recalledAt;
      item.entry.recall_count += 1;
    }
  }

  return {
    query,
    count: ranked.length,
    items: ranked.map((item): RecallResultItem => ({
      score: Number(normalizeRecallScore(item.score).toFixed(3)),
      raw_score: Number(item.score.toFixed(3)),
      memory: item.entry
    }))
  };
}

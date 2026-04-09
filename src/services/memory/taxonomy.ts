import type { Adapter, NestListItem, BranchListItem, TaxonomyNest, TaxonomyTree } from './types.js';

export async function listNests(adapter: Adapter): Promise<{ nests: NestListItem[] }> {
  const rows = await adapter.all<NestListItem>(
    `SELECT nest, COUNT(*) AS count
       FROM memory_entries
      WHERE status = 'active' AND nest != ''
      GROUP BY nest
      ORDER BY count DESC, nest ASC`
  );
  return {
    nests: rows.map(r => ({ nest: r.nest, count: r.count }))
  };
}

export async function listBranches(adapter: Adapter, nest: string): Promise<{ nest: string; branches: BranchListItem[] }> {
  if (!nest) throw new Error('nest parameter is required');
  const rows = await adapter.all<BranchListItem>(
    `SELECT branch, COUNT(*) AS count
       FROM memory_entries
      WHERE status = 'active' AND nest = ? AND branch != ''
      GROUP BY branch
      ORDER BY count DESC, branch ASC`,
    [nest]
  );
  return {
    nest,
    branches: rows.map(r => ({ branch: r.branch, count: r.count }))
  };
}

interface TaxonomyRow {
  nest: string;
  branch: string;
  count: number;
}

export async function getTaxonomyTree(adapter: Adapter): Promise<TaxonomyTree> {
  const rows = await adapter.all<TaxonomyRow>(
    `SELECT nest, branch, COUNT(*) AS count
       FROM memory_entries
      WHERE status = 'active' AND nest != ''
      GROUP BY nest, branch
      ORDER BY nest ASC, count DESC, branch ASC`
  );

  const nestMap = new Map<string, TaxonomyNest>();
  for (const row of rows) {
    if (!nestMap.has(row.nest)) {
      nestMap.set(row.nest, { nest: row.nest, count: 0, branches: [] });
    }
    const entry = nestMap.get(row.nest)!;
    entry.count += row.count;
    if (row.branch && row.branch !== '') {
      entry.branches.push({ branch: row.branch, count: row.count });
    }
  }

  const nests = Array.from(nestMap.values());
  return {
    total_nests: nests.length,
    total_branches: nests.reduce((sum, n) => sum + n.branches.length, 0),
    total_memories: nests.reduce((sum, n) => sum + n.count, 0),
    nests
  };
}

import { z } from 'zod';
import { READ_ONLY_ANNOTATIONS } from '../common/tool-utils.js';
import type { RegisterJsonToolFn } from '../common/tool-utils.js';
import { unifiedFind } from '../../services/unified-find/find.js';

interface MemoryServiceForFind {
  recall(args: Record<string, unknown>): Promise<unknown>;
  searchTriples(args: Record<string, unknown>): Promise<unknown>;
}

interface SearchServiceForFind {
  searchHybrid(opts: Record<string, unknown>): Promise<unknown>;
}

export interface RegisterFindToolsOptions {
  registerJsonTool: RegisterJsonToolFn;
  memory?: MemoryServiceForFind | null;
  search?: SearchServiceForFind | null;
}

export function registerFindTools({
  registerJsonTool,
  memory,
  search
}: RegisterFindToolsOptions): void {
  registerJsonTool(
    'localnest_find',
    {
      title: 'Unified Find',
      description:
        'Search across memory entries, code chunks, and knowledge graph triples in a single call. ' +
        'Results are re-ranked across all sources using normalized scores. Each item includes a ' +
        'source field ("memory", "code", or "triple"). Use the sources parameter to limit which ' +
        'backends are queried.',
      inputSchema: {
        query: z.string().min(1).max(2000),
        limit: z.number().int().min(1).max(50).default(10),
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        sources: z
          .array(z.enum(['memory', 'code', 'triple']))
          .min(1)
          .default(['memory', 'code', 'triple'])
      },
      annotations: READ_ONLY_ANNOTATIONS
    },
    async ({
      query,
      limit,
      project_path,
      all_roots,
      sources
    }: Record<string, unknown>) =>
      unifiedFind(
        {
          query: query as string,
          limit: limit as number,
          projectPath: project_path as string | undefined,
          allRoots: all_roots as boolean | undefined,
          sources: sources as Array<'memory' | 'code' | 'triple'> | undefined
        },
        {
          memory: memory as any,
          search: search as any
        }
      )
  );
}

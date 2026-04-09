import { z } from 'zod';
import { createToolResponse } from '../common/tool-utils.js';
import type { ToolResponsePayload, RegisterJsonToolFn, PaginatedResult } from '../common/tool-utils.js';
import {
  normalizeEmbedStatus,
  normalizeIndexStatus,
  normalizeIndexProjectResult,
  normalizeProjectSummaryResult,
  normalizeProjectTreeResult,
  normalizeReadFileChunkResult,
  normalizeSearchHybridResult,
  normalizeSymbolResult,
  normalizeUsageResult
} from '../common/response-normalizers.js';
import type { RootEntry } from '../../runtime/config.js';

interface WorkspaceService {
  listRoots(): RootEntry[];
  listProjects(rootPath: string | undefined, max: number): unknown[];
  projectTree(projectPath: string, maxDepth: number, maxEntries: number): unknown;
  readFileChunk(filePath: string, startLine: number, endLine: number, maxWidth: number): Promise<unknown>;
  summarizeProject(projectPath: string, maxFiles: number): unknown;
  resolveSearchBases(projectPath: string | undefined, allRoots: boolean | undefined): string[];
}

interface VectorIndexService {
  getStatus(): unknown;
  indexProject(opts: Record<string, unknown>): Promise<unknown>;
}

interface SearchService {
  searchFiles(opts: Record<string, unknown>): unknown[];
  searchCode(opts: Record<string, unknown>): unknown[];
  searchHybrid(opts: Record<string, unknown>): Promise<unknown>;
  getSymbol(opts: Record<string, unknown>): unknown;
  findUsages(opts: Record<string, unknown>): unknown;
}

interface McpExtra {
  _meta?: { progressToken?: unknown };
  sendNotification?(notification: { method: string; params: Record<string, unknown> }): Promise<void>;
}

export interface RegisterRetrievalToolsOptions {
  registerJsonTool: RegisterJsonToolFn;
  paginateItems: <T>(items: T[], limit: number | undefined, offset: number | undefined) => PaginatedResult<T>;
  workspace: WorkspaceService;
  vectorIndex: VectorIndexService;
  search: SearchService;
  defaultMaxReadLines: number;
  defaultMaxResults: number;
}

export function registerRetrievalTools({
  registerJsonTool,
  paginateItems,
  workspace,
  vectorIndex,
  search,
  defaultMaxReadLines,
  defaultMaxResults
}: RegisterRetrievalToolsOptions): void {
  async function emitProgress(extra: unknown, progress: number, total: number, message: string): Promise<void> {
    const mcpExtra = extra as McpExtra | undefined;
    const token = mcpExtra?._meta?.progressToken;
    if (token === undefined || typeof mcpExtra?.sendNotification !== 'function') return;
    await mcpExtra.sendNotification({
      method: 'notifications/progress',
      params: {
        progressToken: token,
        progress,
        total,
        message
      }
    });
  }

  function buildSearchMeta({ tool, query, project_path, all_roots, glob = '*', max_results, case_sensitive, context_lines = 0, use_regex = false }: {
    tool: string; query: string; project_path?: unknown; all_roots?: unknown; glob?: string;
    max_results?: unknown; case_sensitive?: unknown; context_lines?: number; use_regex?: boolean;
  }): Record<string, unknown> {
    const searched_bases = workspace.resolveSearchBases(project_path as string | undefined, all_roots as boolean | undefined);
    return {
      tool,
      query,
      count: 0,
      scope: {
        project_path: project_path || '',
        all_roots: Boolean(all_roots),
        glob,
        max_results,
        case_sensitive: Boolean(case_sensitive),
        context_lines,
        use_regex: Boolean(use_regex),
        searched_bases
      }
    };
  }

  function withSearchMissResponse(
    data: unknown,
    meta: Record<string, unknown>,
    note: string,
    guidance: string[],
    recommendedNextAction: string
  ): ToolResponsePayload {
    return createToolResponse(data, {
      meta: {
        ...meta,
        guidance,
        recommended_next_action: recommendedNextAction
      },
      note: `${note} ${guidance.join(' ')} Next: ${recommendedNextAction}`
    });
  }

  registerJsonTool(
    'localnest_list_roots',
    {
      title: 'List Roots',
      description: 'List configured local roots available to this MCP server.',
      inputSchema: {
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ limit, offset }: Record<string, unknown>) => paginateItems(workspace.listRoots(), limit as number, offset as number)
  );

  registerJsonTool(
    'localnest_list_projects',
    {
      title: 'List Projects',
      description: 'List first-level project directories under a root.',
      inputSchema: {
        root_path: z.string().optional(),
        max_entries: z.number().int().min(1).max(1000).optional(),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ root_path, max_entries, limit, offset }: Record<string, unknown>) => {
      const effectiveLimit = (max_entries || limit) as number;
      const projects = workspace.listProjects(root_path as string | undefined, 2000);
      const paged = paginateItems(projects, effectiveLimit, offset as number);
      return {
        ...paged,
        truncated_total: projects.length === 2000
      };
    }
  );

  registerJsonTool(
    'localnest_project_tree',
    {
      title: 'Project Tree',
      description: 'Return a compact tree of files/directories for a project path.',
      inputSchema: {
        project_path: z.string(),
        max_depth: z.number().int().min(1).max(8).default(3),
        max_entries: z.number().int().min(1).max(10000).default(1500)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ project_path, max_depth, max_entries }: Record<string, unknown>) => normalizeProjectTreeResult(
      workspace.projectTree(project_path as string, max_depth as number, max_entries as number),
      project_path as string
    )
  );

  registerJsonTool(
    'localnest_index_status',
    {
      title: 'Index Status',
      description: 'Return local semantic index status and metadata.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => normalizeIndexStatus(vectorIndex.getStatus())
  );

  registerJsonTool(
    'localnest_embed_status',
    {
      title: 'Embedding Status',
      description: 'Return active embedding backend/model status and vector-search readiness.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => {
      const status = vectorIndex.getStatus();
      return normalizeEmbedStatus(status);
    }
  );

  registerJsonTool(
    'localnest_index_project',
    {
      title: 'Index Project',
      description: 'Build or refresh semantic index for a project or across all roots.',
      inputSchema: {
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        force: z.boolean().default(false),
        max_files: z.number().int().min(1).max(200000).default(20000)
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ project_path, all_roots, force, max_files }: Record<string, unknown>, extra: unknown) => {
      const maxFilesNum = max_files as number;
      await emitProgress(extra, 0, maxFilesNum, 'index_project started');
      const out = await vectorIndex.indexProject({
        projectPath: project_path,
        allRoots: all_roots,
        force,
        maxFiles: maxFilesNum,
        onProgress: async ({ scanned = 0, total = maxFilesNum, phase = 'indexing' }: { scanned?: number; total?: number; phase?: string }) => {
          await emitProgress(extra, scanned, total, phase);
        }
      }) as Record<string, unknown>;
      await emitProgress(
        extra,
        (out.scanned_files || out.total_files || maxFilesNum) as number,
        (out.scanned_files || out.total_files || maxFilesNum) as number,
        'index_project completed'
      );
      return normalizeIndexProjectResult(out, maxFilesNum);
    }
  );

  registerJsonTool(
    'localnest_search_files',
    {
      title: 'Search Files',
      description: 'Search file paths and names matching a query. Use this first when looking for a module, feature, or component by name (e.g. "sso", "payment", "auth"). Much faster than content search for module discovery, and handles cases where the keyword only appears in file/directory names.',
      inputSchema: {
        query: z.string().min(1),
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        max_results: z.number().int().min(1).max(1000).default(defaultMaxResults),
        case_sensitive: z.boolean().default(false)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ query, project_path, all_roots, max_results, case_sensitive }: Record<string, unknown>) => {
      const results = search.searchFiles({
        query,
        projectPath: project_path,
        allRoots: all_roots,
        maxResults: max_results,
        caseSensitive: case_sensitive
      });
      if (results.length > 0) return results;

      return withSearchMissResponse(
        results,
        buildSearchMeta({
          tool: 'localnest_search_files',
          query: query as string,
          project_path,
          all_roots,
          max_results: max_results as number,
          case_sensitive
        }),
        'No file-path matches found.',
        [
          'Verify project_path or broaden the query to a path fragment.',
          'Try synonyms or module names instead of full phrases.'
        ],
        'Retry localnest_search_files with a broader path fragment or switch to localnest_search_code for an exact symbol.'
      );
    }
  );

  registerJsonTool(
    'localnest_search_code',
    {
      title: 'Search Code',
      description: 'Search text across files under a project/root and return matching lines. Best for exact symbol names, imports, or known identifiers. Use use_regex=true for patterns (e.g. "async\\s+function\\s+get\\w+"). Use context_lines to include surrounding lines with each match.',
      inputSchema: {
        query: z.string().min(1),
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        glob: z.string().default('*'),
        max_results: z.number().int().min(1).max(1000).default(defaultMaxResults),
        case_sensitive: z.boolean().default(false),
        context_lines: z.number().int().min(0).max(10).default(0),
        use_regex: z.boolean().default(false)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ query, project_path, all_roots, glob, max_results, case_sensitive, context_lines, use_regex }: Record<string, unknown>) => {
      const results = search.searchCode({
        query,
        projectPath: project_path,
        allRoots: all_roots,
        glob,
        maxResults: max_results,
        caseSensitive: case_sensitive,
        contextLines: context_lines,
        useRegex: use_regex
      });
      if (results.length > 0) return results;

      return withSearchMissResponse(
        results,
        buildSearchMeta({
          tool: 'localnest_search_code',
          query: query as string,
          project_path,
          all_roots,
          glob: glob as string,
          max_results: max_results as number,
          case_sensitive,
          context_lines: context_lines as number,
          use_regex: use_regex as boolean
        }),
        'No code matches found in the current scope.',
        [
          'Verify the scope and try a broader query or synonyms.',
          'If you need pattern matching, retry with use_regex=true.'
        ],
        'Retry localnest_search_code with a broader query or use_regex=true, or switch to localnest_search_hybrid for concept lookup.'
      );
    }
  );

  registerJsonTool(
    'localnest_search_hybrid',
    {
      title: 'Search Hybrid',
      description: 'Run lexical + semantic retrieval and return RRF-ranked results.',
      inputSchema: {
        query: z.string().min(1),
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        glob: z.string().default('*'),
        max_results: z.number().int().min(1).max(1000).default(defaultMaxResults),
        case_sensitive: z.boolean().default(false),
        min_semantic_score: z.number().min(0).max(1).default(0.05),
        auto_index: z.boolean().default(true),
        use_reranker: z.boolean().default(false)
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ query, project_path, all_roots, glob, max_results, case_sensitive, min_semantic_score, auto_index, use_reranker }: Record<string, unknown>) => normalizeSearchHybridResult(
      await search.searchHybrid({
        query,
        projectPath: project_path,
        allRoots: all_roots,
        glob,
        maxResults: max_results,
        caseSensitive: case_sensitive,
        minSemanticScore: min_semantic_score,
        autoIndex: auto_index,
        useReranker: use_reranker
      }),
      query as string
    )
  );

  registerJsonTool(
    'localnest_get_symbol',
    {
      title: 'Get Symbol',
      description: 'Look up symbol definitions/exports by name using fast regex search.',
      inputSchema: {
        symbol: z.string().min(1),
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        glob: z.string().default('*'),
        max_results: z.number().int().min(1).max(1000).default(defaultMaxResults),
        case_sensitive: z.boolean().default(false)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ symbol, project_path, all_roots, glob, max_results, case_sensitive }: Record<string, unknown>) => normalizeSymbolResult(
      search.getSymbol({
        symbol,
        projectPath: project_path,
        allRoots: all_roots,
        glob,
        maxResults: max_results,
        caseSensitive: case_sensitive
      }),
      symbol as string
    )
  );

  registerJsonTool(
    'localnest_find_usages',
    {
      title: 'Find Usages',
      description: 'Find call sites and import usages of a symbol by name.',
      inputSchema: {
        symbol: z.string().min(1),
        project_path: z.string().optional(),
        all_roots: z.boolean().default(false),
        glob: z.string().default('*'),
        max_results: z.number().int().min(1).max(1000).default(defaultMaxResults),
        case_sensitive: z.boolean().default(false),
        context_lines: z.number().int().min(0).max(10).default(0)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ symbol, project_path, all_roots, glob, max_results, case_sensitive, context_lines }: Record<string, unknown>) => normalizeUsageResult(
      search.findUsages({
        symbol,
        projectPath: project_path,
        allRoots: all_roots,
        glob,
        maxResults: max_results,
        caseSensitive: case_sensitive,
        contextLines: context_lines
      }),
      symbol as string
    )
  );

  registerJsonTool(
    'localnest_read_file',
    {
      title: 'Read File',
      description: 'Read a bounded chunk of a file with line numbers.',
      inputSchema: {
        path: z.string(),
        start_line: z.number().int().min(1).default(1),
        end_line: z.number().int().min(1).default(defaultMaxReadLines)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ path: filePath, start_line, end_line }: Record<string, unknown>) => normalizeReadFileChunkResult(
      await workspace.readFileChunk(filePath as string, start_line as number, end_line as number, 800),
      filePath as string,
      start_line as number,
      end_line as number
    )
  );

  registerJsonTool(
    'localnest_summarize_project',
    {
      title: 'Summarize Project',
      description: 'Return a high-level summary of a project directory.',
      inputSchema: {
        project_path: z.string(),
        max_files: z.number().int().min(100).max(20000).default(3000)
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ project_path, max_files }: Record<string, unknown>) => normalizeProjectSummaryResult(
      workspace.summarizeProject(project_path as string, max_files as number),
      project_path as string
    )
  );
}

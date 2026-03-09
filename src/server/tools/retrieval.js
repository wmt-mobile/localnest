import { z } from 'zod';
import { createToolResponse } from '../common/tool-utils.js';
import {
  normalizeEmbedStatus,
  normalizeIndexStatus,
  normalizeIndexProjectResult
  ,
  normalizeProjectSummaryResult,
  normalizeProjectTreeResult,
  normalizeReadFileChunkResult,
  normalizeSearchHybridResult,
  normalizeSymbolResult,
  normalizeUsageResult
} from '../common/response-normalizers.js';

export function registerRetrievalTools({
  registerJsonTool,
  paginateItems,
  workspace,
  vectorIndex,
  search,
  defaultMaxReadLines,
  defaultMaxResults
}) {
  async function emitProgress(extra, progress, total, message) {
    const token = extra?._meta?.progressToken;
    if (token === undefined || typeof extra?.sendNotification !== 'function') return;
    await extra.sendNotification({
      method: 'notifications/progress',
      params: {
        progressToken: token,
        progress,
        total,
        message
      }
    });
  }

  function buildSearchMeta({ tool, query, project_path, all_roots, glob = '*', max_results, case_sensitive, context_lines = 0, use_regex = false }) {
    const searched_bases = workspace.resolveSearchBases(project_path, all_roots);
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

  function withSearchMissResponse(data, meta, note, guidance) {
    return createToolResponse(data, {
      meta: {
        ...meta,
        guidance
      },
      note: `${note} ${guidance.join(' ')}`
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
    async ({ limit, offset }) => paginateItems(workspace.listRoots(), limit, offset)
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
    async ({ root_path, max_entries, limit, offset }) => {
      const effectiveLimit = max_entries || limit;
      const projects = workspace.listProjects(root_path, 2000);
      const paged = paginateItems(projects, effectiveLimit, offset);
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
    async ({ project_path, max_depth, max_entries }) => normalizeProjectTreeResult(
      workspace.projectTree(project_path, max_depth, max_entries),
      project_path
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
    async ({ project_path, all_roots, force, max_files }, extra) => {
      await emitProgress(extra, 0, max_files, 'index_project started');
      const out = await vectorIndex.indexProject({
        projectPath: project_path,
        allRoots: all_roots,
        force,
        maxFiles: max_files,
        onProgress: async ({ scanned = 0, total = max_files, phase = 'indexing' }) => {
          await emitProgress(extra, scanned, total, phase);
        }
      });
      await emitProgress(
        extra,
        out.scanned_files || out.total_files || max_files,
        out.scanned_files || out.total_files || max_files,
        'index_project completed'
      );
      return normalizeIndexProjectResult(out, max_files);
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
    async ({ query, project_path, all_roots, max_results, case_sensitive }) => {
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
          query,
          project_path,
          all_roots,
          max_results,
          case_sensitive
        }),
        'No file-path matches found.',
        [
          'Verify project_path or broaden the query to a path fragment.',
          'Try synonyms or module names instead of full phrases.'
        ]
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
    async ({ query, project_path, all_roots, glob, max_results, case_sensitive, context_lines, use_regex }) => {
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
          query,
          project_path,
          all_roots,
          glob,
          max_results,
          case_sensitive,
          context_lines,
          use_regex
        }),
        'No code matches found in the current scope.',
        [
          'Verify the scope and try a broader query or synonyms.',
          'If you need pattern matching, retry with use_regex=true.'
        ]
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
    async ({ query, project_path, all_roots, glob, max_results, case_sensitive, min_semantic_score, auto_index, use_reranker }) => normalizeSearchHybridResult(
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
      query
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
    async ({ symbol, project_path, all_roots, glob, max_results, case_sensitive }) => normalizeSymbolResult(
      search.getSymbol({
        symbol,
        projectPath: project_path,
        allRoots: all_roots,
        glob,
        maxResults: max_results,
        caseSensitive: case_sensitive
      }),
      symbol
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
    async ({ symbol, project_path, all_roots, glob, max_results, case_sensitive, context_lines }) => normalizeUsageResult(
      search.findUsages({
        symbol,
        projectPath: project_path,
        allRoots: all_roots,
        glob,
        maxResults: max_results,
        caseSensitive: case_sensitive,
        contextLines: context_lines
      }),
      symbol
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
    async ({ path, start_line, end_line }) => normalizeReadFileChunkResult(
      await workspace.readFileChunk(path, start_line, end_line, 800),
      path,
      start_line,
      end_line
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
    async ({ project_path, max_files }) => normalizeProjectSummaryResult(
      workspace.summarizeProject(project_path, max_files),
      project_path
    )
  );
}

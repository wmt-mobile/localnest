/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripEmptyFields } from '../terse-utils.js';

export interface NormalizedProjectTreeResult {
  project_path: string;
  entries: unknown[];
  [key: string]: unknown;
}

export function normalizeProjectTreeResult(result: any, projectPath: string): NormalizedProjectTreeResult {
  const entries = Array.isArray(result)
    ? result
    : (Array.isArray(result?.entries) ? result.entries : []);

  return {
    ...result,
    project_path: result?.project_path || projectPath,
    entries
  };
}

export interface IndexWarning {
  stale: boolean;
  stale_files: number;
  suggestion: string;
}

export interface NormalizedSearchHybridResult {
  query: string;
  lexical_hits: number;
  semantic_hits: number;
  ranking_mode: string;
  auto_index: unknown;
  reranker: unknown;
  index_stale: boolean | null;
  index_staleness: unknown;
  _index_warning?: IndexWarning;
  results: unknown[];
  [key: string]: unknown;
}

export function normalizeSearchHybridResult(result: any, query: string): NormalizedSearchHybridResult {
  const results = Array.isArray(result?.results) ? result.results.map(stripEmptyFields) : [];
  const isStale = result?.index_stale === true;
  const staleness = result?.index_staleness;
  const normalized: NormalizedSearchHybridResult = {
    ...result,
    query: result?.query || query,
    lexical_hits: Number.isFinite(result?.lexical_hits) ? result.lexical_hits : 0,
    semantic_hits: Number.isFinite(result?.semantic_hits) ? result.semantic_hits : 0,
    ranking_mode: result?.ranking_mode || 'hybrid',
    auto_index: result?.auto_index || null,
    reranker: result?.reranker || null,
    index_stale: result?.index_stale ?? null,
    index_staleness: staleness || null,
    results
  };
  if (isStale) {
    normalized._index_warning = {
      stale: true,
      stale_files: Number.isFinite(staleness?.stale_count) ? staleness.stale_count : 0,
      suggestion: 'Run localnest_index_project to refresh'
    };
  }
  return normalized;
}

export interface NormalizedSymbolResult {
  symbol: string;
  count: number;
  definitions: unknown[];
  exports: unknown[];
  [key: string]: unknown;
}

export function normalizeSymbolResult(result: any, symbol: string): NormalizedSymbolResult {
  return {
    ...result,
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    definitions: Array.isArray(result?.definitions) ? result.definitions : [],
    exports: Array.isArray(result?.exports) ? result.exports : []
  };
}

export interface NormalizedUsageResult {
  symbol: string;
  count: number;
  usages: unknown[];
  [key: string]: unknown;
}

export function normalizeUsageResult(result: any, symbol: string): NormalizedUsageResult {
  return {
    ...result,
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    usages: Array.isArray(result?.usages) ? result.usages : []
  };
}

export interface NormalizedReadFileChunkResult {
  path: string;
  start_line: number;
  end_line: number;
  lines: string[];
  [key: string]: unknown;
}

export function normalizeReadFileChunkResult(result: any, requestedPath: string, startLine: number, endLine: number): NormalizedReadFileChunkResult {
  const content = typeof result?.content === 'string' ? result.content : '';
  const lines: string[] = Array.isArray(result?.lines)
    ? result.lines
    : (content ? content.split(/\r?\n/).filter(Boolean) : []);

  return {
    ...result,
    path: result?.path || requestedPath,
    start_line: Number.isFinite(result?.start_line) ? result.start_line : startLine,
    end_line: Number.isFinite(result?.end_line) ? result.end_line : endLine,
    lines
  };
}

export interface NormalizedProjectSummaryResult {
  project_path: string;
  summary: string;
  [key: string]: unknown;
}

export function normalizeProjectSummaryResult(result: any, projectPath: string): NormalizedProjectSummaryResult {
  return {
    ...result,
    project_path: result?.project_path || projectPath,
    summary: result?.summary || ''
  };
}

export interface NormalizedAgentPrimeResult {
  task: string;
  memories: Array<{ id: string; title: string; summary: string; kind: string; score: number }>;
  entities: Array<{ id: string; name: string; type: string; predicates: string[] }>;
  files: Array<{ path: string; score: number }>;
  recent_changes: string;
  suggested_actions: string[];
}

export function normalizeAgentPrimeResult(result: any): NormalizedAgentPrimeResult {
  return {
    task: result?.task || '',
    memories: Array.isArray(result?.memories) ? result.memories : [],
    entities: Array.isArray(result?.entities) ? result.entities : [],
    files: Array.isArray(result?.files) ? result.files : [],
    recent_changes: result?.recent_changes || 'unavailable',
    suggested_actions: Array.isArray(result?.suggested_actions) ? result.suggested_actions : []
  };
}

export function normalizeCallersResult(result: any, symbol: string) {
  return {
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    callers: Array.isArray(result?.callers) ? result.callers : []
  };
}

export function normalizeDefinitionResult(result: any, symbol: string) {
  return {
    symbol: result?.symbol || symbol,
    count: Number.isFinite(result?.count) ? result.count : 0,
    definitions: Array.isArray(result?.definitions) ? result.definitions : []
  };
}

export function normalizeImplementationsResult(result: any, interfaceName: string) {
  return {
    symbol: result?.symbol || interfaceName,
    count: Number.isFinite(result?.count) ? result.count : 0,
    implementations: Array.isArray(result?.implementations) ? result.implementations : []
  };
}

export function normalizeRenamePreviewResult(result: any, oldName: string, newName: string) {
  return {
    old_name: result?.old_name || oldName,
    new_name: result?.new_name || newName,
    total_changes: Number.isFinite(result?.total_changes) ? result.total_changes : 0,
    files_affected: Number.isFinite(result?.files_affected) ? result.files_affected : 0,
    changes: Array.isArray(result?.changes) ? result.changes : []
  };
}

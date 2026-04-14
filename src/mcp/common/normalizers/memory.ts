/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripEmptyFields } from '../terse-utils.js';

export interface NormalizedMemoryRecallResult {
  query: string;
  count: number;
  items: unknown[];
  [key: string]: unknown;
}

export function normalizeMemoryRecallResult(result: any, query: string = ''): NormalizedMemoryRecallResult {
  const items = Array.isArray(result?.items) ? result.items.map(stripEmptyFields) : [];
  return {
    ...result,
    query: result?.query || query,
    count: Number.isFinite(result?.count) ? result.count : 0,
    items
  };
}

export interface NormalizedMemoryEntryPayload {
  id: string | null;
  kind: string | null;
  title: string | null;
  summary: string;
  content: string;
  status: string | null;
  importance: number | null;
  confidence: number | null;
  revisions: unknown[];
  memory: unknown;
  [key: string]: unknown;
}

export function normalizeMemoryEntryPayload(entry: any, extras: Record<string, unknown> = {}): NormalizedMemoryEntryPayload {
  if (!entry || typeof entry !== 'object') {
    return { ...extras, id: null, kind: null, title: null, summary: '', content: '', status: null, importance: null, confidence: null, revisions: [], memory: entry ?? null } as NormalizedMemoryEntryPayload;
  }

  const payload = {
    ...extras,
    id: entry.id ?? null,
    kind: entry.kind ?? null,
    title: entry.title ?? null,
    summary: entry.summary ?? '',
    content: entry.content ?? '',
    status: entry.status ?? null,
    importance: entry.importance ?? null,
    confidence: entry.confidence ?? null,
    revisions: Array.isArray(entry.revisions) ? entry.revisions : [],
    memory: entry
  };
  return stripEmptyFields(payload) as NormalizedMemoryEntryPayload;
}

export interface NormalizedDeleteResult {
  id: string | null;
  deleted: boolean;
}

export function normalizeDeleteResult(result: any, fallback: { id?: string } = {}): NormalizedDeleteResult {
  return {
    id: result?.id ?? fallback.id ?? null,
    deleted: Boolean(result?.deleted)
  };
}

export interface NormalizedMemoryEventsResult {
  count: number;
  items: unknown[];
  [key: string]: unknown;
}

export function normalizeMemoryEventsResult(result: any): NormalizedMemoryEventsResult {
  return {
    ...result,
    count: Number.isFinite(result?.count) ? result.count : 0,
    items: Array.isArray(result?.items) ? result.items : []
  };
}

export interface NormalizedMemorySuggestionResult {
  id: string;
  source_title: string | null;
  count: number;
  threshold: number;
  using_embeddings: boolean;
  suggestions: unknown[];
  [key: string]: unknown;
}

export function normalizeMemorySuggestionResult(result: any, id: string, threshold: number): NormalizedMemorySuggestionResult {
  return {
    ...result,
    id: result?.id ?? id,
    source_title: result?.source_title || null,
    count: Number.isFinite(result?.count) ? result.count : 0,
    threshold: result?.threshold ?? threshold,
    using_embeddings: Boolean(result?.using_embeddings),
    suggestions: Array.isArray(result?.suggestions) ? result.suggestions : []
  };
}

export interface NormalizedRelationResult {
  source_id: string;
  target_id: string;
  relation_type: string;
}

export function normalizeRelationResult(result: any, fallback: { source_id: string; target_id: string; relation_type: string }): NormalizedRelationResult {
  return {
    source_id: result?.source_id ?? fallback.source_id,
    target_id: result?.target_id ?? fallback.target_id,
    relation_type: result?.relation_type ?? fallback.relation_type
  };
}

export interface NormalizedRelationRemovalResult {
  removed: boolean;
  source_id: string;
  target_id: string;
}

export function normalizeRelationRemovalResult(result: any, fallback: { source_id: string; target_id: string }): NormalizedRelationRemovalResult {
  return {
    removed: Boolean(result?.removed),
    source_id: result?.source_id ?? fallback.source_id,
    target_id: result?.target_id ?? fallback.target_id
  };
}

export interface NormalizedRelatedMemoriesResult {
  id: string;
  count: number;
  related: unknown[];
  [key: string]: unknown;
}

export function normalizeRelatedMemoriesResult(result: any, id: string): NormalizedRelatedMemoriesResult {
  return {
    ...result,
    id: result?.id ?? id,
    count: Number.isFinite(result?.count) ? result.count : 0,
    related: Array.isArray(result?.related) ? result.related : []
  };
}

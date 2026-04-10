/**
 * Terse response utilities for Phase 27 (TERSE-01, TERSE-02, TERSE-03, TERSE-04).
 * Applied at the MCP tool handler layer, NOT in the service/store layer.
 */

// -----------------------------------------------------------------------
// Write-side: minimal responses
// -----------------------------------------------------------------------

interface MinimalWriteResponse {
  id: unknown;
  ok: boolean;
}

/**
 * When terse is 'minimal', reduce a full write result to {id, ok}.
 * When terse is 'verbose' or omitted, return the result unchanged.
 */
export function toMinimalWriteResponse(result: unknown, terse?: string): unknown {
  if (terse !== 'minimal') return result;

  const obj = (result && typeof result === 'object' ? result : {}) as Record<string, unknown>;

  // Extract id — try common id field names in priority order
  const id = obj.id ?? obj.event_id ?? obj.source_id ?? null;

  // Extract ok — try common boolean indicators
  let ok: boolean;
  if (typeof obj.ok === 'boolean') {
    ok = obj.ok;
  } else if (typeof obj.skipped === 'boolean') {
    ok = !obj.skipped;
  } else if (typeof obj.deleted === 'boolean') {
    ok = obj.deleted;
  } else if (typeof obj.removed === 'boolean') {
    ok = obj.removed;
  } else if (typeof obj.invalidated === 'boolean') {
    ok = obj.invalidated;
  } else if (typeof obj.captured === 'boolean') {
    ok = obj.captured;
  } else if (obj.created === false) {
    ok = false;
  } else {
    ok = true;
  }

  return { id, ok } as MinimalWriteResponse;
}

// -----------------------------------------------------------------------
// Read-side: strip empty fields and redundant scores (TERSE-03, TERSE-04)
// -----------------------------------------------------------------------

/** Fields that should be removed when they are empty strings. */
const STRIP_WHEN_EMPTY = ['nest', 'branch', 'topic', 'feature'] as const;

/** scope_* fields that duplicate non-prefixed equivalents. */
const SCOPE_DUPLICATES = ['scope_root_path', 'scope_project_path', 'scope_branch_name'] as const;

/**
 * Strip empty taxonomy fields, redundant scope_* prefixes, and raw_score
 * when score is present. Operates on a shallow copy — does not mutate input.
 *
 * Works on a single object (e.g. a MemoryEntry or RecallResultItem).
 * For arrays, call on each element.
 */
export function stripEmptyFields(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const src = obj as Record<string, unknown>;
  const out: Record<string, unknown> = { ...src };

  // TERSE-03: remove empty string taxonomy fields
  for (const key of STRIP_WHEN_EMPTY) {
    if (out[key] === '') delete out[key];
  }

  // TERSE-03: remove scope_* duplicates
  for (const key of SCOPE_DUPLICATES) {
    if (key in out) delete out[key];
  }

  // TERSE-04: remove raw_score when score is present
  if ('score' in out && 'raw_score' in out) {
    delete out.raw_score;
  }

  // Recurse into 'memory' field if present (RecallResultItem wraps MemoryEntry)
  if (out.memory && typeof out.memory === 'object' && !Array.isArray(out.memory)) {
    out.memory = stripEmptyFields(out.memory);
  }

  return out;
}

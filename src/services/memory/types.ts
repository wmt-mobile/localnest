/** Shared types for the LocalNest memory subsystem. */

// ---------------------------------------------------------------------------
// Database adapter
// ---------------------------------------------------------------------------

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint | null;
}

export interface Adapter {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: unknown[]): Promise<RunResult>;
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (ad: Adapter) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

export interface Scope {
  root_path: string;
  project_path: string;
  branch_name: string;
  topic: string;
  feature: string;
}

export interface ScopeInput {
  root_path?: string;
  rootPath?: string;
  project_path?: string;
  projectPath?: string;
  branch_name?: string;
  branchName?: string;
  topic?: string;
  feature?: string;
}

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

export interface Link {
  path: string;
  line: number | null;
  label: string;
}

// ---------------------------------------------------------------------------
// Memory entry (as stored / returned)
// ---------------------------------------------------------------------------

export interface MemoryEntry {
  id: string;
  kind: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  importance: number;
  confidence: number;
  scope_root_path: string;
  scope_project_path: string;
  scope_branch_name: string;
  topic: string;
  feature: string;
  nest: string;
  branch: string;
  agent_id: string;
  tags: string[];
  links: Link[];
  source_type: string;
  source_ref: string;
  created_at: string;
  updated_at: string;
  last_recalled_at: string | null;
  recall_count: number;
}

/** Raw DB row before JSON fields are parsed. */
export interface MemoryEntryRow {
  id: string;
  kind: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  importance: number;
  confidence: number;
  scope_root_path: string;
  scope_project_path: string;
  scope_branch_name: string;
  topic: string;
  feature: string;
  nest: string;
  branch: string;
  agent_id: string;
  tags_json: string;
  search_terms_json: string;
  links_json: string;
  source_type: string;
  source_ref: string;
  fingerprint: string;
  embedding_json: string | null;
  created_at: string;
  updated_at: string;
  last_recalled_at: string | null;
  recall_count: number;
}

export interface MemoryRevision {
  revision: number;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  links: Link[];
  change_note: string;
  created_at: string;
}

export interface MemoryRevisionRow {
  id?: number;
  memory_id: string;
  revision: number;
  title: string;
  summary: string;
  content: string;
  tags_json: string;
  links_json: string;
  change_note: string;
  created_at: string;
}

export interface MemoryEntryWithRevisions extends MemoryEntry {
  revisions: MemoryRevision[];
}

// ---------------------------------------------------------------------------
// Store input
// ---------------------------------------------------------------------------

export interface StoreEntryInput {
  kind?: string;
  title?: string;
  summary?: string;
  content: string;
  status?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  links?: Link[];
  scope?: ScopeInput;
  nest?: string;
  branch?: string;
  agent_id?: string;
  source_type?: string;
  sourceType?: string;
  source_ref?: string;
  sourceRef?: string;
  change_note?: string;
  dedup_threshold?: number;
  event_type?: string;
  memory_status?: string;
}

export interface StoreEntryResult {
  created: boolean;
  duplicate: boolean;
  semantic_match?: DuplicateMatch;
  memory: MemoryEntryWithRevisions | null;
  cancelled?: boolean;
  reason?: string;
}

export interface UpdateEntryPatch {
  kind?: string;
  title?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  links?: Link[];
  scope?: ScopeInput;
  nest?: string;
  branch?: string;
  source_type?: string;
  source_ref?: string;
  change_note?: string;
}

export interface DeleteEntryResult {
  deleted: boolean;
  id: string;
}

// ---------------------------------------------------------------------------
// Dedup
// ---------------------------------------------------------------------------

export interface DuplicateMatch {
  id: string;
  title: string;
  similarity: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  match?: DuplicateMatch;
}

export interface DuplicateCheckOpts {
  threshold?: number;
  nest?: string;
  branch?: string;
  projectPath?: string;
}

// ---------------------------------------------------------------------------
// Embedding service (external dependency interface)
// ---------------------------------------------------------------------------

export interface EmbeddingService {
  isEnabled(): boolean;
  embed(text: string): Promise<number[]>;
}

// ---------------------------------------------------------------------------
// Memory events
// ---------------------------------------------------------------------------

export interface MemoryEvent {
  id: number;
  event_type: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  signal_score: number;
  promoted_memory_id: string | null;
  scope_root_path: string;
  scope_project_path: string;
  scope_branch_name: string;
  topic: string;
  feature: string;
  tags_json: string;
  links_json: string;
  source_ref: string;
  created_at: string;
}

export interface CaptureEventInput {
  event_type?: string;
  eventType?: string;
  title?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: number;
  confidence?: number;
  files_changed?: number;
  filesChanged?: number;
  has_tests?: boolean;
  hasTests?: boolean;
  tags?: string[];
  links?: Link[];
  scope?: ScopeInput;
  nest?: string;
  branch?: string;
  source_ref?: string;
  sourceRef?: string;
  kind?: string;
  memory_status?: string;
}

export interface CaptureEventResult {
  event_id: number | bigint | null;
  event_type: string;
  signal_score: number;
  promotion_threshold: number;
  status: string;
  promoted_memory_id: string | null;
}

export interface ListEventsResult {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset: number | null;
  items: EventListItem[];
}

export interface EventListItem {
  id: number;
  event_type: string;
  title: string;
  summary: string;
  status: string;
  signal_score: number;
  promoted_memory_id: string | null;
  scope_project_path: string;
  topic: string;
  feature: string;
  tags: string[];
  source_ref: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Knowledge graph
// ---------------------------------------------------------------------------

export interface KgEntity {
  id: string;
  name: string;
  entity_type: string;
  properties_json: string;
  memory_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface KgEntityWithRelations extends KgEntity {
  properties: Record<string, unknown>;
  outgoing: KgTriple[];
  incoming: KgTriple[];
}

export interface KgTriple {
  id: string;
  subject_id: string;
  predicate: string;
  object_id: string;
  valid_from: string | null;
  valid_to: string | null;
  confidence: number;
  source_memory_id: string | null;
  source_type: string;
  created_at: string;
}

export interface KgTripleWithNames extends KgTriple {
  subject_name: string;
  object_name: string;
}

export interface AddEntityInput {
  name: string;
  type?: string;
  properties?: Record<string, unknown>;
  memoryId?: string;
}

export interface AddEntityResult extends KgEntity {
  created: boolean;
}

export interface AddTripleInput {
  subjectId?: string;
  subjectName?: string;
  predicate: string;
  objectId?: string;
  objectName?: string;
  validFrom?: string;
  validTo?: string;
  confidence?: number;
  sourceMemoryId?: string;
  sourceType?: string;
}

export interface TripleContradiction {
  existing_triple_id: string;
  existing_object_id: string;
  existing_object_name: string;
}

export interface AddTripleResult {
  id: string;
  subject_id: string;
  predicate: string;
  object_id: string;
  valid_from: string | null;
  valid_to: string | null;
  confidence: number;
  source_memory_id: string | null;
  source_type: string;
  created_at: string;
  contradictions: TripleContradiction[];
  has_contradiction: boolean;
}

export interface InvalidateTripleResult {
  id: string;
  valid_to: string;
  invalidated: boolean;
}

export interface QueryRelationshipsResult {
  entity_id: string;
  direction: string;
  count: number;
  triples: KgTripleWithNames[];
}

export interface KgStats {
  entities: number;
  triples: number;
  active_triples: number;
  by_predicate: Array<{ predicate: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Graph traversal
// ---------------------------------------------------------------------------

export interface TraverseGraphOpts {
  startEntityId: string;
  maxHops?: number;
  direction?: 'outgoing' | 'incoming' | 'both';
}

export interface TraverseGraphResult {
  start_entity_id: string;
  max_hops: number;
  direction: string;
  discovered_count: number;
  entities: Array<{
    entity_id: string;
    name: string;
    entity_type: string;
    depth: number;
    path: string[];
  }>;
}

export interface DiscoverBridgesOpts {
  nest?: string;
}

export interface BridgeEntry {
  triple_id: string;
  subject_id: string;
  subject_name: string;
  predicate: string;
  object_id: string;
  object_name: string;
  subject_nest: string;
  object_nest: string;
}

export interface DiscoverBridgesResult {
  filter_nest: string | null;
  bridge_count: number;
  bridges: BridgeEntry[];
}

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export interface MemoryRelation {
  source_id: string;
  target_id: string;
  relation_type: string;
  created_at: string;
}

export interface RelationSuggestion {
  memory_id: string;
  title: string;
  similarity: number;
}

export interface SuggestRelationsResult {
  id: string;
  source_title: string;
  count: number;
  threshold: number;
  using_embeddings: boolean;
  suggestions: RelationSuggestion[];
}

export interface AddRelationResult {
  source_id: string;
  target_id: string;
  relation_type: string;
}

export interface RemoveRelationResult {
  removed: boolean;
  source_id: string;
  target_id: string;
}

export interface RelatedItem {
  relation_type: string;
  direction: string;
  memory: MemoryEntry;
}

export interface GetRelatedResult {
  id: string;
  count: number;
  related: RelatedItem[];
}

// ---------------------------------------------------------------------------
// Diary (agent scopes)
// ---------------------------------------------------------------------------

export interface DiaryEntry {
  id: string;
  agent_id: string;
  content: string;
  topic: string;
  created_at: string;
}

export interface WriteDiaryInput {
  agentId: string;
  content: string;
  topic?: string;
}

export interface ReadDiaryInput {
  agentId: string;
  topic?: string;
  limit?: number;
  offset?: number;
}

export interface ReadDiaryResult {
  agent_id: string;
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
  items: DiaryEntry[];
}

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export interface NestListItem {
  nest: string;
  count: number;
}

export interface BranchListItem {
  branch: string;
  count: number;
}

export interface TaxonomyNest {
  nest: string;
  count: number;
  branches: BranchListItem[];
}

export interface TaxonomyTree {
  total_nests: number;
  total_branches: number;
  total_memories: number;
  nests: TaxonomyNest[];
}

// ---------------------------------------------------------------------------
// Recall
// ---------------------------------------------------------------------------

export interface RecallInput {
  query: string;
  projectPath?: string;
  topic?: string;
  feature?: string;
  branchName?: string;
  rootPath?: string;
  kind?: string;
  nest?: string;
  branch?: string;
  agentId?: string;
  limit?: number;
}

export interface RecallResultItem {
  score: number;
  raw_score: number;
  memory: MemoryEntry;
}

export interface RecallResult {
  query: string;
  count: number;
  items: RecallResultItem[];
}

// ---------------------------------------------------------------------------
// Ingestion
// ---------------------------------------------------------------------------

export interface ConversationTurn {
  role: string;
  content: string;
  index: number;
  timestamp?: string | null;
}

export interface ExtractedEntity {
  name: string;
  type: string;
}

export interface TripleDef {
  subjectName: string;
  predicate: string;
  objectName: string;
  sourceMemoryId: string;
  sourceType: string;
  confidence: number;
}

export interface IngestOpts {
  filePath?: string;
  content?: string | unknown[];
  nest?: string;
  branch?: string;
  agentId?: string;
}

export interface IngestResult {
  skipped: boolean;
  reason?: string;
  source_id?: string;
  ingested_at?: string;
  turn_count?: number;
  format?: string;
  stored_count?: number;
  dedup_skipped?: number;
  entities_extracted?: number;
  triples_created?: number;
  memory_ids?: string[];
  errors?: Array<{ turn_index: number; error: string }>;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export interface HookContext {
  event: string;
  [key: string]: unknown;
}

export type HookListener = (payload: unknown, context?: HookContext) => Promise<HookListenerResult | void>;

export interface HookListenerResult {
  cancel?: boolean;
  reason?: string;
  payload?: unknown;
}

export interface HookEmitResult {
  cancelled: boolean;
  payload: unknown;
  reason?: string;
}

export interface HookStats {
  enabled: boolean;
  total_listeners: number;
  events: Record<string, number>;
}

export interface HookHandle {
  remove: () => void;
}

// ---------------------------------------------------------------------------
// Schema / Migrations
// ---------------------------------------------------------------------------

export interface MigrationSpec {
  version: number;
  migrate: (ad: Adapter) => Promise<void>;
}

export interface MigrationContext {
  adapter: Adapter;
  getMeta: (key: string) => Promise<string | null>;
  setMeta?: (key: string, value: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store-level types
// ---------------------------------------------------------------------------

export interface ListEntriesOpts {
  kind?: string;
  status?: string;
  projectPath?: string;
  topic?: string;
  limit?: number;
  offset?: number;
}

export interface ListEntriesResult {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset: number | null;
  items: MemoryEntry[];
}

export interface StoreStatusResult {
  enabled: boolean;
  db_path: string;
  db_exists: boolean;
  requested_backend: string;
  selected_backend: string | null;
  initialized: boolean;
  schema_version?: number;
  total_entries?: number;
  total_revisions?: number;
  total_events?: number;
  total_relations?: number;
}

// ---------------------------------------------------------------------------
// Signal scoring (event heuristics)
// ---------------------------------------------------------------------------

export interface SignalScoreInput {
  eventType: string;
  status?: string;
  importance?: number;
  filesChanged?: number;
  hasTests?: boolean;
  tags?: string[];
  title: string;
  content: string;
  summary: string;
}

export interface PromotionThresholdInput {
  eventType: string;
  status?: string;
  title: string;
  summary: string;
  content: string;
}

export interface MergeCandidateInput {
  kind: string;
  title: string;
  summary: string;
  content: string;
  scope: Scope;
  tags: string[];
}

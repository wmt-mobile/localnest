import {
  DEFAULT_MAX_FILE_BYTES,
  IGNORE_DIRS,
  PROJECT_HINT_DIRS,
  PROJECT_MARKER_FILES,
  TEXT_EXTENSIONS
} from '../runtime/config.js';
import { SERVER_VERSION } from '../runtime/version.js';
import { WorkspaceService } from '../services/workspace/index.js';
import {
  SearchService,
  VectorIndexService,
  EmbeddingService,
  AstChunker,
  RerankerService
} from '../services/retrieval/index.js';
import { UpdateService } from '../services/update/index.js';
import { MemoryService } from '../services/memory/index.js';

function createWorkspace(runtime) {
  return new WorkspaceService({
    roots: runtime.roots,
    ignoreDirs: IGNORE_DIRS,
    textExtensions: TEXT_EXTENSIONS,
    projectMarkerFiles: PROJECT_MARKER_FILES,
    projectHintDirs: PROJECT_HINT_DIRS,
    extraProjectMarkers: runtime.extraProjectMarkers,
    maxFileBytes: DEFAULT_MAX_FILE_BYTES,
    autoProjectSplit: runtime.autoProjectSplit,
    maxAutoProjects: runtime.maxAutoProjects,
    forceSplitChildren: runtime.forceSplitChildren
  });
}

async function createVectorIndex(runtime, workspace, embeddingService, setActiveBackend) {
  const astChunker = new AstChunker();

  if (runtime.indexBackend === 'sqlite-vec') {
    try {
      const { SqliteVecIndexService } = await import('../services/retrieval/sqlite-vec/service.js');
      return new SqliteVecIndexService({
        workspace,
        dbPath: runtime.sqliteDbPath,
        sqliteVecExtensionPath: runtime.sqliteVecExtensionPath,
        chunkLines: runtime.vectorChunkLines,
        chunkOverlap: runtime.vectorChunkOverlap,
        maxTermsPerChunk: runtime.vectorMaxTermsPerChunk,
        maxIndexedFiles: runtime.vectorMaxIndexedFiles,
        embeddingService,
        embeddingDimensions: runtime.embeddingDimensions,
        astChunker
      });
    } catch (error) {
      setActiveBackend('json');
      process.stderr.write(
        `[localnest-index] sqlite-vec unavailable on this Node runtime; falling back to json backend. ` +
        `reason=${error?.code || error?.message || 'unknown'}\n`
      );
    }
  }

  return new VectorIndexService({
    workspace,
    indexPath: runtime.vectorIndexPath,
    chunkLines: runtime.vectorChunkLines,
    chunkOverlap: runtime.vectorChunkOverlap,
    maxTermsPerChunk: runtime.vectorMaxTermsPerChunk,
    maxIndexedFiles: runtime.vectorMaxIndexedFiles,
    embeddingService,
    astChunker
  });
}

export async function createServices(runtime) {
  const workspace = createWorkspace(runtime);
  const embeddingService = new EmbeddingService({
    provider: runtime.embeddingProvider,
    model: runtime.embeddingModel,
    cacheDir: runtime.embeddingCacheDir
  });
  let activeIndexBackend = runtime.indexBackend;
  const vectorIndex = await createVectorIndex(runtime, workspace, embeddingService, (nextBackend) => {
    activeIndexBackend = nextBackend;
  });
  const search = new SearchService({
    workspace,
    ignoreDirs: IGNORE_DIRS,
    hasRipgrep: runtime.hasRipgrep,
    rgTimeoutMs: runtime.rgTimeoutMs,
    maxFileBytes: DEFAULT_MAX_FILE_BYTES,
    vectorIndex,
    reranker: new RerankerService({
      provider: runtime.rerankerProvider,
      model: runtime.rerankerModel,
      cacheDir: runtime.rerankerCacheDir
    })
  });
  const updates = new UpdateService({
    localnestHome: runtime.localnestHome,
    packageName: runtime.updatePackageName,
    currentVersion: SERVER_VERSION,
    checkIntervalMinutes: runtime.updateCheckIntervalMinutes,
    failureBackoffMinutes: runtime.updateFailureBackoffMinutes
  });
  const memory = new MemoryService({
    localnestHome: runtime.localnestHome,
    enabled: runtime.memoryEnabled,
    backend: runtime.memoryBackend,
    dbPath: runtime.memoryDbPath,
    autoCapture: runtime.memoryAutoCapture,
    consentDone: runtime.memoryConsentDone,
    embeddingService
  });

  return {
    workspace,
    vectorIndex,
    search,
    updates,
    memory,
    getActiveIndexBackend: () => activeIndexBackend
  };
}

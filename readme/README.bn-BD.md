<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**আপনার কোডবেস। আপনার AI। আপনার মেশিন — কোনো ক্লাউড নয়, কোনো লিক নয়, কোনো চমক নয়।**

LocalNest হলো একটি local-first MCP server এবং CLI tool, যা AI agent-দের আপনার code-এ নিরাপদ, scoped access দেয় — hybrid search, semantic indexing, temporal knowledge graph এবং persistent memoryসহ, যা কখনও আপনার machine ছাড়ে না।

**52 MCP tools** | **Temporal knowledge graph** | **Multi-hop graph traversal** | **Agent-scoped memory** | **Zero cloud dependencies**

📖 [পূর্ণ ডকুমেন্টেশন](https://wmt-mobile.github.io/localnest/) · [আর্কিটেকচারের বিস্তারিত বিশ্লেষণ](../guides/architecture.md)

## README ভাষাসমূহ

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · বাংলা (বাংলাদেশ) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

এই অনূদিত ফাইলগুলো প্রতিটি locale-এর জন্য পূর্ণ README অনুবাদ। লক্ষ্য locale matrix এবং terminology rule-এর জন্য [translation policy](./TRANSLATION_POLICY.md) দেখুন। নতুন command, release note এবং পূর্ণ বিবরণের জন্য ইংরেজি [README.md](../README.md) এখনও source of truth।

---

## 0.0.7-এ নতুন কী আছে

> পূর্ণ changelog: [CHANGELOG.md](../CHANGELOG.md)

- **Temporal knowledge graph** — entity, triple, as_of query, timeline, contradiction detection
- **Multi-hop graph traversal** — recursive CTE দিয়ে 2-5 hop গভীরতায় relationship walk করুন (LocalNest-এর অনন্য ফিচার)
- **Nest/Branch hierarchy** — সুসংগঠিত retrieval-এর জন্য LocalNest-এর নিজস্ব two-level memory taxonomy
- **Agent-scoped memory** — private diary entrysহ per-agent isolation
- **Semantic dedup** — embedding similarity gate near-duplicate memory pollution রোধ করে
- **Conversation ingestion** — entity extraction সহ Markdown/JSON chat export import করুন
- **Hooks system** — memory, KG, traversal, ingestion-এ pre/post operation callback
- **CLI-first architecture** — সবকিছুর জন্য একীভূত `localnest <noun> <verb>` command
- **Shell completions** — bash, zsh, fish tab completion
- **17টি নতুন MCP tool** (মোট 52) — KG, nest, traversal, diary, ingest, dedup, hooks

---

## কেন LocalNest?

বেশিরভাগ AI code tool বাইরে ডেটা পাঠায়। LocalNest তা করে না।

সবকিছু — file read, vector embedding, memory — আপনার machine-এ in-process চলে। কোনো cloud subscription নেই, কোনো rate limit নেই, আপনার box থেকে কোনো data বের হয় না। আর LocalNest যেহেতু MCP-তে কথা বলে, তাই যেকোনো compatible client (Cursor, Windsurf, Codex, Kiro, Gemini CLI) একটিমাত্র config block দিয়েই যুক্ত হতে পারে।

| আপনি কী পান | এটি কীভাবে কাজ করে |
|---|---|
| **নিরাপদ file access** | শুধু configured root-এর ভেতরে scoped read, এর বাইরে কিছু নয় |
| **তাৎক্ষণিক lexical search** | `ripgrep`-backed symbol ও pattern search (`rg` না থাকলে JS fallback) |
| **semantic search** | `all-MiniLM-L6-v2`-এর মাধ্যমে local vector embedding, GPU লাগে না |
| **hybrid retrieval** | সেরা ফলের জন্য lexical + semantic search, RRF ranking দিয়ে একসাথে |
| **project awareness** | marker file থেকে project auto-detect করে এবং প্রতিটি tool call scope করে |
| **agent memory** | durable, queryable knowledge graph, তাই আপনার AI যা শিখেছে তা মনে রাখে |
| **Temporal knowledge graph** | সময়ের বৈধতা সহ subject-predicate-object triple — কোন সময় কী সত্য ছিল, query করুন |
| **Multi-hop graph traversal** | recursive CTE দিয়ে 2-5 hop গভীরতায় relationship walk করুন — অন্য কোনো local tool এটি করে না |
| **Nest/Branch hierarchy** | metadata-filtered boost সহ সুসংগঠিত retrieval-এর জন্য two-level memory taxonomy |
| **Conversation ingestion** | Markdown/JSON chat export-কে structured memory + KG triple-এ import করুন |
| **Agent isolation** | per-agent diary এবং memory scoping — একাধিক agent, শূন্য cross-contamination |
| **Hooks system** | memory, KG, traversal, ingestion-এ pre/post operation hook — নিজের logic যোগ করুন |

---

## দ্রুত শুরু

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. এটি আপনার MCP client config-এ যোগ করুন**

`setup` detected tool-এর জন্য config স্বয়ংক্রিয়ভাবে লিখে দেয়। `~/.localnest/config/mcp.localnest.json`-এ একটি ready-to-paste block-ও পাবেন:

```json
{
  "mcpServers": {
    "localnest": {
      "command": "localnest-mcp",
      "startup_timeout_sec": 30,
      "env": {
        "MCP_MODE": "stdio",
        "LOCALNEST_CONFIG": "~/.localnest/config/localnest.config.json",
        "LOCALNEST_INDEX_BACKEND": "sqlite-vec",
        "LOCALNEST_DB_PATH": "~/.localnest/data/localnest.db",
        "LOCALNEST_INDEX_PATH": "~/.localnest/data/localnest.index.json",
        "LOCALNEST_EMBED_PROVIDER": "huggingface",
        "LOCALNEST_EMBED_MODEL": "sentence-transformers/all-MiniLM-L6-v2",
        "LOCALNEST_EMBED_CACHE_DIR": "~/.localnest/cache",
        "LOCALNEST_EMBED_DIMS": "384",
        "LOCALNEST_RERANKER_PROVIDER": "huggingface",
        "LOCALNEST_RERANKER_MODEL": "cross-encoder/ms-marco-MiniLM-L-6-v2",
        "LOCALNEST_RERANKER_CACHE_DIR": "~/.localnest/cache",
        "LOCALNEST_MEMORY_ENABLED": "false",
        "LOCALNEST_MEMORY_BACKEND": "auto",
        "LOCALNEST_MEMORY_DB_PATH": "~/.localnest/data/localnest.memory.db"
      }
    }
  }
}
```

> **Windows:** `localnest setup` যে config লিখে দেয় সেটাই ব্যবহার করুন — এটি আপনার platform-এর জন্য সঠিক command স্বয়ংক্রিয়ভাবে সেট করে।

আপনার MCP client পুনরায় চালু করুন। timeout হলে client config-এ `startup_timeout_sec: 30` সেট করুন।

**প্রয়োজনীয়তা:** Node.js `>=18` · `ripgrep` সুপারিশকৃত, তবে ঐচ্ছিক

AST-aware chunking ডিফল্টভাবে `JavaScript`, `Python`, `Go`, `Bash`, `Lua` এবং `Dart`-এর জন্য আসে। অন্য ভাষাগুলোও line-based fallback chunking দিয়ে পরিষ্কারভাবে index হয়।

বর্তমান stable runtime local embedding এবং reranking-এর জন্য `@huggingface/transformers` ব্যবহার করে। নতুন setup defaults-এ `huggingface` থাকে, আর পুরোনো `xenova` config compatibility alias হিসেবে এখনও গ্রহণযোগ্য।

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## আপগ্রেড

```bash
localnest upgrade              # latest stable
localnest upgrade stable       # latest stable
localnest upgrade beta         # latest beta
localnest upgrade <version>    # pin to a specific version
localnest version              # check current
```

---

## এজেন্টরা এটি কীভাবে ব্যবহার করে

চারটি workflow প্রায় সবকিছু কভার করে:

### দ্রুত lookup — খুঁজুন, পড়ুন, কাজ শেষ

```
localnest_search_files   → find the module by path/name
localnest_search_code    → find the exact symbol or identifier
localnest_read_file      → read the relevant lines
```

### গভীর কাজ — contextসহ debug, refactor, review

```
localnest_task_context    → one call: runtime status + recalled memories
localnest_search_hybrid   → concept-level search across your codebase
localnest_read_file       → read the relevant sections
localnest_capture_outcome → persist what you learned for next time
```

### Knowledge graph — project সম্পর্কে structured fact

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### Conversation memory — আগের চ্যাট থেকে শিখুন

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## CLI Reference

LocalNest একটি পূর্ণাঙ্গ CLI tool। সবকিছু terminal থেকে পরিচালনা করা যায়:

```bash
localnest setup                     # configure roots, backends, AI clients
localnest doctor                    # health check
localnest upgrade                   # self-update
localnest version                   # current version
localnest status                    # runtime status

localnest memory add "content"      # store a memory
localnest memory search "query"     # find memories
localnest memory list               # list all memories
localnest memory show <id>          # view one memory
localnest memory delete <id>        # remove a memory

localnest kg add Alice works_on ProjectX    # add a fact
localnest kg query Alice                     # query relationships
localnest kg timeline Alice                  # fact evolution
localnest kg stats                           # graph statistics

localnest skill install             # install skills to AI clients
localnest skill list                # show installed skills
localnest skill remove <name>       # uninstall a skill

localnest mcp start                 # start MCP server
localnest mcp status                # server health
localnest mcp config                # config JSON for AI clients

localnest ingest ./chat.md          # import conversation
localnest ingest ./export.json      # import JSON chat

localnest completion bash           # shell completions
```

**Global flag** প্রতিটি command-এ কাজ করে: `--json` (machine output), `--verbose`, `--quiet`, `--config <path>`

---

## টুলসমূহ

### ওয়ার্কস্পেস ও ডিসকভারি

| টুল | এটি কী করে |
|------|-------------|
| `localnest_list_roots` | configured root-গুলো দেখায় |
| `localnest_list_projects` | একটি root-এর নিচে project-গুলো দেখায় |
| `localnest_project_tree` | একটি project-এর file/folder tree |
| `localnest_summarize_project` | ভাষা ও extension-এর বিভাজন |
| `localnest_read_file` | একটি file থেকে নির্দিষ্ট line window পড়ে |

### সার্চ ও ইনডেক্স

| টুল | এটি কী করে |
|------|-------------|
| `localnest_search_files` | file/path name search, module খুঁজতে এখান থেকেই শুরু করুন |
| `localnest_search_code` | lexical search, exact symbol, regex, identifier |
| `localnest_search_hybrid` | hybrid search, lexical + semantic, RRF-ranked |
| `localnest_get_symbol` | কোনো symbol-এর definition/export location খুঁজে বের করে |
| `localnest_find_usages` | কোনো symbol-এর import এবং call-site usage খুঁজে বের করে |
| `localnest_index_project` | semantic index তৈরি বা refresh করে |
| `localnest_index_status` | index metadata: আছে কি না, stale কি না, backend কী |
| `localnest_embed_status` | embedding backend এবং vector-search readiness |

### মেমরি

| টুল | এটি কী করে |
|------|-------------|
| `localnest_task_context` | একটি task-এর জন্য one-call runtime + memory context |
| `localnest_memory_recall` | একটি query-এর জন্য প্রাসঙ্গিক memory recall করে |
| `localnest_capture_outcome` | task outcome memory-তে ধরে রাখে |
| `localnest_memory_capture_event` | background event ingest করে auto-promotionসহ |
| `localnest_memory_store` | হাতে করে memory store করে |
| `localnest_memory_update` | memory update করে এবং revision যোগ করে |
| `localnest_memory_delete` | memory delete করে |
| `localnest_memory_get` | revision historyসহ একটি memory আনে |
| `localnest_memory_list` | stored memory-গুলো দেখায় |
| `localnest_memory_events` | সাম্প্রতিক memory event inspect করে |
| `localnest_memory_add_relation` | নামযুক্ত relation দিয়ে দুটি memory লিংক করে |
| `localnest_memory_remove_relation` | একটি relation সরিয়ে দেয় |
| `localnest_memory_related` | knowledge graph-এ এক ধাপ traverse করে |
| `localnest_memory_suggest_relations` | similarity অনুযায়ী related memory auto-suggest করে |
| `localnest_memory_status` | memory consent, backend এবং database status |

### Knowledge Graph

| টুল | এটি কী করে |
|------|-------------|
| `localnest_kg_add_entity` | entity তৈরি করে (people, project, concept, tool) |
| `localnest_kg_add_triple` | temporal validity সহ subject-predicate-object fact যোগ করে |
| `localnest_kg_query` | direction filtering সহ entity relationship query করে |
| `localnest_kg_invalidate` | একটি fact-কে আর বৈধ নয় হিসেবে mark করে (archival, deletion নয়) |
| `localnest_kg_as_of` | point-in-time query — X তারিখে কী সত্য ছিল? |
| `localnest_kg_timeline` | একটি entity-র জন্য chronological fact evolution |
| `localnest_kg_stats` | entity count, triple count, predicate breakdown |

### Nest/Branch Organization

| টুল | এটি কী করে |
|------|-------------|
| `localnest_nest_list` | count সহ সব nest (top-level memory domain) দেখায় |
| `localnest_nest_branches` | একটি nest-এর ভেতরের branch (topic) দেখায় |
| `localnest_nest_tree` | পূর্ণ hierarchy: nest, branch, এবং count |

### Graph Traversal

| টুল | এটি কী করে |
|------|-------------|
| `localnest_graph_traverse` | path tracking সহ multi-hop traversal (recursive CTE) |
| `localnest_graph_bridges` | cross-nest bridge খুঁজে বের করে — domain জুড়ে connection |

### Agent Diary

| টুল | এটি কী করে |
|------|-------------|
| `localnest_diary_write` | private scratchpad entry লেখে (agent-isolated) |
| `localnest_diary_read` | নিজের সাম্প্রতিক diary entry পড়ে |

### Conversation Ingestion

| টুল | এটি কী করে |
|------|-------------|
| `localnest_ingest_markdown` | Markdown conversation export memory + KG-তে import করে |
| `localnest_ingest_json` | JSON conversation export memory + KG-তে import করে |
| `localnest_memory_check_duplicate` | filing-এর আগে semantic duplicate detection |

### সার্ভার ও আপডেট

| টুল | এটি কী করে |
|------|-------------|
| `localnest_server_status` | runtime config, root, ripgrep, index backend |
| `localnest_health` | background monitor reportসহ compact health summary |
| `localnest_usage_guide` | agent-দের জন্য best-practice guidance |
| `localnest_update_status` | npm-এ latest version check করে (cached) |
| `localnest_update_self` | globally update করে এবং bundled skill sync করে (approval required) |

**মোট 50টি tool।** সব টুল `response_format: "json"` (ডিফল্ট) বা `"markdown"` সমর্থন করে। list tool-গুলো pagination-এর জন্য `total_count`, `has_more`, `next_offset` ফেরত দেয়।

---

## LocalNest-এর তুলনা

LocalNest একমাত্র local-first MCP server যা code retrieval এবং structured memory দুটোকেই একটি tool-এ একত্রিত করে। এখানে এর অবস্থান দেখুন:

| সক্ষমতা | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (no cloud)** | হ্যাঁ | হ্যাঁ | না ($25+/mo) | না (Neo4j) | না ($20-200/mo) |
| **Code retrieval** | 50 MCP tool, AST-aware, hybrid search | নেই | নেই | নেই | নেই |
| **Knowledge graph** | temporal validity সহ SQLite triple | SQLite triple | Neo4j | Neo4j | Key-value |
| **Multi-hop traversal** | হ্যাঁ (recursive CTE, 2-5 hop) | না (flat lookup only) | না | হ্যাঁ (Neo4j দরকার) | না |
| **Temporal queries (as_of)** | হ্যাঁ | হ্যাঁ | হ্যাঁ | হ্যাঁ | না |
| **Contradiction detection** | হ্যাঁ (write-time warning) | আছে কিন্তু wired নয় | না | না | না |
| **Conversation ingestion** | Markdown + JSON | Markdown + JSON + Slack | না | না | না |
| **Agent isolation** | per-agent scoping + private diary | Wing-per-agent | User/session scoping | না | User/agent/run/session |
| **Semantic dedup** | 0.92 cosine gate on all writes | 0.9 threshold | না | না | না |
| **Memory hierarchy** | Nest/Branch (original) | Wing/Room/Hall (palace) | Flat | Flat | Flat |
| **Hooks system** | Pre/post operation hooks | নেই | Webhooks | নেই | নেই |
| **Runtime** | Node.js (lightweight) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (cloud) |
| **Dependencies** | 0 new (pure SQLite) | ChromaDB (heavy) | Neo4j ($25+/mo) | Neo4j | Cloud API |
| **MCP tools** | 50 | 19 | 0 | 0 | 0 |
| **খরচ** | বিনামূল্যে | বিনামূল্যে | $25+/mo | $25+/mo | $20-200/mo |

**LocalNest-এর অনন্য অবস্থান:** একমাত্র tool যা আপনার AI-কে deep code understanding এবং structured persistent memory দুটোই দেয় — সম্পূর্ণ local, zero cloud, zero cost।

---

## মেমরি — আপনার AI ভুলে যায় না

`localnest setup`-এর সময় memory enable করলে LocalNest local SQLite database-এ durable knowledge graph তৈরি শুরু করে। আপনার AI agent যে bug fix, architectural decision এবং preference স্পর্শ করে, তা পরের session-এ recall করা যায়।

- **Node 22.13+** দরকার, তবে Node 18/20-এ search এবং file tool এগুলো ছাড়াও ঠিকমতো কাজ করে
- memory ব্যর্থ হলেও অন্য tool আটকে যায় না, সবকিছু আলাদাভাবে degrade করে

**auto-promotion কীভাবে কাজ করে:** `localnest_memory_capture_event` দিয়ে ধরা event-গুলো signal strength অনুযায়ী score করা হয়। bug fix, decision, preference-এর মতো high-signal event durable memory-তে promote হয়। দুর্বল exploratory event রেকর্ড হয়, তারপর 30 দিন পরে নীরবে বাদ পড়ে।

**Knowledge graph:** structured fact-কে temporal validity সহ subject-predicate-object triple হিসেবে store করুন। `as_of` দিয়ে যেকোনো সময়ে কী সত্য ছিল query করুন। Recursive CTE traversal দিয়ে 2-5 hop গভীরতায় relationship walk করুন। Write time-এ contradiction detect করুন।

**Nest/Branch hierarchy:** memory-কে nest (top-level domain) এবং branch (topic)-এ সংগঠিত করুন। Metadata-filtered recall scoring-এর আগে candidate সংকুচিত করে দ্রুত ও আরো নির্ভুল ফলাফল দেয়।

**Agent isolation:** প্রতিটি agent-এর নিজস্ব memory scope এবং private diary থাকে। Recall-এ নিজের + global memory আসে, কখনো অন্য agent-এর private data নয়।

**Semantic dedup:** প্রতিটি write embedding similarity gate (default 0.92 cosine threshold) দিয়ে যায়। Near-duplicate storage-র আগেই ধরা পড়ে — আপনার memory পরিষ্কার থাকে।

**Conversation ingestion:** Markdown বা JSON chat export import করুন। প্রতিটি turn একটি memory entry হয়, automatic entity extraction এবং KG triple creation সহ। Content hash-এর ভিত্তিতে একই file-এর re-ingestion skip হয়ে যায়।

**Hooks:** যেকোনো memory operation-এ pre/post callback register করুন — store, recall, KG write, traversal, ingestion। Core code পরিবর্তন না করেই custom pipeline তৈরি করুন।

---

## ইনডেক্স ব্যাকএন্ড

| ব্যাকএন্ড | কখন ব্যবহার করবেন |
|---------|-------------|
| `sqlite-vec` | **প্রস্তাবিত।** persistent SQLite, বড় repo-র জন্য দ্রুত ও দক্ষ। Node 22+ দরকার। |
| `json` | compatibility fallback। `sqlite-vec` না থাকলে এটি স্বয়ংক্রিয়ভাবে বেছে নেওয়া হয়। |

কখন migrate করতে হবে তা জানতে `localnest_server_status` → `upgrade_recommended` দেখুন।

---

## কনফিগারেশন

`setup` সবকিছু `~/.localnest/`-এ লিখে দেয়:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite index + memory databases
├── cache/    → Model weights, update status
├── backups/  → Config migration history
└── vendor/   → Managed native deps (sqlite-vec)
```

**কনফিগ অগ্রাধিকার:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → current directory

**গুরুত্বপূর্ণ environment variable:**

| ভেরিয়েবল | ডিফল্ট | বিবরণ |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` বা `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite database path |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | প্রতিটি index chunk-এ line সংখ্যা |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | chunk-গুলোর মাঝে overlap |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | প্রতি index run-এ সর্বোচ্চ file |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | embedding model |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | model cache path |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | cross-encoder reranker model |
| `LOCALNEST_MEMORY_ENABLED` | `false` | local memory subsystem enable করে |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | memory database path |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | background event auto-promote করে |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm update check interval |

<details>
<summary>সব environment variable</summary>

| ভেরিয়েবল | ডিফল্ট | বিবরণ |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON index path |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | native `vec0` extension path |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | প্রতি chunk-এ সর্বোচ্চ term |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | embedding backend |
| `LOCALNEST_EMBED_DIMS` | `384` | embedding vector dimension |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | reranker backend |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | reranker cache path |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite`, বা `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | consent prompt দেখায় না |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | যে npm package check করা হবে |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | npm check ব্যর্থ হলে retry interval |

</details>

## ইনস্টল নোট

`0.0.6-beta.1` বর্তমান stable line হিসেবে `0.0.5` বজায় রেখে CLI deprecation pass-এর preview দেখায়: canonical `localnest task-context` / `localnest capture-outcome` command, পুরোনো `localnest-mcp-*` helper-এর জন্য deprecated compatibility wrapper, এবং MCP client-রা যে `localnest-mcp` server binary ব্যবহার করে তাতে কোনো পরিবর্তন নেই। কিছু npm environment-এ ONNX runtime dependency chain থেকে একটি upstream deprecation warning এখনও দেখা যেতে পারে; LocalNest-এর কার্যকারিতায় এর প্রভাব নেই।

**পারফরম্যান্স টিপস:**
- সম্ভব হলে `project_path` এবং সংকীর্ণ `glob` দিয়ে query scope করুন
- `max_results: 20–40` দিয়ে শুরু করুন, দরকার হলে তবেই বাড়ান
- reranking ডিফল্টভাবে বন্ধ রাখুন, শুধু চূড়ান্ত precision pass-এ চালু করুন

---

## স্কিল বিতরণ

LocalNest একটি canonical source থেকে bundled AI agent skill সরবরাহ করে এবং supported client-এর জন্য tool-specific variant install করে। বর্তমান user-level target-এর মধ্যে generic agent directory ছাড়াও Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline এবং Continue রয়েছে।

```bash
localnest install skills             # install or update bundled skills
localnest install skills --force     # force reinstall
localnest-mcp-install-skill          # deprecated compatibility alias
```

**automation ও hook-এর জন্য Shell CLI tools:**

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

পুরোনো alias `localnest-mcp-task-context` এবং `localnest-mcp-capture-outcome` compatibility-এর জন্য এখনও কাজ করে। দুই command-ই stdin-এ JSON গ্রহণ করে। GitHub থেকে install করুন:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## স্বয়ংক্রিয় মাইগ্রেশন

ঝামেলা ছাড়াই upgrade করুন। startup-এর সময় LocalNest পুরোনো config schema এবং সমতল `~/.localnest` layout-কে স্বয়ংক্রিয়ভাবে নতুন `config/`, `data/`, `cache/`, এবং `backups/` structure-এ migrate করে। কোনো manual rerun লাগে না, upgrade-এর পরে config নষ্ট হয় না।

---

## নিরাপত্তা

LocalNest OSS security pipeline pattern অনুসরণ করে:

- **CI quality gate** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL static analysis** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **public scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## অবদান রাখা

[CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md) দেখুন

> **কোডবেসে নতুন?** **[Architecture Overview](../guides/architecture.md)** দিয়ে শুরু করুন — এখানে server কীভাবে boot হয়, search এবং memory কীভাবে কাজ করে, এবং সবকিছু কোথায় থাকে তা দেখানো হয়েছে।

---

## অবদানকারীরা

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

যারা code, docs, review, testing এবং issue report-এ অবদান রাখেন, সবাইকে ধন্যবাদ।

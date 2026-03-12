<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**आपका कोडबेस। आपकी AI। आपकी मशीन — न क्लाउड, न लीक, न कोई चौंकाने वाली बात।**

LocalNest एक local-first MCP server है, जो AI agent को आपके code तक सुरक्षित, scoped access देता है — hybrid search, semantic indexing और persistent memory के साथ, जो कभी आपकी machine से बाहर नहीं जाती।

📖 [पूर्ण दस्तावेज़](https://wmt-mobile.github.io/localnest/) · [आर्किटेक्चर की विस्तृत पड़ताल](../guides/architecture.md)

## README भाषाएँ

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · हिन्दी (भारत) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

ये अनूदित फ़ाइलें हर locale के लिए पूरी README अनुवाद प्रतियाँ हैं। लक्ष्य locale matrix और terminology rules के लिए [translation policy](./TRANSLATION_POLICY.md) देखें। नए command, release note और पूरी जानकारी के लिए अंग्रेज़ी [README.md](../README.md) अब भी source of truth है।

---

## LocalNest क्यों?

ज़्यादातर AI code tools बाहर डेटा भेजते हैं। LocalNest ऐसा नहीं करता।

सब कुछ — file read, vector embedding, memory — आपकी machine पर in-process चलता है। कोई cloud subscription नहीं, कोई rate limit नहीं, और आपका data आपकी मशीन से बाहर नहीं जाता। और क्योंकि यह MCP बोलता है, कोई भी compatible client (Cursor, Windsurf, Codex, Kiro, Gemini CLI) एक config block के साथ जुड़ सकता है।

| आपको क्या मिलता है | यह कैसे काम करता है |
|---|---|
| **सुरक्षित file access** | आपके configured root के भीतर scoped read, बाहर कुछ नहीं |
| **तुरंत lexical search** | `ripgrep`-backed symbol और pattern search (`rg` न हो तो JS fallback) |
| **semantic search** | `all-MiniLM-L6-v2` के जरिए local vector embedding, GPU की ज़रूरत नहीं |
| **hybrid retrieval** | बेहतर नतीजों के लिए lexical + semantic search को RRF ranking के साथ जोड़ा जाता है |
| **project awareness** | marker file से project auto-detect करता है और हर tool call को scope करता है |
| **agent memory** | durable, queryable knowledge graph, ताकि आपकी AI सीखी हुई बात याद रखे |

---

## त्वरित शुरुआत

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. इसे अपने MCP client config में जोड़ें**

`setup` detected tools के लिए config अपने-आप लिख देता है। `~/.localnest/config/mcp.localnest.json` में एक ready-to-paste block भी मिलेगा:

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

> **Windows:** `localnest setup` द्वारा लिखी गई config ही इस्तेमाल करें — यह आपकी platform के लिए सही command अपने-आप सेट करती है।

अपने MCP client को restart करें। अगर timeout हो, तो client config में `startup_timeout_sec: 30` सेट करें।

**आवश्यकताएँ:** Node.js `>=18` · `ripgrep` अनुशंसित है, पर वैकल्पिक

AST-aware chunking डिफ़ॉल्ट रूप से `JavaScript`, `Python`, `Go`, `Bash`, `Lua`, और `Dart` के लिए आती है। दूसरी भाषाएँ भी line-based fallback chunking के साथ ठीक से index होती हैं।

मौजूदा stable runtime local embedding और reranking के लिए `@huggingface/transformers` का उपयोग करती है। नए setup defaults में `huggingface` होता है, और पुराने `xenova` config अभी भी compatibility alias के रूप में मान्य हैं।

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## अपग्रेड

```bash
localnest upgrade              # latest stable
localnest upgrade stable       # latest stable
localnest upgrade beta         # latest beta
localnest upgrade <version>    # pin to a specific version
localnest version              # check current
```

---

## एजेंट इसे कैसे उपयोग करते हैं

दो workflow लगभग सब कुछ कवर करते हैं:

### तेज lookup — ढूँढें, पढ़ें, काम पूरा
किसी file, symbol, या code pattern को जल्दी pinpoint करने के लिए सबसे अच्छा।

```
localnest_search_files   → find the module by path/name
localnest_search_code    → find the exact symbol or identifier
localnest_read_file      → read the relevant lines
```

### गहरा task — context के साथ debug, refactor, review
उन जटिल कामों के लिए सबसे अच्छा जहाँ memory और semantic understanding मायने रखती है।

```
localnest_task_context    → one call: runtime status + recalled memories
localnest_search_hybrid   → concept-level search across your codebase
localnest_read_file       → read the relevant sections
localnest_capture_outcome → persist what you learned for next time
```

> **Tool success ≠ useful result.** कोई tool OK लौटाए और फिर भी खाली हो सकता है। non-empty file match और असली line content को ही अर्थपूर्ण सबूत मानें, सिर्फ process success को नहीं।

---

## टूल्स

### वर्कस्पेस और डिस्कवरी

| टूल | यह क्या करता है |
|------|-------------|
| `localnest_list_roots` | configured root की सूची दिखाता है |
| `localnest_list_projects` | किसी root के नीचे project दिखाता है |
| `localnest_project_tree` | किसी project की file/folder tree |
| `localnest_summarize_project` | language और extension का breakdown |
| `localnest_read_file` | किसी file से सीमित line window पढ़ता है |

### सर्च और इंडेक्स

| टूल | यह क्या करता है |
|------|-------------|
| `localnest_search_files` | file/path name search, module discovery के लिए यहीं से शुरू करें |
| `localnest_search_code` | lexical search, exact symbol, regex, identifier |
| `localnest_search_hybrid` | hybrid search, lexical + semantic, RRF-ranked |
| `localnest_get_symbol` | किसी symbol की definition/export location ढूँढता है |
| `localnest_find_usages` | किसी symbol के import और call-site usage ढूँढता है |
| `localnest_index_project` | semantic index बनाता या refresh करता है |
| `localnest_index_status` | index metadata: मौजूद है, stale है या नहीं, backend क्या है |
| `localnest_embed_status` | embedding backend और vector-search readiness |

### मेमोरी

| टूल | यह क्या करता है |
|------|-------------|
| `localnest_task_context` | किसी task के लिए one-call runtime + memory context |
| `localnest_memory_recall` | query के लिए relevant memory recall करता है |
| `localnest_capture_outcome` | task outcome को memory में कैप्चर करता है |
| `localnest_memory_capture_event` | background event ingest करता है, auto-promotion के साथ |
| `localnest_memory_store` | memory को manually store करता है |
| `localnest_memory_update` | memory update करता है और revision जोड़ता है |
| `localnest_memory_delete` | memory delete करता है |
| `localnest_memory_get` | revision history के साथ एक memory लाता है |
| `localnest_memory_list` | stored memory की सूची दिखाता है |
| `localnest_memory_events` | हाल के memory event inspect करता है |
| `localnest_memory_add_relation` | नामित relation के साथ दो memory को जोड़ता है |
| `localnest_memory_remove_relation` | relation हटाता है |
| `localnest_memory_related` | knowledge graph में एक hop traverse करता है |
| `localnest_memory_suggest_relations` | similarity के आधार पर related memory auto-suggest करता है |
| `localnest_memory_status` | memory consent, backend और database status |

### सर्वर और अपडेट

| टूल | यह क्या करता है |
|------|-------------|
| `localnest_server_status` | runtime config, root, ripgrep, index backend |
| `localnest_health` | background monitor report के साथ compact health summary |
| `localnest_usage_guide` | agent के लिए best-practice guidance |
| `localnest_update_status` | npm पर latest version check करता है (cached) |
| `localnest_update_self` | globally update करता है और bundled skill sync करता है (approval required) |

सभी tools `response_format: "json"` (default) या `"markdown"` को support करते हैं। list tools pagination के लिए `total_count`, `has_more`, `next_offset` लौटाते हैं।

---

## मेमोरी — आपकी AI भूलती नहीं

`localnest setup` के दौरान memory enable करें और LocalNest local SQLite database में durable knowledge graph बनाना शुरू कर देता है। आपका AI agent जिस bug fix, architectural decision, और preference को छूता है, उसे अगली session में recall किया जा सकता है।

- **Node 22.13+** चाहिए, लेकिन इसके बिना भी Node 18/20 पर search और file tools ठीक चलते हैं
- memory failure कभी दूसरे tools को block नहीं करती, सब कुछ स्वतंत्र रूप से degrade होता है

**auto-promotion कैसे काम करता है:** `localnest_memory_capture_event` के जरिए capture किए गए event को signal strength के हिसाब से score किया जाता है। bug fix, decision, और preference जैसे high-signal event durable memory में promote हो जाते हैं। कमज़ोर exploratory event रिकॉर्ड होते हैं और 30 दिन बाद चुपचाप हटा दिए जाते हैं।

---

## इंडेक्स बैकएंड

| बैकएंड | कब उपयोग करें |
|---------|-------------|
| `sqlite-vec` | **अनुशंसित।** persistent SQLite, बड़े repo के लिए तेज़ और कुशल। Node 22+ चाहिए। |
| `json` | compatibility fallback। अगर `sqlite-vec` उपलब्ध न हो तो यह अपने-आप चुना जाता है। |

कब migrate करना है, यह जानने के लिए `localnest_server_status` → `upgrade_recommended` देखें।

---

## कॉन्फ़िगरेशन

`setup` सब कुछ `~/.localnest/` में लिख देता है:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite index + memory databases
├── cache/    → Model weights, update status
├── backups/  → Config migration history
└── vendor/   → Managed native deps (sqlite-vec)
```

**कॉन्फ़िग प्राथमिकता:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → current directory

**मुख्य environment variables:**

| वेरिएबल | डिफ़ॉल्ट | विवरण |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` या `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite database path |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | हर index chunk में line की संख्या |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | chunk के बीच overlap |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | हर index run में अधिकतम file |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | embedding model |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | model cache path |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | cross-encoder reranker model |
| `LOCALNEST_MEMORY_ENABLED` | `false` | local memory subsystem enable करता है |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | memory database path |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | background event auto-promote करता है |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm update check interval |

<details>
<summary>सभी environment variables</summary>

| वेरिएबल | डिफ़ॉल्ट | विवरण |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON index path |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | native `vec0` extension path |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | हर chunk में अधिकतम term |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | embedding backend |
| `LOCALNEST_EMBED_DIMS` | `384` | embedding vector dimensions |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | reranker backend |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | reranker cache path |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite`, या `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | consent prompt को दबाता है |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | जाँची जाने वाली npm package का नाम |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | npm check विफल होने पर retry interval |

</details>

## इंस्टॉल नोट

`0.0.6-beta.1` मौजूदा stable line के रूप में `0.0.5` को बनाए रखता है, जबकि CLI deprecation pass का preview देता है: canonical `localnest task-context` / `localnest capture-outcome` command, पुराने `localnest-mcp-*` helper के लिए deprecated compatibility wrapper, और MCP client द्वारा इस्तेमाल किए जाने वाले `localnest-mcp` server binary में कोई बदलाव नहीं। कुछ npm environment अब भी ONNX runtime dependency chain से एक upstream deprecation warning दिखा सकते हैं; LocalNest की functionality प्रभावित नहीं होती।

**परफ़ॉर्मेंस टिप्स:**
- जहाँ संभव हो, query को `project_path` और एक संकरे `glob` के साथ scope करें
- `max_results: 20–40` से शुरू करें, और ज़रूरत होने पर ही बढ़ाएँ
- reranking को default रूप से बंद रखें, इसे सिर्फ अंतिम precision pass के लिए चालू करें

---

## स्किल वितरण

LocalNest bundled AI agent skills को एक canonical source से ship करता है और supported client के लिए tool-specific variant install करता है। मौजूदा user-level target में generic agent directory के साथ Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline, और Continue शामिल हैं।

```bash
localnest install skills             # install or update bundled skills
localnest install skills --force     # force reinstall
localnest-mcp-install-skill          # deprecated compatibility alias
```

**automation और hooks के लिए Shell CLI tools:**

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

पुराने alias `localnest-mcp-task-context` और `localnest-mcp-capture-outcome` compatibility के लिए अभी भी काम करते हैं। दोनों command stdin पर JSON स्वीकार करते हैं। GitHub से install करें:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## ऑटो-माइग्रेशन

बिना झंझट upgrade करें। startup पर LocalNest पुराने config schema और flat `~/.localnest` layout को अपने-आप नई `config/`, `data/`, `cache/`, और `backups/` structure में migrate कर देता है। कोई manual rerun नहीं, और upgrade के बाद टूटी हुई config नहीं।

---

## सुरक्षा

LocalNest OSS security pipeline pattern का पालन करता है:

- **CI quality gate** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL static analysis** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **public scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## योगदान

[CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md) देखें

> **कोडबेस में नए हैं?** **[Architecture Overview](../guides/architecture.md)** से शुरू करें — इसमें बताया गया है कि server कैसे boot होता है, search और memory कैसे काम करते हैं, और सब कुछ कहाँ रहता है।

---

## योगदानकर्ता

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

जो भी code, docs, review, testing, और issue report में योगदान देते हैं, सभी का धन्यवाद।

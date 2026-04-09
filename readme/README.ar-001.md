<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**قاعدة الشفرة الخاصة بك. ذكاؤك الاصطناعي. جهازك — لا سحابة، لا تسريبات، لا مفاجآت.**

LocalNest هو خادم MCP محلي أولًا وأداة CLI تمنح وكلاء الذكاء الاصطناعي وصولًا آمنًا ومحدود النطاق إلى شفرتك، مع بحث هجين، وفهرسة دلالية، ورسم معرفة زمني، وذاكرة دائمة لا تغادر جهازك أبدًا.

**52 أداة MCP** | **رسم معرفة زمني** | **عبور رسم بياني متعدد القفزات** | **ذاكرة محددة النطاق لكل وكيل** | **بدون أي اعتماد على السحابة**

📖 [الوثائق الكاملة](https://wmt-mobile.github.io/localnest/) · [تعمق معماري](../guides/architecture.md)

## لغات README

[English](../README.md) · العربية الفصحى · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

هذه الملفات المترجمة هي ترجمات README كاملة ومخصصة لكل لغة محلية. راجع [سياسة الترجمة](./TRANSLATION_POLICY.md) للاطلاع على مصفوفة اللغات المستهدفة وقواعد المصطلحات. يظل ملف [README.md](../README.md) الإنجليزي هو المصدر المرجعي للأوامر الأحدث، وملاحظات الإصدارات، وكل التفاصيل الكاملة.

---

## الجديد في الإصدار 0.1.0

> سجل التغييرات الكامل: [CHANGELOG.md](../CHANGELOG.md)

- **رسم معرفة زمني** — كيانات، ثلاثيات، استعلامات as_of، خطوط زمنية، كشف التناقضات
- **عبور رسم بياني متعدد القفزات** — استكشف العلاقات بعمق 2-5 قفزات عبر CTEs التكرارية (حصري لـ LocalNest)
- **تنظيم Nest/Branch** — تصنيف ذاكرة ذو مستويين خاص بـ LocalNest لاسترجاع منظم
- **ذاكرة محددة النطاق لكل وكيل** — عزل لكل وكيل مع إدخالات يوميات خاصة
- **إزالة التكرار الدلالي** — بوابة تشابه embedding تمنع تلوث الذاكرة بالنسخ شبه المكررة
- **استيعاب المحادثات** — استيراد صادرات محادثات Markdown/JSON مع استخراج الكيانات
- **نظام الخطافات** — ردود نداء قبل/بعد العملية للذاكرة وKG والعبور والاستيعاب
- **بنية CLI-first** — أوامر `localnest <noun> <verb>` موحدة لكل شيء
- **إكمال تلقائي للطرفية** — إكمال tab في bash وzsh وfish
- **17 أداة MCP جديدة** (52 إجمالاً) — KG، الأعشاش، العبور، اليوميات، الاستيعاب، إزالة التكرار، الخطافات

---

## لماذا LocalNest؟

معظم أدوات الشفرة المعتمدة على الذكاء الاصطناعي تتصل بخوادم خارجية. LocalNest لا يفعل ذلك.

كل شيء — قراءات الملفات، والتضمينات المتجهية، والذاكرة — يعمل داخل العملية على جهازك. لا اشتراك سحابي، ولا حدود لمعدل الاستخدام، ولا بيانات تغادر جهازك. وبما أنه يتحدث MCP، يمكن لأي عميل متوافق (Cursor وWindsurf وCodex وKiro وGemini CLI) أن يتصل به عبر كتلة إعداد واحدة.

| ما الذي تحصل عليه | كيف يعمل |
|---|---|
| **وصول آمن إلى الملفات** | قراءات مقيّدة داخل الجذور التي أعددتها، ولا شيء خارجها |
| **بحث معجمي فوري** | بحث في الرموز والأنماط مدعوم بـ `ripgrep` (مع بديل JS إذا كان غير متوفر) |
| **بحث دلالي** | تضمينات متجهية محلية عبر `all-MiniLM-L6-v2`، ومن دون حاجة إلى GPU |
| **استرجاع هجين** | دمج بين البحث المعجمي والدلالي مع ترتيب RRF للحصول على أفضل ما في الطريقتين |
| **وعي بالمشروع** | يكتشف المشاريع تلقائيًا من ملفات المؤشرات ويحدّد نطاق كل استدعاء أداة |
| **ذاكرة الوكيل** | رسم معرفة متين وقابل للاستعلام، بحيث يتذكر ذكاؤك الاصطناعي ما تعلّمه |
| **رسم معرفة زمني** | ثلاثيات فاعل-محمول-مفعول مع صلاحية زمنية — استعلم عما كان صحيحًا في أي وقت |
| **عبور رسم بياني متعدد القفزات** | استكشف العلاقات بعمق 2-5 قفزات عبر CTEs التكرارية — لا توجد أداة محلية أخرى تقدم هذا |
| **تنظيم Nest/Branch** | تصنيف ذاكرة ذو مستويين مع تعزيز مصفى بالبيانات الوصفية لاسترجاع منظم |
| **استيعاب المحادثات** | استيراد صادرات محادثات Markdown/JSON إلى ذاكرة مُهيكلة + ثلاثيات KG |
| **عزل الوكلاء** | يوميات ونطاق ذاكرة لكل وكيل — وكلاء متعددون، بلا تلوث متبادل |
| **نظام الخطافات** | خطافات قبل/بعد العملية للذاكرة وKG والعبور والاستيعاب — أضف منطقك الخاص |

---

## البدء السريع

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. أدرِج هذا في إعدادات عميل MCP لديك**

يقوم `setup` بكتابة الإعدادات للأدوات المكتشفة تلقائيًا. وستجد أيضًا مقطعًا جاهزًا للصق في `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** استخدم الإعدادات التي يكتبها `localnest setup`، فهي تضبط الأمر الصحيح لمنصتك تلقائيًا.

أعد تشغيل عميل MCP لديك. وإذا انتهت مهلة التشغيل، فاضبط `startup_timeout_sec: 30` في إعدادات العميل.

**المتطلبات:** Node.js `>=18` · يُوصى بـ ripgrep لكنه اختياري

يأتي التقسيم المعتمد على AST افتراضيًا للغات `TypeScript` و`JavaScript` و`Python` و`Go` و`Bash` و`Lua` و`Dart`. وتظل اللغات الأخرى تُفهرس بشكل جيد باستخدام تقسيم احتياطي قائم على الأسطر.

تستخدم بيئة التشغيل المستقرة الحالية `@huggingface/transformers` للتضمينات المحلية وإعادة الترتيب. وتستخدم الإعدادات الافتراضية الجديدة `huggingface`، بينما تظل إعدادات `xenova` الأقدم مقبولة باعتبارها اسمًا مستعارًا للتوافق.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## الترقية

```bash
localnest upgrade              # latest stable
localnest upgrade stable       # latest stable
localnest upgrade beta         # latest beta
localnest upgrade <version>    # pin to a specific version
localnest version              # check current
```

---

## كيف يستخدمه الوكلاء

أربعة مسارات عملية تغطي تقريبًا كل شيء:

### بحث سريع — اعثر عليه، اقرأه، وانتهى

```
localnest_search_files   → find the module by path/name
localnest_search_code    → find the exact symbol or identifier
localnest_read_file      → read the relevant lines
```

### مهمة عميقة — تصحيح الأخطاء، وإعادة الهيكلة، والمراجعة مع السياق

```
localnest_task_context    → one call: runtime status + recalled memories
localnest_search_hybrid   → concept-level search across your codebase
localnest_read_file       → read the relevant sections
localnest_capture_outcome → persist what you learned for next time
```

### رسم المعرفة — حقائق مُهيكلة عن المشروع

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### ذاكرة المحادثات — تعلّم من المحادثات السابقة

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## مرجع CLI

LocalNest هو أداة CLI كاملة. كل شيء يُدار من الطرفية:

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

**علامات عامة** تعمل على كل أمر: `--json` (إخراج آلي)، `--verbose`، `--quiet`، `--config <path>`

---

## الأدوات

### مساحة العمل والاستكشاف

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_list_roots` | يسرد الجذور المُعدّة |
| `localnest_list_projects` | يسرد المشاريع تحت جذر معيّن |
| `localnest_project_tree` | شجرة الملفات/المجلدات لمشروع |
| `localnest_summarize_project` | تفصيل اللغات والامتدادات |
| `localnest_read_file` | يقرأ نافذة محددة من الأسطر من ملف |

### البحث والفهرسة

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_search_files` | بحث في أسماء الملفات/المسارات، ابدأ هنا لاكتشاف الوحدات |
| `localnest_search_code` | بحث معجمي، للرموز المطابقة، والتعابير النمطية، والمعرّفات |
| `localnest_search_hybrid` | بحث هجين، معجمي + دلالي مع ترتيب RRF |
| `localnest_get_symbol` | يعثر على مواضع التعريف/التصدير لرمز |
| `localnest_find_usages` | يعثر على استخدامات الاستيراد ومواضع الاستدعاء لرمز |
| `localnest_index_project` | يبني الفهرس الدلالي أو يحدّثه |
| `localnest_index_status` | بيانات الفهرس الوصفية: الوجود، والقدم، والخلفية |
| `localnest_embed_status` | حالة خلفية التضمين والاستعداد للبحث المتجهي |

### الذاكرة

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_task_context` | سياق التشغيل + الذاكرة للمهمة في استدعاء واحد |
| `localnest_memory_recall` | يسترجع الذكريات ذات الصلة باستعلام |
| `localnest_capture_outcome` | يلتقط نتيجة مهمة داخل الذاكرة |
| `localnest_memory_capture_event` | يستوعب أحداث الخلفية مع ترقية تلقائية |
| `localnest_memory_store` | يخزّن ذكرى يدويًا |
| `localnest_memory_update` | يحدّث ذكرى ويضيف مراجعة |
| `localnest_memory_delete` | يحذف ذكرى |
| `localnest_memory_get` | يجلب ذكرى واحدة مع سجل المراجعات |
| `localnest_memory_list` | يسرد الذكريات المخزنة |
| `localnest_memory_events` | يفحص أحداث الذاكرة الأخيرة |
| `localnest_memory_add_relation` | يربط ذكريين بعلاقة مسماة |
| `localnest_memory_remove_relation` | يزيل علاقة |
| `localnest_memory_related` | يعبر رسم المعرفة لقفزة واحدة |
| `localnest_memory_suggest_relations` | يقترح تلقائيًا ذكريات مرتبطة حسب التشابه |
| `localnest_memory_status` | حالة موافقة الذاكرة، والخلفية، وقاعدة البيانات |

### رسم المعرفة

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_kg_add_entity` | إنشاء كيانات (أشخاص، مشاريع، مفاهيم، أدوات) |
| `localnest_kg_add_triple` | إضافة حقائق فاعل-محمول-مفعول مع صلاحية زمنية |
| `localnest_kg_query` | استعلام عن علاقات الكيانات مع تصفية الاتجاه |
| `localnest_kg_invalidate` | وضع علامة على حقيقة بأنها لم تعد صالحة (أرشفة، وليس حذف) |
| `localnest_kg_as_of` | استعلامات في نقطة زمنية — ماذا كان صحيحًا في التاريخ X؟ |
| `localnest_kg_timeline` | تطور الحقائق الزمني لكيان ما |
| `localnest_kg_stats` | عدد الكيانات، وعدد الثلاثيات، وتفصيل المحمولات |

### تنظيم Nest/Branch

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_nest_list` | سرد جميع الأعشاش (نطاقات الذاكرة العليا) مع الأعداد |
| `localnest_nest_branches` | سرد الفروع (المواضيع) داخل عش |
| `localnest_nest_tree` | التسلسل الهرمي الكامل: الأعشاش والفروع والأعداد |

### عبور الرسم البياني

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_graph_traverse` | عبور متعدد القفزات مع تتبع المسار (CTEs التكرارية) |
| `localnest_graph_bridges` | إيجاد الجسور بين الأعشاش — الروابط عبر النطاقات |

### يوميات الوكيل

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_diary_write` | كتابة مدخل في دفتر الملاحظات الخاص (معزول لكل وكيل) |
| `localnest_diary_read` | قراءة مدخلات اليوميات الأخيرة الخاصة بك |

### استيعاب المحادثات

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_ingest_markdown` | استيراد صادرات محادثات Markdown إلى الذاكرة + KG |
| `localnest_ingest_json` | استيراد صادرات محادثات JSON إلى الذاكرة + KG |
| `localnest_memory_check_duplicate` | كشف التكرار الدلالي قبل الحفظ |

### الخادم والتحديثات

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_server_status` | إعدادات التشغيل، والجذور، وripgrep، وخلفية الفهرسة |
| `localnest_health` | ملخص صحة موجز مع تقرير مراقب الخلفية |
| `localnest_usage_guide` | إرشادات أفضل الممارسات للوكلاء |
| `localnest_update_status` | يفحص npm لمعرفة أحدث إصدار (مع تخزين مؤقت) |
| `localnest_update_self` | يحدّث التثبيت العام ويزامن المهارة المضمّنة (يتطلب موافقة) |

**52 أداة إجمالاً.** تدعم جميع الأدوات `response_format: "json"` (افتراضيًا) أو `"markdown"`. وتُرجع أدوات القوائم `total_count` و`has_more` و`next_offset` من أجل الترقيم الصفحي.

---

## كيف يقارن LocalNest

LocalNest هو خادم MCP المحلي الأول الوحيد الذي يجمع بين استرجاع الشفرة والذاكرة المُهيكلة في أداة واحدة. إليك مكانته:

| القدرة | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **محلي أولاً (بدون سحابة)** | نعم | نعم | لا ($25+/شهر) | لا (Neo4j) | لا ($20-200/شهر) |
| **استرجاع الشفرة** | 52 أداة MCP، مدرك لـ AST، بحث هجين | لا يوجد | لا يوجد | لا يوجد | لا يوجد |
| **رسم المعرفة** | ثلاثيات SQLite مع صلاحية زمنية | ثلاثيات SQLite | Neo4j | Neo4j | Key-value |
| **عبور متعدد القفزات** | نعم (CTEs التكرارية، 2-5 قفزات) | لا (بحث مسطح فقط) | لا | نعم (يتطلب Neo4j) | لا |
| **استعلامات زمنية (as_of)** | نعم | نعم | نعم | نعم | لا |
| **كشف التناقضات** | نعم (تحذيرات وقت الكتابة) | موجود لكن غير مفعّل | لا | لا | لا |
| **استيعاب المحادثات** | Markdown + JSON | Markdown + JSON + Slack | لا | لا | لا |
| **عزل الوكلاء** | نطاق لكل وكيل + يوميات خاصة | Wing-per-agent | User/session scoping | لا | User/agent/run/session |
| **إزالة التكرار الدلالي** | بوابة cosine 0.92 على كل الكتابات | عتبة 0.9 | لا | لا | لا |
| **تنظيم الذاكرة** | Nest/Branch (أصلي) | Wing/Room/Hall (palace) | مسطح | مسطح | مسطح |
| **نظام الخطافات** | خطافات قبل/بعد العملية | لا يوجد | Webhooks | لا يوجد | لا يوجد |
| **بيئة التشغيل** | Node.js + TypeScript (خفيف) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (سحابي) |
| **التبعيات** | 0 جديد (SQLite صرف) | ChromaDB (ثقيل) | Neo4j ($25+/شهر) | Neo4j | Cloud API |
| **أدوات MCP** | 52 | 19 | 0 | 0 | 0 |
| **التكلفة** | مجاني | مجاني | $25+/شهر | $25+/شهر | $20-200/شهر |

**موقع LocalNest الفريد:** الأداة الوحيدة التي تمنح ذكاءك الاصطناعي فهمًا عميقًا للشفرة وذاكرة دائمة مُهيكلة — محلية بالكامل، بدون سحابة، بدون تكلفة.

---

## الذاكرة — ذكاؤك الاصطناعي لا ينسى

فعّل الذاكرة أثناء `localnest setup` وسيبدأ LocalNest في بناء رسم معرفة متين داخل قاعدة بيانات SQLite محلية. يمكن استرجاع كل إصلاح عطل، وقرار معماري، وتفضيل يلامسه وكيلك الذكي في الجلسة التالية.

- تتطلب **Node 22.13+**، بينما تعمل أدوات البحث والملفات جيدًا على Node 18/20 بدونها
- فشل الذاكرة لا يحجب الأدوات الأخرى أبدًا، فكل شيء يتدهور بشكل مستقل

**كيف تعمل الترقية التلقائية:** تُقيَّم الأحداث الملتقطة عبر `localnest_memory_capture_event` بحسب قوة الإشارة. وتُرقّى الأحداث عالية الإشارة، مثل إصلاحات الأعطال والقرارات والتفضيلات، إلى ذكريات دائمة. أما الأحداث الاستكشافية الأضعف فتُسجَّل ثم تُحذف بهدوء بعد 30 يومًا.

**رسم المعرفة:** خزّن الحقائق المُهيكلة كثلاثيات فاعل-محمول-مفعول مع صلاحية زمنية. استعلم عما كان صحيحًا في أي نقطة زمنية باستخدام `as_of`. استكشف العلاقات بعمق 2-5 قفزات عبر عبور CTE التكراري. اكتشف التناقضات وقت الكتابة.

**تنظيم Nest/Branch:** نظّم الذكريات في أعشاش (نطاقات عليا) وفروع (مواضيع). الاسترجاع المصفّى بالبيانات الوصفية يضيّق المرشحين قبل التسجيل للحصول على نتائج أسرع وأدق.

**عزل الوكلاء:** يحصل كل وكيل على نطاق ذاكرة خاص ويوميات خاصة. الاسترجاع يعيد الذكريات الخاصة + العامة، ولا يعيد بيانات وكيل آخر الخاصة أبدًا.

**إزالة التكرار الدلالي:** كل كتابة تمر عبر بوابة تشابه embedding (عتبة cosine الافتراضية 0.92). تُلتقط النسخ شبه المكررة قبل التخزين — تظل ذاكرتك نظيفة.

**استيعاب المحادثات:** استورد صادرات محادثات Markdown أو JSON. يصبح كل دور إدخال ذاكرة مع استخراج كيانات تلقائي وإنشاء ثلاثيات KG. يتم تخطي إعادة استيعاب نفس الملف بناءً على hash المحتوى.

**الخطافات:** سجّل ردود نداء قبل/بعد على أي عملية ذاكرة — التخزين، والاسترجاع، وكتابات KG، والعبور، والاستيعاب. ابنِ خطوط أنابيب مخصصة دون تعديل الشفرة الأساسية.

---

## خلفية الفهرسة

| الخلفية | متى تستخدمها |
|---------|-------------|
| `sqlite-vec` | **موصى بها.** SQLite دائم، سريع وكفء للمستودعات الكبيرة. يتطلب Node 22+. |
| `json` | بديل للتوافق. يُختار تلقائيًا إذا لم يكن `sqlite-vec` متاحًا. |

تحقق من `localnest_server_status` → `upgrade_recommended` لمعرفة متى ينبغي الترحيل.

---

## الإعداد

يكتب `setup` كل شيء إلى `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite index + memory databases
├── cache/    → Model weights, update status
├── backups/  → Config migration history
└── vendor/   → Managed native deps (sqlite-vec)
```

**أولوية الإعداد:** متغير البيئة `PROJECT_ROOTS` → ملف `LOCALNEST_CONFIG` → الدليل الحالي

**متغيرات البيئة الأساسية:**

| المتغير | الافتراضي | الوصف |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` أو `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | مسار قاعدة بيانات SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | عدد الأسطر لكل جزء مفهرس |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | مقدار التداخل بين الأجزاء |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | الحد الأقصى للملفات في كل تشغيل للفهرسة |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | نموذج التضمين |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | مسار ذاكرة التخزين المؤقت للنموذج |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | نموذج إعادة الترتيب cross-encoder |
| `LOCALNEST_MEMORY_ENABLED` | `false` | يفعّل نظام الذاكرة المحلية الفرعي |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | مسار قاعدة بيانات الذاكرة |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | يرقّي أحداث الخلفية تلقائيًا |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | فاصل التحقق من تحديث npm |

<details>
<summary>جميع متغيرات البيئة</summary>

| المتغير | الافتراضي | الوصف |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | مسار فهرس JSON |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | مسار امتداد `vec0` الأصلي |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | الحد الأقصى للمصطلحات لكل جزء |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | خلفية التضمين |
| `LOCALNEST_EMBED_DIMS` | `384` | أبعاد متجه التضمين |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | خلفية إعادة الترتيب |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | مسار ذاكرة التخزين المؤقت لإعادة الترتيب |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto` أو `node-sqlite` أو `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | يخفي مطالبة الموافقة |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | اسم حزمة npm المطلوب التحقق منها |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | يعيد المحاولة عند فشل فحص npm |

</details>

## ملاحظة التثبيت

`0.1.0` هو إصدار رئيسي -- أُعيدت كتابته بالكامل بلغة TypeScript -- يتضمن رسم معرفة زمني، وعبور متعدد القفزات، وتنظيم Nest/Branch، وذاكرة محددة النطاق لكل وكيل، وإزالة التكرار الدلالي، واستيعاب المحادثات، ونظام الخطافات، وبنية CLI-first مع 52 أداة MCP، و10 أوامر شرطة مائلة لـ Claude Code، ولوحة TUI تفاعلية، ومعالج إعداد موجّه، واختبار ذاتي شامل. عمليات ترحيل المخطط كلها إضافية ومتوافقة مع الإصدارات السابقة -- تُحدّث قواعد البيانات الحالية تلقائيًا عند التشغيل الأول.

**نصائح الأداء:**
- حدّد نطاق الاستعلامات باستخدام `project_path` مع `glob` ضيق كلما أمكن
- ابدأ بـ `max_results: 20–40` ثم وسّع فقط عند الحاجة
- اترك إعادة الترتيب معطّلة افتراضيًا، وفعّلها فقط في تمريرات الدقة النهائية

---

## توزيع المهارات

يشحن LocalNest مهارات وكلاء الذكاء الاصطناعي المضمّنة من مصدر قياسي واحد، ويثبّت نسخًا خاصة بالأدوات للعملاء المدعومين. تشمل الأهداف الحالية على مستوى المستخدم أدلة الوكلاء العامة، إضافة إلى Codex وCopilot وClaude Code وCursor وWindsurf وOpenCode وGemini وAntigravity وCline وContinue.

```bash
localnest install skills             # install or update bundled skills
localnest install skills --force     # force reinstall
localnest-mcp-install-skill          # deprecated compatibility alias
```

**أدوات Shell CLI** للأتمتة والخطافات:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

ما زالت الأسماء البديلة القديمة `localnest-mcp-task-context` و`localnest-mcp-capture-outcome` تعمل من أجل التوافق. ويقبل كلا الأمرين JSON عبر stdin. التثبيت من GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## الترحيل التلقائي

حدّث بلا تعقيد. عند التشغيل، يرحّل LocalNest تلقائيًا مخططات الإعدادات الأقدم والتخطيط المسطح `~/.localnest` إلى البنية الجديدة `config/` و`data/` و`cache/` و`backups/`. لا حاجة لإعادة التشغيل يدويًا، ولا إعدادات مكسورة بعد الترقية.

---

## الأمان

يتبع LocalNest نمط خط أنابيب أمان OSS:

- **بوابة جودة CI** — [quality.yml](../.github/workflows/quality.yml)
- **تحليل CodeQL الثابت** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **بطاقة تقييم عامة** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## المساهمة

راجع [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **هل أنت جديد على قاعدة الشفرة؟** ابدأ بـ **[نظرة عامة على المعمارية](../guides/architecture.md)**، فهي تشرح كيفية إقلاع الخادم، وكيف يعمل البحث والذاكرة، وأين يوجد كل شيء.

---

## المساهمون

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

شكرًا لكل من يساهم بالشفرة، والوثائق، والمراجعات، والاختبارات، وتقارير المشكلات.

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

LocalNest هو خادم MCP محلي أولًا يمنح وكلاء الذكاء الاصطناعي وصولًا آمنًا ومحدود النطاق إلى شفرتك، مع بحث هجين، وفهرسة دلالية، وذاكرة دائمة لا تغادر جهازك أبدًا.

📖 [الوثائق الكاملة](https://wmt-mobile.github.io/localnest/) · [تعمق معماري](../guides/architecture.md)

## لغات README

[English](../README.md) · العربية الفصحى · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

هذه الملفات المترجمة هي ترجمات README كاملة ومخصصة لكل لغة محلية. راجع [سياسة الترجمة](./TRANSLATION_POLICY.md) للاطلاع على مصفوفة اللغات المستهدفة وقواعد المصطلحات. يظل ملف [README.md](../README.md) الإنجليزي هو المصدر المرجعي للأوامر الأحدث، وملاحظات الإصدارات، وكل التفاصيل الكاملة.

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

يأتي التقسيم المعتمد على AST افتراضيًا للغات `JavaScript` و`Python` و`Go` و`Bash` و`Lua` و`Dart`. وتظل اللغات الأخرى تُفهرس بشكل جيد باستخدام تقسيم احتياطي قائم على الأسطر.

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

يغطي مساران عمليان تقريبًا كل شيء:

### بحث سريع — اعثر عليه، اقرأه، وانتهى
الأفضل لتحديد ملف أو رمز أو نمط شيفرة بدقة.

```
localnest_search_files   → find the module by path/name
localnest_search_code    → find the exact symbol or identifier
localnest_read_file      → read the relevant lines
```

### مهمة عميقة — تصحيح الأخطاء، وإعادة الهيكلة، والمراجعة مع السياق
الأفضل للأعمال المعقدة التي تكون فيها الذاكرة والفهم الدلالي مهمين.

```
localnest_task_context    → one call: runtime status + recalled memories
localnest_search_hybrid   → concept-level search across your codebase
localnest_read_file       → read the relevant sections
localnest_capture_outcome → persist what you learned for next time
```

> **نجاح الأداة ≠ نتيجة مفيدة.** قد تُرجع الأداة حالة OK ومع ذلك تكون النتيجة فارغة. اعتبر تطابقات الملفات غير الفارغة ومحتوى الأسطر الحقيقي دليلًا ذا معنى، لا مجرد نجاح للعملية.

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

### الخادم والتحديثات

| الأداة | ما الذي تفعله |
|------|-------------|
| `localnest_server_status` | إعدادات التشغيل، والجذور، وripgrep، وخلفية الفهرسة |
| `localnest_health` | ملخص صحة موجز مع تقرير مراقب الخلفية |
| `localnest_usage_guide` | إرشادات أفضل الممارسات للوكلاء |
| `localnest_update_status` | يفحص npm لمعرفة أحدث إصدار (مع تخزين مؤقت) |
| `localnest_update_self` | يحدّث التثبيت العام ويزامن المهارة المضمّنة (يتطلب موافقة) |

تدعم جميع الأدوات `response_format: "json"` (افتراضيًا) أو `"markdown"`. وتُرجع أدوات القوائم `total_count` و`has_more` و`next_offset` من أجل الترقيم الصفحي.

---

## الذاكرة — ذكاؤك الاصطناعي لا ينسى

فعّل الذاكرة أثناء `localnest setup` وسيبدأ LocalNest في بناء رسم معرفة متين داخل قاعدة بيانات SQLite محلية. يمكن استرجاع كل إصلاح عطل، وقرار معماري، وتفضيل يلامسه وكيلك الذكي في الجلسة التالية.

- تتطلب **Node 22.13+**، بينما تعمل أدوات البحث والملفات جيدًا على Node 18/20 بدونها
- فشل الذاكرة لا يحجب الأدوات الأخرى أبدًا، فكل شيء يتدهور بشكل مستقل

**كيف تعمل الترقية التلقائية:** تُقيَّم الأحداث الملتقطة عبر `localnest_memory_capture_event` بحسب قوة الإشارة. وتُرقّى الأحداث عالية الإشارة، مثل إصلاحات الأعطال والقرارات والتفضيلات، إلى ذكريات دائمة. أما الأحداث الاستكشافية الأضعف فتُسجَّل ثم تُحذف بهدوء بعد 30 يومًا.

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

يحافظ `0.0.6-beta.1` على `0.0.5` بوصفه خط الإصدار المستقر الحالي، بينما يقدّم معاينة لمرحلة إلغاء التقادم في CLI: أوامر `localnest task-context` و`localnest capture-outcome` القياسية، وأغلفة توافق متقادمة للمساعدات الأقدم `localnest-mcp-*`، ومن دون أي تغيير في الملف التنفيذي `localnest-mcp` الذي تستخدمه عملاء MCP. قد تُظهر بعض بيئات npm تحذير إلغاء تقادم واحدًا منبعثًا من سلسلة تبعيات وقت تشغيل ONNX، لكن وظائف LocalNest لا تتأثر بذلك.

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

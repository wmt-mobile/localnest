<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Kod tabanınız. Yapay zekanız. Makineniz - bulut yok, sızıntı yok, sürpriz yok.**

LocalNest, yapay zeka ajanlarına kodunuza güvenli ve sınırlı erişim veren, hibrit arama, anlamsal indeksleme ve makinenizden hiç çıkmayan kalıcı bellek sağlayan local-first bir MCP sunucusudur.

📖 [Tam dokümantasyon](https://wmt-mobile.github.io/localnest/) · [Mimariye derin bakış](../guides/architecture.md)

## README Dilleri

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · Türkçe · [简体中文](./README.zh-CN.md)

Bu çevrilmiş dosyalar, locale hedefli tam README çevirileridir. Hedef locale matrisi ve terim kuralları için [çeviri politikasına](./TRANSLATION_POLICY.md) bakın. Yeni komutlar, sürüm notları ve tüm ayrıntılar için ana kaynak İngilizce [README.md](../README.md) olmaya devam eder.

---

## Neden LocalNest?

Kod için kullanılan çoğu yapay zeka aracı verileri dışarı gönderir. LocalNest göndermez.

Dosya okuma, vektör embedding, bellek - her şey doğrudan sizin makinenizde süreç içinde çalışır. Bulut aboneliği yok, rate limit yok, veriniz cihazınızın dışına çıkmaz. Üstelik LocalNest MCP konuştuğu için uyumlu her istemci (Cursor, Windsurf, Codex, Kiro, Gemini CLI) tek bir yapılandırma bloğuyla bağlanabilir.

| Elde ettikleriniz | Nasıl çalışır |
|---|---|
| **Güvenli dosya erişimi** | Yapılandırdığınız roots altında kapsamlı okuma - bunun dışında hiçbir şeye erişmez |
| **Anında sözcüksel arama** | `ripgrep` destekli sembol ve desen araması (`rg` yoksa JS fallback kullanılır) |
| **Anlamsal arama** | `all-MiniLM-L6-v2` ile yerel vektör embedding - GPU gerekmez |
| **Hibrit retrieval** | Sözcüksel ve anlamsal arama, her iki yaklaşımın en iyi sonucunu almak için RRF sıralamasıyla birleştirilir |
| **Proje farkındalığı** | Marker dosyalarından projeleri otomatik algılar ve her tool çağrısına scope uygular |
| **Ajan belleği** | Kalıcı ve sorgulanabilir bilgi grafiği - yapay zekanız öğrendiklerini hatırlar |

---

## Hızlı Başlangıç

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Bunu MCP istemci yapılandırmanıza ekleyin**

`setup`, algılanan araçlar için yapılandırmayı otomatik olarak yazar. Aynı zamanda `~/.localnest/config/mcp.localnest.json` içinde doğrudan yapıştırabileceğiniz hazır bir blok bulursunuz:

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

> **Windows:** `localnest setup` tarafından yazılan yapılandırmayı kullanın - platformunuz için doğru komutu otomatik olarak ayarlar.

MCP istemcinizi yeniden başlatın. Zaman aşımına uğrarsa istemci yapılandırmasında `startup_timeout_sec: 30` ayarlayın.

**Gereksinimler:** Node.js `>=18` · `ripgrep` önerilir ancak zorunlu değildir

AST-aware chunking varsayılan olarak `JavaScript`, `Python`, `Go`, `Bash`, `Lua` ve `Dart` için gelir. Diğer diller de satır tabanlı fallback chunking ile temiz biçimde indekslenir.

Geçerli kararlı runtime, yerel embedding ve reranking için `@huggingface/transformers` kullanır. Yeni setup varsayılanları `huggingface` kullanır; eski `xenova` yapılandırmaları ise uyumluluk takma adı olarak kabul edilmeye devam eder.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## Upgrade

```bash
localnest upgrade              # en yeni kararlı sürüm
localnest upgrade stable       # en yeni kararlı sürüm
localnest upgrade beta         # en yeni beta sürüm
localnest upgrade <version>    # belirli bir sürüme sabitle
localnest version              # mevcut sürümü kontrol et
```

---

## Ajanlar Bunu Nasıl Kullanır

İki iş akışı neredeyse her şeyi kapsar:

### Hızlı lookup - bul, oku, bitir
Bir dosyayı, sembolü veya kod desenini nokta atışıyla bulmak için en uygunudur.

```
localnest_search_files   → modülü path/ad üzerinden bul
localnest_search_code    → tam sembolü veya identifier'ı bul
localnest_read_file      → ilgili satırları oku
```

### Derin görev - bağlamla debug, refactor, review
Bellek ve anlamsal kavrayışın önemli olduğu karmaşık işler için en uygunudur.

```
localnest_task_context    → tek çağrı: runtime durumu + geri çağrılmış bellekler
localnest_search_hybrid   → kod tabanınız genelinde kavramsal arama
localnest_read_file       → ilgili bölümleri oku
localnest_capture_outcome → öğrendiklerinizi bir sonraki sefer için kalıcılaştır
```

> **Tool başarısı ≠ faydalı sonuç.** Bir tool OK dönebilir ama yine de boş olabilir. Boş olmayan dosya eşleşmelerini ve gerçek satır içeriğini anlamlı kanıt olarak değerlendirin; yalnızca süreç başarısını değil.

---

## Tools

### Workspace & Discovery

| Tool | Ne yapar |
|------|-------------|
| `localnest_list_roots` | Yapılandırılmış roots listesini verir |
| `localnest_list_projects` | Bir root altındaki projeleri listeler |
| `localnest_project_tree` | Bir proje için dosya/klasör ağacını gösterir |
| `localnest_summarize_project` | Dil ve uzantı dağılımını özetler |
| `localnest_read_file` | Bir dosyadan sınırlı bir satır penceresi okur |

### Search & Index

| Tool | Ne yapar |
|------|-------------|
| `localnest_search_files` | Dosya/path adı araması - modül keşfi için buradan başlayın |
| `localnest_search_code` | Sözcüksel arama - tam semboller, regex, identifier'lar |
| `localnest_search_hybrid` | Hibrit arama - sözcüksel + anlamsal, RRF ile sıralanmış |
| `localnest_get_symbol` | Bir sembolün tanım/export konumlarını bulur |
| `localnest_find_usages` | Bir sembolün import ve çağrı noktalarını bulur |
| `localnest_index_project` | Anlamsal indeksi oluşturur veya yeniler |
| `localnest_index_status` | İndeks metaverisi - mevcut, eski, backend |
| `localnest_embed_status` | Embedding backend durumu ve vektör arama hazırlığı |

### Memory

| Tool | Ne yapar |
|------|-------------|
| `localnest_task_context` | Bir görev için tek çağrıda runtime + memory bağlamı |
| `localnest_memory_recall` | Bir sorgu için ilgili bellekleri geri çağırır |
| `localnest_capture_outcome` | Görev sonucunu memory içine kaydeder |
| `localnest_memory_capture_event` | Arka plan olaylarını auto-promotion ile alır |
| `localnest_memory_store` | Bir belleği manuel olarak kaydeder |
| `localnest_memory_update` | Bir belleği günceller ve revizyon ekler |
| `localnest_memory_delete` | Bir belleği siler |
| `localnest_memory_get` | Tek bir belleği revizyon geçmişiyle getirir |
| `localnest_memory_list` | Kaydedilmiş bellekleri listeler |
| `localnest_memory_events` | Son memory olaylarını inceler |
| `localnest_memory_add_relation` | İki belleği adlandırılmış bir ilişkiyle bağlar |
| `localnest_memory_remove_relation` | Bir ilişkiyi kaldırır |
| `localnest_memory_related` | Bilgi grafiğini tek bir hop boyunca dolaşır |
| `localnest_memory_suggest_relations` | Benzerliğe göre ilişkili bellekler önerir |
| `localnest_memory_status` | Memory consent, backend ve veritabanı durumu |

### Server & Updates

| Tool | Ne yapar |
|------|-------------|
| `localnest_server_status` | Runtime yapılandırması, roots, `ripgrep`, indeks backend'i |
| `localnest_health` | Arka plan izleyici raporuyla birlikte kısa sağlık özeti |
| `localnest_usage_guide` | Ajanlar için en iyi uygulama rehberi |
| `localnest_update_status` | En yeni sürümü npm üzerinden kontrol eder (önbellekli) |
| `localnest_update_self` | Global güncelleme yapar ve bundled skill'i senkronize eder (onay gerekir) |

Tüm tools `response_format: "json"` (varsayılan) veya `"markdown"` destekler. Liste tools'ları sayfalama için `total_count`, `has_more`, `next_offset` döndürür.

---

## Memory - Yapay Zekanız Unutmaz

`localnest setup` sırasında memory özelliğini etkinleştirin; LocalNest yerel bir SQLite veritabanında kalıcı bir bilgi grafiği oluşturmaya başlar. Yapay zeka ajanınızın dokunduğu her hata düzeltmesi, mimari kararı ve tercih bir sonraki oturumda yeniden çağrılabilir.

- **Node 22.13+** gerektirir - arama ve dosya tools'ları Node 18/20 üzerinde bellek olmadan da sorunsuz çalışır
- Memory hatası diğer tools'ları asla engellemez - her şey birbirinden bağımsız olarak degrade olur

**Auto-promotion nasıl çalışır:** `localnest_memory_capture_event` ile yakalanan olaylar sinyal gücüne göre puanlanır. Güçlü sinyalli olaylar - hata düzeltmeleri, kararlar, tercihler - kalıcı belleklere yükseltilir. Zayıf keşif olayları kaydedilir ve 30 gün sonra sessizce silinir.

---

## İndeks Backend'i

| Backend | Ne zaman kullanılır |
|---------|-------------|
| `sqlite-vec` | **Önerilir.** Kalıcı SQLite, büyük depolar için hızlı ve verimli. Node 22+ gerektirir. |
| `json` | Uyumluluk fallback'i. `sqlite-vec` kullanılamadığında otomatik seçilir. |

Ne zaman geçiş yapılması gerektiğini görmek için `localnest_server_status` → `upgrade_recommended` alanını kontrol edin.

---

## Yapılandırma

`setup` her şeyi `~/.localnest/` altına yazar:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite indeks + memory veritabanları
├── cache/    → Model ağırlıkları, güncelleme durumu
├── backups/  → Yapılandırma geçiş geçmişi
└── vendor/   → Yönetilen native bağımlılıklar (sqlite-vec)
```

**Yapılandırma önceliği:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` dosyası → mevcut dizin

**Temel environment değişkenleri:**

| Variable | Default | Açıklama |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` veya `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite veritabanı path'i |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | İndeks chunk başına satır sayısı |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Chunk'lar arasındaki örtüşme |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Bir indeks çalıştırmasındaki azami dosya sayısı |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding modeli |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Model önbellek path'i |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-encoder reranker modeli |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Yerel memory alt sistemini etkinleştirir |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Memory veritabanı path'i |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Arka plan olaylarını otomatik yükseltir |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm güncelleme denetimi aralığı |

<details>
<summary>Tüm environment değişkenleri</summary>

| Variable | Default | Açıklama |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON indeks path'i |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Native `vec0` uzantı path'i |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Chunk başına azami terim |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Embedding backend'i |
| `LOCALNEST_EMBED_DIMS` | `384` | Embedding vektör boyutları |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Reranker backend'i |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Reranker önbellek path'i |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` veya `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Consent istemini bastırır |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Kontrol edilecek npm paket adı |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | npm denetimi başarısız olursa yeniden deneme aralığı |

</details>

## Kurulum Notu

`0.0.6-beta.1`, `0.0.5` sürümünü mevcut kararlı hat olarak korurken CLI deprecation geçişini önizler: kanonik `localnest task-context` / `localnest capture-outcome` komutları, eski `localnest-mcp-*` yardımcıları için deprecated uyumluluk sarmalayıcıları ve MCP istemcilerinin kullandığı `localnest-mcp` sunucu binary'sinde hiçbir değişiklik yoktur. Bazı npm ortamları ONNX runtime bağımlılık zincirinden gelen tek bir upstream deprecation uyarısı göstermeye devam edebilir; LocalNest işlevselliği etkilenmez.

**Performans ipuçları:**
- Mümkün olduğunda sorguları `project_path` + dar bir `glob` ile sınırlandırın
- `max_results: 20-40` ile başlayın, yalnızca gerektiğinde genişletin
- Reranking varsayılan olarak kapalı kalsın - yalnızca son hassasiyet adımında açın

---

## Skill Dağıtımı

LocalNest, bundled AI ajan skill'lerini tek bir kanonik kaynaktan dağıtır ve desteklenen istemciler için tool'a özgü varyantlar kurar. Mevcut kullanıcı düzeyi hedefler arasında genel ajan dizinleri ile birlikte Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline ve Continue bulunur.

```bash
localnest install skills             # bundled skill'leri kur veya güncelle
localnest install skills --force     # yeniden kurulumu zorla
localnest-mcp-install-skill          # deprecated uyumluluk takma adı
```

**Shell CLI tools** otomasyon ve hook'lar için:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Eski `localnest-mcp-task-context` ve `localnest-mcp-capture-outcome` takma adları uyumluluk için çalışmaya devam eder. Her iki komut da stdin üzerinden JSON kabul eder. GitHub'dan kurulum:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Otomatik Geçiş

Yükseltmeleri tören gerektirmeden yapın. Başlangıçta LocalNest, eski yapılandırma şemalarını ve düz `~/.localnest` düzenini yeni `config/`, `data/`, `cache/` ve `backups/` yapısına otomatik olarak taşır. Elle yeniden çalıştırma yok, yükseltmeden sonra bozulan yapılandırma yok.

---

## Güvenlik

LocalNest, OSS security pipeline desenini izler:

- **CI kalite kapısı** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL statik analizi** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Herkese açık scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Katkı

Bkz. [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Kod tabanına yeni misiniz?** Önce **[Mimari Genel Bakış](../guides/architecture.md)** ile başlayın - sunucunun nasıl boot ettiği, arama ve memory'nin nasıl çalıştığı ve her şeyin nerede bulunduğu burada anlatılır.

---

## Katkıda Bulunanlar

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Kod, dokümantasyon, review, test ve issue raporlarına katkı sunan herkese teşekkürler.

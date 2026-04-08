<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Basis kode Anda. AI Anda. Mesin Anda - tanpa cloud, tanpa kebocoran, tanpa kejutan.**

LocalNest adalah server MCP local-first dan tool CLI yang memberi agen AI akses aman dan terbatasi ke kode Anda, dengan pencarian hibrida, pengindeksan semantik, graf pengetahuan temporal, dan memori persisten yang tidak pernah meninggalkan mesin Anda.

**52 MCP tools** | **Temporal knowledge graph** | **Multi-hop graph traversal** | **Agent-scoped memory** | **Zero cloud dependencies**

📖 [Dokumentasi lengkap](https://wmt-mobile.github.io/localnest/) · [Pendalaman arsitektur](../guides/architecture.md)

## Bahasa README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · Bahasa Indonesia · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Berkas terjemahan ini adalah terjemahan README lengkap yang ditargetkan per locale. Lihat [kebijakan terjemahan](./TRANSLATION_POLICY.md) untuk matriks locale dan aturan terminologi. [README.md](../README.md) bahasa Inggris tetap menjadi sumber utama untuk perintah terbaru, catatan rilis, dan detail lengkap.

---

## Yang Baru di 0.0.7

> Changelog lengkap: [CHANGELOG.md](../CHANGELOG.md)

- **Temporal knowledge graph** -- entitas, tripel, kueri as_of, timeline, deteksi kontradiksi
- **Multi-hop graph traversal** -- jelajahi relasi 2-5 hop melalui recursive CTE (unik di LocalNest)
- **Hierarki Nest/Branch** -- taksonomi memori dua tingkat milik LocalNest untuk retrieval terorganisir
- **Agent-scoped memory** -- isolasi per-agen dengan entri diary pribadi
- **Semantic dedup** -- gate kesamaan embedding mencegah polusi memori duplikat
- **Conversation ingestion** -- impor ekspor chat Markdown/JSON dengan ekstraksi entitas
- **Hooks system** -- callback pre/post operasi untuk memori, KG, traversal, ingestion
- **Arsitektur CLI-first** -- perintah `localnest <noun> <verb>` yang terpadu untuk segalanya
- **Shell completions** -- tab completion bash, zsh, fish
- **17 MCP tools baru** (52 total) -- KG, nest, traversal, diary, ingest, dedup, hooks

---

## Mengapa LocalNest?

Sebagian besar tool AI untuk kode mengirim data ke luar. LocalNest tidak.

Semua hal - pembacaan file, embedding vektor, memori - berjalan di dalam proses pada mesin Anda. Tanpa langganan cloud, tanpa rate limit, tanpa data yang keluar dari perangkat Anda. Dan karena LocalNest berbicara MCP, klien yang kompatibel (Cursor, Windsurf, Codex, Kiro, Gemini CLI) dapat terhubung hanya dengan satu blok konfigurasi.

| Apa yang Anda dapatkan | Cara kerjanya |
|---|---|
| **Akses file yang aman** | Pembacaan berscope di bawah root yang Anda konfigurasi - tidak ada akses ke luar itu |
| **Pencarian leksikal instan** | Pencarian simbol dan pola berbasis `ripgrep` (fallback JS jika `rg` tidak tersedia) |
| **Pencarian semantik** | Embedding vektor lokal melalui `all-MiniLM-L6-v2` - tidak memerlukan GPU |
| **Retrieval hibrida** | Pencarian leksikal + semantik digabungkan dengan peringkat RRF untuk hasil terbaik dari keduanya |
| **Kesadaran proyek** | Mendeteksi proyek secara otomatis dari file penanda dan memberi scope pada setiap pemanggilan tool |
| **Memori agen** | Graf pengetahuan yang tahan lama dan dapat di-query - AI Anda mengingat apa yang telah dipelajarinya |
| **Temporal knowledge graph** | Tripel subjek-predikat-objek dengan validitas waktu -- kueri apa yang benar kapan saja |
| **Multi-hop graph traversal** | Jelajahi relasi 2-5 hop via recursive CTE -- tidak ada tool lokal lain yang melakukannya |
| **Hierarki Nest/Branch** | Taksonomi memori dua tingkat dengan boost berfilter metadata untuk retrieval terorganisir |
| **Conversation ingestion** | Impor ekspor chat Markdown/JSON ke memori terstruktur + tripel KG |
| **Isolasi agen** | Diary dan scoping memori per-agen -- banyak agen, nol kontaminasi silang |
| **Hooks system** | Hook pre/post operasi untuk memori, KG, traversal, ingestion -- sambungkan logika Anda sendiri |

---

## Mulai Cepat

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Tempelkan ini ke konfigurasi klien MCP Anda**

`setup` menulis konfigurasi untuk tool yang terdeteksi secara otomatis. Anda juga akan menemukan blok yang siap ditempel di `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** Gunakan konfigurasi yang ditulis oleh `localnest setup` - konfigurasi itu mengatur perintah yang benar untuk platform Anda secara otomatis.

Mulai ulang klien MCP Anda. Jika klien timeout, setel `startup_timeout_sec: 30` di konfigurasi klien Anda.

**Persyaratan:** Node.js `>=18` · `ripgrep` disarankan tetapi opsional

Chunking berbasis AST dikirim secara default untuk `JavaScript`, `Python`, `Go`, `Bash`, `Lua`, dan `Dart`. Bahasa lain tetap dapat diindeks dengan baik menggunakan chunking fallback berbasis baris.

Runtime stabil saat ini menggunakan `@huggingface/transformers` untuk embedding lokal dan reranking. Default setup baru menggunakan `huggingface`, dan konfigurasi lama berbasis `xenova` tetap diterima sebagai alias kompatibilitas.

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
localnest upgrade              # stable terbaru
localnest upgrade stable       # stable terbaru
localnest upgrade beta         # beta terbaru
localnest upgrade <version>    # pin ke versi tertentu
localnest version              # cek versi saat ini
```

---

## Cara Agen Menggunakannya

Empat alur kerja mencakup hampir semuanya:

### Lookup cepat - temukan, baca, selesai
Terbaik untuk menemukan file, simbol, atau pola kode secara tepat.

```
localnest_search_files   → temukan modul berdasarkan path/nama
localnest_search_code    → temukan simbol atau identifier yang tepat
localnest_read_file      → baca baris yang relevan
```

### Tugas mendalam - debug, refactor, review dengan konteks
Terbaik untuk pekerjaan kompleks ketika memori dan pemahaman semantik penting.

```
localnest_task_context    → satu panggilan: status runtime + memori yang dipanggil kembali
localnest_search_hybrid   → pencarian tingkat konsep di seluruh basis kode Anda
localnest_read_file       → baca bagian yang relevan
localnest_capture_outcome → simpan apa yang dipelajari untuk nanti
```

### Knowledge graph -- fakta terstruktur tentang proyek

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### Conversation memory -- belajar dari chat sebelumnya

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## Referensi CLI

LocalNest adalah tool CLI lengkap. Semua dikelola dari terminal:

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

**Flag global** bekerja di setiap perintah: `--json` (output mesin), `--verbose`, `--quiet`, `--config <path>`

---

## Tools

### Workspace & Discovery

| Tool | Fungsinya |
|------|-------------|
| `localnest_list_roots` | Menampilkan root yang dikonfigurasi |
| `localnest_list_projects` | Menampilkan proyek di bawah sebuah root |
| `localnest_project_tree` | Pohon file/folder untuk sebuah proyek |
| `localnest_summarize_project` | Ringkasan bahasa dan ekstensi |
| `localnest_read_file` | Membaca jendela baris terbatas dari sebuah file |

### Search & Index

| Tool | Fungsinya |
|------|-------------|
| `localnest_search_files` | Pencarian nama file/path - mulai di sini untuk menemukan modul |
| `localnest_search_code` | Pencarian leksikal - simbol tepat, regex, identifier |
| `localnest_search_hybrid` | Pencarian hibrida - leksikal + semantik, diberi peringkat RRF |
| `localnest_get_symbol` | Menemukan lokasi definisi/ekspor untuk sebuah simbol |
| `localnest_find_usages` | Menemukan import dan call site untuk sebuah simbol |
| `localnest_index_project` | Membangun atau menyegarkan indeks semantik |
| `localnest_index_status` | Metadata indeks - ada, usang, backend |
| `localnest_embed_status` | Kesiapan backend embedding dan pencarian vektor |

### Memory

| Tool | Fungsinya |
|------|-------------|
| `localnest_task_context` | Konteks runtime + memori satu panggilan untuk sebuah tugas |
| `localnest_memory_recall` | Memanggil memori yang relevan untuk sebuah query |
| `localnest_capture_outcome` | Menangkap hasil tugas ke dalam memori |
| `localnest_memory_capture_event` | Ingest event latar belakang dengan auto-promotion |
| `localnest_memory_store` | Menyimpan memori secara manual |
| `localnest_memory_update` | Memperbarui memori dan menambahkan revisi |
| `localnest_memory_delete` | Menghapus memori |
| `localnest_memory_get` | Mengambil satu memori beserta riwayat revisinya |
| `localnest_memory_list` | Menampilkan memori yang tersimpan |
| `localnest_memory_events` | Memeriksa event memori terbaru |
| `localnest_memory_add_relation` | Menautkan dua memori dengan relasi bernama |
| `localnest_memory_remove_relation` | Menghapus sebuah relasi |
| `localnest_memory_related` | Menelusuri graf pengetahuan sejauh satu hop |
| `localnest_memory_suggest_relations` | Menyarankan memori terkait berdasarkan kemiripan |
| `localnest_memory_status` | Status consent, backend, dan database memori |

### Knowledge Graph

| Tool | Fungsinya |
|------|-------------|
| `localnest_kg_add_entity` | Membuat entitas (orang, proyek, konsep, tool) |
| `localnest_kg_add_triple` | Menambah fakta subjek-predikat-objek dengan validitas temporal |
| `localnest_kg_query` | Mengkueri relasi entitas dengan filter arah |
| `localnest_kg_invalidate` | Menandai fakta sebagai tidak valid lagi (pengarsipan, bukan penghapusan) |
| `localnest_kg_as_of` | Kueri titik waktu -- apa yang benar pada tanggal X? |
| `localnest_kg_timeline` | Evolusi fakta kronologis untuk sebuah entitas |
| `localnest_kg_stats` | Jumlah entitas, jumlah tripel, rincian predikat |

### Organisasi Nest/Branch

| Tool | Fungsinya |
|------|-------------|
| `localnest_nest_list` | Menampilkan semua nest (domain memori tingkat atas) dengan hitungan |
| `localnest_nest_branches` | Menampilkan branch (topik) dalam sebuah nest |
| `localnest_nest_tree` | Hierarki lengkap: nest, branch, dan hitungan |

### Graph Traversal

| Tool | Fungsinya |
|------|-------------|
| `localnest_graph_traverse` | Traversal multi-hop dengan pelacakan jalur (recursive CTE) |
| `localnest_graph_bridges` | Menemukan jembatan cross-nest -- koneksi lintas domain |

### Agent Diary

| Tool | Fungsinya |
|------|-------------|
| `localnest_diary_write` | Menulis entri catatan pribadi (terisolasi per agen) |
| `localnest_diary_read` | Membaca entri diary terbaru Anda |

### Conversation Ingestion

| Tool | Fungsinya |
|------|-------------|
| `localnest_ingest_markdown` | Mengimpor ekspor percakapan Markdown ke memori + KG |
| `localnest_ingest_json` | Mengimpor ekspor percakapan JSON ke memori + KG |
| `localnest_memory_check_duplicate` | Deteksi duplikat semantik sebelum penyimpanan |

### Server & Updates

| Tool | Fungsinya |
|------|-------------|
| `localnest_server_status` | Konfigurasi runtime, root, `ripgrep`, backend indeks |
| `localnest_health` | Ringkasan kesehatan ringkas dengan laporan monitor latar belakang |
| `localnest_usage_guide` | Panduan praktik terbaik untuk agen |
| `localnest_update_status` | Memeriksa npm untuk versi terbaru (cached) |
| `localnest_update_self` | Memperbarui secara global dan menyinkronkan skill bawaan (memerlukan persetujuan) |

**Total 50 tool.** Semua tool mendukung `response_format: "json"` (default) atau `"markdown"`. Tool daftar mengembalikan `total_count`, `has_more`, dan `next_offset` untuk pagination.

---

## Perbandingan LocalNest

LocalNest adalah satu-satunya server MCP local-first yang menggabungkan code retrieval DAN structured memory dalam satu tool. Berikut posisinya:

| Kemampuan | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (tanpa cloud)** | Ya | Ya | Tidak ($25+/bln) | Tidak (Neo4j) | Tidak ($20-200/bln) |
| **Code retrieval** | 50 MCP tool, AST-aware, hybrid search | Tidak ada | Tidak ada | Tidak ada | Tidak ada |
| **Knowledge graph** | Tripel SQLite dengan validitas temporal | Tripel SQLite | Neo4j | Neo4j | Key-value |
| **Multi-hop traversal** | Ya (recursive CTE, 2-5 hop) | Tidak (flat lookup saja) | Tidak | Ya (perlu Neo4j) | Tidak |
| **Temporal queries (as_of)** | Ya | Ya | Ya | Ya | Tidak |
| **Deteksi kontradiksi** | Ya (peringatan saat tulis) | Ada tapi tidak terhubung | Tidak | Tidak | Tidak |
| **Conversation ingestion** | Markdown + JSON | Markdown + JSON + Slack | Tidak | Tidak | Tidak |
| **Isolasi agen** | Scoping per-agen + diary pribadi | Wing-per-agent | User/session scoping | Tidak | User/agent/run/session |
| **Semantic dedup** | 0.92 cosine gate pada semua penulisan | 0.9 threshold | Tidak | Tidak | Tidak |
| **Hierarki memori** | Nest/Branch (original) | Wing/Room/Hall (palace) | Flat | Flat | Flat |
| **Hooks system** | Hook pre/post operasi | Tidak ada | Webhooks | Tidak ada | Tidak ada |
| **Runtime** | Node.js (ringan) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (cloud) |
| **Dependencies** | 0 baru (SQLite murni) | ChromaDB (berat) | Neo4j ($25+/bln) | Neo4j | Cloud API |
| **MCP tools** | 50 | 19 | 0 | 0 | 0 |
| **Biaya** | Gratis | Gratis | $25+/bln | $25+/bln | $20-200/bln |

**Posisi unik LocalNest:** Satu-satunya tool yang memberikan AI Anda pemahaman kode mendalam DAN memori persisten terstruktur -- sepenuhnya lokal, nol cloud, nol biaya.

---

## Memory - AI Anda Tidak Lupa

Aktifkan memory saat `localnest setup`, dan LocalNest akan mulai membangun graf pengetahuan yang tahan lama di database SQLite lokal. Setiap perbaikan bug, keputusan arsitektur, dan preferensi yang disentuh agen AI Anda dapat dipanggil kembali pada sesi berikutnya.

- Memerlukan **Node 22.13+** - tool pencarian dan file tetap berfungsi baik di Node 18/20 tanpa ini
- Kegagalan memory tidak pernah memblokir tool lain - semuanya mengalami degradasi secara independen

**Cara kerja auto-promotion:** event yang ditangkap melalui `localnest_memory_capture_event` diberi skor berdasarkan kekuatan sinyal. Event dengan sinyal tinggi - perbaikan bug, keputusan, preferensi - dipromosikan menjadi memori yang tahan lama. Event eksplorasi yang lemah dicatat dan dibuang secara diam-diam setelah 30 hari.

**Knowledge graph:** Simpan fakta terstruktur sebagai tripel subjek-predikat-objek dengan validitas temporal. Kueri apa yang benar pada titik waktu mana pun dengan `as_of`. Jelajahi relasi 2-5 hop dengan traversal CTE rekursif. Deteksi kontradiksi saat penulisan.

**Hierarki Nest/Branch:** Organisasi memori ke dalam nest (domain tingkat atas) dan branch (topik). Recall berfilter metadata mempersempit kandidat sebelum scoring untuk hasil yang lebih cepat dan lebih tepat.

**Isolasi agen:** Setiap agen mendapat scope memori dan diary pribadinya sendiri. Recall mengembalikan memori sendiri + global, tidak pernah data pribadi agen lain.

**Semantic dedup:** Setiap penulisan melewati gate kesamaan embedding (threshold cosine default 0.92). Duplikat hampir identik tertangkap sebelum penyimpanan -- memori Anda tetap bersih.

**Conversation ingestion:** Impor ekspor chat Markdown atau JSON. Setiap giliran menjadi entri memori dengan ekstraksi entitas otomatis dan pembuatan tripel KG. Re-ingestion file yang sama dilewati berdasarkan hash konten.

**Hooks:** Daftarkan callback pre/post pada operasi memori apa pun -- penyimpanan, recall, penulisan KG, traversal, ingestion. Bangun pipeline kustom tanpa mengubah kode inti.

---

## Backend Indeks

| Backend | Kapan digunakan |
|---------|-------------|
| `sqlite-vec` | **Direkomendasikan.** SQLite persisten, cepat, dan efisien untuk repo besar. Memerlukan Node 22+. |
| `json` | Fallback kompatibilitas. Dipilih otomatis jika `sqlite-vec` tidak tersedia. |

Periksa `localnest_server_status` → `upgrade_recommended` untuk mengetahui kapan perlu migrasi.

---

## Konfigurasi

`setup` menulis semuanya ke `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → Database indeks SQLite + database memory
├── cache/    → Bobot model, status pembaruan
├── backups/  → Riwayat migrasi konfigurasi
└── vendor/   → Dependensi native terkelola (sqlite-vec)
```

**Prioritas konfigurasi:** env `PROJECT_ROOTS` → file `LOCALNEST_CONFIG` → direktori saat ini

**Variabel environment utama:**

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` atau `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Path database SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Baris per chunk indeks |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Overlap antar chunk |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Maks file per proses indeks |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Model embedding |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Path cache model |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Model reranker cross-encoder |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Mengaktifkan subsistem memory lokal |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Path database memory |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Auto-promote event latar belakang |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Interval pengecekan update npm |

<details>
<summary>Semua variabel environment</summary>

| Variable | Default | Deskripsi |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | Path indeks JSON |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Path ekstensi `vec0` native |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Maks istilah per chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Backend embedding |
| `LOCALNEST_EMBED_DIMS` | `384` | Dimensi vektor embedding |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Backend reranker |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Path cache reranker |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite`, atau `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Menyembunyikan prompt consent |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Nama paket npm yang diperiksa |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Coba lagi setelah pengecekan npm gagal |

</details>

## Catatan Instalasi

`0.0.6-beta.1` mempertahankan `0.0.5` sebagai jalur stable saat ini sambil mempratinjau pass deprecasi CLI: perintah kanonis `localnest task-context` / `localnest capture-outcome`, wrapper kompatibilitas yang deprecated untuk helper `localnest-mcp-*` lama, dan tanpa perubahan pada biner server `localnest-mcp` yang digunakan oleh klien MCP. Beberapa environment npm mungkin masih menampilkan satu peringatan deprecasi dari rantai dependensi runtime ONNX; fungsi LocalNest tidak terpengaruh.

**Tips performa:**
- Scope query dengan `project_path` + `glob` sempit bila memungkinkan
- Mulai dengan `max_results: 20-40`, perluas hanya jika memang dibutuhkan
- Biarkan reranking nonaktif secara default - aktifkan hanya untuk tahap presisi akhir

---

## Distribusi Skill

LocalNest mengirim skill agen AI bawaan dari satu sumber kanonis dan memasang varian khusus tool untuk klien yang didukung. Target tingkat pengguna saat ini mencakup direktori agen generik plus Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline, dan Continue.

```bash
localnest install skills             # pasang atau perbarui skill bawaan
localnest install skills --force     # paksa pemasangan ulang
localnest-mcp-install-skill          # alias kompatibilitas yang deprecated
```

**Tool CLI shell** untuk otomasi dan hook:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Alias lama `localnest-mcp-task-context` dan `localnest-mcp-capture-outcome` tetap berfungsi untuk kompatibilitas. Kedua perintah menerima JSON dari stdin. Instal dari GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Migrasi Otomatis

Lakukan upgrade tanpa drama. Saat startup, LocalNest secara otomatis memigrasikan skema konfigurasi lama dan tata letak datar `~/.localnest` ke struktur baru `config/`, `data/`, `cache/`, dan `backups/`. Tidak perlu rerun manual, tidak ada konfigurasi yang rusak setelah upgrade.

---

## Keamanan

LocalNest mengikuti pola pipeline keamanan OSS:

- **Gerbang kualitas CI** — [quality.yml](../.github/workflows/quality.yml)
- **Analisis statis CodeQL** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Scorecard publik** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Berkontribusi

Lihat [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Baru mengenal codebase ini?** Mulailah dari **[Ikhtisar Arsitektur](../guides/architecture.md)** - bagian ini menjelaskan bagaimana server melakukan boot, bagaimana pencarian dan memory bekerja, dan di mana semuanya berada.

---

## Kontributor

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Terima kasih kepada semua orang yang berkontribusi pada kode, dokumentasi, review, pengujian, dan laporan issue.

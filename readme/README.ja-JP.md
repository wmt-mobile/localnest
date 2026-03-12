<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**あなたのコードベース。あなたの AI。あなたのマシン。クラウドなし、漏えいなし、想定外なし。**

LocalNest は local-first の MCP サーバーです。AI エージェントに対して、安全でスコープされたコードアクセスを提供し、ハイブリッド検索、セマンティックインデックス、そしてマシンの外に出ない永続メモリを備えています。

📖 [完全なドキュメント](https://wmt-mobile.github.io/localnest/) · [アーキテクチャの詳細](../guides/architecture.md)

## README の言語

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · 日本語 · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

これらの翻訳ファイルは、各ロケール向けの完全な README 翻訳です。対象ロケールの一覧と用語ルールは [翻訳ポリシー](./TRANSLATION_POLICY.md) を参照してください。新しいコマンド、リリースノート、完全な詳細については、英語版の [README.md](../README.md) が引き続き正式な情報源です。

---

## なぜ LocalNest なのか？

多くの AI コードツールは外部に通信します。LocalNest は違います。

ファイル読み取り、ベクトル埋め込み、メモリのすべてが、あなたのマシン上でプロセス内実行されます。クラウド契約も、レート制限も、マシンの外へ出るデータもありません。しかも MCP を話すため、互換クライアント (Cursor, Windsurf, Codex, Kiro, Gemini CLI) なら 1 つの設定ブロックで接続できます。

| 得られるもの | 仕組み |
|---|---|
| **安全なファイルアクセス** | 設定したルート配下に限定した読み取りで、範囲外にはアクセスしません |
| **即時のレキシカル検索** | `ripgrep` ベースのシンボル検索とパターン検索 (`rg` がなければ JS フォールバック) |
| **セマンティック検索** | `all-MiniLM-L6-v2` によるローカルベクトル埋め込み。GPU は不要 |
| **ハイブリッド検索** | レキシカル検索とセマンティック検索を RRF ランキングで統合し、両方の利点を活かします |
| **プロジェクト認識** | マーカーファイルからプロジェクトを自動検出し、すべてのツール呼び出しを適切な範囲に限定します |
| **エージェントメモリ** | 永続的でクエリ可能なナレッジグラフにより、AI が学んだことを覚え続けます |

---

## クイックスタート

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. これを MCP クライアント設定に追加**

`setup` は検出したツール向けの設定を自動生成します。すぐに貼り付けられるブロックは `~/.localnest/config/mcp.localnest.json` にも出力されます。

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

> **Windows:** `localnest setup` が書き出した設定を使ってください。プラットフォームに合った正しいコマンドが自動で設定されます。

MCP クライアントを再起動してください。タイムアウトする場合は、クライアント設定で `startup_timeout_sec: 30` を指定します。

**要件:** Node.js `>=18` · `ripgrep` 推奨、ただし必須ではありません

AST 対応チャンク分割は、`JavaScript`、`Python`、`Go`、`Bash`、`Lua`、`Dart` で標準有効です。その他の言語も、行ベースのフォールバックチャンク分割で問題なくインデックスされます。

現在の stable ランタイムは、ローカル埋め込みと再ランキングに `@huggingface/transformers` を使用します。新しいセットアップ既定値は `huggingface` を使い、古い `xenova` 設定も互換エイリアスとして引き続き受け付けます。

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## アップグレード

```bash
localnest upgrade              # 最新の stable
localnest upgrade stable       # 最新の stable
localnest upgrade beta         # 最新の beta
localnest upgrade <version>    # 特定のバージョンに固定
localnest version              # 現在のバージョンを確認
```

---

## エージェントによる使い方

ほとんどの用途は、次の 2 つのワークフローでカバーできます。

### 高速ルックアップ — 見つけて、読んで、終わり
ファイル、シンボル、コードパターンを素早く特定したいときに最適です。

```
localnest_search_files   → パスや名前からモジュールを見つける
localnest_search_code    → 正確なシンボルや識別子を見つける
localnest_read_file      → 関連する行を読む
```

### ディープタスク — 文脈付きでデバッグ、リファクタ、レビュー
メモリとセマンティックな理解が重要になる複雑な作業に最適です。

```
localnest_task_context    → 1 回の呼び出しで実行状況 + 呼び出されたメモリを取得
localnest_search_hybrid   → コードベース全体を概念レベルで検索
localnest_read_file       → 関連するセクションを読む
localnest_capture_outcome → 学んだ内容を次回のために保存
```

> **ツールの成功 ≠ 有用な結果。** ツールが OK を返しても、結果が空のことはあります。意味のある証拠として扱うべきなのは、空でないファイル一致と実際の行内容であって、単なるプロセス成功ではありません。

---

## ツール

### ワークスペースと探索

| ツール | 役割 |
|------|-------------|
| `localnest_list_roots` | 設定済みルートを一覧表示 |
| `localnest_list_projects` | ルート配下のプロジェクトを一覧表示 |
| `localnest_project_tree` | プロジェクトのファイル/フォルダツリー |
| `localnest_summarize_project` | 言語と拡張子の内訳 |
| `localnest_read_file` | ファイルから範囲を限定して行を読む |

### 検索とインデックス

| ツール | 役割 |
|------|-------------|
| `localnest_search_files` | ファイル名/パス名検索。モジュール探索はここから開始 |
| `localnest_search_code` | レキシカル検索。正確なシンボル、正規表現、識別子向け |
| `localnest_search_hybrid` | ハイブリッド検索。レキシカル + セマンティック、RRF ランキング付き |
| `localnest_get_symbol` | シンボルの定義/エクスポート位置を探す |
| `localnest_find_usages` | シンボルの import と呼び出し箇所を探す |
| `localnest_index_project` | セマンティックインデックスを構築または更新 |
| `localnest_index_status` | インデックスのメタデータ。存在有無、鮮度、バックエンド |
| `localnest_embed_status` | 埋め込みバックエンドとベクトル検索の準備状況 |

### メモリ

| ツール | 役割 |
|------|-------------|
| `localnest_task_context` | タスク向けの実行状況 + メモリ文脈を 1 回で取得 |
| `localnest_memory_recall` | クエリに関連するメモリを呼び出す |
| `localnest_capture_outcome` | タスク結果をメモリに記録 |
| `localnest_memory_capture_event` | バックグラウンドイベントを取り込み、自動昇格 |
| `localnest_memory_store` | メモリを手動で保存 |
| `localnest_memory_update` | メモリを更新し、改訂を追加 |
| `localnest_memory_delete` | メモリを削除 |
| `localnest_memory_get` | 改訂履歴付きで 1 件のメモリを取得 |
| `localnest_memory_list` | 保存済みメモリを一覧表示 |
| `localnest_memory_events` | 最近のメモリイベントを確認 |
| `localnest_memory_add_relation` | 2 つのメモリを名前付き関係でリンク |
| `localnest_memory_remove_relation` | 関係を削除 |
| `localnest_memory_related` | ナレッジグラフを 1 ホップたどる |
| `localnest_memory_suggest_relations` | 類似度に基づいて関連メモリを自動提案 |
| `localnest_memory_status` | メモリ同意、バックエンド、データベース状態 |

### サーバーと更新

| ツール | 役割 |
|------|-------------|
| `localnest_server_status` | 実行設定、ルート、`ripgrep`、インデックスバックエンド |
| `localnest_health` | バックグラウンド監視レポート付きのコンパクトなヘルス概要 |
| `localnest_usage_guide` | エージェント向けベストプラクティス |
| `localnest_update_status` | npm で最新バージョンを確認 (キャッシュあり) |
| `localnest_update_self` | グローバル更新と同梱スキル同期 (承認が必要) |

すべてのツールは `response_format: "json"` (既定) または `"markdown"` をサポートします。一覧系ツールは、ページネーション用に `total_count`、`has_more`、`next_offset` を返します。

---

## メモリ — AI は忘れない

`localnest setup` 中にメモリを有効化すると、LocalNest はローカル SQLite データベースに永続的なナレッジグラフを構築し始めます。AI エージェントが関わったバグ修正、アーキテクチャ判断、設定の好みは、次のセッションで呼び出せます。

- **Node 22.13+** が必要です。検索ツールとファイルツールは、メモリなしでも Node 18/20 で問題なく動作します
- メモリ障害が他のツールを止めることはありません。各機能は独立して劣化します

**自動昇格の仕組み:** `localnest_memory_capture_event` で取得したイベントは、シグナル強度でスコア化されます。強いシグナルを持つイベント、つまりバグ修正、意思決定、好みの設定は永続メモリへ昇格します。探索的で弱いイベントは記録されたあと、30 日で静かに破棄されます。

---

## インデックスバックエンド

| バックエンド | 使いどころ |
|---------|-------------|
| `sqlite-vec` | **推奨。** 永続 SQLite で、大規模リポジトリでも高速かつ効率的です。Node 22+ が必要です。 |
| `json` | 互換性用フォールバック。`sqlite-vec` が使えない場合に自動選択されます。 |

移行のタイミングは `localnest_server_status` → `upgrade_recommended` で確認できます。

---

## 設定

`setup` はすべてを `~/.localnest/` に書き込みます。

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite インデックス + メモリデータベース
├── cache/    → モデル重み、更新状態
├── backups/  → 設定移行の履歴
└── vendor/   → 管理されたネイティブ依存関係 (sqlite-vec)
```

**設定の優先順位:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → current directory

**主要な環境変数:**

| 変数 | 既定値 | 説明 |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` または `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite データベースパス |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | 1 つのインデックスチャンクあたりの行数 |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | チャンク間のオーバーラップ |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | 1 回のインデックス実行で処理する最大ファイル数 |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | 埋め込みモデル |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | モデルキャッシュのパス |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-Encoder reranker モデル |
| `LOCALNEST_MEMORY_ENABLED` | `false` | ローカルメモリサブシステムを有効化 |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | メモリデータベースのパス |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | バックグラウンドイベントを自動昇格 |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm 更新確認の間隔 |

<details>
<summary>すべての環境変数</summary>

| 変数 | 既定値 | 説明 |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON インデックスのパス |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | ネイティブ `vec0` 拡張のパス |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | 1 チャンクあたりの最大語数 |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | 埋め込みバックエンド |
| `LOCALNEST_EMBED_DIMS` | `384` | 埋め込みベクトル次元 |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | 再ランキングバックエンド |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | 再ランキングキャッシュのパス |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`、`node-sqlite`、または `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | 同意プロンプトを抑止 |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | 確認対象の npm パッケージ名 |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | npm 確認失敗時の再試行間隔 |

</details>

## インストールに関する注記

`0.0.6-beta.1` は、現在の stable 系列を `0.0.5` のまま維持しつつ、CLI 非推奨化フェーズを先行公開します。正規の `localnest task-context` / `localnest capture-outcome` コマンド、旧 `localnest-mcp-*` ヘルパー向けの非推奨互換ラッパー、そして MCP クライアントが使う `localnest-mcp` サーバーバイナリには変更がない、という内容です。npm 環境によっては ONNX runtime 依存チェーン由来の上流の非推奨警告が 1 件表示されることがありますが、LocalNest の機能には影響しません。

**パフォーマンスのヒント:**
- 可能な限り `project_path` と狭い `glob` でクエリ範囲を絞る
- `max_results: 20–40` から始め、必要なときだけ広げる
- 再ランキングは既定でオフのままにし、最終的な精度確認時だけ有効化する

---

## スキル配布

LocalNest は、正規の 1 つのソースから同梱 AI エージェントスキルを配布し、対応クライアント向けにツール別バリアントをインストールします。現在のユーザーレベル対象には、汎用エージェントディレクトリに加えて、Codex、Copilot、Claude Code、Cursor、Windsurf、OpenCode、Gemini、Antigravity、Cline、Continue が含まれます。

```bash
localnest install skills             # 同梱スキルをインストールまたは更新
localnest install skills --force     # 強制的に再インストール
localnest-mcp-install-skill          # 非推奨の互換エイリアス
```

**自動化やフック向けの Shell CLI ツール:**

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

互換性のため、従来のエイリアス `localnest-mcp-task-context` と `localnest-mcp-capture-outcome` も引き続き動作します。どちらのコマンドも stdin から JSON を受け付けます。GitHub からのインストール:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## 自動移行

大げさな手順は不要です。起動時に LocalNest は、古い設定スキーマとフラットな `~/.localnest` レイアウトを、新しい `config/`、`data/`、`cache/`、`backups/` 構成へ自動移行します。アップグレードのたびに手動でやり直す必要はなく、設定が壊れることもありません。

---

## セキュリティ

LocalNest は OSS のセキュリティパイプラインのパターンに従っています。

- **CI 品質ゲート** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL 静的解析** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **公開 Scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## コントリビュート

[CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md) を参照してください。

> **このコードベースが初めてですか？** まずは **[Architecture Overview](../guides/architecture.md)** から始めてください。サーバーの起動方法、検索とメモリの仕組み、各要素の配置を把握できます。

---

## Contributors

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

コード、ドキュメント、レビュー、テスト、Issue 報告に貢献してくれるすべての皆さんに感謝します。

<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**你的代码库。你的 AI。你的机器。没有云端、没有泄露、没有意外。**

LocalNest 是一个 local-first 的 MCP 服务器，为 AI 代理提供安全且有范围限制的代码访问能力，同时具备混合搜索、语义索引，以及绝不会离开你机器的持久记忆。

📖 [完整文档](https://wmt-mobile.github.io/localnest/) · [架构深度解析](../guides/architecture.md)

## README 语言

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · 简体中文

这些翻译文件都是针对具体区域设置的完整 README 译本。目标语言矩阵和术语规则请参阅[翻译政策](./TRANSLATION_POLICY.md)。最新命令、发布说明和完整细节仍以英文版 [README.md](../README.md) 为准。

---

## 为什么选择 LocalNest？

大多数 AI 代码工具都会把数据回传出去。LocalNest 不会。

文件读取、向量嵌入、记忆，一切都在你的机器上以进程内方式运行。没有云订阅、没有速率限制、没有任何数据离开你的设备。而且它使用 MCP，所以任何兼容客户端（Cursor、Windsurf、Codex、Kiro、Gemini CLI）都可以通过一段配置直接接入。

| 你能得到什么 | 它如何工作 |
|---|---|
| **安全的文件访问** | 只允许在你配置的根目录下读取，范围之外一律不碰 |
| **即时 lexical 搜索** | 基于 `ripgrep` 的符号与模式搜索（缺少 `rg` 时使用 JS fallback） |
| **语义搜索** | 通过 `all-MiniLM-L6-v2` 在本地生成向量嵌入，不需要 GPU |
| **混合检索** | 将 lexical 和 semantic 搜索与 RRF 排名融合，兼顾两者优势 |
| **项目感知** | 通过标记文件自动识别项目，并为每次工具调用限定作用范围 |
| **代理记忆** | 持久、可查询的知识图谱，让 AI 记住它学到的内容 |

---

## 快速开始

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. 把这段配置放进你的 MCP 客户端配置中**

`setup` 会为检测到的工具自动写入配置。你也可以在 `~/.localnest/config/mcp.localnest.json` 里找到可直接粘贴的配置块：

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

> **Windows:** 请使用 `localnest setup` 写出的配置，它会自动为你的平台设置正确的命令。

重启你的 MCP 客户端。如果启动超时，请在客户端配置里设置 `startup_timeout_sec: 30`。

**要求：** Node.js `>=18` · 推荐安装 `ripgrep`，但不是必须

AST 感知分块默认支持 `JavaScript`、`Python`、`Go`、`Bash`、`Lua` 和 `Dart`。其他语言也会通过基于行的 fallback 分块正常建立索引。

当前 stable 运行时使用 `@huggingface/transformers` 在本地完成嵌入和 reranking。新的 setup 默认值使用 `huggingface`，旧的 `xenova` 配置仍然作为兼容别名被接受。

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## 升级

```bash
localnest upgrade              # 最新 stable
localnest upgrade stable       # 最新 stable
localnest upgrade beta         # 最新 beta
localnest upgrade <version>    # 固定到指定版本
localnest version              # 查看当前版本
```

---

## 代理如何使用

绝大多数场景都可以用下面两种工作流覆盖：

### 快速查找 - 找到它，读出来，结束
适合快速定位某个文件、符号或代码模式。

```
localnest_search_files   → 按路径或名称找到模块
localnest_search_code    → 找到精确的符号或标识符
localnest_read_file      → 读取相关行
```

### 深度任务 - 带上下文地调试、重构、评审
适合需要记忆和语义理解的复杂工作。

```
localnest_task_context    → 一次调用获取运行时状态 + 回忆出的记忆
localnest_search_hybrid   → 在整个代码库中做概念级搜索
localnest_read_file       → 读取相关片段
localnest_capture_outcome → 把这次学到的内容保存到下次可用
```

> **工具成功 ≠ 结果有用。** 工具可能返回 OK，但内容依然是空的。真正有意义的证据是非空的文件匹配和真实的代码行内容，而不只是进程成功执行。

---

## 工具

### 工作区与发现

| 工具 | 作用 |
|------|-------------|
| `localnest_list_roots` | 列出已配置的根目录 |
| `localnest_list_projects` | 列出某个根目录下的项目 |
| `localnest_project_tree` | 查看项目的文件/文件夹树 |
| `localnest_summarize_project` | 统计语言和扩展名分布 |
| `localnest_read_file` | 按限定行范围读取文件 |

### 搜索与索引

| 工具 | 作用 |
|------|-------------|
| `localnest_search_files` | 文件名/路径名搜索，发现模块时先用它 |
| `localnest_search_code` | lexical 搜索，用于精确符号、正则、标识符 |
| `localnest_search_hybrid` | 混合搜索，lexical + semantic，并使用 RRF 排名 |
| `localnest_get_symbol` | 查找符号的定义/导出位置 |
| `localnest_find_usages` | 查找符号的 import 和调用位置 |
| `localnest_index_project` | 构建或刷新语义索引 |
| `localnest_index_status` | 查看索引元数据，如是否存在、是否过期、使用的后端 |
| `localnest_embed_status` | 查看嵌入后端和向量搜索就绪状态 |

### 记忆

| 工具 | 作用 |
|------|-------------|
| `localnest_task_context` | 一次调用获取任务的运行时 + 记忆上下文 |
| `localnest_memory_recall` | 回忆与查询相关的记忆 |
| `localnest_capture_outcome` | 将任务结果写入记忆 |
| `localnest_memory_capture_event` | 接收后台事件并自动提升 |
| `localnest_memory_store` | 手动存储一条记忆 |
| `localnest_memory_update` | 更新记忆并追加修订 |
| `localnest_memory_delete` | 删除记忆 |
| `localnest_memory_get` | 获取单条记忆及其修订历史 |
| `localnest_memory_list` | 列出已存储的记忆 |
| `localnest_memory_events` | 查看最近的记忆事件 |
| `localnest_memory_add_relation` | 用命名关系连接两条记忆 |
| `localnest_memory_remove_relation` | 删除一条关系 |
| `localnest_memory_related` | 在知识图谱中向外遍历一跳 |
| `localnest_memory_suggest_relations` | 按相似度自动建议相关记忆 |
| `localnest_memory_status` | 查看记忆同意状态、后端和数据库状态 |

### 服务器与更新

| 工具 | 作用 |
|------|-------------|
| `localnest_server_status` | 运行时配置、根目录、`ripgrep`、索引后端 |
| `localnest_health` | 带后台监控报告的精简健康摘要 |
| `localnest_usage_guide` | 面向代理的最佳实践指南 |
| `localnest_update_status` | 检查 npm 上的最新版本（带缓存） |
| `localnest_update_self` | 全局更新并同步内置 skill（需要批准） |

所有工具都支持 `response_format: "json"`（默认）或 `"markdown"`。列表类工具会返回 `total_count`、`has_more`、`next_offset` 用于分页。

---

## 记忆 - 你的 AI 不会忘记

在 `localnest setup` 期间启用记忆后，LocalNest 就会开始在本地 SQLite 数据库中构建持久知识图谱。AI 代理处理过的每一次 bug 修复、架构决策和偏好设置，都可以在下一次会话中被重新调用。

- 需要 **Node 22.13+**，但搜索和文件工具在没有记忆功能时也能在 Node 18/20 上正常工作
- 记忆功能出错不会阻塞其他工具，所有能力都会彼此独立地降级

**自动提升如何工作：** 通过 `localnest_memory_capture_event` 捕获的事件会按信号强度评分。高信号事件，例如 bug 修复、决策和偏好，会被提升为持久记忆。弱信号的探索性事件会先记录下来，然后在 30 天后悄悄丢弃。

---

## 索引后端

| 后端 | 适用场景 |
|---------|-------------|
| `sqlite-vec` | **推荐。** 基于持久化 SQLite，对大型仓库也足够快速高效。需要 Node 22+。 |
| `json` | 兼容性 fallback。当 `sqlite-vec` 不可用时会自动选用。 |

什么时候该迁移，可以查看 `localnest_server_status` → `upgrade_recommended`。

---

## 配置

`setup` 会把所有内容写入 `~/.localnest/`：

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite 索引 + 记忆数据库
├── cache/    → 模型权重、更新状态
├── backups/  → 配置迁移历史
└── vendor/   → 托管的原生依赖 (sqlite-vec)
```

**配置优先级：** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → current directory

**关键环境变量：**

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` 或 `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite 数据库路径 |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | 每个索引分块的行数 |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | 分块之间的重叠行数 |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | 单次索引运行处理的最大文件数 |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | 嵌入模型 |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | 模型缓存路径 |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-Encoder reranker 模型 |
| `LOCALNEST_MEMORY_ENABLED` | `false` | 启用本地记忆子系统 |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | 记忆数据库路径 |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | 自动提升后台事件 |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm 更新检查间隔 |

<details>
<summary>全部环境变量</summary>

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON 索引路径 |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | 原生 `vec0` 扩展路径 |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | 每个分块的最大术语数 |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | 嵌入后端 |
| `LOCALNEST_EMBED_DIMS` | `384` | 嵌入向量维度 |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | reranker 后端 |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | reranker 缓存路径 |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`、`node-sqlite` 或 `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | 隐藏同意提示 |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | 要检查的 npm 包名 |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | npm 检查失败后的重试间隔 |

</details>

## 安装说明

`0.0.6-beta.1` 在继续保留 `0.0.5` 作为当前 stable 线的同时，提前预览了 CLI 弃用整理：官方推荐的 `localnest task-context` / `localnest capture-outcome` 命令、面向旧 `localnest-mcp-*` 辅助命令的 deprecated 兼容包装层，以及 MCP 客户端使用的 `localnest-mcp` 服务器二进制本身没有变化。在某些 npm 环境中，你仍然可能看到来自 ONNX runtime 依赖链上游的一条弃用警告，但这不会影响 LocalNest 的功能。

**性能提示：**
- 尽可能用 `project_path` 和更窄的 `glob` 限定查询范围
- 从 `max_results: 20–40` 开始，只在需要时再扩大
- 默认关闭 reranking，只在最后需要更高精度时再开启

---

## Skill 分发

LocalNest 从一个规范来源提供内置 AI 代理 skill，并为受支持的客户端安装对应的工具变体。当前面向用户的目标包括通用 agents 目录，以及 Codex、Copilot、Claude Code、Cursor、Windsurf、OpenCode、Gemini、Antigravity、Cline 和 Continue。

```bash
localnest install skills             # 安装或更新内置 skill
localnest install skills --force     # 强制重新安装
localnest-mcp-install-skill          # deprecated 兼容别名
```

**用于自动化和 hooks 的 Shell CLI 工具：**

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

旧别名 `localnest-mcp-task-context` 和 `localnest-mcp-capture-outcome` 仍然保留以兼容旧流程。两个命令都支持通过 stdin 接收 JSON。可从 GitHub 安装：

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## 自动迁移

升级不需要额外仪式。启动时，LocalNest 会自动把旧版配置模式以及扁平的 `~/.localnest` 目录布局迁移到新的 `config/`、`data/`、`cache/`、`backups/` 结构。无需手动重新执行，也不会在升级后留下损坏的配置。

---

## 安全

LocalNest 遵循 OSS 安全流水线模式：

- **CI 质量门禁** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL 静态分析** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **公开 Scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## 参与贡献

请参阅 [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **刚接触这个代码库？** 先看 **[Architecture Overview](../guides/architecture.md)**。它会说明服务器如何启动、搜索和记忆如何工作，以及各部分代码都放在哪里。

---

## Contributors

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

感谢所有为代码、文档、评审、测试和 issue 报告做出贡献的人。

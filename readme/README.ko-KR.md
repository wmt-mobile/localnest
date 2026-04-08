<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**당신의 코드베이스. 당신의 AI. 당신의 머신. 클라우드도, 유출도, 뜻밖의 일도 없습니다.**

LocalNest는 local-first MCP 서버이자 CLI 도구로, AI 에이전트에게 안전하고 범위가 제한된 코드 접근을 제공합니다. 하이브리드 검색, 시맨틱 인덱싱, 시계열 지식 그래프, 그리고 머신 밖으로 나가지 않는 영구 메모리도 함께 제공합니다.

**52 MCP 도구** | **시계열 지식 그래프** | **멀티홉 그래프 탐색** | **에이전트별 메모리** | **클라우드 의존성 제로**

📖 [전체 문서](https://wmt-mobile.github.io/localnest/) · [아키텍처 심층 가이드](../guides/architecture.md)

## README 언어

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · 한국어 · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

이 번역 파일들은 각 로캘에 맞춘 전체 README 번역본입니다. 대상 로캘 목록과 용어 규칙은 [번역 정책](./TRANSLATION_POLICY.md)을 참고하세요. 최신 명령어, 릴리스 노트, 전체 세부사항에 대해서는 영문 [README.md](../README.md)가 계속 기준 문서입니다.

---

## 0.0.7의 새로운 기능

> 전체 변경 내역: [CHANGELOG.md](../CHANGELOG.md)

- **시계열 지식 그래프** -- 엔티티, 트리플, as_of 쿼리, 타임라인, 모순 감지
- **멀티홉 그래프 탐색** -- 재귀 CTE로 관계를 2-5홉 깊이까지 탐색 (LocalNest 고유 기능)
- **Nest/Branch 계층** -- 체계적 검색을 위한 LocalNest 자체 2단계 메모리 분류 체계
- **에이전트별 메모리** -- 비공개 일기 항목을 포함한 에이전트별 격리
- **시맨틱 중복 제거** -- 임베딩 유사도 게이트가 거의 동일한 메모리 오염 방지
- **대화 수집** -- 엔티티 추출과 함께 Markdown/JSON 채팅 내보내기 가져오기
- **Hook 시스템** -- 메모리, KG, 탐색, 수집에 대한 사전/사후 작업 콜백
- **CLI 우선 아키텍처** -- 모든 것을 위한 통합 `localnest <noun> <verb>` 명령
- **셸 자동 완성** -- bash, zsh, fish 탭 완성
- **17개의 새 MCP 도구** (총 52개) -- KG, 네스트, 탐색, 일기, 수집, 중복 제거, Hook

---

## 왜 LocalNest인가?

대부분의 AI 코드 도구는 외부로 데이터를 보냅니다. LocalNest는 그렇지 않습니다.

파일 읽기, 벡터 임베딩, 메모리까지 모든 것이 당신의 머신 안에서 같은 프로세스로 실행됩니다. 클라우드 구독도 없고, rate limit도 없고, 데이터가 머신 밖으로 나가지도 않습니다. 그리고 MCP를 사용하므로 호환되는 클라이언트(Cursor, Windsurf, Codex, Kiro, Gemini CLI)는 설정 블록 하나로 바로 연결할 수 있습니다.

| 얻는 것 | 동작 방식 |
|---|---|
| **안전한 파일 접근** | 구성한 루트 아래에서만 읽기를 허용하며, 그 밖은 접근하지 않습니다 |
| **즉시 가능한 lexical 검색** | `ripgrep` 기반의 심볼/패턴 검색 (`rg`가 없으면 JS fallback 사용) |
| **시맨틱 검색** | `all-MiniLM-L6-v2`를 통한 로컬 벡터 임베딩. GPU 불필요 |
| **하이브리드 검색** | lexical + semantic 검색을 RRF 랭킹으로 결합해 양쪽 장점을 모두 활용 |
| **프로젝트 인식** | 마커 파일로 프로젝트를 자동 감지하고 모든 도구 호출에 범위를 적용 |
| **에이전트 메모리** | 질의 가능한 영구 지식 그래프로 AI가 배운 내용을 기억 |
| **시계열 지식 그래프** | 시간 유효성이 있는 주어-서술어-목적어 트리플 -- 언제 무엇이 참이었는지 쿼리 |
| **멀티홉 그래프 탐색** | 재귀 CTE로 관계를 2-5홉 깊이까지 탐색 -- 다른 로컬 도구에는 없는 기능 |
| **Nest/Branch 계층** | 메타데이터 필터 부스트가 적용된 체계적 검색용 2단계 메모리 분류 체계 |
| **대화 수집** | Markdown/JSON 채팅 내보내기를 구조화된 메모리 + KG 트리플로 가져오기 |
| **에이전트 격리** | 에이전트별 일기 및 메모리 스코핑 -- 여러 에이전트, 교차 오염 제로 |
| **Hook 시스템** | 메모리, KG, 탐색, 수집에 대한 사전/사후 작업 Hook -- 자신만의 로직 연결 |

---

## 빠른 시작

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. 이 내용을 MCP 클라이언트 설정에 넣으세요**

`setup`은 감지된 도구에 맞는 설정을 자동으로 작성합니다. 바로 붙여 넣을 수 있는 블록도 `~/.localnest/config/mcp.localnest.json`에 생성됩니다.

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

> **Windows:** `localnest setup`이 작성한 설정을 사용하세요. 플랫폼에 맞는 올바른 명령이 자동으로 들어갑니다.

MCP 클라이언트를 다시 시작하세요. 시간 초과가 나면 클라이언트 설정에 `startup_timeout_sec: 30`을 지정하면 됩니다.

**요구 사항:** Node.js `>=18` · `ripgrep` 권장, 하지만 선택 사항

AST 기반 청킹은 `JavaScript`, `Python`, `Go`, `Bash`, `Lua`, `Dart`에 기본으로 제공됩니다. 다른 언어도 줄 단위 fallback 청킹으로 정상적으로 인덱싱됩니다.

현재 stable 런타임은 로컬 임베딩과 reranking에 `@huggingface/transformers`를 사용합니다. 새 setup 기본값은 `huggingface`를 사용하며, 이전 `xenova` 구성도 호환 별칭으로 계속 허용됩니다.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## 업그레이드

```bash
localnest upgrade              # 최신 stable
localnest upgrade stable       # 최신 stable
localnest upgrade beta         # 최신 beta
localnest upgrade <version>    # 특정 버전으로 고정
localnest version              # 현재 버전 확인
```

---

## 에이전트가 사용하는 방식

거의 모든 작업은 다음 네 가지 워크플로로 커버됩니다.

### 빠른 조회 - 찾고, 읽고, 끝내기
파일, 심볼, 코드 패턴을 정확히 짚어야 할 때 가장 적합합니다.

```
localnest_search_files   → 경로나 이름으로 모듈 찾기
localnest_search_code    → 정확한 심볼 또는 식별자 찾기
localnest_read_file      → 관련 줄 읽기
```

### 심층 작업 - 맥락과 함께 디버그, 리팩터, 리뷰
메모리와 시맨틱 이해가 중요한 복잡한 작업에 가장 적합합니다.

```
localnest_task_context    → 한 번의 호출로 런타임 상태 + 회상된 메모리 확인
localnest_search_hybrid   → 코드베이스 전반을 개념 수준으로 검색
localnest_read_file       → 관련 섹션 읽기
localnest_capture_outcome → 이번에 배운 내용을 다음을 위해 저장
```

### 지식 그래프 -- 프로젝트에 관한 구조화된 사실

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### 대화 메모리 -- 이전 채팅에서 배우기

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## CLI 레퍼런스

LocalNest는 완전한 CLI 도구입니다. 모든 것을 터미널에서 관리합니다:

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

**전역 플래그**는 모든 명령에서 사용 가능: `--json` (기계 출력), `--verbose`, `--quiet`, `--config <path>`

---

## 도구

### 워크스페이스 및 탐색

| 도구 | 설명 |
|------|-------------|
| `localnest_list_roots` | 구성된 루트 목록 표시 |
| `localnest_list_projects` | 루트 아래 프로젝트 목록 표시 |
| `localnest_project_tree` | 프로젝트의 파일/폴더 트리 |
| `localnest_summarize_project` | 언어와 확장자 분포 요약 |
| `localnest_read_file` | 파일에서 제한된 줄 범위를 읽기 |

### 검색 및 인덱스

| 도구 | 설명 |
|------|-------------|
| `localnest_search_files` | 파일명/경로명 검색. 모듈 찾기는 여기서 시작 |
| `localnest_search_code` | lexical 검색. 정확한 심볼, 정규식, 식별자용 |
| `localnest_search_hybrid` | 하이브리드 검색. lexical + semantic, RRF 랭킹 |
| `localnest_get_symbol` | 심볼의 정의/내보내기 위치 찾기 |
| `localnest_find_usages` | 심볼의 import 및 호출 위치 찾기 |
| `localnest_index_project` | 시맨틱 인덱스 생성 또는 갱신 |
| `localnest_index_status` | 인덱스 메타데이터. 존재 여부, stale 상태, 백엔드 |
| `localnest_embed_status` | 임베딩 백엔드와 벡터 검색 준비 상태 |

### 메모리

| 도구 | 설명 |
|------|-------------|
| `localnest_task_context` | 작업용 런타임 + 메모리 컨텍스트를 한 번에 가져오기 |
| `localnest_memory_recall` | 쿼리에 관련된 메모리 회상 |
| `localnest_capture_outcome` | 작업 결과를 메모리에 기록 |
| `localnest_memory_capture_event` | 백그라운드 이벤트 수집 및 자동 승격 |
| `localnest_memory_store` | 메모리를 수동 저장 |
| `localnest_memory_update` | 메모리를 업데이트하고 리비전 추가 |
| `localnest_memory_delete` | 메모리 삭제 |
| `localnest_memory_get` | 리비전 이력과 함께 단일 메모리 가져오기 |
| `localnest_memory_list` | 저장된 메모리 목록 표시 |
| `localnest_memory_events` | 최근 메모리 이벤트 확인 |
| `localnest_memory_add_relation` | 두 메모리를 이름 있는 관계로 연결 |
| `localnest_memory_remove_relation` | 관계 제거 |
| `localnest_memory_related` | 지식 그래프를 한 홉 탐색 |
| `localnest_memory_suggest_relations` | 유사도를 기준으로 관련 메모리 자동 제안 |
| `localnest_memory_status` | 메모리 동의, 백엔드, 데이터베이스 상태 |

### Knowledge Graph

| 도구 | 설명 |
|------|-------------|
| `localnest_kg_add_entity` | 엔티티 생성 (사람, 프로젝트, 개념, 도구) |
| `localnest_kg_add_triple` | 시간 유효성이 있는 주어-서술어-목적어 사실 추가 |
| `localnest_kg_query` | 방향 필터링으로 엔티티 관계 쿼리 |
| `localnest_kg_invalidate` | 사실을 더 이상 유효하지 않은 것으로 표시 (보관, 삭제 아님) |
| `localnest_kg_as_of` | 시점 쿼리 -- 날짜 X에 무엇이 참이었나? |
| `localnest_kg_timeline` | 엔티티의 시간순 사실 변화 |
| `localnest_kg_stats` | 엔티티 수, 트리플 수, 서술어 분류 |

### Nest/Branch 구성

| 도구 | 설명 |
|------|-------------|
| `localnest_nest_list` | 카운트와 함께 모든 네스트 (최상위 메모리 도메인) 나열 |
| `localnest_nest_branches` | 네스트 내 브랜치 (토픽) 나열 |
| `localnest_nest_tree` | 전체 계층: 네스트, 브랜치, 카운트 |

### 그래프 탐색

| 도구 | 설명 |
|------|-------------|
| `localnest_graph_traverse` | 경로 추적이 있는 멀티홉 탐색 (재귀 CTE) |
| `localnest_graph_bridges` | 크로스 네스트 브릿지 발견 -- 도메인 간 연결 |

### 에이전트 일기

| 도구 | 설명 |
|------|-------------|
| `localnest_diary_write` | 비공개 메모장 항목 작성 (에이전트 격리) |
| `localnest_diary_read` | 자신의 최근 일기 항목 읽기 |

### 대화 수집

| 도구 | 설명 |
|------|-------------|
| `localnest_ingest_markdown` | Markdown 대화 내보내기를 메모리 + KG로 가져오기 |
| `localnest_ingest_json` | JSON 대화 내보내기를 메모리 + KG로 가져오기 |
| `localnest_memory_check_duplicate` | 저장 전 시맨틱 중복 감지 |

### 서버 및 업데이트

| 도구 | 설명 |
|------|-------------|
| `localnest_server_status` | 런타임 설정, 루트, `ripgrep`, 인덱스 백엔드 |
| `localnest_health` | 백그라운드 모니터 보고서를 포함한 간단한 상태 요약 |
| `localnest_usage_guide` | 에이전트용 모범 사례 안내 |
| `localnest_update_status` | npm에서 최신 버전 확인 (캐시됨) |
| `localnest_update_self` | 전역 업데이트 및 번들 스킬 동기화 (승인 필요) |

**총 50개 도구.** 모든 도구는 `response_format: "json"`(기본값) 또는 `"markdown"`을 지원합니다. 목록 계열 도구는 페이지네이션을 위해 `total_count`, `has_more`, `next_offset`을 반환합니다.

---

## LocalNest 비교

LocalNest는 코드 검색과 구조화된 메모리를 하나의 도구에 결합한 유일한 local-first MCP 서버입니다. 포지션은 다음과 같습니다:

| 기능 | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (클라우드 없음)** | 예 | 예 | 아니오 ($25+/월) | 아니오 (Neo4j) | 아니오 ($20-200/월) |
| **코드 검색** | 50 MCP 도구, AST 인식, 하이브리드 검색 | 없음 | 없음 | 없음 | 없음 |
| **지식 그래프** | 시간 유효성이 있는 SQLite 트리플 | SQLite 트리플 | Neo4j | Neo4j | Key-value |
| **멀티홉 탐색** | 예 (재귀 CTE, 2-5홉) | 아니오 (플랫 조회만) | 아니오 | 예 (Neo4j 필요) | 아니오 |
| **시계열 쿼리 (as_of)** | 예 | 예 | 예 | 예 | 아니오 |
| **모순 감지** | 예 (쓰기 시 경고) | 존재하나 연결 안 됨 | 아니오 | 아니오 | 아니오 |
| **대화 수집** | Markdown + JSON | Markdown + JSON + Slack | 아니오 | 아니오 | 아니오 |
| **에이전트 격리** | 에이전트별 스코핑 + 비공개 일기 | Wing-per-agent | User/session scoping | 아니오 | User/agent/run/session |
| **시맨틱 중복 제거** | 모든 쓰기에 0.92 cosine 게이트 | 0.9 임계값 | 아니오 | 아니오 | 아니오 |
| **메모리 계층** | Nest/Branch (오리지널) | Wing/Room/Hall (palace) | 플랫 | 플랫 | 플랫 |
| **Hook 시스템** | 사전/사후 작업 Hook | 없음 | Webhooks | 없음 | 없음 |
| **런타임** | Node.js (경량) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (클라우드) |
| **의존성** | 새 항목 0 (순수 SQLite) | ChromaDB (무거움) | Neo4j ($25+/월) | Neo4j | Cloud API |
| **MCP 도구** | 50 | 19 | 0 | 0 | 0 |
| **비용** | 무료 | 무료 | $25+/월 | $25+/월 | $20-200/월 |

**LocalNest의 고유한 위치:** 심층 코드 이해와 구조화된 영구 메모리를 AI에게 동시에 제공하는 유일한 도구 -- 완전히 로컬, 클라우드 제로, 비용 제로.

---

## 메모리 - 당신의 AI는 잊지 않습니다

`localnest setup` 중에 메모리를 활성화하면 LocalNest는 로컬 SQLite 데이터베이스에 영구 지식 그래프를 만들기 시작합니다. AI 에이전트가 다룬 버그 수정, 아키텍처 결정, 선호 설정은 다음 세션에서 다시 불러올 수 있습니다.

- **Node 22.13+** 가 필요합니다. 검색 및 파일 도구는 메모리 없이도 Node 18/20에서 잘 동작합니다
- 메모리 장애가 다른 도구를 막지는 않습니다. 각 기능은 서로 독립적으로 저하됩니다

**자동 승격 방식:** `localnest_memory_capture_event`로 수집된 이벤트는 신호 강도로 점수가 매겨집니다. 버그 수정, 결정, 선호 설정처럼 신호가 강한 이벤트는 영구 메모리로 승격됩니다. 약한 탐색성 이벤트는 기록만 남기고 30일 뒤 조용히 폐기됩니다.

**지식 그래프:** 시간 유효성이 있는 주어-서술어-목적어 트리플로 구조화된 사실을 저장합니다. `as_of`로 특정 시점에 무엇이 참이었는지 쿼리할 수 있습니다. 재귀 CTE 탐색으로 관계를 2-5홉 깊이까지 탐색합니다. 쓰기 시 모순을 감지합니다.

**Nest/Branch 계층:** 메모리를 네스트 (최상위 도메인)와 브랜치 (토픽)로 구성합니다. 메타데이터 필터 리콜이 스코어링 전 후보를 좁혀 더 빠르고 정확한 결과를 제공합니다.

**에이전트 격리:** 각 에이전트는 자신만의 메모리 스코프와 비공개 일기를 갖습니다. 리콜은 자신 + 전역 메모리를 반환하며, 다른 에이전트의 비공개 데이터는 절대 반환하지 않습니다.

**시맨틱 중복 제거:** 모든 쓰기는 임베딩 유사도 게이트 (기본 0.92 cosine 임계값)를 통과합니다. 거의 동일한 항목은 저장 전에 잡혀서 메모리가 깨끗하게 유지됩니다.

**대화 수집:** Markdown 또는 JSON 채팅 내보내기를 가져옵니다. 각 턴이 메모리 항목이 되며 자동 엔티티 추출과 KG 트리플 생성이 이루어집니다. 동일 파일의 재수집은 콘텐츠 해시로 건너뜁니다.

**Hook:** 모든 메모리 작업에 사전/사후 콜백을 등록할 수 있습니다 -- 저장, 리콜, KG 쓰기, 탐색, 수집. 핵심 코드를 수정하지 않고 커스텀 파이프라인을 구축합니다.

---

## 인덱스 백엔드

| 백엔드 | 사용 시점 |
|---------|-------------|
| `sqlite-vec` | **권장.** 영구 SQLite 기반으로 대형 저장소에서도 빠르고 효율적입니다. Node 22+ 필요 |
| `json` | 호환성 fallback. `sqlite-vec`를 사용할 수 없으면 자동 선택됩니다. |

언제 마이그레이션해야 하는지는 `localnest_server_status` → `upgrade_recommended`에서 확인할 수 있습니다.

---

## 구성

`setup`은 모든 항목을 `~/.localnest/`에 기록합니다.

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite 인덱스 + 메모리 데이터베이스
├── cache/    → 모델 가중치, 업데이트 상태
├── backups/  → 구성 마이그레이션 이력
└── vendor/   → 관리되는 네이티브 의존성 (sqlite-vec)
```

**구성 우선순위:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → current directory

**주요 환경 변수:**

| 변수 | 기본값 | 설명 |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` 또는 `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | SQLite 데이터베이스 경로 |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | 인덱스 청크당 줄 수 |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | 청크 간 겹침 |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | 한 번의 인덱싱에서 처리할 최대 파일 수 |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | 임베딩 모델 |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | 모델 캐시 경로 |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-Encoder reranker 모델 |
| `LOCALNEST_MEMORY_ENABLED` | `false` | 로컬 메모리 서브시스템 활성화 |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | 메모리 데이터베이스 경로 |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | 백그라운드 이벤트 자동 승격 |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | npm 업데이트 확인 간격 |

<details>
<summary>전체 환경 변수</summary>

| 변수 | 기본값 | 설명 |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON 인덱스 경로 |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | 네이티브 `vec0` 확장 경로 |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | 청크당 최대 용어 수 |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | 임베딩 백엔드 |
| `LOCALNEST_EMBED_DIMS` | `384` | 임베딩 벡터 차원 |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | reranker 백엔드 |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | reranker 캐시 경로 |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite`, 또는 `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | 동의 프롬프트 숨기기 |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | 확인할 npm 패키지 이름 |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | npm 확인 실패 시 재시도 간격 |

</details>

## 설치 참고

`0.0.6-beta.1`은 현재 안정 라인을 `0.0.5`로 유지하면서 CLI 사용 중단 정리 작업을 미리 보여줍니다. 정식 `localnest task-context` / `localnest capture-outcome` 명령, 이전 `localnest-mcp-*` 헬퍼를 위한 deprecated 호환 래퍼, 그리고 MCP 클라이언트가 사용하는 `localnest-mcp` 서버 바이너리에는 변경이 없다는 의미입니다. 일부 npm 환경에서는 ONNX runtime 의존성 체인에서 올라오는 단일 deprecation 경고가 계속 보일 수 있지만, LocalNest 기능에는 영향이 없습니다.

**성능 팁:**
- 가능하면 `project_path`와 좁은 `glob`로 쿼리 범위를 제한하세요
- `max_results: 20–40`으로 시작하고 필요할 때만 넓히세요
- reranking은 기본적으로 끄고, 마지막 정밀도 확인 단계에서만 켜세요

---

## 스킬 배포

LocalNest는 하나의 정식 소스에서 번들 AI 에이전트 스킬을 제공하고, 지원되는 클라이언트에 맞는 도구별 변형을 설치합니다. 현재 사용자 수준 대상에는 일반 agents 디렉터리와 함께 Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline, Continue가 포함됩니다.

```bash
localnest install skills             # 번들 스킬 설치 또는 업데이트
localnest install skills --force     # 강제 재설치
localnest-mcp-install-skill          # deprecated 호환 별칭
```

**자동화와 훅을 위한 Shell CLI 도구:**

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

기존 별칭 `localnest-mcp-task-context`와 `localnest-mcp-capture-outcome`도 호환성을 위해 계속 동작합니다. 두 명령 모두 stdin으로 JSON을 받을 수 있습니다. GitHub에서 설치:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## 자동 마이그레이션

번거로운 절차 없이 업그레이드할 수 있습니다. 시작 시 LocalNest는 이전 구성 스키마와 평면형 `~/.localnest` 레이아웃을 새로운 `config/`, `data/`, `cache/`, `backups/` 구조로 자동 마이그레이션합니다. 업그레이드 후 수동으로 다시 실행할 필요도 없고, 구성이 깨질 일도 없습니다.

---

## 보안

LocalNest는 OSS 보안 파이프라인 패턴을 따릅니다.

- **CI 품질 게이트** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL 정적 분석** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **공개 Scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## 기여하기

[CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)를 참고하세요.

> **코드베이스가 처음인가요?** 먼저 **[Architecture Overview](../guides/architecture.md)** 부터 보세요. 서버 부팅 방식, 검색과 메모리의 동작 방식, 전체 구조를 빠르게 파악할 수 있습니다.

---

## Contributors

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

코드, 문서, 리뷰, 테스트, 이슈 리포트에 기여해 주는 모든 분들께 감사드립니다.

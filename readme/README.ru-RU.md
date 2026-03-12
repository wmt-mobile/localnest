<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Ваша кодовая база. Ваш ИИ. Ваша машина - никакого облака, никаких утечек, никаких сюрпризов.**

LocalNest - это local-first MCP-сервер, который даёт AI-агентам безопасный и ограниченный доступ к вашему коду, с гибридным поиском, семантической индексацией и постоянной памятью, которая никогда не покидает вашу машину.

📖 [Полная документация](https://wmt-mobile.github.io/localnest/) · [Подробно об архитектуре](../guides/architecture.md)

## Языки README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · Русский · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Эти переведённые файлы являются полными README-переводами для конкретных региональных вариантов. См. [политику перевода](./TRANSLATION_POLICY.md) для матрицы locale и правил терминологии. Английский [README.md](../README.md) остаётся основным источником для новых команд, заметок о релизах и всех деталей.

---

## Почему LocalNest?

Большинство AI-инструментов для кода отправляют данные наружу. LocalNest - нет.

Всё - чтение файлов, векторные embedding, память - выполняется внутри процесса на вашей машине. Никакой облачной подписки, никаких rate limit, никакие данные не покидают ваш компьютер. А поскольку LocalNest использует MCP, любой совместимый клиент (Cursor, Windsurf, Codex, Kiro, Gemini CLI) можно подключить одним конфигурационным блоком.

| Что вы получаете | Как это работает |
|---|---|
| **Безопасный доступ к файлам** | Чтение только в пределах настроенных roots - ничего за их пределами |
| **Мгновенный лексический поиск** | Поиск символов и шаблонов на базе `ripgrep` (есть JS-fallback, если `rg` недоступен) |
| **Семантический поиск** | Локальные векторные embedding через `all-MiniLM-L6-v2` - без необходимости в GPU |
| **Гибридный retrieval** | Лексический и семантический поиск объединяются ранжированием RRF для лучшего результата |
| **Понимание структуры проекта** | Автоматически определяет проекты по marker-файлам и ограничивает scope каждого вызова tool |
| **Память агента** | Постоянный граф знаний с возможностью запросов - ваш ИИ помнит, чему научился |

---

## Быстрый старт

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Вставьте это в конфигурацию вашего MCP-клиента**

`setup` автоматически записывает конфигурацию для обнаруженных tools. Готовый для вставки блок также находится в `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** Используйте конфигурацию, записанную `localnest setup` - она автоматически подставляет правильную команду для вашей платформы.

Перезапустите MCP-клиент. Если он уходит в timeout, установите `startup_timeout_sec: 30` в конфигурации клиента.

**Требования:** Node.js `>=18` · `ripgrep` рекомендуется, но необязателен

AST-aware chunking включён по умолчанию для `JavaScript`, `Python`, `Go`, `Bash`, `Lua` и `Dart`. Другие языки тоже индексируются корректно благодаря построчному fallback chunking.

Текущий стабильный runtime использует `@huggingface/transformers` для локальных embedding и reranking. Новые значения setup по умолчанию используют `huggingface`, а старые конфигурации `xenova` по-прежнему принимаются как alias совместимости.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## Обновление

```bash
localnest upgrade              # последняя стабильная версия
localnest upgrade stable       # последняя стабильная версия
localnest upgrade beta         # последняя бета-версия
localnest upgrade <version>    # закрепить конкретную версию
localnest version              # проверить текущую версию
```

---

## Как агенты используют это

Два рабочих процесса покрывают почти всё:

### Быстрый lookup - найти, прочитать, закончить
Лучше всего подходит для точечного поиска файла, символа или шаблона кода.

```
localnest_search_files   → найти модуль по path/имени
localnest_search_code    → найти точный символ или identifier
localnest_read_file      → прочитать нужные строки
```

### Глубокая задача - debug, refactor, review с контекстом
Лучше всего подходит для сложной работы, где важны память и семантическое понимание.

```
localnest_task_context    → один вызов: состояние runtime + извлечённые воспоминания
localnest_search_hybrid   → концептуальный поиск по всей кодовой базе
localnest_read_file       → прочитать нужные фрагменты
localnest_capture_outcome → сохранить полученное знание на будущее
```

> **Успешный tool ≠ полезный результат.** Tool может вернуть OK и всё равно оказаться пустым. Считайте осмысленным доказательством ненулевые совпадения по файлам и реальные строки содержимого, а не просто успешное завершение процесса.

---

## Tools

### Workspace & Discovery

| Tool | Что делает |
|------|-------------|
| `localnest_list_roots` | Показывает настроенные roots |
| `localnest_list_projects` | Показывает проекты внутри root |
| `localnest_project_tree` | Дерево файлов и папок проекта |
| `localnest_summarize_project` | Сводка по языкам и расширениям |
| `localnest_read_file` | Читает ограниченное окно строк из файла |

### Search & Index

| Tool | Что делает |
|------|-------------|
| `localnest_search_files` | Поиск по имени файла/path - начните здесь для поиска модулей |
| `localnest_search_code` | Лексический поиск - точные символы, regex, identifier |
| `localnest_search_hybrid` | Гибридный поиск - лексический + семантический, ранжированный RRF |
| `localnest_get_symbol` | Находит места определения/экспорта символа |
| `localnest_find_usages` | Находит imports и места вызовов символа |
| `localnest_index_project` | Строит или обновляет семантический индекс |
| `localnest_index_status` | Метаданные индекса - существует, устарел, backend |
| `localnest_embed_status` | Состояние backend embedding и готовность векторного поиска |

### Memory

| Tool | Что делает |
|------|-------------|
| `localnest_task_context` | Одновызовный контекст runtime + memory для задачи |
| `localnest_memory_recall` | Возвращает релевантные воспоминания по запросу |
| `localnest_capture_outcome` | Сохраняет результат задачи в memory |
| `localnest_memory_capture_event` | Приём фоновых событий с auto-promotion |
| `localnest_memory_store` | Сохраняет воспоминание вручную |
| `localnest_memory_update` | Обновляет воспоминание и добавляет ревизию |
| `localnest_memory_delete` | Удаляет воспоминание |
| `localnest_memory_get` | Получает одно воспоминание с историей ревизий |
| `localnest_memory_list` | Перечисляет сохранённые воспоминания |
| `localnest_memory_events` | Показывает недавние memory-события |
| `localnest_memory_add_relation` | Связывает два воспоминания именованным отношением |
| `localnest_memory_remove_relation` | Удаляет отношение |
| `localnest_memory_related` | Обходит граф знаний на один hop |
| `localnest_memory_suggest_relations` | Предлагает связанные воспоминания по сходству |
| `localnest_memory_status` | Статус consent, backend и базы данных memory |

### Server & Updates

| Tool | Что делает |
|------|-------------|
| `localnest_server_status` | Конфигурация runtime, roots, `ripgrep`, backend индекса |
| `localnest_health` | Краткая сводка здоровья с отчётом фонового мониторинга |
| `localnest_usage_guide` | Рекомендации по best practices для агентов |
| `localnest_update_status` | Проверяет npm на наличие новой версии (с кешем) |
| `localnest_update_self` | Обновляет пакет глобально и синхронизирует bundled skill (требуется approval) |

Все tools поддерживают `response_format: "json"` (по умолчанию) или `"markdown"`. Tools со списками возвращают `total_count`, `has_more`, `next_offset` для пагинации.

---

## Memory - ваш ИИ не забывает

Включите memory во время `localnest setup`, и LocalNest начнёт строить постоянный граф знаний в локальной базе SQLite. Каждое исправление бага, архитектурное решение и предпочтение, с которыми соприкасается ваш AI-агент, можно будет вспомнить в следующей сессии.

- Требует **Node 22.13+** - инструменты поиска и файлов работают на Node 18/20 и без memory
- Сбой memory никогда не блокирует другие tools - всё деградирует независимо

**Как работает auto-promotion:** события, захваченные через `localnest_memory_capture_event`, оцениваются по силе сигнала. Сильные сигналы - исправления багов, решения, предпочтения - повышаются до постоянных воспоминаний. Слабые исследовательские события фиксируются и тихо удаляются через 30 дней.

---

## Backend индекса

| Backend | Когда использовать |
|---------|-------------|
| `sqlite-vec` | **Рекомендуется.** Постоянный SQLite, быстрый и эффективный для больших репозиториев. Требует Node 22+. |
| `json` | Совместимый fallback. Выбирается автоматически, если `sqlite-vec` недоступен. |

Проверьте `localnest_server_status` → `upgrade_recommended`, чтобы понять, когда пора мигрировать.

---

## Конфигурация

`setup` записывает всё в `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → Базы данных SQLite для индекса и memory
├── cache/    → Веса моделей, статус обновлений
├── backups/  → История миграций конфигурации
└── vendor/   → Управляемые native зависимости (sqlite-vec)
```

**Приоритет конфигурации:** env `PROJECT_ROOTS` → файл `LOCALNEST_CONFIG` → текущий каталог

**Ключевые переменные окружения:**

| Variable | Default | Описание |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` или `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Path к базе SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Строк на один index chunk |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Перекрытие между chunk |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Максимум файлов за один проход индексации |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Модель embedding |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Path к кешу модели |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Модель cross-encoder reranker |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Включить локальную подсистему memory |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Path к базе memory |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Автоматически продвигать фоновые события |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Интервал проверки обновлений npm |

<details>
<summary>Все переменные окружения</summary>

| Variable | Default | Описание |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | Path к JSON-индексу |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Path к native-расширению `vec0` |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Максимум terms на chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Backend embedding |
| `LOCALNEST_EMBED_DIMS` | `384` | Размерность embedding-векторов |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Backend reranker |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Path к кешу reranker |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` или `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Подавить prompt consent |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Имя npm-пакета для проверки |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Повтор при неудачной проверке npm |

</details>

## Примечание по установке

`0.0.6-beta.1` сохраняет `0.0.5` как текущую стабильную ветку, одновременно показывая предварительный проход по deprecation CLI: канонические команды `localnest task-context` / `localnest capture-outcome`, устаревшие совместимые wrappers для старых helper-команд `localnest-mcp-*` и отсутствие изменений в серверном бинарнике `localnest-mcp`, который используют MCP-клиенты. В некоторых npm-средах всё ещё может отображаться одно внешнее deprecation-предупреждение из цепочки зависимостей ONNX runtime; на функциональность LocalNest это не влияет.

**Советы по производительности:**
- Ограничивайте запросы через `project_path` и узкий `glob`, когда это возможно
- Начинайте с `max_results: 20-40` и расширяйте диапазон только при необходимости
- Держите reranking выключенным по умолчанию - включайте только для финального уточнения

---

## Распространение skill

LocalNest поставляет bundled skills для AI-агентов из одного канонического источника и устанавливает варианты под конкретные tools для поддерживаемых клиентов. Текущие пользовательские цели включают общие каталоги агентов, а также Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline и Continue.

```bash
localnest install skills             # установить или обновить bundled skills
localnest install skills --force     # принудительно переустановить
localnest-mcp-install-skill          # устаревший alias совместимости
```

**Shell CLI tools** для автоматизации и hooks:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Старые aliases `localnest-mcp-task-context` и `localnest-mcp-capture-outcome` по-прежнему работают для совместимости. Обе команды принимают JSON через stdin. Установка из GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Автомиграция

Обновляйтесь без лишней церемонии. При запуске LocalNest автоматически мигрирует старые схемы конфигурации и плоскую структуру `~/.localnest` в новые каталоги `config/`, `data/`, `cache/` и `backups/`. Никаких ручных повторных запусков, никаких сломанных конфигов после обновления.

---

## Безопасность

LocalNest следует шаблону OSS security pipeline:

- **CI quality gate** — [quality.yml](../.github/workflows/quality.yml)
- **Статический анализ CodeQL** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Публичный scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Участие в проекте

См. [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Впервые в этой codebase?** Начните с **[Обзора архитектуры](../guides/architecture.md)** - там описано, как сервер запускается, как работают поиск и memory и где всё находится.

---

## Участники

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Спасибо всем, кто вносит вклад в код, документацию, review, тестирование и отчёты об issue.

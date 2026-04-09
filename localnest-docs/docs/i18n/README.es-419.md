<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Tu base de codigo. Tu IA. Tu maquina - sin nube, sin fugas, sin sorpresas.**

LocalNest es un servidor MCP local-first y herramienta CLI que les da a los agentes de IA acceso seguro y delimitado a tu codigo, con busqueda hibrida, indexacion semantica, grafo de conocimiento temporal y memoria persistente que nunca sale de tu maquina.

**52 herramientas MCP** | **Grafo de conocimiento temporal** | **Recorrido multi-hop del grafo** | **Memoria por agente** | **Cero dependencias de nube**

📖 [Documentacion completa](https://wmt-mobile.github.io/localnest/) · [Arquitectura en profundidad](../guides/architecture.md)

## Idiomas del README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · Espanol (Latinoamerica) · [Francais (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Portugues (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Turkce](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Estos archivos traducidos son traducciones completas del README para cada configuracion regional. Consulta la [politica de traduccion](./TRANSLATION_POLICY.md) para ver la matriz de locales y las reglas terminologicas. El [README.md](../README.md) en ingles sigue siendo la fuente principal para comandos nuevos, notas de version y todos los detalles.

---

## Novedades en 0.1.0

> Changelog completo: [CHANGELOG.md](../CHANGELOG.md)

- **Grafo de conocimiento temporal** -- entidades, tripletas, consultas as_of, lineas de tiempo, deteccion de contradicciones
- **Recorrido multi-hop del grafo** -- recorre relaciones de 2-5 saltos de profundidad mediante CTEs recursivas (exclusivo de LocalNest)
- **Jerarquia Nest/Branch** -- taxonomia de memoria de dos niveles propia de LocalNest para recuperacion organizada
- **Memoria por agente** -- aislamiento por agente con entradas de diario privadas
- **Dedup semantico** -- gate de similitud de embeddings previene la contaminacion por memorias casi duplicadas
- **Ingesta de conversaciones** -- importa exports de chat en Markdown/JSON con extraccion de entidades
- **Sistema de hooks** -- callbacks pre/post operacion para memoria, KG, recorrido, ingesta
- **Arquitectura CLI-first** -- comandos `localnest <noun> <verb>` unificados para todo
- **Completions de shell** -- tab completion para bash, zsh, fish
- **17 herramientas MCP nuevas** (52 en total) -- KG, nests, recorrido, diario, ingesta, dedup, hooks

---

## Por que LocalNest?

La mayoria de las herramientas de IA para codigo envian informacion hacia fuera. LocalNest no.

Todo - lecturas de archivos, embeddings vectoriales, memoria - corre dentro del proceso en tu maquina. Sin suscripciones cloud, sin limites de tasa, sin sacar datos de tu entorno. Y como habla MCP, cualquier cliente compatible (Cursor, Windsurf, Codex, Kiro, Gemini CLI) puede conectarse con un solo bloque de configuracion.

| Lo que obtienes | Como funciona |
|---|---|
| **Acceso seguro a archivos** | Lecturas acotadas dentro de los roots configurados - nada fuera de ellos |
| **Busqueda lexica inmediata** | Busqueda de simbolos y patrones con `ripgrep` (fallback en JS si falta) |
| **Busqueda semantica** | Embeddings locales via `all-MiniLM-L6-v2` - sin necesidad de GPU |
| **Recuperacion hibrida** | Fusion de busqueda lexica y semantica con ranking RRF para obtener los mejores resultados |
| **Conciencia de proyecto** | Detecta proyectos automaticamente por archivos marcador y delimita cada llamada |
| **Memoria del agente** | Grafo de conocimiento persistente y consultable - tu IA recuerda lo que aprendio |
| **Grafo de conocimiento temporal** | Tripletas sujeto-predicado-objeto con validez temporal -- consulta que era cierto en cualquier momento |
| **Recorrido multi-hop del grafo** | Recorre relaciones de 2-5 saltos via CTEs recursivas -- ningun otro tool local lo hace |
| **Jerarquia Nest/Branch** | Taxonomia de memoria de dos niveles con boost filtrado por metadatos para recuperacion organizada |
| **Ingesta de conversaciones** | Importa exports de chat Markdown/JSON a memoria estructurada + tripletas KG |
| **Aislamiento de agentes** | Diario por agente y scoping de memoria -- multiples agentes, cero contaminacion cruzada |
| **Sistema de hooks** | Hooks pre/post operacion para memoria, KG, recorrido, ingesta -- conecta tu propia logica |

---

## Inicio rapido

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Pega esto en la configuracion de tu cliente MCP**

`setup` escribe automaticamente la configuracion para las herramientas detectadas. Tambien encontraras un bloque listo para copiar en `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** Usa la configuracion escrita por `localnest setup`; ahi se establece automaticamente el comando correcto para tu plataforma.

Reinicia tu cliente MCP. Si entra en timeout, define `startup_timeout_sec: 30` en la configuracion del cliente.

**Requisitos:** Node.js `>=18` · `ripgrep` recomendado, pero opcional

El chunking con soporte AST viene por defecto para `TypeScript`, `JavaScript`, `Python`, `Go`, `Bash`, `Lua` y `Dart`. Los demas lenguajes siguen indexandose correctamente con chunking de respaldo basado en lineas.

El runtime estable actual usa `@huggingface/transformers` para embeddings y reranking locales. Las nuevas configuraciones de setup usan `huggingface`, y las configuraciones antiguas de `xenova` siguen aceptandose como alias de compatibilidad.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## Actualizacion

```bash
localnest upgrade              # ultima version estable
localnest upgrade stable       # ultima version estable
localnest upgrade beta         # ultima beta
localnest upgrade <version>    # fijar una version especifica
localnest version              # revisar la version actual
```

---

## Como lo usan los agentes

Cuatro flujos cubren casi todo:

### Busqueda rapida - encontrar, leer y listo

```
localnest_search_files   → find the module by path/name
localnest_search_code    → find the exact symbol or identifier
localnest_read_file      → read the relevant lines
```

### Tarea profunda - depurar, refactorizar, revisar con contexto

```
localnest_task_context    → one call: runtime status + recalled memories
localnest_search_hybrid   → concept-level search across your codebase
localnest_read_file       → read the relevant sections
localnest_capture_outcome → persist what you learned for next time
```

### Grafo de conocimiento - hechos estructurados sobre el proyecto

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### Memoria de conversaciones - aprender de chats anteriores

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## Referencia CLI

LocalNest es una herramienta CLI completa. Todo se gestiona desde la terminal:

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

**Flags globales** funcionan en todos los comandos: `--json` (salida maquina), `--verbose`, `--quiet`, `--config <path>`

---

## Tools

### Workspace & Discovery

| Tool | Que hace |
|------|-------------|
| `localnest_list_roots` | Lista los roots configurados |
| `localnest_list_projects` | Lista los proyectos bajo un root |
| `localnest_project_tree` | Arbol de archivos/carpetas de un proyecto |
| `localnest_summarize_project` | Resumen por lenguaje y extensiones |
| `localnest_read_file` | Lee una ventana acotada de lineas de un archivo |

### Search & Index

| Tool | Que hace |
|------|-------------|
| `localnest_search_files` | Busqueda por nombre de archivo/ruta - empieza aqui para descubrir modulos |
| `localnest_search_code` | Busqueda lexica - simbolos exactos, regex, identificadores |
| `localnest_search_hybrid` | Busqueda hibrida - lexica + semantica, ordenada con RRF |
| `localnest_get_symbol` | Encuentra definiciones/exportaciones de un simbolo |
| `localnest_find_usages` | Encuentra imports y sitios de uso de un simbolo |
| `localnest_index_project` | Construye o actualiza el indice semantico |
| `localnest_index_status` | Metadatos del indice - existe, esta obsoleto, backend |
| `localnest_embed_status` | Estado del backend de embeddings y preparacion de busqueda vectorial |

### Memory

| Tool | Que hace |
|------|-------------|
| `localnest_task_context` | Contexto en una llamada: runtime + memoria para una tarea |
| `localnest_memory_recall` | Recupera memorias relevantes para una consulta |
| `localnest_capture_outcome` | Captura el resultado de una tarea en memoria |
| `localnest_memory_capture_event` | Ingesta de eventos en segundo plano con autopromocion |
| `localnest_memory_store` | Guarda una memoria manualmente |
| `localnest_memory_update` | Actualiza una memoria y agrega una revision |
| `localnest_memory_delete` | Elimina una memoria |
| `localnest_memory_get` | Obtiene una memoria con historial de revisiones |
| `localnest_memory_list` | Lista las memorias almacenadas |
| `localnest_memory_events` | Inspecciona eventos recientes de memoria |
| `localnest_memory_add_relation` | Vincula dos memorias con una relacion nombrada |
| `localnest_memory_remove_relation` | Elimina una relacion |
| `localnest_memory_related` | Recorre el grafo de conocimiento a un salto |
| `localnest_memory_suggest_relations` | Sugiere memorias relacionadas por similitud |
| `localnest_memory_status` | Estado de consentimiento, backend y base de datos de memoria |

### Knowledge Graph

| Tool | Que hace |
|------|-------------|
| `localnest_kg_add_entity` | Crea entidades (personas, proyectos, conceptos, herramientas) |
| `localnest_kg_add_triple` | Agrega hechos sujeto-predicado-objeto con validez temporal |
| `localnest_kg_query` | Consulta relaciones de entidades con filtrado de direccion |
| `localnest_kg_invalidate` | Marca un hecho como ya no valido (archivado, no eliminacion) |
| `localnest_kg_as_of` | Consultas en un punto del tiempo -- que era cierto en la fecha X? |
| `localnest_kg_timeline` | Evolucion cronologica de hechos para una entidad |
| `localnest_kg_stats` | Cantidad de entidades, tripletas, desglose de predicados |

### Organizacion Nest/Branch

| Tool | Que hace |
|------|-------------|
| `localnest_nest_list` | Lista todos los nests (dominios de memoria de nivel superior) con conteos |
| `localnest_nest_branches` | Lista branches (temas) dentro de un nest |
| `localnest_nest_tree` | Jerarquia completa: nests, branches y conteos |

### Recorrido del Grafo

| Tool | Que hace |
|------|-------------|
| `localnest_graph_traverse` | Recorrido multi-hop con seguimiento de ruta (CTEs recursivas) |
| `localnest_graph_bridges` | Encuentra puentes cross-nest -- conexiones entre dominios |

### Diario del Agente

| Tool | Que hace |
|------|-------------|
| `localnest_diary_write` | Escribe una entrada privada de bloc de notas (aislada por agente) |
| `localnest_diary_read` | Lee tus entradas de diario recientes |

### Ingesta de Conversaciones

| Tool | Que hace |
|------|-------------|
| `localnest_ingest_markdown` | Importa exports de conversaciones Markdown a memoria + KG |
| `localnest_ingest_json` | Importa exports de conversaciones JSON a memoria + KG |
| `localnest_memory_check_duplicate` | Deteccion de duplicados semanticos antes de archivar |

### Server & Updates

| Tool | Que hace |
|------|-------------|
| `localnest_server_status` | Configuracion de runtime, roots, `ripgrep`, backend del indice |
| `localnest_health` | Resumen compacto de salud con reporte del monitor en segundo plano |
| `localnest_usage_guide` | Guia de buenas practicas para agentes |
| `localnest_update_status` | Revisa npm por la version mas reciente (con cache) |
| `localnest_update_self` | Actualiza globalmente y sincroniza el skill incluido (requiere aprobacion) |

**52 tools en total.** Todos los tools soportan `response_format: "json"` (por defecto) o `"markdown"`. Los tools de lista devuelven `total_count`, `has_more` y `next_offset` para paginacion.

---

## Como se compara LocalNest

LocalNest es el unico servidor MCP local-first que combina recuperacion de codigo Y memoria estructurada en una sola herramienta. Aqui esta su posicion:

| Capacidad | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (sin nube)** | Si | Si | No ($25+/mes) | No (Neo4j) | No ($20-200/mes) |
| **Recuperacion de codigo** | 52 tools MCP, AST-aware, busqueda hibrida | Ninguna | Ninguna | Ninguna | Ninguna |
| **Grafo de conocimiento** | Tripletas SQLite con validez temporal | Tripletas SQLite | Neo4j | Neo4j | Key-value |
| **Recorrido multi-hop** | Si (CTEs recursivas, 2-5 saltos) | No (solo lookup plano) | No | Si (requiere Neo4j) | No |
| **Consultas temporales (as_of)** | Si | Si | Si | Si | No |
| **Deteccion de contradicciones** | Si (advertencias al escribir) | Existe pero no conectado | No | No | No |
| **Ingesta de conversaciones** | Markdown + JSON | Markdown + JSON + Slack | No | No | No |
| **Aislamiento de agentes** | Scoping por agente + diario privado | Wing-per-agent | User/session scoping | No | User/agent/run/session |
| **Dedup semantico** | Gate cosine 0.92 en todas las escrituras | Umbral 0.9 | No | No | No |
| **Jerarquia de memoria** | Nest/Branch (original) | Wing/Room/Hall (palace) | Plano | Plano | Plano |
| **Sistema de hooks** | Hooks pre/post operacion | Ninguno | Webhooks | Ninguno | Ninguno |
| **Runtime** | Node.js + TypeScript (ligero) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (nube) |
| **Dependencias** | 0 nuevas (SQLite puro) | ChromaDB (pesado) | Neo4j ($25+/mes) | Neo4j | Cloud API |
| **Tools MCP** | 52 | 19 | 0 | 0 | 0 |
| **Costo** | Gratis | Gratis | $25+/mes | $25+/mes | $20-200/mes |

**La posicion unica de LocalNest:** La unica herramienta que le da a tu IA comprension profunda del codigo Y memoria persistente estructurada -- totalmente local, cero nube, cero costo.

---

## Memory - tu IA no olvida

Habilita memory durante `localnest setup` y LocalNest empezara a construir un grafo de conocimiento persistente en una base SQLite local. Cada bug fix, decision arquitectonica y preferencia que toque tu agente de IA podra recuperarse en la siguiente sesion.

- Requiere **Node 22.13+** - las herramientas de busqueda y archivos funcionan bien en Node 18/20 sin esto
- Un fallo en memory nunca bloquea los demas tools - todo degrada de forma independiente

**Como funciona la autopromocion:** los eventos capturados via `localnest_memory_capture_event` se puntuan segun la fuerza de la senal. Los eventos de alta senal - bug fixes, decisiones, preferencias - se promueven a memorias duraderas. Los eventos exploratorios debiles se registran y se descartan silenciosamente despues de 30 dias.

**Grafo de conocimiento:** Almacena hechos estructurados como tripletas sujeto-predicado-objeto con validez temporal. Consulta que era cierto en cualquier momento con `as_of`. Recorre relaciones de 2-5 saltos con recorrido CTE recursivo. Detecta contradicciones al momento de escritura.

**Jerarquia Nest/Branch:** Organiza memorias en nests (dominios de nivel superior) y branches (temas). La recuperacion filtrada por metadatos reduce candidatos antes del scoring para resultados mas rapidos y precisos.

**Aislamiento de agentes:** Cada agente tiene su propio alcance de memoria y diario privado. La recuperacion devuelve memorias propias + globales, nunca los datos privados de otro agente.

**Dedup semantico:** Cada escritura pasa por un gate de similitud de embeddings (umbral cosine predeterminado de 0.92). Los casi-duplicados se detectan antes del almacenamiento -- tu memoria se mantiene limpia.

**Ingesta de conversaciones:** Importa exports de chat en Markdown o JSON. Cada turno se convierte en una entrada de memoria con extraccion automatica de entidades y creacion de tripletas KG. La reingesta del mismo archivo se omite por hash de contenido.

**Hooks:** Registra callbacks pre/post en cualquier operacion de memoria -- almacenar, recuperar, escrituras KG, recorrido, ingesta. Construye pipelines personalizados sin modificar el codigo principal.

---

## Backend de indexacion

| Backend | Cuando usarlo |
|---------|-------------|
| `sqlite-vec` | **Recomendado.** SQLite persistente, rapido y eficiente para repos grandes. Requiere Node 22+. |
| `json` | Fallback de compatibilidad. Se selecciona automaticamente si `sqlite-vec` no esta disponible. |

Revisa `localnest_server_status` -> `upgrade_recommended` para saber cuando conviene migrar.

---

## Configuracion

`setup` escribe todo en `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → bases de datos SQLite del indice y de memory
├── cache/    → pesos de modelos, estado de actualizacion
├── backups/  → historial de migraciones de configuracion
└── vendor/   → dependencias nativas administradas (sqlite-vec)
```

**Prioridad de configuracion:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → directorio actual

**Variables de entorno clave:**

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` o `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Ruta de la base SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Lineas por chunk del indice |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Solapamiento entre chunks |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Maximo de archivos por corrida de indexacion |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Modelo de embeddings |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Ruta del cache de modelos |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Modelo reranker cross-encoder |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Habilita el subsistema de memory local |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Ruta de la base de memory |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Autopromover eventos en segundo plano |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Intervalo de revision de actualizaciones npm |

<details>
<summary>Todas las variables de entorno</summary>

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | Ruta del indice JSON |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Ruta a la extension nativa `vec0` |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Maximo de terminos por chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Backend de embeddings |
| `LOCALNEST_EMBED_DIMS` | `384` | Dimensiones del vector de embeddings |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Backend del reranker |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Ruta del cache del reranker |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` o `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Suprime el prompt de consentimiento |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Nombre del paquete npm a revisar |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Reintento tras una revision npm fallida |

</details>

## Nota de instalacion

`0.1.0` es un lanzamiento mayor -- completamente reescrito en TypeScript -- con grafo de conocimiento temporal, recorrido multi-hop, jerarquia Nest/Branch, memoria por agente, dedup semantico, ingesta de conversaciones, sistema de hooks, arquitectura CLI-first con 52 herramientas MCP, 10 comandos slash de Claude Code, dashboard TUI interactivo, asistente de onboarding guiado y selftest de extremo a extremo. Las migraciones de esquema son aditivas y compatibles hacia atras -- las bases de datos existentes se actualizan automaticamente en el primer inicio.

**Consejos de rendimiento:**
- Delimita las consultas con `project_path` + un `glob` estrecho siempre que sea posible
- Empieza con `max_results: 20-40` y amplia solo si hace falta
- Deja el reranking desactivado por defecto - activalo solo para un pase final de precision

---

## Distribucion de skills

LocalNest distribuye skills de agentes de IA desde una unica fuente canonica e instala variantes especificas por herramienta para clientes soportados. Los destinos actuales a nivel usuario incluyen directorios genericos de agents, ademas de Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline y Continue.

```bash
localnest install skills             # install or update bundled skills
localnest install skills --force     # force reinstall
localnest-mcp-install-skill          # deprecated compatibility alias
```

**Herramientas CLI de shell** para automatizacion y hooks:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Los aliases heredados `localnest-mcp-task-context` y `localnest-mcp-capture-outcome` siguen funcionando por compatibilidad. Ambos comandos aceptan JSON por stdin. Instalar desde GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Auto-migracion

Actualiza sin ceremonias. Al iniciar, LocalNest migra automaticamente esquemas de configuracion antiguos y el layout plano de `~/.localnest` hacia la nueva estructura `config/`, `data/`, `cache/` y `backups/`. Sin repetir pasos manuales, sin configuraciones rotas despues de actualizar.

---

## Seguridad

LocalNest sigue el patron OSS de pipeline de seguridad:

- **Gate de calidad en CI** -- [quality.yml](../.github/workflows/quality.yml)
- **Analisis estatico con CodeQL** -- [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** -- [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** -- [.github/dependabot.yml](../.github/dependabot.yml)
- **Scorecard publica** -- https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Contribuir

Consulta [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Nuevo en la base de codigo?** Empieza con la **[arquitectura general](../guides/architecture.md)**: explica como arranca el servidor, como funcionan la busqueda y la memoria, y donde vive cada parte.

---

## Contributors

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Gracias a todas las personas que aportan codigo, documentacion, revisiones, pruebas y reportes de issues.

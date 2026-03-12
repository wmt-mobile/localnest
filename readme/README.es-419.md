<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Tu base de código. Tu IA. Tu máquina - sin nube, sin fugas, sin sorpresas.**

LocalNest es un servidor MCP local-first que les da a los agentes de IA acceso seguro y delimitado a tu código, con búsqueda híbrida, indexación semántica y memoria persistente que nunca sale de tu máquina.

📖 [Documentación completa](https://wmt-mobile.github.io/localnest/) · [Arquitectura en profundidad](../guides/architecture.md)

## Idiomas del README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · Español (Latinoamérica) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Estos archivos traducidos son traducciones completas del README para cada configuración regional. Consulta la [política de traducción](./TRANSLATION_POLICY.md) para ver la matriz de locales y las reglas terminológicas. El [README.md](../README.md) en inglés sigue siendo la fuente principal para comandos nuevos, notas de versión y todos los detalles.

---

## ¿Por qué LocalNest?

La mayoría de las herramientas de IA para código envían información hacia fuera. LocalNest no.

Todo - lecturas de archivos, embeddings vectoriales, memoria - corre dentro del proceso en tu máquina. Sin suscripciones cloud, sin límites de tasa, sin sacar datos de tu entorno. Y como habla MCP, cualquier cliente compatible (Cursor, Windsurf, Codex, Kiro, Gemini CLI) puede conectarse con un solo bloque de configuración.

| Lo que obtienes | Cómo funciona |
|---|---|
| **Acceso seguro a archivos** | Lecturas acotadas dentro de los roots configurados - nada fuera de ellos |
| **Búsqueda léxica inmediata** | Búsqueda de símbolos y patrones con `ripgrep` (fallback en JS si falta) |
| **Búsqueda semántica** | Embeddings locales vía `all-MiniLM-L6-v2` - sin necesidad de GPU |
| **Recuperación híbrida** | Fusión de búsqueda léxica y semántica con ranking RRF para obtener los mejores resultados |
| **Conciencia de proyecto** | Detecta proyectos automáticamente por archivos marcador y delimita cada llamada |
| **Memoria del agente** | Grafo de conocimiento persistente y consultable - tu IA recuerda lo que aprendió |

---

## Inicio rápido

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Pega esto en la configuración de tu cliente MCP**

`setup` escribe automáticamente la configuración para las herramientas detectadas. También encontrarás un bloque listo para copiar en `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** Usa la configuración escrita por `localnest setup`; ahí se establece automáticamente el comando correcto para tu plataforma.

Reinicia tu cliente MCP. Si entra en timeout, define `startup_timeout_sec: 30` en la configuración del cliente.

**Requisitos:** Node.js `>=18` · `ripgrep` recomendado, pero opcional

El chunking con soporte AST viene por defecto para `JavaScript`, `Python`, `Go`, `Bash`, `Lua` y `Dart`. Los demás lenguajes siguen indexándose correctamente con chunking de respaldo basado en líneas.

El runtime estable actual usa `@huggingface/transformers` para embeddings y reranking locales. Las nuevas configuraciones de setup usan `huggingface`, y las configuraciones antiguas de `xenova` siguen aceptándose como alias de compatibilidad.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## Actualización

```bash
localnest upgrade              # última versión estable
localnest upgrade stable       # última versión estable
localnest upgrade beta         # última beta
localnest upgrade <version>    # fijar una versión específica
localnest version              # revisar la versión actual
```

---

## Cómo lo usan los agentes

Dos flujos cubren casi todo:

### Búsqueda rápida - encontrar, leer y listo
Ideal para ubicar con precisión un archivo, símbolo o patrón de código.

```
localnest_search_files   → encontrar el módulo por ruta/nombre
localnest_search_code    → encontrar el símbolo o identificador exacto
localnest_read_file      → leer las líneas relevantes
```

### Tarea profunda - depurar, refactorizar, revisar con contexto
Ideal para trabajo complejo donde importan la memoria y la comprensión semántica.

```
localnest_task_context    → una sola llamada: estado de runtime + memorias recuperadas
localnest_search_hybrid   → búsqueda conceptual en toda la base de código
localnest_read_file       → leer las secciones relevantes
localnest_capture_outcome → persistir lo aprendido para la próxima vez
```

> **Éxito del tool ≠ resultado útil.** Un tool puede devolver OK y aun así venir vacío. Toma las coincidencias no vacías y el contenido real de líneas como evidencia útil, no solo el éxito del proceso.

---

## Tools

### Workspace & Discovery

| Tool | Qué hace |
|------|-------------|
| `localnest_list_roots` | Lista los roots configurados |
| `localnest_list_projects` | Lista los proyectos bajo un root |
| `localnest_project_tree` | Árbol de archivos/carpetas de un proyecto |
| `localnest_summarize_project` | Resumen por lenguaje y extensiones |
| `localnest_read_file` | Lee una ventana acotada de líneas de un archivo |

### Search & Index

| Tool | Qué hace |
|------|-------------|
| `localnest_search_files` | Búsqueda por nombre de archivo/ruta - empieza aquí para descubrir módulos |
| `localnest_search_code` | Búsqueda léxica - símbolos exactos, regex, identificadores |
| `localnest_search_hybrid` | Búsqueda híbrida - léxica + semántica, ordenada con RRF |
| `localnest_get_symbol` | Encuentra definiciones/exportaciones de un símbolo |
| `localnest_find_usages` | Encuentra imports y sitios de uso de un símbolo |
| `localnest_index_project` | Construye o actualiza el índice semántico |
| `localnest_index_status` | Metadatos del índice - existe, está obsoleto, backend |
| `localnest_embed_status` | Estado del backend de embeddings y preparación de búsqueda vectorial |

### Memory

| Tool | Qué hace |
|------|-------------|
| `localnest_task_context` | Contexto en una llamada: runtime + memoria para una tarea |
| `localnest_memory_recall` | Recupera memorias relevantes para una consulta |
| `localnest_capture_outcome` | Captura el resultado de una tarea en memoria |
| `localnest_memory_capture_event` | Ingesta de eventos en segundo plano con autopromoción |
| `localnest_memory_store` | Guarda una memoria manualmente |
| `localnest_memory_update` | Actualiza una memoria y agrega una revisión |
| `localnest_memory_delete` | Elimina una memoria |
| `localnest_memory_get` | Obtiene una memoria con historial de revisiones |
| `localnest_memory_list` | Lista las memorias almacenadas |
| `localnest_memory_events` | Inspecciona eventos recientes de memoria |
| `localnest_memory_add_relation` | Vincula dos memorias con una relación nombrada |
| `localnest_memory_remove_relation` | Elimina una relación |
| `localnest_memory_related` | Recorre el grafo de conocimiento a un salto |
| `localnest_memory_suggest_relations` | Sugiere memorias relacionadas por similitud |
| `localnest_memory_status` | Estado de consentimiento, backend y base de datos de memoria |

### Server & Updates

| Tool | Qué hace |
|------|-------------|
| `localnest_server_status` | Configuración de runtime, roots, `ripgrep`, backend del índice |
| `localnest_health` | Resumen compacto de salud con reporte del monitor en segundo plano |
| `localnest_usage_guide` | Guía de buenas prácticas para agentes |
| `localnest_update_status` | Revisa npm por la versión más reciente (con caché) |
| `localnest_update_self` | Actualiza globalmente y sincroniza el skill incluido (requiere aprobación) |

Todos los tools soportan `response_format: "json"` (por defecto) o `"markdown"`. Los tools de lista devuelven `total_count`, `has_more` y `next_offset` para paginación.

---

## Memory - tu IA no olvida

Habilita memory durante `localnest setup` y LocalNest empezará a construir un grafo de conocimiento persistente en una base SQLite local. Cada bug fix, decisión arquitectónica y preferencia que toque tu agente de IA podrá recuperarse en la siguiente sesión.

- Requiere **Node 22.13+** - las herramientas de búsqueda y archivos funcionan bien en Node 18/20 sin esto
- Un fallo en memory nunca bloquea los demás tools - todo degrada de forma independiente

**Cómo funciona la autopromoción:** los eventos capturados vía `localnest_memory_capture_event` se puntúan según la fuerza de la señal. Los eventos de alta señal - bug fixes, decisiones, preferencias - se promueven a memorias duraderas. Los eventos exploratorios débiles se registran y se descartan silenciosamente después de 30 días.

---

## Backend de indexación

| Backend | Cuándo usarlo |
|---------|-------------|
| `sqlite-vec` | **Recomendado.** SQLite persistente, rápido y eficiente para repos grandes. Requiere Node 22+. |
| `json` | Fallback de compatibilidad. Se selecciona automáticamente si `sqlite-vec` no está disponible. |

Revisa `localnest_server_status` → `upgrade_recommended` para saber cuándo conviene migrar.

---

## Configuración

`setup` escribe todo en `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → bases de datos SQLite del índice y de memory
├── cache/    → pesos de modelos, estado de actualización
├── backups/  → historial de migraciones de configuración
└── vendor/   → dependencias nativas administradas (sqlite-vec)
```

**Prioridad de configuración:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → directorio actual

**Variables de entorno clave:**

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` o `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Ruta de la base SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Líneas por chunk del índice |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Solapamiento entre chunks |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Máximo de archivos por corrida de indexación |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Modelo de embeddings |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Ruta del caché de modelos |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Modelo reranker cross-encoder |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Habilita el subsistema de memory local |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Ruta de la base de memory |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Autopromover eventos en segundo plano |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Intervalo de revisión de actualizaciones npm |

<details>
<summary>Todas las variables de entorno</summary>

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | Ruta del índice JSON |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Ruta a la extensión nativa `vec0` |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Máximo de términos por chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Backend de embeddings |
| `LOCALNEST_EMBED_DIMS` | `384` | Dimensiones del vector de embeddings |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Backend del reranker |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Ruta del caché del reranker |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` o `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Suprime el prompt de consentimiento |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Nombre del paquete npm a revisar |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Reintento tras una revisión npm fallida |

</details>

## Nota de instalación

`0.0.6-beta.1` mantiene `0.0.5` como la línea estable actual mientras adelanta la fase de deprecación de CLI: comandos canónicos `localnest task-context` / `localnest capture-outcome`, wrappers de compatibilidad deprecados para helpers antiguos `localnest-mcp-*`, y sin cambios en el binario `localnest-mcp` que usan los clientes MCP. Algunos entornos npm todavía pueden mostrar una advertencia de deprecación upstream desde la cadena de dependencias de ONNX runtime; la funcionalidad de LocalNest no se ve afectada.

**Consejos de rendimiento:**
- Delimita las consultas con `project_path` + un `glob` estrecho siempre que sea posible
- Empieza con `max_results: 20–40` y amplía solo si hace falta
- Deja el reranking desactivado por defecto - actívalo solo para un pase final de precisión

---

## Distribución de skills

LocalNest distribuye skills de agentes de IA desde una única fuente canónica e instala variantes específicas por herramienta para clientes soportados. Los destinos actuales a nivel usuario incluyen directorios genéricos de agents, además de Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline y Continue.

```bash
localnest install skills             # instalar o actualizar skills incluidos
localnest install skills --force     # forzar reinstalación
localnest-mcp-install-skill          # alias de compatibilidad deprecado
```

**Herramientas CLI de shell** para automatización y hooks:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Los aliases heredados `localnest-mcp-task-context` y `localnest-mcp-capture-outcome` siguen funcionando por compatibilidad. Ambos comandos aceptan JSON por stdin. Instalar desde GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Auto-migración

Actualiza sin ceremonias. Al iniciar, LocalNest migra automáticamente esquemas de configuración antiguos y el layout plano de `~/.localnest` hacia la nueva estructura `config/`, `data/`, `cache/` y `backups/`. Sin repetir pasos manuales, sin configuraciones rotas después de actualizar.

---

## Seguridad

LocalNest sigue el patrón OSS de pipeline de seguridad:

- **Gate de calidad en CI** — [quality.yml](../.github/workflows/quality.yml)
- **Análisis estático con CodeQL** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Scorecard pública** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Contribuir

Consulta [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **¿Nuevo en la base de código?** Empieza con la **[arquitectura general](../guides/architecture.md)**: explica cómo arranca el servidor, cómo funcionan la búsqueda y la memoria, y dónde vive cada parte.

---

## Contributors

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Gracias a todas las personas que aportan código, documentación, revisiones, pruebas y reportes de issues.

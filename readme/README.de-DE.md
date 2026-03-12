<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Deine Codebasis. Deine KI. Deine Maschine - keine Cloud, keine Lecks, keine Überraschungen.**

LocalNest ist ein local-first MCP-Server, der KI-Agenten sicheren, begrenzten Zugriff auf deinen Code gibt - mit hybrider Suche, semantischer Indizierung und persistentem Speicher, der deine Maschine nie verlässt.

📖 [Vollständige Dokumentation](https://wmt-mobile.github.io/localnest/) · [Architektur im Detail](../guides/architecture.md)

## README-Sprachen

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · Deutsch (Deutschland) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Diese lokalisierten Dateien sind vollständige README-Übersetzungen für die jeweilige Sprachregion. In der [Übersetzungsrichtlinie](./TRANSLATION_POLICY.md) findest du die Ziel-Locale-Matrix und Terminologieregeln. Die englische [README.md](../README.md) bleibt die maßgebliche Quelle für neue Befehle, Release-Notes und alle Details.

---

## Warum LocalNest?

Die meisten KI-Entwicklungswerkzeuge telefonieren nach Hause. LocalNest nicht.

Alles - Dateizugriffe, Vektoreinbettungen, Speicher - läuft im Prozess auf deiner Maschine. Kein Cloud-Abo, keine Rate Limits, keine Daten verlassen dein System. Und weil LocalNest MCP spricht, kann jeder kompatible Client (Cursor, Windsurf, Codex, Kiro, Gemini CLI) mit einem Konfigurationsblock angebunden werden.

| Was du bekommst | Wie es funktioniert |
|---|---|
| **Sicherer Dateizugriff** | Begrenzte Lesezugriffe unter deinen konfigurierten Roots - nichts außerhalb |
| **Sofortige lexikalische Suche** | `ripgrep`-gestützte Symbol- und Mustersuche (JS-Fallback, falls `rg` fehlt) |
| **Semantische Suche** | Lokale Vektoreinbettungen über `all-MiniLM-L6-v2` - keine GPU nötig |
| **Hybride Retrieval-Pipeline** | Lexikalische und semantische Suche, kombiniert mit RRF-Ranking für die besten Ergebnisse |
| **Projektbewusstsein** | Erkennt Projekte automatisch über Marker-Dateien und scoped jeden Tool-Aufruf |
| **Agenten-Speicher** | Dauerhafter, abfragbarer Wissensgraph - deine KI erinnert sich an Gelerntes |

---

## Schnellstart

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Füge dies in deine MCP-Client-Konfiguration ein**

`setup` schreibt die Konfiguration für erkannte Tools automatisch. Einen direkt einfügbaren Block findest du außerdem unter `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** Verwende die von `localnest setup` erzeugte Konfiguration - sie setzt automatisch den richtigen Befehl für deine Plattform.

Starte deinen MCP-Client neu. Wenn er in ein Timeout läuft, setze `startup_timeout_sec: 30` in der Client-Konfiguration.

**Voraussetzungen:** Node.js `>=18` · `ripgrep` empfohlen, aber optional

AST-basiertes Chunking wird standardmäßig für `JavaScript`, `Python`, `Go`, `Bash`, `Lua` und `Dart` mitgeliefert. Andere Sprachen werden weiterhin sauber mit zeilenbasiertem Fallback-Chunking indiziert.

Die aktuelle stabile Laufzeit nutzt `@huggingface/transformers` für lokale Einbettungen und Re-Ranking. Neue Setup-Standards verwenden `huggingface`, ältere `xenova`-Konfigurationen bleiben als Kompatibilitätsalias gültig.

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
localnest upgrade              # neueste stabile Version
localnest upgrade stable       # neueste stabile Version
localnest upgrade beta         # neueste Beta-Version
localnest upgrade <version>    # auf eine bestimmte Version festsetzen
localnest version              # aktuelle Version prüfen
```

---

## Wie Agenten es verwenden

Zwei Workflows decken fast alles ab:

### Schneller Lookup - finden, lesen, fertig
Am besten, um eine Datei, ein Symbol oder ein Codemuster exakt zu lokalisieren.

```
localnest_search_files   → Modul über Pfad/Namen finden
localnest_search_code    → exaktes Symbol oder Kennung finden
localnest_read_file      → relevante Zeilen lesen
```

### Tiefe Aufgabe - Debugging, Refactoring, Review mit Kontext
Am besten für komplexe Aufgaben, bei denen Speicher und semantisches Verständnis wichtig sind.

```
localnest_task_context    → ein Aufruf: Laufzeitstatus + abgerufene Erinnerungen
localnest_search_hybrid   → konzeptuelle Suche über deine Codebasis
localnest_read_file       → relevante Abschnitte lesen
localnest_capture_outcome → speichern, was du gelernt hast, für das nächste Mal
```

> **Tool-Erfolg ≠ nützliches Ergebnis.** Ein Tool kann OK zurückgeben und trotzdem leer sein. Betrachte nichtleere Dateitreffer und echte Zeileninhalte als aussagekräftige Evidenz - nicht bloß den Prozesserfolg.

---

## Tools

### Workspace & Discovery

| Tool | Was es macht |
|------|-------------|
| `localnest_list_roots` | Konfigurierte Roots auflisten |
| `localnest_list_projects` | Projekte unter einem Root auflisten |
| `localnest_project_tree` | Datei-/Ordnerbaum für ein Projekt |
| `localnest_summarize_project` | Aufschlüsselung nach Sprachen und Dateiendungen |
| `localnest_read_file` | Begrenztes Zeilenfenster aus einer Datei lesen |

### Search & Index

| Tool | Was es macht |
|------|-------------|
| `localnest_search_files` | Suche nach Datei-/Pfadnamen - hier für Modulfindung beginnen |
| `localnest_search_code` | Lexikalische Suche - exakte Symbole, Regex, Kennungen |
| `localnest_search_hybrid` | Hybride Suche - lexikalisch + semantisch, mit RRF gerankt |
| `localnest_get_symbol` | Definitions-/Exportpositionen für ein Symbol finden |
| `localnest_find_usages` | Importe und Aufrufstellen für ein Symbol finden |
| `localnest_index_project` | Semantischen Index aufbauen oder aktualisieren |
| `localnest_index_status` | Index-Metadaten - vorhanden, veraltet, Backend |
| `localnest_embed_status` | Status des Embedding-Backends und Bereitschaft der Vektorsuche |

### Memory

| Tool | Was es macht |
|------|-------------|
| `localnest_task_context` | Ein-Aufruf-Kontext aus Laufzeit + Speicher für eine Aufgabe |
| `localnest_memory_recall` | Relevante Erinnerungen für eine Anfrage abrufen |
| `localnest_capture_outcome` | Aufgabenergebnis im Speicher festhalten |
| `localnest_memory_capture_event` | Hintergrundereignis-Aufnahme mit Auto-Promotion |
| `localnest_memory_store` | Erinnerung manuell speichern |
| `localnest_memory_update` | Erinnerung aktualisieren und Revision anhängen |
| `localnest_memory_delete` | Erinnerung löschen |
| `localnest_memory_get` | Einzelne Erinnerung mit Revisionshistorie holen |
| `localnest_memory_list` | Gespeicherte Erinnerungen auflisten |
| `localnest_memory_events` | Kürzliche Speicherereignisse inspizieren |
| `localnest_memory_add_relation` | Zwei Erinnerungen mit einer Relation verknüpfen |
| `localnest_memory_remove_relation` | Relation entfernen |
| `localnest_memory_related` | Wissensgraph einen Hop weit traversieren |
| `localnest_memory_suggest_relations` | Ähnliche Erinnerungen per Ähnlichkeit vorschlagen |
| `localnest_memory_status` | Status zu Speicher-Einwilligung, Backend und Datenbank |

### Server & Updates

| Tool | Was es macht |
|------|-------------|
| `localnest_server_status` | Laufzeitkonfig, Roots, `ripgrep`, Index-Backend |
| `localnest_health` | Kompakte Health-Zusammenfassung mit Hintergrundmonitor |
| `localnest_usage_guide` | Best-Practice-Hinweise für Agenten |
| `localnest_update_status` | npm auf neue Version prüfen (gecacht) |
| `localnest_update_self` | Global aktualisieren und gebündelten Skill synchronisieren (Genehmigung erforderlich) |

Alle Tools unterstützen `response_format: "json"` (Standard) oder `"markdown"`. Listen-Tools liefern `total_count`, `has_more`, `next_offset` für Pagination zurück.

---

## Memory - Deine KI vergisst nicht

Aktiviere den Speicher während `localnest setup`, und LocalNest beginnt, einen dauerhaften Wissensgraphen in einer lokalen SQLite-Datenbank aufzubauen. Jeder Bugfix, jede Architekturentscheidung und jede Präferenz, die dein KI-Agent berührt, kann in der nächsten Sitzung wieder abgerufen werden.

- Benötigt **Node 22.13+** - Such- und Datei-Tools funktionieren unter Node 18/20 auch ohne Speicher problemlos
- Speicherfehler blockieren niemals andere Tools - alles degradiert unabhängig voneinander

**So funktioniert Auto-Promotion:** Ereignisse, die über `localnest_memory_capture_event` erfasst werden, werden nach Signalstärke bewertet. Starke Ereignisse - Bugfixes, Entscheidungen, Präferenzen - werden in dauerhafte Erinnerungen überführt. Schwache explorative Ereignisse werden aufgezeichnet und nach 30 Tagen still verworfen.

---

## Index-Backend

| Backend | Wann es sinnvoll ist |
|---------|-------------|
| `sqlite-vec` | **Empfohlen.** Persistentes SQLite, schnell und effizient für große Repositories. Benötigt Node 22+. |
| `json` | Kompatibilitäts-Fallback. Wird automatisch gewählt, wenn `sqlite-vec` nicht verfügbar ist. |

Prüfe `localnest_server_status` → `upgrade_recommended`, um zu sehen, wann eine Migration sinnvoll ist.

---

## Konfiguration

`setup` schreibt alles nach `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → SQLite-Index- und Speicher-Datenbanken
├── cache/    → Modellgewichte, Update-Status
├── backups/  → Historie der Konfigurationsmigrationen
└── vendor/   → Verwaltete native Abhängigkeiten (sqlite-vec)
```

**Konfigurationspriorität:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → aktuelles Verzeichnis

**Wichtige Umgebungsvariablen:**

| Variable | Standard | Beschreibung |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` oder `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Pfad zur SQLite-Datenbank |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Zeilen pro Index-Chunk |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Überlappung zwischen Chunks |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Maximale Dateien pro Indexlauf |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding-Modell |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Modell-Cache-Pfad |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-Encoder-Reranker-Modell |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Lokales Speichersubsystem aktivieren |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Pfad zur Speicher-Datenbank |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Hintergrundereignisse automatisch befördern |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Intervall für npm-Update-Prüfung |

<details>
<summary>Alle Umgebungsvariablen</summary>

| Variable | Standard | Beschreibung |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | JSON-Indexpfad |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Pfad zur nativen `vec0`-Erweiterung |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Maximale Terme pro Chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Embedding-Backend |
| `LOCALNEST_EMBED_DIMS` | `384` | Dimensionen des Embedding-Vektors |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Reranker-Backend |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Pfad zum Reranker-Cache |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` oder `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Einwilligungsabfrage unterdrücken |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Zu prüfender npm-Paketname |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Wiederholungsintervall nach fehlgeschlagener npm-Prüfung |

</details>

## Install-Hinweis

`0.0.6-beta.1` lässt `0.0.5` als aktuelle stabile Linie bestehen und zeigt zugleich die CLI-Abschreibungsphase vor: kanonische Befehle `localnest task-context` / `localnest capture-outcome`, veraltete Kompatibilitäts-Wrapper für ältere `localnest-mcp-*`-Hilfsbefehle und keine Änderung am `localnest-mcp`-Server-Binary, das von MCP-Clients verwendet wird. Manche npm-Umgebungen können weiterhin eine einzelne vorgelagerte Deprecation-Warnung aus der ONNX-Runtime-Abhängigkeitskette anzeigen; die LocalNest-Funktionalität bleibt unbeeinträchtigt.

**Performance-Tipps:**
- Anfragen nach Möglichkeit mit `project_path` + engem `glob` eingrenzen
- Mit `max_results: 20–40` beginnen und nur bei Bedarf erweitern
- Re-Ranking standardmäßig deaktiviert lassen - nur für einen finalen Präzisionsdurchlauf aktivieren

---

## Skill-Verteilung

LocalNest liefert gebündelte KI-Agenten-Skills aus einer kanonischen Quelle und installiert toolspezifische Varianten für unterstützte Clients. Aktuelle Ziele auf Benutzerebene umfassen generische Agents-Verzeichnisse sowie Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline und Continue.

```bash
localnest install skills             # gebündelte Skills installieren oder aktualisieren
localnest install skills --force     # Neuinstallation erzwingen
localnest-mcp-install-skill          # veralteter Kompatibilitätsalias
```

**Shell-CLI-Tools** für Automatisierung und Hooks:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Die Legacy-Aliase `localnest-mcp-task-context` und `localnest-mcp-capture-outcome` funktionieren aus Kompatibilitätsgründen weiterhin. Beide Befehle akzeptieren JSON über stdin. Installation von GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Auto-Migration

Upgrade ohne Umstände. Beim Start migriert LocalNest ältere Konfigurationsschemata und das flache `~/.localnest`-Layout automatisch in die neue Struktur `config/`, `data/`, `cache/` und `backups/`. Keine manuellen Wiederholungen, keine kaputten Konfigurationen nach Upgrades.

---

## Sicherheit

LocalNest folgt dem OSS-Sicherheitsmuster:

- **CI-Qualitäts-Gate** — [quality.yml](../.github/workflows/quality.yml)
- **CodeQL-Statikanalyse** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Öffentliche Scorecard** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Mitwirken

Siehe [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Neu im Codebestand?** Beginne mit dem **[Architekturüberblick](../guides/architecture.md)** - dort wird erklärt, wie der Server startet, wie Suche und Speicher funktionieren und wo alles liegt.

---

## Mitwirkende

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Danke an alle, die Code, Dokumentation, Reviews, Tests und Issue-Reports beitragen.

<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Votre base de code. Votre IA. Votre machine - pas de cloud, pas de fuite, pas de surprise.**

LocalNest est un serveur MCP local-first qui donne aux agents IA un accès sûr et circonscrit à votre code, avec recherche hybride, indexation sémantique et mémoire persistante qui ne quitte jamais votre machine.

📖 [Documentation complète](https://wmt-mobile.github.io/localnest/) · [Architecture détaillée](../guides/architecture.md)

## Langues du README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · Français (France) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Ces fichiers traduits sont des traductions complètes du README, adaptées à chaque locale. Consultez la [politique de traduction](./TRANSLATION_POLICY.md) pour la matrice des locales cibles et les règles terminologiques. Le [README.md](../README.md) anglais reste la source de référence pour les nouvelles commandes, les notes de version et l’ensemble des détails.

---

## Pourquoi LocalNest ?

La plupart des outils IA pour le code envoient vos données ailleurs. LocalNest ne le fait pas.

Tout - lecture de fichiers, embeddings vectoriels, mémoire - s’exécute dans le processus, sur votre machine. Pas d’abonnement cloud, pas de limitation par quotas, aucune donnée ne quitte votre environnement. Et comme LocalNest parle MCP, n’importe quel client compatible (Cursor, Windsurf, Codex, Kiro, Gemini CLI) peut s’y brancher avec un seul bloc de configuration.

| Ce que vous obtenez | Comment cela fonctionne |
|---|---|
| **Accès sécurisé aux fichiers** | Lectures limitées à vos roots configurés - rien en dehors |
| **Recherche lexicale instantanée** | Recherche de symboles et de motifs via `ripgrep` (repli JS si absent) |
| **Recherche sémantique** | Embeddings locaux via `all-MiniLM-L6-v2` - aucun GPU nécessaire |
| **Récupération hybride** | Fusion recherche lexicale + sémantique avec classement RRF pour le meilleur des deux mondes |
| **Conscience du projet** | Détecte automatiquement les projets via des fichiers marqueurs et applique un scope à chaque appel |
| **Mémoire de l’agent** | Graphe de connaissances durable et interrogeable - votre IA se souvient de ce qu’elle apprend |

---

## Démarrage rapide

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Collez ceci dans la configuration de votre client MCP**

`setup` écrit automatiquement la configuration pour les outils détectés. Vous trouverez aussi un bloc prêt à copier dans `~/.localnest/config/mcp.localnest.json` :

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

> **Windows :** utilisez la configuration écrite par `localnest setup` ; elle choisit automatiquement la bonne commande pour votre plateforme.

Redémarrez votre client MCP. En cas de timeout, définissez `startup_timeout_sec: 30` dans la configuration du client.

**Prérequis :** Node.js `>=18` · `ripgrep` recommandé mais optionnel

Le découpage de code assisté par AST est fourni par défaut pour `JavaScript`, `Python`, `Go`, `Bash`, `Lua` et `Dart`. Les autres langages sont quand même indexés correctement grâce à un fallback de découpage par lignes.

Le runtime stable actuel utilise `@huggingface/transformers` pour les embeddings et le reranking locaux. Les nouvelles valeurs par défaut de setup utilisent `huggingface`, et les anciennes configurations `xenova` restent acceptées comme alias de compatibilité.

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt-get install ripgrep

# Windows
winget install BurntSushi.ripgrep.MSVC
```

---

## Mise à niveau

```bash
localnest upgrade              # dernière version stable
localnest upgrade stable       # dernière version stable
localnest upgrade beta         # dernière version bêta
localnest upgrade <version>    # épingler une version précise
localnest version              # vérifier la version actuelle
```

---

## Comment les agents l’utilisent

Deux workflows couvrent presque tous les cas :

### Recherche rapide - trouver, lire, terminé
Idéal pour localiser précisément un fichier, un symbole ou un motif de code.

```
localnest_search_files   → trouver le module par chemin/nom
localnest_search_code    → trouver le symbole ou l’identifiant exact
localnest_read_file      → lire les lignes pertinentes
```

### Tâche approfondie - debug, refactor, review avec contexte
Idéal pour le travail complexe où la mémoire et la compréhension sémantique comptent.

```
localnest_task_context    → un appel : état du runtime + mémoires rappelées
localnest_search_hybrid   → recherche conceptuelle dans toute votre base de code
localnest_read_file       → lire les sections pertinentes
localnest_capture_outcome → persister ce qui a été appris pour la prochaine fois
```

> **Succès d’un tool ≠ résultat utile.** Un tool peut répondre OK et rester vide. Considérez les correspondances de fichiers non vides et le vrai contenu des lignes comme une preuve utile, pas seulement le succès du processus.

---

## Tools

### Workspace & Discovery

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_list_roots` | Liste les roots configurés |
| `localnest_list_projects` | Liste les projets sous un root |
| `localnest_project_tree` | Arborescence de fichiers/dossiers pour un projet |
| `localnest_summarize_project` | Répartition par langages et extensions |
| `localnest_read_file` | Lit une fenêtre bornée de lignes dans un fichier |

### Search & Index

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_search_files` | Recherche par nom de fichier/chemin - point de départ pour découvrir un module |
| `localnest_search_code` | Recherche lexicale - symboles exacts, regex, identifiants |
| `localnest_search_hybrid` | Recherche hybride - lexicale + sémantique, classée par RRF |
| `localnest_get_symbol` | Trouve les emplacements de définition/export d’un symbole |
| `localnest_find_usages` | Trouve les imports et usages d’un symbole |
| `localnest_index_project` | Construit ou rafraîchit l’index sémantique |
| `localnest_index_status` | Métadonnées d’index - existe, obsolète, backend |
| `localnest_embed_status` | État du backend d’embeddings et disponibilité de la recherche vectorielle |

### Memory

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_task_context` | Contexte runtime + mémoire en un appel pour une tâche |
| `localnest_memory_recall` | Rappelle les mémoires pertinentes pour une requête |
| `localnest_capture_outcome` | Capture le résultat d’une tâche dans la mémoire |
| `localnest_memory_capture_event` | Ingestion d’événements en arrière-plan avec auto-promotion |
| `localnest_memory_store` | Stocke une mémoire manuellement |
| `localnest_memory_update` | Met à jour une mémoire et ajoute une révision |
| `localnest_memory_delete` | Supprime une mémoire |
| `localnest_memory_get` | Récupère une mémoire avec l’historique des révisions |
| `localnest_memory_list` | Liste les mémoires stockées |
| `localnest_memory_events` | Inspecte les événements mémoire récents |
| `localnest_memory_add_relation` | Relie deux mémoires avec une relation nommée |
| `localnest_memory_remove_relation` | Supprime une relation |
| `localnest_memory_related` | Parcourt le graphe de connaissances à un saut |
| `localnest_memory_suggest_relations` | Suggère automatiquement des mémoires liées par similarité |
| `localnest_memory_status` | État du consentement, du backend et de la base mémoire |

### Server & Updates

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_server_status` | Configuration runtime, roots, `ripgrep`, backend d’index |
| `localnest_health` | Résumé de santé compact avec rapport du moniteur en arrière-plan |
| `localnest_usage_guide` | Bonnes pratiques pour les agents |
| `localnest_update_status` | Vérifie npm pour la version la plus récente (avec cache) |
| `localnest_update_self` | Met à jour globalement et synchronise le skill embarqué (approbation requise) |

Tous les tools prennent en charge `response_format: "json"` (par défaut) ou `"markdown"`. Les tools de liste renvoient `total_count`, `has_more`, `next_offset` pour la pagination.

---

## Memory - votre IA n’oublie pas

Activez la mémoire pendant `localnest setup` et LocalNest commencera à construire un graphe de connaissances durable dans une base SQLite locale. Chaque bug fix, décision d’architecture et préférence manipulés par votre agent IA pourront être rappelés lors de la session suivante.

- Nécessite **Node 22.13+** - les tools de recherche et de fichiers fonctionnent très bien sur Node 18/20 sans cela
- Une panne de mémoire ne bloque jamais les autres tools - tout se dégrade indépendamment

**Fonctionnement de l’auto-promotion :** les événements capturés via `localnest_memory_capture_event` sont notés selon la force du signal. Les événements à fort signal - correctifs, décisions, préférences - sont promus en mémoires durables. Les événements exploratoires faibles sont enregistrés puis discrètement supprimés après 30 jours.

---

## Backend d’indexation

| Backend | Quand l’utiliser |
|---------|-------------|
| `sqlite-vec` | **Recommandé.** SQLite persistant, rapide et efficace pour les grands dépôts. Nécessite Node 22+. |
| `json` | Repli de compatibilité. Sélectionné automatiquement si `sqlite-vec` n’est pas disponible. |

Consultez `localnest_server_status` → `upgrade_recommended` pour savoir quand migrer.

---

## Configuration

`setup` écrit tout dans `~/.localnest/` :

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → bases SQLite d’index et de mémoire
├── cache/    → poids de modèles, état des mises à jour
├── backups/  → historique des migrations de configuration
└── vendor/   → dépendances natives gérées (sqlite-vec)
```

**Priorité de configuration :** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → répertoire courant

**Variables d’environnement clés :**

| Variable | Valeur par défaut | Description |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` ou `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Chemin de la base SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Nombre de lignes par chunk d’index |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Chevauchement entre les chunks |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Nombre maximal de fichiers par indexation |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Modèle d’embeddings |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Chemin du cache des modèles |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Modèle reranker cross-encoder |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Active le sous-système de mémoire locale |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Chemin de la base mémoire |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Auto-promotion des événements de fond |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Intervalle de vérification des mises à jour npm |

<details>
<summary>Toutes les variables d’environnement</summary>

| Variable | Valeur par défaut | Description |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | Chemin de l’index JSON |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Chemin de l’extension native `vec0` |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Nombre maximal de termes par chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Backend d’embeddings |
| `LOCALNEST_EMBED_DIMS` | `384` | Dimensions du vecteur d’embeddings |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Backend du reranker |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Chemin du cache reranker |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` ou `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Supprime le prompt de consentement |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Nom du package npm à vérifier |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Délai avant nouvelle tentative après échec npm |

</details>

## Note d’installation

`0.0.6-beta.1` garde `0.0.5` comme ligne stable actuelle tout en prévisualisant la phase de dépréciation CLI : commandes canoniques `localnest task-context` / `localnest capture-outcome`, wrappers de compatibilité dépréciés pour les anciens helpers `localnest-mcp-*`, et aucun changement sur le binaire serveur `localnest-mcp` utilisé par les clients MCP. Certains environnements npm peuvent encore afficher un avertissement de dépréciation amont provenant de la chaîne de dépendances ONNX runtime ; la fonctionnalité de LocalNest n’est pas affectée.

**Conseils de performance :**
- Limitez les requêtes avec `project_path` + un `glob` étroit quand c’est possible
- Commencez avec `max_results: 20–40`, puis élargissez seulement si nécessaire
- Laissez le reranking désactivé par défaut - activez-le uniquement pour une passe finale de précision

---

## Distribution des skills

LocalNest distribue des skills d’agents IA depuis une source canonique unique et installe des variantes spécifiques pour les clients pris en charge. Les cibles actuelles au niveau utilisateur incluent des répertoires agents génériques ainsi que Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline et Continue.

```bash
localnest install skills             # installer ou mettre à jour les skills embarqués
localnest install skills --force     # forcer la réinstallation
localnest-mcp-install-skill          # alias de compatibilité déprécié
```

**Outils CLI shell** pour l’automatisation et les hooks :

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Les alias historiques `localnest-mcp-task-context` et `localnest-mcp-capture-outcome` fonctionnent toujours pour compatibilité. Les deux commandes acceptent du JSON sur stdin. Installation depuis GitHub :

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Auto-migration

Mettez à niveau sans cérémonie. Au démarrage, LocalNest migre automatiquement les anciens schémas de configuration et la structure plate `~/.localnest` vers la nouvelle organisation `config/`, `data/`, `cache/` et `backups/`. Aucun rerun manuel, aucune configuration cassée après une mise à niveau.

---

## Sécurité

LocalNest suit le modèle OSS de pipeline de sécurité :

- **Gate qualité CI** — [quality.yml](../.github/workflows/quality.yml)
- **Analyse statique CodeQL** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Scorecard publique** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Contribution

Voir [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Nouveau dans la base de code ?** Commencez par la **[vue d’ensemble de l’architecture](../guides/architecture.md)** : elle couvre le démarrage du serveur, le fonctionnement de la recherche et de la mémoire, et l’emplacement des différents éléments.

---

## Contributeurs

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Merci à toutes les personnes qui contribuent avec du code, de la documentation, des reviews, des tests et des signalements d’issues.

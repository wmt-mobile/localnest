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

LocalNest est un serveur MCP local-first et outil CLI qui donne aux agents IA un acces sur et circonscrit a votre code, avec recherche hybride, indexation semantique, graphe de connaissances temporel et memoire persistante qui ne quitte jamais votre machine.

**52 outils MCP** | **Graphe de connaissances temporel** | **Parcours multi-hop du graphe** | **Memoire par agent** | **Zero dependance cloud**

📖 [Documentation complète](https://wmt-mobile.github.io/localnest/) · [Architecture détaillée](../guides/architecture.md)

## Langues du README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · Français (France) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · [Português (Brasil)](./README.pt-BR.md) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Ces fichiers traduits sont des traductions complètes du README, adaptées à chaque locale. Consultez la [politique de traduction](./TRANSLATION_POLICY.md) pour la matrice des locales cibles et les règles terminologiques. Le [README.md](../README.md) anglais reste la source de référence pour les nouvelles commandes, les notes de version et l’ensemble des détails.

---

## Nouveautes de la version 0.0.7

> Changelog complet : [CHANGELOG.md](../CHANGELOG.md)

- **Graphe de connaissances temporel** -- entites, triplets, requetes as_of, chronologies, detection de contradictions
- **Parcours multi-hop du graphe** -- exploration des relations sur 2-5 sauts via des CTEs recursives (unique a LocalNest)
- **Hierarchie Nest/Branch** -- taxonomie de memoire a deux niveaux propre a LocalNest pour une recuperation organisee
- **Memoire par agent** -- isolation par agent avec entrees de journal privees
- **Dedup semantique** -- gate de similarite d'embedding empeche la pollution par des doublons quasi identiques
- **Ingestion de conversations** -- import d'exports de chat Markdown/JSON avec extraction d'entites
- **Systeme de hooks** -- callbacks pre/post operation pour la memoire, le KG, le parcours, l'ingestion
- **Architecture CLI-first** -- commandes unifiees `localnest <noun> <verb>` pour tout
- **Completions shell** -- tab completion pour bash, zsh, fish
- **17 nouveaux outils MCP** (52 au total) -- KG, nests, parcours, journal, ingestion, dedup, hooks

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
| **Memoire de l’agent** | Graphe de connaissances durable et interrogeable - votre IA se souvient de ce qu’elle apprend |
| **Graphe de connaissances temporel** | Triplets sujet-predicat-objet avec validite temporelle -- interrogez ce qui etait vrai a un moment donne |
| **Parcours multi-hop du graphe** | Explorez les relations sur 2-5 sauts via des CTEs recursives -- aucun autre outil local ne le fait |
| **Hierarchie Nest/Branch** | Taxonomie de memoire a deux niveaux avec boost filtre par metadonnees pour une recuperation organisee |
| **Ingestion de conversations** | Importez les exports de chat Markdown/JSON en memoire structuree + triplets KG |
| **Isolation des agents** | Journal et scope memoire par agent -- agents multiples, zero contamination croisee |
| **Systeme de hooks** | Hooks pre/post operation pour la memoire, le KG, le parcours, l’ingestion -- branchez votre propre logique |

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

Quatre workflows couvrent presque tous les cas :

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

### Graphe de connaissances -- faits structures sur le projet

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### Memoire conversationnelle -- apprendre des chats precedents

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## Reference CLI

LocalNest est un outil CLI complet. Tout se gere depuis le terminal :

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

**Flags globaux** fonctionnent sur chaque commande : `--json` (sortie machine), `--verbose`, `--quiet`, `--config <path>`

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

### Knowledge Graph

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_kg_add_entity` | Creer des entites (personnes, projets, concepts, outils) |
| `localnest_kg_add_triple` | Ajouter des faits sujet-predicat-objet avec validite temporelle |
| `localnest_kg_query` | Interroger les relations d’entites avec filtrage de direction |
| `localnest_kg_invalidate` | Marquer un fait comme n’etant plus valide (archivage, pas suppression) |
| `localnest_kg_as_of` | Requetes point-dans-le-temps -- qu’etait-il vrai a la date X ? |
| `localnest_kg_timeline` | Evolution chronologique des faits pour une entite |
| `localnest_kg_stats` | Nombre d’entites, nombre de triplets, repartition des predicats |

### Organisation Nest/Branch

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_nest_list` | Lister tous les nests (domaines memoire de premier niveau) avec comptages |
| `localnest_nest_branches` | Lister les branches (sujets) dans un nest |
| `localnest_nest_tree` | Hierarchie complete : nests, branches et comptages |

### Parcours du graphe

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_graph_traverse` | Parcours multi-hop avec suivi de chemin (CTEs recursives) |
| `localnest_graph_bridges` | Trouver les ponts cross-nest -- connexions entre domaines |

### Journal de l’agent

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_diary_write` | Ecrire une entree de bloc-notes privee (isolee par agent) |
| `localnest_diary_read` | Lire vos entrees de journal recentes |

### Ingestion de conversations

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_ingest_markdown` | Importer des exports de conversation Markdown dans la memoire + KG |
| `localnest_ingest_json` | Importer des exports de conversation JSON dans la memoire + KG |
| `localnest_memory_check_duplicate` | Detection de doublons semantiques avant enregistrement |

### Server & Updates

| Tool | Ce qu’il fait |
|------|-------------|
| `localnest_server_status` | Configuration runtime, roots, `ripgrep`, backend d’index |
| `localnest_health` | Résumé de santé compact avec rapport du moniteur en arrière-plan |
| `localnest_usage_guide` | Bonnes pratiques pour les agents |
| `localnest_update_status` | Vérifie npm pour la version la plus récente (avec cache) |
| `localnest_update_self` | Met à jour globalement et synchronise le skill embarqué (approbation requise) |

**50 outils au total.** Tous les tools prennent en charge `response_format: "json"` (par defaut) ou `"markdown"`. Les tools de liste renvoient `total_count`, `has_more`, `next_offset` pour la pagination.

---

## Comment LocalNest se compare

LocalNest est le seul serveur MCP local-first qui combine recuperation de code ET memoire structuree dans un seul outil. Voici sa position :

| Capacite | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (pas de cloud)** | Oui | Oui | Non ($25+/mois) | Non (Neo4j) | Non ($20-200/mois) |
| **Recuperation de code** | 50 outils MCP, AST-aware, recherche hybride | Aucun | Aucun | Aucun | Aucun |
| **Graphe de connaissances** | Triplets SQLite avec validite temporelle | Triplets SQLite | Neo4j | Neo4j | Key-value |
| **Parcours multi-hop** | Oui (CTEs recursives, 2-5 sauts) | Non (lookup plat uniquement) | Non | Oui (necessite Neo4j) | Non |
| **Requetes temporelles (as_of)** | Oui | Oui | Oui | Oui | Non |
| **Detection de contradictions** | Oui (avertissements a l’ecriture) | Existe mais non branche | Non | Non | Non |
| **Ingestion de conversations** | Markdown + JSON | Markdown + JSON + Slack | Non | Non | Non |
| **Isolation des agents** | Scoping par agent + journal prive | Wing-per-agent | User/session scoping | Non | User/agent/run/session |
| **Dedup semantique** | Gate cosine 0.92 sur toutes les ecritures | Seuil 0.9 | Non | Non | Non |
| **Hierarchie memoire** | Nest/Branch (original) | Wing/Room/Hall (palace) | Plat | Plat | Plat |
| **Systeme de hooks** | Hooks pre/post operation | Aucun | Webhooks | Aucun | Aucun |
| **Runtime** | Node.js (leger) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (cloud) |
| **Dependances** | 0 nouvelle (SQLite pur) | ChromaDB (lourd) | Neo4j ($25+/mois) | Neo4j | Cloud API |
| **Outils MCP** | 50 | 19 | 0 | 0 | 0 |
| **Cout** | Gratuit | Gratuit | $25+/mois | $25+/mois | $20-200/mois |

**Position unique de LocalNest :** Le seul outil qui donne a votre IA une comprehension profonde du code ET une memoire persistante structuree -- entierement local, zero cloud, zero cout.

---

## Memory - votre IA n’oublie pas

Activez la mémoire pendant `localnest setup` et LocalNest commencera à construire un graphe de connaissances durable dans une base SQLite locale. Chaque bug fix, décision d’architecture et préférence manipulés par votre agent IA pourront être rappelés lors de la session suivante.

- Nécessite **Node 22.13+** - les tools de recherche et de fichiers fonctionnent très bien sur Node 18/20 sans cela
- Une panne de mémoire ne bloque jamais les autres tools - tout se dégrade indépendamment

**Fonctionnement de l’auto-promotion :** les evenements captures via `localnest_memory_capture_event` sont notes selon la force du signal. Les evenements a fort signal - correctifs, decisions, preferences - sont promus en memoires durables. Les evenements exploratoires faibles sont enregistres puis discretement supprimes apres 30 jours.

**Graphe de connaissances :** Stockez des faits structures sous forme de triplets sujet-predicat-objet avec validite temporelle. Interrogez ce qui etait vrai a un moment donne avec `as_of`. Parcourez les relations sur 2-5 sauts avec le parcours CTE recursif. Detectez les contradictions a l’ecriture.

**Hierarchie Nest/Branch :** Organisez les memoires en nests (domaines de premier niveau) et branches (sujets). La recuperation filtree par metadonnees reduit les candidats avant le scoring pour des resultats plus rapides et plus precis.

**Isolation des agents :** Chaque agent dispose de son propre scope memoire et d’un journal prive. La recuperation renvoie les memoires propres + globales, jamais les donnees privees d’un autre agent.

**Dedup semantique :** Chaque ecriture passe par un gate de similarite d’embedding (seuil cosine par defaut : 0.92). Les quasi-doublons sont detectes avant le stockage -- votre memoire reste propre.

**Ingestion de conversations :** Importez des exports de chat Markdown ou JSON. Chaque tour devient une entree memoire avec extraction automatique d’entites et creation de triplets KG. La re-ingestion du meme fichier est ignoree par hash de contenu.

**Hooks :** Enregistrez des callbacks pre/post sur toute operation memoire -- stockage, recuperation, ecritures KG, parcours, ingestion. Construisez des pipelines personnalises sans modifier le code principal.

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

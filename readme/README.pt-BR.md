<!-- cspell:disable -->

# LocalNest MCP

[![stable](https://img.shields.io/npm/v/localnest-mcp?label=stable)](https://www.npmjs.com/package/localnest-mcp)
[![nightly](https://img.shields.io/npm/v/localnest-mcp/beta?label=nightly&color=blueviolet)](https://www.npmjs.com/package/localnest-mcp?activeTab=versions)
[![Node.js](https://img.shields.io/node/v/localnest-mcp)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Quality](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/quality.yml)
[![CodeQL](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml/badge.svg?branch=beta)](https://github.com/wmt-mobile/localnest/actions/workflows/codeql.yml)
[![Socket](https://badge.socket.dev/npm/package/localnest-mcp)](https://socket.dev/npm/package/localnest-mcp)

**Sua base de código. Sua IA. Sua máquina - sem nuvem, sem vazamento, sem surpresa.**

LocalNest e um servidor MCP local-first e ferramenta CLI que da a agentes de IA acesso seguro e delimitado ao seu codigo, com busca hibrida, indexacao semantica, grafo de conhecimento temporal e memoria persistente que nunca sai da sua maquina.

**52 ferramentas MCP** | **Grafo de conhecimento temporal** | **Travessia multi-hop do grafo** | **Memoria por agente** | **Zero dependencias de nuvem**

📖 [Documentação completa](https://wmt-mobile.github.io/localnest/) · [Arquitetura em profundidade](../guides/architecture.md)

## Idiomas do README

[English](../README.md) · [العربية الفصحى](./README.ar-001.md) · [বাংলা (বাংলাদেশ)](./README.bn-BD.md) · [Deutsch (Deutschland)](./README.de-DE.md) · [Español (Latinoamérica)](./README.es-419.md) · [Français (France)](./README.fr-FR.md) · [हिन्दी (भारत)](./README.hi-IN.md) · [Bahasa Indonesia](./README.id-ID.md) · [日本語](./README.ja-JP.md) · [한국어](./README.ko-KR.md) · Português (Brasil) · [Русский](./README.ru-RU.md) · [Türkçe](./README.tr-TR.md) · [简体中文](./README.zh-CN.md)

Esses arquivos traduzidos são traduções completas do README para cada localidade. Consulte a [política de tradução](./TRANSLATION_POLICY.md) para ver a matriz de locales e as regras terminológicas. O [README.md](../README.md) em inglês continua sendo a fonte principal para comandos novos, notas de versão e todos os detalhes.

---

## Novidades na 0.0.7

> Changelog completo: [CHANGELOG.md](../CHANGELOG.md)

- **Grafo de conhecimento temporal** -- entidades, triplas, consultas as_of, linhas do tempo, deteccao de contradicoes
- **Travessia multi-hop do grafo** -- percorra relacoes de 2-5 saltos via CTEs recursivas (exclusivo do LocalNest)
- **Hierarquia Nest/Branch** -- taxonomia de memoria de dois niveis propria do LocalNest para recuperacao organizada
- **Memoria por agente** -- isolamento por agente com entradas de diario privadas
- **Dedup semantico** -- gate de similaridade de embedding previne poluicao por memorias quase duplicadas
- **Ingestao de conversas** -- importe exports de chat Markdown/JSON com extracao de entidades
- **Sistema de hooks** -- callbacks pre/pos operacao para memoria, KG, travessia, ingestao
- **Arquitetura CLI-first** -- comandos `localnest <noun> <verb>` unificados para tudo
- **Completions de shell** -- tab completion para bash, zsh, fish
- **17 ferramentas MCP novas** (52 no total) -- KG, nests, travessia, diario, ingestao, dedup, hooks

---

## Por que LocalNest?

A maioria das ferramentas de IA para código envia dados para fora. LocalNest não.

Tudo - leitura de arquivos, embeddings vetoriais, memória - roda em processo na sua máquina. Sem assinatura de cloud, sem rate limit, sem dados saindo do seu ambiente. E como fala MCP, qualquer cliente compatível (Cursor, Windsurf, Codex, Kiro, Gemini CLI) pode se conectar com um único bloco de configuração.

| O que você ganha | Como funciona |
|---|---|
| **Acesso seguro a arquivos** | Leituras com escopo dentro dos roots configurados - nada fora deles |
| **Busca lexical instantânea** | Busca de símbolos e padrões com `ripgrep` (fallback em JS se faltar) |
| **Busca semântica** | Embeddings locais via `all-MiniLM-L6-v2` - sem necessidade de GPU |
| **Recuperação híbrida** | Busca lexical + semântica combinadas com ranking RRF para o melhor dos dois mundos |
| **Consciência de projeto** | Detecta projetos automaticamente por arquivos marcadores e aplica escopo a cada chamada |
| **Memoria do agente** | Grafo de conhecimento duravel e consultavel - sua IA lembra do que aprendeu |
| **Grafo de conhecimento temporal** | Triplas sujeito-predicado-objeto com validade temporal -- consulte o que era verdade em qualquer momento |
| **Travessia multi-hop do grafo** | Percorra relacoes de 2-5 saltos via CTEs recursivas -- nenhuma outra ferramenta local faz isso |
| **Hierarquia Nest/Branch** | Taxonomia de memoria de dois niveis com boost filtrado por metadados para recuperacao organizada |
| **Ingestao de conversas** | Importe exports de chat Markdown/JSON em memoria estruturada + triplas KG |
| **Isolamento de agentes** | Diario e scoping de memoria por agente -- multiplos agentes, zero contaminacao cruzada |
| **Sistema de hooks** | Hooks pre/pos operacao para memoria, KG, travessia, ingestao -- conecte sua propria logica |

---

## Início rápido

```bash
npm install -g localnest-mcp
localnest setup
localnest doctor
```

**3. Cole isto na configuração do seu cliente MCP**

`setup` grava automaticamente a configuração para as ferramentas detectadas. Você também encontra um bloco pronto para colar em `~/.localnest/config/mcp.localnest.json`:

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

> **Windows:** use a configuração escrita por `localnest setup`; ela define automaticamente o comando correto para sua plataforma.

Reinicie seu cliente MCP. Se ele estourar tempo de inicialização, defina `startup_timeout_sec: 30` na configuração do cliente.

**Requisitos:** Node.js `>=18` · `ripgrep` recomendado, mas opcional

O chunking com suporte a AST é entregue por padrão para `JavaScript`, `Python`, `Go`, `Bash`, `Lua` e `Dart`. Outras linguagens continuam sendo indexadas corretamente com fallback baseado em linhas.

O runtime estável atual usa `@huggingface/transformers` para embeddings e reranking locais. Os novos padrões do setup usam `huggingface`, e configurações antigas com `xenova` continuam aceitas como alias de compatibilidade.

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
localnest upgrade              # versão estável mais recente
localnest upgrade stable       # versão estável mais recente
localnest upgrade beta         # beta mais recente
localnest upgrade <version>    # fixar uma versão específica
localnest version              # verificar a versão atual
```

---

## Como os agentes usam isso

Quatro fluxos cobrem praticamente tudo:

### Busca rápida - encontrou, leu, terminou
Ideal para localizar com precisão um arquivo, símbolo ou padrão de código.

```
localnest_search_files   → encontrar o módulo por caminho/nome
localnest_search_code    → encontrar o símbolo ou identificador exato
localnest_read_file      → ler as linhas relevantes
```

### Tarefa profunda - depurar, refatorar, revisar com contexto
Ideal para trabalho complexo, quando memória e entendimento semântico importam.

```
localnest_task_context    → uma chamada: estado do runtime + memórias recuperadas
localnest_search_hybrid   → busca conceitual em toda a base de código
localnest_read_file       → ler as seções relevantes
localnest_capture_outcome → persistir o que foi aprendido para a próxima vez
```

### Grafo de conhecimento -- fatos estruturados sobre o projeto

```
localnest_kg_add_triple   → store a fact: "auth-service" uses "JWT"
localnest_kg_query        → what does "auth-service" relate to?
localnest_kg_as_of        → what was true about this on March 1st?
localnest_graph_traverse  → walk 2-3 hops to discover connections
```

### Memoria de conversas -- aprender de chats anteriores

```
localnest_ingest_markdown → import a conversation export
localnest_memory_recall   → what do I already know about this?
localnest_diary_write     → private scratchpad for this agent
```

---

## Referencia CLI

LocalNest e uma ferramenta CLI completa. Tudo e gerenciado pelo terminal:

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

**Flags globais** funcionam em todos os comandos: `--json` (saida maquina), `--verbose`, `--quiet`, `--config <path>`

---

## Tools

### Workspace & Discovery

| Tool | O que faz |
|------|-------------|
| `localnest_list_roots` | Lista os roots configurados |
| `localnest_list_projects` | Lista projetos dentro de um root |
| `localnest_project_tree` | Árvore de arquivos/pastas de um projeto |
| `localnest_summarize_project` | Resumo por linguagem e extensões |
| `localnest_read_file` | Lê uma janela limitada de linhas de um arquivo |

### Search & Index

| Tool | O que faz |
|------|-------------|
| `localnest_search_files` | Busca por nome de arquivo/caminho - comece aqui para descobrir módulos |
| `localnest_search_code` | Busca lexical - símbolos exatos, regex, identificadores |
| `localnest_search_hybrid` | Busca híbrida - lexical + semântica, ordenada com RRF |
| `localnest_get_symbol` | Encontra definições/exportações de um símbolo |
| `localnest_find_usages` | Encontra imports e pontos de uso de um símbolo |
| `localnest_index_project` | Constrói ou atualiza o índice semântico |
| `localnest_index_status` | Metadados do índice - existe, está desatualizado, backend |
| `localnest_embed_status` | Estado do backend de embeddings e prontidão da busca vetorial |

### Memory

| Tool | O que faz |
|------|-------------|
| `localnest_task_context` | Contexto de runtime + memória em uma chamada para uma tarefa |
| `localnest_memory_recall` | Recupera memórias relevantes para uma consulta |
| `localnest_capture_outcome` | Captura o resultado de uma tarefa na memória |
| `localnest_memory_capture_event` | Ingestão de eventos em segundo plano com autopromoção |
| `localnest_memory_store` | Armazena uma memória manualmente |
| `localnest_memory_update` | Atualiza uma memória e anexa uma revisão |
| `localnest_memory_delete` | Remove uma memória |
| `localnest_memory_get` | Busca uma memória com histórico de revisões |
| `localnest_memory_list` | Lista memórias armazenadas |
| `localnest_memory_events` | Inspeciona eventos recentes de memória |
| `localnest_memory_add_relation` | Vincula duas memórias com uma relação nomeada |
| `localnest_memory_remove_relation` | Remove uma relação |
| `localnest_memory_related` | Percorre o grafo de conhecimento a um salto |
| `localnest_memory_suggest_relations` | Sugere memórias relacionadas por similaridade |
| `localnest_memory_status` | Estado de consentimento, backend e banco de dados de memória |

### Knowledge Graph

| Tool | O que faz |
|------|-------------|
| `localnest_kg_add_entity` | Cria entidades (pessoas, projetos, conceitos, ferramentas) |
| `localnest_kg_add_triple` | Adiciona fatos sujeito-predicado-objeto com validade temporal |
| `localnest_kg_query` | Consulta relacoes de entidades com filtragem de direcao |
| `localnest_kg_invalidate` | Marca um fato como nao mais valido (arquivamento, nao exclusao) |
| `localnest_kg_as_of` | Consultas em ponto no tempo -- o que era verdade na data X? |
| `localnest_kg_timeline` | Evolucao cronologica de fatos para uma entidade |
| `localnest_kg_stats` | Contagem de entidades, contagem de triplas, detalhamento de predicados |

### Organizacao Nest/Branch

| Tool | O que faz |
|------|-------------|
| `localnest_nest_list` | Lista todos os nests (dominios de memoria de nivel superior) com contagens |
| `localnest_nest_branches` | Lista branches (topicos) dentro de um nest |
| `localnest_nest_tree` | Hierarquia completa: nests, branches e contagens |

### Travessia do Grafo

| Tool | O que faz |
|------|-------------|
| `localnest_graph_traverse` | Travessia multi-hop com rastreamento de caminho (CTEs recursivas) |
| `localnest_graph_bridges` | Encontra pontes cross-nest -- conexoes entre dominios |

### Diario do Agente

| Tool | O que faz |
|------|-------------|
| `localnest_diary_write` | Escreve uma entrada privada de bloco de notas (isolada por agente) |
| `localnest_diary_read` | Le suas entradas de diario recentes |

### Ingestao de Conversas

| Tool | O que faz |
|------|-------------|
| `localnest_ingest_markdown` | Importa exports de conversa Markdown para memoria + KG |
| `localnest_ingest_json` | Importa exports de conversa JSON para memoria + KG |
| `localnest_memory_check_duplicate` | Deteccao de duplicatas semanticas antes do arquivamento |

### Server & Updates

| Tool | O que faz |
|------|-------------|
| `localnest_server_status` | Configuração de runtime, roots, `ripgrep`, backend de índice |
| `localnest_health` | Resumo compacto de saúde com relatório do monitor em segundo plano |
| `localnest_usage_guide` | Orientações de boas práticas para agentes |
| `localnest_update_status` | Verifica no npm a versão mais recente (com cache) |
| `localnest_update_self` | Atualiza globalmente e sincroniza o skill incluído (requer aprovação) |

**50 tools no total.** Todos os tools suportam `response_format: "json"` (padrao) ou `"markdown"`. Os tools de listagem retornam `total_count`, `has_more` e `next_offset` para paginacao.

---

## Como o LocalNest se compara

LocalNest e o unico servidor MCP local-first que combina recuperacao de codigo E memoria estruturada em uma unica ferramenta. Veja seu posicionamento:

| Capacidade | LocalNest | MemPalace | Zep | Graphiti | Mem0 |
|---|---|---|---|---|---|
| **Local-first (sem nuvem)** | Sim | Sim | Nao ($25+/mes) | Nao (Neo4j) | Nao ($20-200/mes) |
| **Recuperacao de codigo** | 50 MCP tools, AST-aware, busca hibrida | Nenhuma | Nenhuma | Nenhuma | Nenhuma |
| **Grafo de conhecimento** | Triplas SQLite com validade temporal | Triplas SQLite | Neo4j | Neo4j | Key-value |
| **Travessia multi-hop** | Sim (CTEs recursivas, 2-5 saltos) | Nao (lookup plano apenas) | Nao | Sim (requer Neo4j) | Nao |
| **Consultas temporais (as_of)** | Sim | Sim | Sim | Sim | Nao |
| **Deteccao de contradicoes** | Sim (avisos na escrita) | Existe mas nao conectado | Nao | Nao | Nao |
| **Ingestao de conversas** | Markdown + JSON | Markdown + JSON + Slack | Nao | Nao | Nao |
| **Isolamento de agentes** | Scoping por agente + diario privado | Wing-per-agent | User/session scoping | Nao | User/agent/run/session |
| **Dedup semantico** | Gate cosine 0.92 em todas as escritas | Limiar 0.9 | Nao | Nao | Nao |
| **Hierarquia de memoria** | Nest/Branch (original) | Wing/Room/Hall (palace) | Plano | Plano | Plano |
| **Sistema de hooks** | Hooks pre/pos operacao | Nenhum | Webhooks | Nenhum | Nenhum |
| **Runtime** | Node.js (leve) | Python + ChromaDB | Python + Neo4j | Python + Neo4j | Python (nuvem) |
| **Dependencias** | 0 novas (SQLite puro) | ChromaDB (pesado) | Neo4j ($25+/mes) | Neo4j | Cloud API |
| **MCP tools** | 50 | 19 | 0 | 0 | 0 |
| **Custo** | Gratis | Gratis | $25+/mes | $25+/mes | $20-200/mes |

**Posicao unica do LocalNest:** A unica ferramenta que da a sua IA compreensao profunda de codigo E memoria persistente estruturada -- totalmente local, zero nuvem, zero custo.

---

## Memory - sua IA nao esquece

Ative memory durante `localnest setup` e o LocalNest começará a construir um grafo de conhecimento durável em um banco SQLite local. Cada correção de bug, decisão de arquitetura e preferência tocada pelo seu agente de IA poderá ser recuperada na próxima sessão.

- Requer **Node 22.13+** - as ferramentas de busca e arquivos funcionam bem no Node 18/20 sem isso
- Falha em memory nunca bloqueia os outros tools - tudo degrada de forma independente

**Como a autopromocao funciona:** eventos capturados via `localnest_memory_capture_event` recebem pontuacao de forca de sinal. Eventos de sinal forte - correcoes, decisoes, preferencias - sao promovidos a memorias duraveis. Eventos exploratorios fracos sao registrados e descartados silenciosamente apos 30 dias.

**Grafo de conhecimento:** Armazene fatos estruturados como triplas sujeito-predicado-objeto com validade temporal. Consulte o que era verdade em qualquer ponto no tempo com `as_of`. Percorra relacoes de 2-5 saltos com travessia CTE recursiva. Detecte contradicoes no momento da escrita.

**Hierarquia Nest/Branch:** Organize memorias em nests (dominios de nivel superior) e branches (topicos). A recuperacao filtrada por metadados reduz candidatos antes do scoring para resultados mais rapidos e precisos.

**Isolamento de agentes:** Cada agente tem seu proprio escopo de memoria e diario privado. A recuperacao retorna memorias proprias + globais, nunca os dados privados de outro agente.

**Dedup semantico:** Cada escrita passa por um gate de similaridade de embedding (limiar cosine padrao de 0.92). Quase-duplicatas sao detectadas antes do armazenamento -- sua memoria permanece limpa.

**Ingestao de conversas:** Importe exports de chat Markdown ou JSON. Cada turno se torna uma entrada de memoria com extracao automatica de entidades e criacao de triplas KG. A reingestao do mesmo arquivo e pulada por hash de conteudo.

**Hooks:** Registre callbacks pre/pos em qualquer operacao de memoria -- armazenamento, recuperacao, escritas KG, travessia, ingestao. Construa pipelines personalizados sem modificar o codigo principal.

---

## Backend de indexação

| Backend | Quando usar |
|---------|-------------|
| `sqlite-vec` | **Recomendado.** SQLite persistente, rápido e eficiente para repositórios grandes. Requer Node 22+. |
| `json` | Fallback de compatibilidade. Selecionado automaticamente se `sqlite-vec` estiver indisponível. |

Verifique `localnest_server_status` → `upgrade_recommended` para saber quando migrar.

---

## Configuração

`setup` grava tudo em `~/.localnest/`:

```
~/.localnest/
├── config/   → localnest.config.json, mcp.localnest.json
├── data/     → bancos SQLite de índice e memory
├── cache/    → pesos de modelos, status de atualização
├── backups/  → histórico de migrações de configuração
└── vendor/   → dependências nativas gerenciadas (sqlite-vec)
```

**Prioridade de configuração:** `PROJECT_ROOTS` env → `LOCALNEST_CONFIG` file → diretório atual

**Principais variáveis de ambiente:**

| Variable | Default | Descrição |
|----------|---------|-------------|
| `LOCALNEST_INDEX_BACKEND` | `sqlite-vec` | `sqlite-vec` ou `json` |
| `LOCALNEST_DB_PATH` | `~/.localnest/data/localnest.db` | Caminho do banco SQLite |
| `LOCALNEST_VECTOR_CHUNK_LINES` | `60` | Linhas por chunk do índice |
| `LOCALNEST_VECTOR_CHUNK_OVERLAP` | `15` | Sobreposição entre chunks |
| `LOCALNEST_VECTOR_MAX_FILES` | `20000` | Máximo de arquivos por execução de indexação |
| `LOCALNEST_EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Modelo de embeddings |
| `LOCALNEST_EMBED_CACHE_DIR` | `~/.localnest/cache` | Caminho do cache de modelos |
| `LOCALNEST_RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Modelo reranker cross-encoder |
| `LOCALNEST_MEMORY_ENABLED` | `false` | Habilita o subsistema de memory local |
| `LOCALNEST_MEMORY_DB_PATH` | `~/.localnest/data/localnest.memory.db` | Caminho do banco de memory |
| `LOCALNEST_MEMORY_AUTO_CAPTURE` | `false` | Autopromove eventos em segundo plano |
| `LOCALNEST_UPDATE_CHECK_INTERVAL_MINUTES` | `120` | Intervalo de verificação de atualização no npm |

<details>
<summary>Todas as variáveis de ambiente</summary>

| Variable | Default | Descrição |
|----------|---------|-------------|
| `LOCALNEST_INDEX_PATH` | `~/.localnest/data/localnest.index.json` | Caminho do índice JSON |
| `LOCALNEST_SQLITE_VEC_EXTENSION` | auto-detected | Caminho da extensão nativa `vec0` |
| `LOCALNEST_VECTOR_MAX_TERMS` | `80` | Máximo de termos por chunk |
| `LOCALNEST_EMBED_PROVIDER` | `huggingface` | Backend de embeddings |
| `LOCALNEST_EMBED_DIMS` | `384` | Dimensões do vetor de embeddings |
| `LOCALNEST_RERANKER_PROVIDER` | `huggingface` | Backend do reranker |
| `LOCALNEST_RERANKER_CACHE_DIR` | `~/.localnest/cache` | Caminho do cache do reranker |
| `LOCALNEST_MEMORY_BACKEND` | `auto` | `auto`, `node-sqlite` ou `sqlite3` |
| `LOCALNEST_MEMORY_CONSENT_DONE` | `false` | Suprime o prompt de consentimento |
| `LOCALNEST_UPDATE_PACKAGE` | `localnest-mcp` | Nome do pacote npm a verificar |
| `LOCALNEST_UPDATE_FAILURE_BACKOFF_MINUTES` | `15` | Repetição após falha na verificação do npm |

</details>

## Nota de instalação

`0.0.6-beta.1` mantém `0.0.5` como a linha estável atual enquanto antecipa a fase de depreciação da CLI: comandos canônicos `localnest task-context` / `localnest capture-outcome`, wrappers de compatibilidade depreciados para helpers antigos `localnest-mcp-*` e nenhuma mudança no binário `localnest-mcp` usado pelos clientes MCP. Alguns ambientes npm ainda podem mostrar um aviso de depreciação vindo da cadeia de dependências do ONNX runtime; a funcionalidade do LocalNest não é afetada.

**Dicas de performance:**
- Restrinja consultas com `project_path` + um `glob` estreito sempre que possível
- Comece com `max_results: 20–40` e amplie apenas quando necessário
- Deixe o reranking desligado por padrão - ative somente para uma passada final de precisão

---

## Distribuição de skills

LocalNest distribui skills de agentes de IA a partir de uma fonte canônica única e instala variantes específicas por ferramenta para clientes suportados. Os destinos atuais em nível de usuário incluem diretórios genéricos de agents e também Codex, Copilot, Claude Code, Cursor, Windsurf, OpenCode, Gemini, Antigravity, Cline e Continue.

```bash
localnest install skills             # instalar ou atualizar skills incluídos
localnest install skills --force     # forçar reinstalação
localnest-mcp-install-skill          # alias de compatibilidade depreciado
```

**Ferramentas CLI de shell** para automação e hooks:

```bash
localnest task-context --task "debug auth" --project-path /path/to/project
localnest capture-outcome --task "fix auth" --summary "..." --files-changed 2
```

Os aliases legados `localnest-mcp-task-context` e `localnest-mcp-capture-outcome` continuam funcionando por compatibilidade. Ambos os comandos aceitam JSON via stdin. Instalação a partir do GitHub:

```bash
npx skills add https://github.com/wmt-mobile/localnest --skill localnest-mcp
```

---

## Auto-Migration

Atualize sem cerimônia. Na inicialização, o LocalNest migra automaticamente esquemas antigos de configuração e o layout plano de `~/.localnest` para a nova estrutura `config/`, `data/`, `cache/` e `backups/`. Sem reruns manuais, sem configurações quebradas depois de atualizar.

---

## Segurança

LocalNest segue o padrão OSS de pipeline de segurança:

- **Gate de qualidade na CI** — [quality.yml](../.github/workflows/quality.yml)
- **Análise estática com CodeQL** — [codeql.yml](../.github/workflows/codeql.yml)
- **OpenSSF Scorecard** — [scorecards.yml](../.github/workflows/scorecards.yml)
- **Dependabot** — [.github/dependabot.yml](../.github/dependabot.yml)
- **Scorecard pública** — https://scorecard.dev/viewer/?uri=github.com/wmt-mobile/localnest

---

## Contribuindo

Veja [CONTRIBUTING.md](../CONTRIBUTING.md) · [CHANGELOG.md](../CHANGELOG.md) · [SECURITY.md](../SECURITY.md)

> **Novo na base de código?** Comece pela **[visão geral da arquitetura](../guides/architecture.md)** - ela mostra como o servidor sobe, como busca e memory funcionam e onde tudo fica.

---

## Contribuidores

[![Contributors](https://contrib.rocks/image?repo=wmt-mobile/localnest)](https://github.com/wmt-mobile/localnest/graphs/contributors)

Obrigado a todas as pessoas que contribuem com código, documentação, revisões, testes e relatos de issues.

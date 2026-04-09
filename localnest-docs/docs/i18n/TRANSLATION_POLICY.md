# README Translation Policy

This file defines the locale matrix and translation rules for README work in this repository.

## Source Of Truth

- The root [README.md](../README.md) is the canonical source.
- Locale README files under this directory are full localized derivatives of the root README.
- If command examples, release notes, tool names, or config snippets change in English, localized files must be reviewed.

## Current Locale Matrix

| File | Target locale | Notes |
|---|---|---|
| `README.ar-001.md` | Arabic, World / Modern Standard Arabic | Use formal technical MSA |
| `README.bn-BD.md` | Bengali, Bangladesh | Prefer Bangladeshi technical usage |
| `README.de-DE.md` | German, Germany | Use standard German technical terminology |
| `README.es-419.md` | Spanish, Latin America | Avoid Spain-only phrasing |
| `README.fr-FR.md` | French, France | Use standard French technical tone |
| `README.hi-IN.md` | Hindi, India | Keep technical product names unchanged |
| `README.id-ID.md` | Indonesian, Indonesia | Use standard Bahasa Indonesia |
| `README.ja-JP.md` | Japanese, Japan | Keep concise technical style |
| `README.ko-KR.md` | Korean, South Korea | Use standard developer terminology |
| `README.pt-BR.md` | Portuguese, Brazil | Avoid European Portuguese forms |
| `README.ru-RU.md` | Russian, Russia | Use neutral technical Russian |
| `README.tr-TR.md` | Turkish, Turkey | Use standard Turkish technical tone |
| `README.zh-CN.md` | Chinese, Mainland China | Simplified Chinese only |

## Translation Rules

- Keep code blocks, shell commands, JSON, environment variables, file paths, and tool IDs unchanged.
- Keep product and protocol names unchanged where that is the common technical norm:
  - `LocalNest`
  - `MCP`
  - `Cursor`
  - `Windsurf`
  - `Codex`
  - `Kiro`
  - `Gemini CLI`
- Translate prose naturally for the target locale instead of forcing literal word order.
- Preserve Markdown structure and section order unless there is a strong locale-specific reason not to.
- Prefer the target locale's common technical vocabulary over generic pan-language wording.
- If a language has multiple major standards, do not publish a generic file when a locale-specific file is feasible.

## README Scope

- Locale files in this directory are full README translations.
- Mirror the English README section order, tables, code blocks, JSON, commands, and link structure as closely as possible.
- Translate prose and table descriptions, but do not translate shell commands, env vars, file paths, JSON keys, tool IDs, or product names that should remain canonical.
- If a locale needs region-specific phrasing changes, keep the meaning aligned with the English source.

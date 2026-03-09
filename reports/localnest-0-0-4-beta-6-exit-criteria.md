# LocalNest 0.0.4-beta.6 Exit Criteria

Date: 2026-03-09T09:08:34.196Z

## Summary

- PASS: 3
- FAIL: 3
- Overall gate: BLOCKED

## Criteria

| Criterion | Status | Details |
|---|---|---|
| All MCP tools return stable, documented response shapes. | PASS | Shared response normalizers exist and MCP tool regression coverage asserts canonical response fields. |
| Installed-runtime release sweep passes with no empty evidence for known-good retrieval checks. | FAIL | Missing JSON report: /mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest/reports/localnest-0-0-4-beta-6-release-test-report.json |
| Default cache path behavior is understood and either fixed or clearly documented. | PASS | README and install docs explain fallback behavior and the supported remediation path. |
| `update_self` has dedicated test coverage or an approved explicit exclusion policy. | PASS | Dedicated update-service tests cover dry-run validation and real failure paths. |
| Supported client auto-install paths are verified on real configs. | FAIL | 2/6 supported real configs currently include LocalNest |
| Release report generation is repeatable and trustworthy enough to gate a publish decision. | FAIL | Release JSON report missing or malformed at /mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest/reports/localnest-0-0-4-beta-6-release-test-report.json |

## Supported Client Verification

- Present supported configs: 6
- Configured with LocalNest: 2

- Codex: configured (/home/jenil-d-gohel/.codex/config.toml)
- Cursor: missing LocalNest entry (/home/jenil-d-gohel/.cursor/mcp.json)
- Windsurf: missing LocalNest entry (/home/jenil-d-gohel/.windsurf/mcp.json)
- Windsurf (Codeium): missing LocalNest entry (/home/jenil-d-gohel/.codeium/windsurf/mcp_config.json)
- Gemini CLI: configured (/home/jenil-d-gohel/.gemini/antigravity/mcp_config.json)
- Kiro: missing LocalNest entry (/home/jenil-d-gohel/.kiro/settings/mcp.json)

## Report Input

- JSON report path: /mnt/da2ae3dd-9788-4b37-88e8-effd7025eb4c/Base Projects/localnest/reports/localnest-0-0-4-beta-6-release-test-report.json
- JSON report found: false


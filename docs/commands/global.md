# Global Flags & Running Commands

## Global Flags

Available on every command:

| Flag | Description |
|---|---|
| `--profile <name>` | Use a specific config profile from `config.json` |
| `--format table\|json\|csv` | Output format (default: `table`) |
| `--dry-run` | Print what would happen without executing |
| `--yes` | Skip confirmation prompts (for automation) |

## Running Commands

```bash
# CLI — dev mode (preferred — no pnpm noise)
./pm <command> [options]

# CLI — after building
node dist/index.js <command> [options]

# Web server — dev mode
pnpm web
# Web server listens on http://localhost:3000 by default
# Override port: SERVER_PORT=8080 pnpm web
```

## Audit Log

Every command — listing, dry-run, failure, cancellation — is written as a JSON line.

```bash
cat ~/.proxmox-manager/audit.log | tail -5
```

```json
{"timestamp":"2026-06-07T13:00:00.000Z","profile":"homelab","command":"vm list","resource":{"type":"vm"},"dryRun":false,"result":"success","error":null,"source":"cli"}
```

The `source` field is `"cli"` for terminal commands and `"web"` for requests via the API server.

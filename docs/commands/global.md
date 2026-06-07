# Global Flags & Running Commands

## Global Flags

These flags are available on every command and can be placed anywhere in the command line.

| Flag | Description |
|---|---|
| `--profile <name>` | Use a named profile from `config.json` instead of the default |
| `--format table\|json\|csv` | Output format for listing commands (default: `table`) |
| `--dry-run` | Print what the command would do without making any API calls |
| `--yes` | Skip interactive confirmation prompts — useful for scripting and automation |

## Running Commands

```bash
# Dev mode — no build required, preferred during development
./pm <command> [options]

# After building (pnpm build)
node dist/index.js <command> [options]
```

## Starting the Web Server

```bash
pnpm web:dev     # API server (port 3000) + Vite dev server (port 5173) — for development
pnpm web:server  # API server only
pnpm web:ui      # Vite dev server only
pnpm build:web   # Production build → web/dist/
```

The API server port defaults to `3000`. Override with `SERVER_PORT=8080 pnpm web`.

## Audit Log

Every command — including listings, dry-runs, failures, and cancellations — is written as a single JSON line to the audit log path set in `config.json`.

```bash
cat ~/.proxmox-manager/audit.log | tail -5
```

```json
{"timestamp":"2026-06-07T13:00:00.000Z","profile":"homelab","command":"vm list","resource":{"type":"vm"},"dryRun":false,"result":"success","error":null,"source":"cli"}
```

The `source` field is `"cli"` for terminal commands and `"web"` for requests made via the API server.

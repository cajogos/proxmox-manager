# Configuration

proxmox-manager reads `config.json` from the current working directory. This file is never written back by the tool — all changes are manual.

## Full schema

```json
{
  "defaultProfile": "homelab",
  "serverPort": 3000,
  "auditLog": {
    "path": "~/.proxmox-manager/audit.log"
  },
  "profiles": {
    "homelab": {
      "host": "192.168.1.100",
      "port": 8006,
      "API_TOKEN_ID": "root@pam!proxmox-manager",
      "API_TOKEN_SECRET": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "rejectUnauthorized": false,
      "safeguards": {
        "protectedVMs": [100, 101],
        "protectedNodes": ["pve-prod"],
        "protectedContainers": [200]
      }
    },
    "prod": {
      "host": "prod.example.com",
      "port": 8006,
      "API_TOKEN_ID": "admin@pam!ci-token",
      "API_TOKEN_SECRET": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "rejectUnauthorized": true
    }
  }
}
```

## Field reference

### Top-level fields

| Field | Type | Default | Description |
|---|---|---|---|
| `defaultProfile` | string | — | Profile used when `--profile` is not specified |
| `serverPort` | number | `3000` | Port the web API server listens on |
| `auditLog.path` | string | `~/.proxmox-manager/audit.log` | Path for the JSON-lines audit log |

### Profile fields

| Field | Type | Required | Description |
|---|---|---|---|
| `host` | string | yes | Proxmox hostname or IP |
| `port` | number | yes | Proxmox API port (usually `8006`) |
| `API_TOKEN_ID` | string | yes | Token ID in `user@realm!token-name` format |
| `API_TOKEN_SECRET` | string | yes | Token secret from Proxmox |
| `rejectUnauthorized` | boolean | no | Set `false` for self-signed certificates (default: `true`) |
| `safeguards` | object | no | Protected resource IDs |

### Safeguards

Protected resources are blocked from all destructive operations (stop, shutdown, delete, etc.) regardless of `--yes` or dry-run flags.

```json
"safeguards": {
  "protectedVMs": [100, 101],
  "protectedNodes": ["pve-prod"],
  "protectedContainers": [200, 201]
}
```

## Multiple profiles

Use `--profile` to target a specific profile:

```bash
./pm vm list --profile prod
./pm node list --profile homelab
```

The web UI uses the `?profile=` query param or `X-Profile` request header.

## Legacy format

The tool auto-detects the legacy flat config format (where profiles were top-level keys) and upgrades it at runtime. The config file itself is never rewritten.

## Audit log

Every CLI and web API action appends a JSON line to the audit log:

```json
{"timestamp":"2025-01-15T10:30:00.000Z","profile":"homelab","command":"vm start","resource":{"type":"vm","id":"100"},"dryRun":false,"result":"success","error":null,"source":"cli"}
```

The `source` field is `"cli"` for CLI commands and `"web"` for API/web UI actions.

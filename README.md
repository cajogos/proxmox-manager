# proxmox-manager

A safe, audited CLI for managing Proxmox VE from your terminal. Built with TypeScript, designed to grow into a Web UI.

> **Target:** Proxmox VE 8.x — `pve-api-daemon/3.0`

---

## Features

- **API Token authentication** — no passwords stored, granular Proxmox permissions
- **Multi-profile support** — manage multiple Proxmox instances from one tool
- **Safe by default** — every destructive action requires confirmation
- **Audit log** — every action (manual or automatic) written as a structured JSON line
- **Dry-run mode** — see exactly what would happen before it does
- **Protected resources** — config-driven list of VMs/nodes/containers that cannot be touched
- **Flexible output** — `--format table|json|csv` on every listing command

---

## Requirements

- Node.js `v24.16.0` (via `.nvmrc`)
- pnpm `>= 9`
- A Proxmox VE 8.x server with an API token

---

## Setup

### 1. Install Node.js via nvm

```bash
nvm install
nvm use
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure

```bash
cp config.example.json config.json
```

Edit `config.json` with your Proxmox connection details:

```json
{
  "defaultProfile": "homelab",
  "auditLog": {
    "path": "~/.proxmox-manager/audit.log"
  },
  "profiles": {
    "homelab": {
      "host": "192.168.1.180",
      "port": 8006,
      "API_TOKEN_ID": "user@pam!token-name",
      "API_TOKEN_SECRET": "your-token-secret",
      "rejectUnauthorized": false,
      "safeguards": {
        "protectedVMs": [],
        "protectedNodes": [],
        "protectedContainers": []
      }
    }
  }
}
```

> **Tip:** Create your API token in Proxmox at `Datacenter → Permissions → API Tokens`.

### 4. Build

```bash
pnpm build
```

---

## Usage

```bash
# Dev mode (no build required)
./node_modules/.bin/tsx src/index.ts <command> [options]

# After building (recommended)
node dist/index.js <command> [options]
```

### Global flags

| Flag | Description |
|---|---|
| `--profile <name>` | Use a specific config profile |
| `--format table\|json\|csv` | Output format (default: `table`) |
| `--dry-run` | Show what would happen without executing |
| `--yes` | Skip confirmation prompts |

---

## Phase 1: VM Listing

### List all VMs

```bash
pnpm start -- vm list
```

Example output:

```
┌────────┬──────────────────┬─────────┬──────┬──────┬─────────────┬──────────┐
│ VMID   │ Name             │ Status  │ Node │ CPUs │ Memory (MB) │ Template │
├────────┼──────────────────┼─────────┼──────┼──────┼─────────────┼──────────┤
│ 100    │ ubuntu-server    │ running │ pve  │ 2    │ 2048        │ No       │
│ 101    │ docker-host      │ running │ pve  │ 4    │ 8192        │ No       │
│ 200    │ windows-template │ stopped │ pve  │ 2    │ 4096        │ Yes      │
└────────┴──────────────────┴─────────┴──────┴──────┴─────────────┴──────────┘
```

### Output as JSON

```bash
pnpm start -- vm list --format json
```

### Output as CSV

```bash
pnpm start -- vm list --format csv
```

### Use a specific profile

```bash
pnpm start -- --profile homelab vm list
```

### Check the audit log

Every command is recorded:

```bash
cat ~/.proxmox-manager/audit.log | tail -5
```

Each line is a JSON object:

```json
{"timestamp":"2026-06-07T13:00:00.000Z","profile":"homelab","command":"vm list","resource":{"type":"vm"},"dryRun":false,"result":"success","error":null}
```

---

## Development Phases

| Phase | Status | Description |
|---|---|---|
| [Phase 1](docs/plan/phase_1.md) | ✅ Complete | Core infrastructure + VM listing |
| [Phase 2](docs/plan/phase_2.md) | 🔲 Pending | Full VM lifecycle management |
| [Phase 3](docs/plan/phase_3.md) | 🔲 Pending | LXC container management |
| [Phase 4](docs/plan/phase_4.md) | 🔲 Pending | Node management |
| [Phase 5](docs/plan/phase_5.md) | 🔲 Pending | Storage management |
| [Phase 6](docs/plan/phase_6.md) | 🔲 Pending | Full API coverage |

---

## Audit Log

Every action — including read-only listings, dry-runs, cancellations, and failures — is written to the audit log as a JSON line.

**Default location:** `~/.proxmox-manager/audit.log`

**Configurable** via `auditLog.path` in `config.json`.

**Log entry shape:**

```json
{
  "timestamp": "2026-06-07T13:00:00.000Z",
  "profile": "homelab",
  "command": "vm stop",
  "resource": { "type": "vm", "id": 100, "name": "ubuntu-server" },
  "dryRun": false,
  "result": "success | failed | cancelled | dry-run",
  "error": null
}
```

---

## Safeguards

### Protected resources

Mark VMs, nodes, or containers as untouchable in `config.json`:

```json
"safeguards": {
  "protectedVMs": [100, 101],
  "protectedNodes": ["pve-prod"],
  "protectedContainers": [200]
}
```

Any destructive command targeting a protected resource is rejected immediately.

### Dry-run mode

```bash
pnpm start -- --dry-run vm stop 100
# [DRY RUN] Would execute: stop on vm/100
```

### Confirmation prompts

```bash
pnpm start -- vm stop 100
# ! Stop vm/100 (ubuntu-server). Are you sure? [y/N]
```

Skip with `--yes` for automation:

```bash
pnpm start -- --yes vm stop 100
```

---

## License

MIT — Carlos Ferreira

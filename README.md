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
- **Polished CLI** — spinner during API calls, colored status, human-readable memory (GB), compact tables, summary line
- **Full VM lifecycle** — start, stop, shutdown, reboot, suspend, resume, snapshots, config, delete (with double-confirm)
- **Full LXC lifecycle** — same command set as VMs, plus `lxc exec` for running commands inside containers

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
# Dev mode (no build required) — preferred, no pnpm noise
./pm <command> [options]

# After building
node dist/index.js <command> [options]
```

See [docs/COMMANDS.md](docs/COMMANDS.md) for the full command reference.

---

## Development Phases

| Phase | Status | Description |
|---|---|---|
| [Phase 1](docs/plan/phase_1.md) | ✅ Complete | Core infrastructure + VM listing |
| [Phase 2](docs/plan/phase_2.md) | ✅ Complete | CLI aesthetics (colors, spinners, compact tables, human-readable values) |
| [Phase 3](docs/plan/phase_3.md) | ✅ Complete | Full VM lifecycle management |
| [Phase 4](docs/plan/phase_4.md) | ✅ Complete | LXC container management |
| [Phase 5](docs/plan/phase_5.md) | 🔲 Pending | Node management |
| [Phase 6](docs/plan/phase_6.md) | 🔲 Pending | Storage management |
| [Phase 7](docs/plan/phase_7.md) | 🔲 Pending | Full API coverage |
| [Phase 8](docs/plan/phase_8.md) | 🔲 Pending | Web UI (React + Vite + API server) |

---

## License

MIT — Carlos Ferreira

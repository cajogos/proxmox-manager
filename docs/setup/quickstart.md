# Quick Start

Get proxmox-manager running against your Proxmox VE instance in under 5 minutes.

## Prerequisites

- Node.js v24+ (install via `nvm install` from the project root)
- pnpm v9+
- A Proxmox VE 8.x server with an API token — see [Proxmox API Tokens](proxmox-api-tokens.md)

## 1. Install dependencies

```bash
pnpm install
```

## 2. Create your config

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
      "host": "192.168.1.100",
      "port": 8006,
      "API_TOKEN_ID": "root@pam!proxmox-manager",
      "API_TOKEN_SECRET": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "rejectUnauthorized": false
    }
  }
}
```

Set `rejectUnauthorized: false` if your Proxmox uses a self-signed certificate (most home setups do).

## 3. Verify the connection

```bash
./pm doctor
```

`doctor` checks connectivity, authentication, and required permissions. Fix any errors it reports before continuing.

## 4. Try your first commands

```bash
./pm vm list          # List all VMs
./pm lxc list         # List all containers
./pm node list        # List cluster nodes
```

## 5. Start the Web UI (optional)

```bash
pnpm web:dev
```

Open `http://localhost:5173` in your browser. The web UI provides the same functionality as the CLI in a graphical interface.

## Next steps

- Read [Configuration](configuration.md) to understand all config options
- Read [Web UI](web-ui.md) for production deployment
- Read [Troubleshooting](troubleshooting.md) if something isn't working

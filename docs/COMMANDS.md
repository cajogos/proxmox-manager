# Commands Reference

Full documentation is split into per-command files in [`docs/commands/`](commands/).

## Quick Reference

| Command group | Reference |
|---|---|
| Global flags & running commands | [global.md](commands/global.md) |
| `vm` — Virtual machines | [vm.md](commands/vm.md) |
| `lxc` — LXC containers | [lxc.md](commands/lxc.md) |
| `node` — Proxmox nodes | [node.md](commands/node.md) |
| `storage` — Storage pools & content | [storage.md](commands/storage.md) |
| `cluster` — Cluster status, resources, HA | [cluster.md](commands/cluster.md) |
| `network` — Network interfaces | [network.md](commands/network.md) |
| `access` — Users, groups, roles, API tokens | [access.md](commands/access.md) |
| `backup` — Scheduled backup jobs | [backup.md](commands/backup.md) |
| `firewall` — Firewall rules | [firewall.md](commands/firewall.md) |
| `sdn` — Software-Defined Networking | [sdn.md](commands/sdn.md) |
| `config check` — Validate config & connectivity | [config.md](commands/config.md) |
| `doctor` — Full connectivity + health check | [doctor.md](commands/doctor.md) |

## Global Flags

| Flag | Description |
|---|---|
| `--profile <name>` | Use a specific config profile from `config.json` |
| `--format table\|json\|csv` | Output format (default: `table`) |
| `--dry-run` | Print what would happen without executing |
| `--yes` | Skip confirmation prompts (for automation) |

## Running Commands

```bash
./pm <command> [options]       # dev mode (preferred)
node dist/index.js <command>   # compiled
```

## Web UI

```bash
pnpm web:dev    # API server (port 3000) + Vite dev server (port 5173)
pnpm web:server # API server only
pnpm web:ui     # Vite only
pnpm build:web  # Production build → web/dist/
```

Open `http://localhost:5173`. The sidebar links to all resource pages. The **Docs** page renders this command reference in the browser.

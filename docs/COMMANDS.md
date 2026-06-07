# Commands Reference

## Global Flags

Available on every command:

| Flag | Description |
|---|---|
| `--profile <name>` | Use a specific config profile from `config.json` |
| `--format table\|json\|csv` | Output format (default: `table`) |
| `--dry-run` | Print what would happen without executing |
| `--yes` | Skip confirmation prompts (for automation) |

---

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

---

## Phase 1 + 2 — VM Listing

### `vm list`

List all VMs across all nodes. Shows a spinner while fetching, then a compact table with colored status, human-readable memory, and a summary line.

```bash
./pm vm list
```

```
┌──────┬──────────────────┬─────────┬──────┬──────┬────────┬──────────┬──────┐
│ VMID │ Name             │ Status  │ Node │ CPUs │ Memory │ Template │ Tags │
├──────┼──────────────────┼─────────┼──────┼──────┼────────┼──────────┼──────┤
│  100 │ ubuntu-server    │ running │ pve  │    2 │ 2.0 GB │ -        │ -    │
│  101 │ docker-host      │ running │ pve  │    4 │ 8.0 GB │ -        │ -    │
│  200 │ windows-template │ stopped │ pve  │    2 │ 4.0 GB │ template │ -    │
└──────┴──────────────────┴─────────┴──────┴──────┴────────┴──────────┴──────┘
3 VMs — 2 running · 1 stopped
```

Status is color-coded: `running` → green, `stopped` → red, `suspended` → yellow.
VMID, CPUs, and Memory columns are right-aligned. Template VMs show `template` (dimmed) instead of `Yes`.

**JSON output:**

```bash
./pm vm list --format json
```

**CSV output:**

```bash
./pm vm list --format csv
```

**Specific profile:**

```bash
./pm --profile homelab vm list
```

---

## Phase 3 — VM Lifecycle

All commands auto-discover the VM's node. Pass `--node <name>` to skip discovery.
Destructive commands require confirmation unless `--yes` is passed.

### `vm status <vmid>`

```bash
./pm vm status 100
```

### `vm start <vmid>` / `vm stop <vmid>` / `vm shutdown <vmid>` / `vm reboot <vmid>`

```bash
./pm vm start 100
./pm vm stop 100
./pm vm shutdown 100          # graceful ACPI shutdown
./pm vm reboot 100
./pm vm stop 100 --yes        # skip confirm
./pm vm stop 100 --dry-run    # print intent, no API call
```

### `vm suspend <vmid>` / `vm resume <vmid>`

```bash
./pm vm suspend 100
./pm vm resume 100
```

### `vm config <vmid>`

```bash
./pm vm config 100
./pm vm config 100 --format json
```

### `vm delete <vmid>`

Requires two confirmations: a yes/no prompt followed by typing the VM name.

```bash
./pm vm delete 100
```

### `vm snapshot list <vmid>`

```bash
./pm vm snapshot list 100
```

### `vm snapshot create <vmid> <name>`

```bash
./pm vm snapshot create 100 before-update
./pm vm snapshot create 100 pre-upgrade --description "Before kernel upgrade"
```

### `vm snapshot delete <vmid> <name>`

```bash
./pm vm snapshot delete 100 before-update
```

### `vm snapshot rollback <vmid> <name>`

High-risk: shows a warning and requires confirmation. Current VM state is permanently overwritten.

```bash
./pm vm snapshot rollback 100 before-update
```

---

## Phase 4 — LXC Container Management

Same command structure as VMs. Container IDs use the `<ctid>` argument.

### `lxc list`

```bash
./pm lxc list
./pm lxc list --format json
```

### `lxc status <ctid>` / `lxc config <ctid>`

```bash
./pm lxc status 200
./pm lxc config 200
```

### Lifecycle actions

```bash
./pm lxc start 200
./pm lxc stop 200
./pm lxc shutdown 200
./pm lxc reboot 200
./pm lxc suspend 200
./pm lxc resume 200
```

### `lxc delete <ctid>`

Same double-confirmation as `vm delete`.

```bash
./pm lxc delete 200
```

### `lxc exec <ctid> [command...]`

Executes a command inside the container via `ssh root@<host> pct exec`. Requires SSH key-based root access to the Proxmox node.

```bash
./pm lxc exec 200 -- hostname
./pm lxc exec 200 -- apt-get update
```

### `lxc snapshot` subcommands

Same as VM snapshots — `list`, `create`, `delete`, `rollback`.

```bash
./pm lxc snapshot list 200
./pm lxc snapshot create 200 before-update
./pm lxc snapshot rollback 200 before-update
```

---

## Audit Log

Every command — listing, dry-run, failure, cancellation — is written as a JSON line.

```bash
cat ~/.proxmox-manager/audit.log | tail -5
```

```json
{"timestamp":"2026-06-07T13:00:00.000Z","profile":"homelab","command":"vm list","resource":{"type":"vm"},"dryRun":false,"result":"success","error":null,"source":"cli"}
```

The `source` field is `"cli"` for terminal commands and `"web"` for requests via the API server.

---

## Web Server Endpoints

The web server (`pnpm web`) exposes the same operations as REST endpoints.

### `GET /health`

```bash
curl http://localhost:3000/health
# { "ok": true, "version": "0.1.0" }
```

### `GET /api/vms`

```bash
curl http://localhost:3000/api/vms
curl "http://localhost:3000/api/vms?profile=homelab"
```

```json
{ "ok": true, "data": [] }
```

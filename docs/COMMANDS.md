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

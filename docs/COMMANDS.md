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
# Dev mode (no build required)
./node_modules/.bin/tsx src/index.ts <command> [options]

# After building
node dist/index.js <command> [options]
```

---

## Phase 1 — VM Listing

### `vm list`

List all VMs across all nodes.

```bash
node dist/index.js vm list
```

```
┌──────┬──────────────────┬─────────┬──────┬──────┬─────────────┬──────────┬──────┐
│ VMID │ Name             │ Status  │ Node │ CPUs │ Memory (MB) │ Template │ Tags │
├──────┼──────────────────┼─────────┼──────┼──────┼─────────────┼──────────┼──────┤
│ 100  │ ubuntu-server    │ running │ pve  │ 2    │ 2048        │ No       │ -    │
│ 101  │ docker-host      │ running │ pve  │ 4    │ 8192        │ No       │ -    │
│ 200  │ windows-template │ stopped │ pve  │ 2    │ 4096        │ Yes      │ -    │
└──────┴──────────────────┴─────────┴──────┴──────┴─────────────┴──────────┴──────┘
```

**JSON output:**

```bash
node dist/index.js vm list --format json
```

**CSV output:**

```bash
node dist/index.js vm list --format csv
```

**Specific profile:**

```bash
node dist/index.js --profile homelab vm list
```

---

## Audit Log

Every command — listing, dry-run, failure, cancellation — is written as a JSON line.

```bash
cat ~/.proxmox-manager/audit.log | tail -5
```

```json
{"timestamp":"2026-06-07T13:00:00.000Z","profile":"homelab","command":"vm list","resource":{"type":"vm"},"dryRun":false,"result":"success","error":null}
```

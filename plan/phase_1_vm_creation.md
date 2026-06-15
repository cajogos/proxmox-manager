# Phase 1: VM Creation (CLI + API + Web UI)

**Priority: HIGH** — First phase to implement.

## Goal

Add the ability to create new QEMU VMs via `pm vm create`, the REST API, and the React web UI.

---

## Requirements

### CLI
- Command: `pm vm create`
- Options:
  - `--name <name>` — VM display name (required)
  - `--node <node>` — target node (required; no auto-discovery for creation)
  - `--vmid <id>` — explicit VMID; if omitted, fetch next available via `GET /cluster/nextid`
  - `--memory <mb>` — RAM in MB (default: 512)
  - `--cores <n>` — CPU cores (default: 1)
  - `--sockets <n>` — CPU sockets (default: 1)
  - `--cpu <type>` — CPU type, e.g. `kvm64`, `host` (default: `kvm64`)
  - `--ostype <type>` — OS type, e.g. `l26`, `win11` (default: `l26`)
  - `--disk <storage:size>` — primary disk, e.g. `local-lvm:32` (omit to create diskless)
  - `--iso <storage:path>` — ISO image for CDROM, e.g. `local:iso/debian-12.iso`
  - `--net <model,bridge>` — network adapter, e.g. `virtio,bridge=vmbr0`
  - `--start` — start the VM immediately after creation
  - `--profile <name>`, `--dryRun`, `--yes` — standard flags
- Output: success message with VMID and node; table row if `--format json/csv`
- Safeguards: dry-run support; no confirmation needed (creation is not destructive)
- Audit: log action with `source: 'cli'`

### API Endpoint
- `POST /api/vms` with JSON body matching CLI options
- Returns `{ ok: true, data: { vmid: number, node: string, upid?: string } }`
- Proxmox API target: `POST /nodes/{node}/qemu`

### Web UI
- "Create VM" button on the VMs page (top-right, next to refresh)
- Modal/dialog form with fields: Name, Node (dropdown from loaded nodes), Memory, Cores, Disk (storage:size), ISO (optional), Network
- VMID: auto-fetched from `GET /cluster/nextid` and shown read-only (editable)
- On submit: POST to `/api/vms`, close modal, reload VM list
- Show spinner during submission; display error inline if it fails

---

## Implementation Checklist

### Backend
- [ ] `GET /cluster/nextid` endpoint in `src/api/endpoints/cluster.ts` (or a new `nextid.ts`)
- [ ] `createVM(node, params)` in `src/api/endpoints/vm.ts`
- [ ] `createVMService(config, params, profileName?)` in `src/services/vm.ts` returning `CommandResult<{vmid, node, upid?}>`
- [ ] `POST /api/vms` route in `src/server/routes/vms.ts`
- [ ] `createVM` function in `web/src/api/client.ts`

### CLI
- [ ] `src/cli/commands/vm/create.ts`
- [ ] Register in `src/cli/commands/vm/index.ts`

### Web UI
- [ ] `web/src/components/CreateVMDialog.tsx` — modal form
- [ ] Update `web/src/pages/VMs.tsx` — add "Create VM" button + wire dialog

### Docs
- [ ] Update `docs/COMMANDS.md` — add `vm create` section
- [ ] Update `README.md` — mention VM creation
- [ ] Update `CLAUDE.md` architecture table

---

## Key Files

| File | Change |
|---|---|
| `src/api/endpoints/vm.ts` | Add `createVM()`, `getNextVMID()` |
| `src/api/endpoints/cluster.ts` | Add `getNextID()` (Proxmox `/cluster/nextid`) |
| `src/services/vm.ts` | Add `createVMService()` |
| `src/server/routes/vms.ts` | Add `POST /` handler |
| `src/cli/commands/vm/create.ts` | New file |
| `src/cli/commands/vm/index.ts` | Register `create` subcommand |
| `web/src/api/client.ts` | Add `createVM()` |
| `web/src/pages/VMs.tsx` | Add button + dialog integration |
| `web/src/components/CreateVMDialog.tsx` | New file |

---

## Proxmox API Reference

```
POST /nodes/{node}/qemu
  vmid     integer  (required if not using nextid)
  name     string
  memory   integer  (MB)
  cores    integer
  sockets  integer
  cpu      string   (e.g. kvm64, host)
  ostype   string   (l26, win11, …)
  scsi0    string   (e.g. local-lvm:32)
  ide2     string   (e.g. local:iso/debian-12.iso,media=cdrom)
  net0     string   (e.g. virtio,bridge=vmbr0)
  start    boolean

GET /cluster/nextid
  Returns: { data: number }  (next available VMID)
```

---

## Verification

```bash
# CLI dry-run
./pm vm create --name test-vm --node pve1 --memory 1024 --cores 2 --disk local-lvm:20 --dryRun

# CLI real create
./pm vm create --name test-vm --node pve1 --memory 1024 --cores 2 --disk local-lvm:20 --yes

# API
curl -X POST http://localhost:3000/api/vms \
  -H 'Content-Type: application/json' \
  -d '{"name":"test-vm","node":"pve1","memory":1024,"cores":2,"disk":"local-lvm:20"}'

# Web UI: open http://localhost:5173, click "Create VM", fill form, submit
```

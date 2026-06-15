# Phase 2: LXC Container Creation (CLI + API + Web UI)

**Priority: HIGH** — Natural follow-on to Phase 1 (VM creation).

## Goal

Add the ability to create new LXC containers via `pm lxc create`, the REST API, and the React web UI.

---

## Requirements

### CLI
- Command: `pm lxc create`
- Options:
  - `--name <hostname>` — container hostname (required)
  - `--node <node>` — target node (required)
  - `--vmid <id>` — explicit VMID; if omitted, fetch next available via `GET /cluster/nextid`
  - `--template <storage:template>` — CT template, e.g. `local:vztmpl/debian-12-standard.tar.zst` (required)
  - `--rootfs <storage:size>` — root filesystem, e.g. `local-lvm:8` (required)
  - `--memory <mb>` — RAM in MB (default: 512)
  - `--cores <n>` — CPU cores (default: 1)
  - `--password <pwd>` — root password (if omitted, prompt interactively; never echoed)
  - `--net <net-string>` — network config, e.g. `name=eth0,bridge=vmbr0,ip=dhcp`
  - `--unprivileged` — create as unprivileged container (default: true)
  - `--start` — start after creation
  - `--profile <name>`, `--dryRun`, `--yes` — standard flags
- Output: success message with CTID and node
- Safeguards: dry-run support
- Audit: log action with `source: 'cli'`

### API Endpoint
- `POST /api/lxc` with JSON body
- Returns `{ ok: true, data: { vmid: number, node: string, upid?: string } }`
- Proxmox API target: `POST /nodes/{node}/lxc`

### Web UI
- "Create LXC" button on the LXC page
- Modal/dialog: Hostname, Node (dropdown), Template (text input or dropdown if templates loaded), Root Filesystem, Memory, Cores, Network, Unprivileged checkbox
- VMID: auto-fetched and shown read-only
- On submit: POST to `/api/lxc`, close modal, reload list

---

## Implementation Checklist

### Backend
- [ ] `createLXC(node, params)` in `src/api/endpoints/lxc.ts`
- [ ] `createLXCService(config, params, profileName?)` in `src/services/lxc.ts`
- [ ] `POST /api/lxc` route in `src/server/routes/lxc.ts`
- [ ] `createLXC` function in `web/src/api/client.ts`

### CLI
- [ ] `src/cli/commands/lxc/create.ts`
- [ ] Register in `src/cli/commands/lxc/index.ts`
- [ ] Interactive password prompt (use `readline` or similar; never accept via `--password` in production but allow for scripting)

### Web UI
- [ ] `web/src/components/CreateLXCDialog.tsx`
- [ ] Update `web/src/pages/LXC.tsx` — add "Create LXC" button + wire dialog

### Docs
- [ ] Update `docs/COMMANDS.md`
- [ ] Update `README.md`
- [ ] Update `CLAUDE.md`

---

## Key Files

| File | Change |
|---|---|
| `src/api/endpoints/lxc.ts` | Add `createLXC()` |
| `src/services/lxc.ts` | Add `createLXCService()` |
| `src/server/routes/lxc.ts` | Add `POST /` handler |
| `src/cli/commands/lxc/create.ts` | New file |
| `src/cli/commands/lxc/index.ts` | Register `create` subcommand |
| `web/src/api/client.ts` | Add `createLXC()` |
| `web/src/pages/LXC.tsx` | Add button + dialog |
| `web/src/components/CreateLXCDialog.tsx` | New file |

---

## Proxmox API Reference

```
POST /nodes/{node}/lxc
  vmid         integer  (required)
  hostname     string   (required)
  ostemplate   string   (required, e.g. local:vztmpl/debian-12-standard.tar.zst)
  rootfs       string   (required, e.g. local-lvm:8)
  memory       integer  (MB)
  cores        integer
  password     string
  net0         string   (e.g. name=eth0,bridge=vmbr0,ip=dhcp)
  unprivileged boolean
  start        boolean
```

---

## Verification

```bash
# CLI dry-run
./pm lxc create --name my-ct --node pve1 --template local:vztmpl/debian-12-standard.tar.zst \
  --rootfs local-lvm:8 --memory 512 --dryRun

# API
curl -X POST http://localhost:3000/api/lxc \
  -H 'Content-Type: application/json' \
  -d '{"hostname":"my-ct","node":"pve1","ostemplate":"local:vztmpl/debian-12-standard.tar.zst","rootfs":"local-lvm:8"}'

# Web UI: open LXC page, click "Create LXC", fill form, submit
```

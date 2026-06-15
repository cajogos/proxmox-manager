# Phase 4: VM & LXC Detail Pages (Web UI)

**Priority: MEDIUM** — Expands web UI to cover advanced operations already available in the CLI.

## Goal

Add per-VM and per-LXC detail views with tabs for config, snapshots, and action modals for clone, migrate, and resize.

---

## Requirements

### Detail Page (shared pattern for VM and LXC)

Route: `/vms/:vmid` and `/lxc/:vmid`

Tabs:
1. **Overview** — status, resource usage (CPU, memory, disk), IPs, uptime
2. **Config** — raw config key/value table (read-only)
3. **Snapshots** — list snapshots; Create / Delete / Rollback actions

Action buttons (top-right):
- Start / Shutdown / Stop / Reboot / Suspend / Resume (context-aware, same as list page)
- **Clone** → opens Clone dialog
- **Migrate** → opens Migrate dialog (VMs only)
- **Resize Disk** → opens Resize dialog

### Clone Dialog
Fields: New VMID (auto-fetched), New Name, Target Node (dropdown), Full Clone checkbox, Storage (optional)

### Migrate Dialog (VMs only)
Fields: Target Node (dropdown, excludes current node), Online Migration checkbox

### Resize Disk Dialog
Fields: Disk selector (from config), New Size (e.g. `+10G` or absolute `50G`)

### Snapshot Tab
- List: columns — Name, Description, Created, Has RAM state
- Create: Name (required), Description (optional)
- Delete: confirmation dialog
- Rollback: double-confirm (destructive)

---

## Implementation Checklist

### API & Service (mostly exists)
- [ ] Verify `GET /api/vms/:vmid/config` route exists; add if missing
- [ ] Verify `GET /api/vms/:vmid/snapshots`, `POST`, `DELETE`, `POST .../rollback`; add if missing
- [ ] Same audit for `/api/lxc/:vmid/*`
- [ ] Add `cloneVM`, `migrateVM`, `resizeVMDisk` to server routes if not present
- [ ] Add corresponding functions to `web/src/api/client.ts`

### Web UI
- [ ] `web/src/pages/VMDetail.tsx` — new page
- [ ] `web/src/pages/LXCDetail.tsx` — new page (or shared `ContainerDetail.tsx`)
- [ ] `web/src/components/SnapshotTab.tsx` — snapshot list + CRUD
- [ ] `web/src/components/CloneDialog.tsx`
- [ ] `web/src/components/MigrateDialog.tsx`
- [ ] `web/src/components/ResizeDiskDialog.tsx`
- [ ] Update router in `web/src/App.tsx` — add `/vms/:vmid` and `/lxc/:vmid` routes
- [ ] Make VMID column in list pages a link to the detail page

---

## Key Files

| File | Change |
|---|---|
| `src/server/routes/vms.ts` | Audit & add missing detail routes |
| `src/server/routes/lxc.ts` | Audit & add missing detail routes |
| `web/src/api/client.ts` | Add config, snapshot, clone, migrate, resize calls |
| `web/src/App.tsx` | Register detail page routes |
| `web/src/pages/VMs.tsx` | Make VMID a link |
| `web/src/pages/VMDetail.tsx` | New file |
| `web/src/pages/LXCDetail.tsx` | New file |
| `web/src/components/SnapshotTab.tsx` | New file |
| `web/src/components/CloneDialog.tsx` | New file |
| `web/src/components/MigrateDialog.tsx` | New file |
| `web/src/components/ResizeDiskDialog.tsx` | New file |

---

## Verification

```bash
# Navigate to VMs page, click VMID → lands on detail page
# Overview tab shows live status + IPs
# Config tab shows raw key/value pairs
# Snapshots tab: create a snapshot, verify it appears, rollback, delete
# Clone modal: fill form, submit, new VM appears in list
# Migrate modal: pick another node, submit, VM moves
# Resize dialog: pick disk, add +5G, verify new size in config
```

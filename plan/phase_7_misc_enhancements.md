# Phase 7: Miscellaneous Web UI Enhancements ✅ COMPLETE

**Priority: LOW** — Small additions that round out the web UI.

## Goal

Fill the remaining gaps: SDN read-only view, Node detail (services + tasks), Backup job creation, and Storage content upload.

---

## Items

### 7.1 — SDN Read-Only View

New page: `/sdn`

Tabs: Zones | VNets | Subnets

- **Zones:** Name, Type, State, Nodes
- **VNets:** Name, Zone, Alias, Tag
- **Subnets:** VNet, CIDR, Gateway, DHCP

New API routes:
- `GET /api/sdn/zones`
- `GET /api/sdn/vnets`
- `GET /api/sdn/subnets`

Reuse: `src/services/sdn.ts`, `src/api/endpoints/sdn.ts` (already complete)

Files: `src/server/routes/sdn.ts` (new), `web/src/pages/SDN.tsx` (new), Layout.tsx nav entry.

---

### 7.2 — Node Services & Tasks (Web UI)

Extend the Nodes page or add a Node detail page at `/nodes/:node`.

Tabs:
- **Services** — list systemd services (name, state, description), start/stop/restart actions
- **Tasks** — list recent tasks (UPID, type, status, start time); click to stream logs via SSE

Reuse: existing SSE endpoint `GET /api/tasks/:upid/stream` already works.

New API routes:
- `GET /api/nodes/:node/services`
- `POST /api/nodes/:node/services/:service/:action` (start/stop/restart)
- `GET /api/nodes/:node/tasks`

Reuse: `src/services/node.ts` already has service and task functions.

---

### 7.3 — Backup Job Creation (Web UI)

The Backup page already lists and deletes jobs. Add a "Create Backup Job" button.

New dialog fields: Node, VM/CT selection (multi-select checkboxes), Schedule (cron string), Storage, Mode (snapshot/suspend/stop), Compress, Remove (retention count)

New API route: `POST /api/backup`

Reuse: `src/services/vzdump.ts` already has `createBackupJobService()`.

---

### 7.4 — Storage Content Upload (Web UI)

Add an upload button on the Storage page (per-pool row) to upload an ISO or CT template.

New dialog: Storage pool (pre-filled), Content type (iso/vztmpl), File picker.

Stream upload progress using `onProgress` callback (same pattern as CLI spinner progress).

New API route: `POST /api/storage/:storage/upload`

Reuse: `src/services/storage.ts` already has upload service with `onProgress` support.

---

## Implementation Checklist

- [ ] **7.1 SDN:** `src/server/routes/sdn.ts`, `web/src/pages/SDN.tsx`, Layout entry, route in App.tsx
- [ ] **7.2 Node detail:** `src/server/routes/nodes.ts` additions, `web/src/pages/NodeDetail.tsx`
- [ ] **7.3 Backup create:** `src/server/routes/backup.ts` POST handler, `web/src/components/CreateBackupJobDialog.tsx`
- [ ] **7.4 Storage upload:** `src/server/routes/storage.ts` upload endpoint, `web/src/components/StorageUploadDialog.tsx`

---

## Verification

```bash
# 7.1: SDN page loads, zones/vnets/subnets render correctly
# 7.2: Node row links to detail; services list shows; tasks list shows; click UPID → SSE log stream
# 7.3: Backup page → "Create Job" → fill form → job appears in list
# 7.4: Storage page → upload button → pick ISO file → progress bar → file appears in content list
```

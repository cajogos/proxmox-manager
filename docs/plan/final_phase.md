# Final Phase: Incomplete Scope from Phases 7–8

Items that were explicitly named in earlier phase requirements but were never implemented. These are the only true gaps; everything else in phases 1–8 is complete.

## Requirements

### 9a — VM Live Migration

Phase 7 scoped cluster management as "cluster status, HA, migrations" but only cluster status and HA were delivered.

**API layer (`src/api/endpoints/cluster.ts`):**
- `MigrateVMParams` — vmid, target (node), online, with-local-disks
- `migrateVM(client, node, vmid, params)` → `POST /nodes/{node}/qemu/{vmid}/migrate`
- `getMigrationPreconditions(client, node, vmid)` → `GET /nodes/{node}/qemu/{vmid}/migrate` (checks feasibility)

**Service layer (`src/services/vm.ts`):**
- `migrateVMService(config, profileName, vmid, targetNode, opts)` — resolves source node via `resolveVMNode()`, checks preconditions, runs safeguard pipeline, calls migrate API, returns task UPID

**CLI command (`src/cli/commands/vm/migrate.ts`):**
- `pm vm migrate <vmid> <target-node>` — table output showing task UPID
- `--online` flag — live migration without downtime (if storage allows)
- `--with-local-disks` flag — migrate shared-disk VMs (advanced, confirm-required)
- Full safeguard pipeline: protected check → dry-run → confirmation

---

### 9b — API Token CRUD

Phase 7c scoped access management as "users, groups, roles, API tokens" but only users/groups/roles were delivered.

**API layer (`src/api/endpoints/access.ts`):**
- `APIToken` — tokenid, comment, expire, privsep
- `listUserTokens(client, userid)` → `GET /access/users/{userid}/token`
- `createUserToken(client, userid, tokenid, params)` → `POST /access/users/{userid}/token/{tokenid}`
- `deleteUserToken(client, userid, tokenid)` → `DELETE /access/users/{userid}/token/{tokenid}`

**Service layer (`src/services/access.ts`):**
- `listUserTokensService`, `createUserTokenService`, `deleteUserTokenService`

**CLI commands (`src/cli/commands/access/`):**
- `pm access token list <userid>` — table: Token ID, Comment, Expire, Privilege Separation
- `pm access token create <userid> <tokenid> [--comment <text>] [--expire <epoch>] [--privsep 0|1]` — prints the generated secret on creation (shown once only)
- `pm access token delete <userid> <tokenid>` — confirmation required

---

### 9c — Web API Routes for Remaining Command Groups

Phase 8 added Express routes only for VMs, LXC, nodes, and storage. The remaining CLI command groups have no web-accessible API.

**New route files (`src/server/routes/`):**
- `cluster.ts` — `GET /api/cluster/status`, `GET /api/cluster/resources`, `GET /api/cluster/ha`
- `network.ts` — `GET /api/network/:node`, `GET /api/network/:node/:iface`
- `access.ts` — `GET /api/access/users`, `GET /api/access/groups`, `GET /api/access/roles`
- `backup.ts` — `GET /api/backup`, `GET /api/backup/:id`, `POST /api/backup`, `DELETE /api/backup/:id`

All routes use the existing `profileMiddleware` and `errorHandler` patterns from `src/server/middleware/`.

---

### 9d — Web UI Pages for 9c Routes

**New pages (`web/src/pages/`):**
- `Cluster.tsx` — cluster resource table with status badges
- `Network.tsx` — per-node network interface table
- `Access.tsx` — tabs: users / groups / roles
- `Backup.tsx` — scheduled backup job list with create/delete actions

Update `web/src/App.tsx` routes and `web/src/components/Layout.tsx` nav links.
Update `web/src/api/client.ts` with typed fetch wrappers for the 9c endpoints.

---

## Checklist

### 9a — VM Live Migration
- [ ] `getMigrationPreconditions` in `src/api/endpoints/cluster.ts`
- [ ] `migrateVM` API call in `src/api/endpoints/cluster.ts`
- [ ] `migrateVMService` in `src/services/vm.ts`
- [ ] `src/cli/commands/vm/migrate.ts` — `vm migrate <vmid> <target>`
- [ ] `--online` and `--with-local-disks` flags
- [ ] Safeguard pipeline applied
- [ ] Audit log entry

### 9b — API Token CRUD
- [ ] `listUserTokens`, `createUserToken`, `deleteUserToken` in `src/api/endpoints/access.ts`
- [ ] `listUserTokensService`, `createUserTokenService`, `deleteUserTokenService` in `src/services/access.ts`
- [ ] `pm access token list <userid>`
- [ ] `pm access token create <userid> <tokenid>` — secret printed once
- [ ] `pm access token delete <userid> <tokenid>` — confirmation required
- [ ] Audit log entries

### 9c — Web API Routes
- [ ] `src/server/routes/cluster.ts` — status, resources, HA
- [ ] `src/server/routes/network.ts` — list ifaces, show iface
- [ ] `src/server/routes/access.ts` — users, groups, roles
- [ ] `src/server/routes/backup.ts` — CRUD
- [ ] All routes mounted in `src/server/index.ts`

### 9d — Web UI Pages
- [ ] `web/src/pages/Cluster.tsx`
- [ ] `web/src/pages/Network.tsx`
- [ ] `web/src/pages/Access.tsx`
- [ ] `web/src/pages/Backup.tsx`
- [ ] `web/src/api/client.ts` updated with new fetch wrappers
- [ ] `App.tsx` routes updated
- [ ] `Layout.tsx` nav links updated

### Sign-off
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` + `pnpm build:web` pass
- [ ] `README.md` updated
- [ ] `docs/COMMANDS.md` updated
- [ ] `CLAUDE.md` updated

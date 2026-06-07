# Phase 7: Full API Coverage

## Requirements

- Cover remaining Proxmox API surface areas not handled in phases 1–5
- This phase is defined incrementally — scoped at the start of each sub-phase

### Planned Sub-phases

| Sub-phase | Area |
|---|---|
| 7a | Cluster management (cluster status, HA, migrations) |
| 7b | Network configuration (bridges, bonds, VLANs per node) |
| 7c | User and permission management (users, groups, roles, API tokens) |
| 7d | Backup jobs (scheduled backups via vzdump) |

### General Requirements (all sub-phases)

- All write/destructive operations pass through the safeguard pipeline
- All actions logged to audit log
- `--format table|json|csv` supported on all listing commands
- Protected resource lists respected

## Implementation

### 7a — Cluster + HA

**API layer (`src/api/endpoints/cluster.ts`):**
- `ClusterStatusEntry` — name, type, id, online, ip, local, quorate, nodeid, version, nodes
- `ClusterResource` — id, type, node, status, name, vmid, maxcpu, cpu, maxmem, mem, disk, maxdisk, uptime, pool, hastate
- `HAStatusEntry` — sid, state, type, node, crm_state, lrm_state
- `listClusterStatus(client)` → `GET /cluster/status`
- `listClusterResources(client, type?)` → `GET /cluster/resources[?type=...]`
- `listHAStatus(client)` → `GET /cluster/ha/status/current`

**Service layer (`src/services/cluster.ts`):** `listClusterStatusService`, `listClusterResourcesService`, `listHAStatusService`

**CLI commands (`src/cli/commands/cluster/`):**
- `pm cluster status` — table: name, type, ID, online, IP, quorate, nodes
- `pm cluster resources [--type vm|node|storage|pool]` — table of all cluster resources
- `pm cluster ha` — table of HA resource states

### 7b — Network Configuration

**API layer (`src/api/endpoints/network.ts`):**
- `NetworkIface` — iface, type, active, autostart, method, address, netmask, gateway, bridge_ports, bond_slaves, comments
- `listNetworkIfaces(client, node)` → `GET /nodes/{node}/network`
- `getNetworkIface(client, node, iface)` → `GET /nodes/{node}/network/{iface}`

**Service layer (`src/services/network.ts`):** `listNetworkIfacesService`, `getNetworkIfaceService`

**CLI commands (`src/cli/commands/network/`):**
- `pm network list <node>` — table: Interface, Type, Method, Address, Active, Autostart, Bridge Ports
- `pm network show <node> <iface>` — key/value detail, filtering `-` rows

### 7c — User and Access Management

**API layer (`src/api/endpoints/access.ts`):**
- `UserInfo` — userid, firstname, lastname, email, enable, expire, groups, tokens, comment
- `GroupInfo` — groupid, members, comment
- `RoleInfo` — roleid, privs, special
- `listUsers(client)` → `GET /access/users`
- `getUser(client, userid)` → `GET /access/users/{userid}`
- `listGroups(client)` → `GET /access/groups`
- `listRoles(client)` → `GET /access/roles`

**Service layer (`src/services/access.ts`):** `listUsersService`, `getUserService`, `listGroupsService`, `listRolesService`

**CLI commands (`src/cli/commands/access/`):**
- `pm access user list` — table: UserID, Name, Email, Enabled, Groups, Comment
- `pm access user show <userid>` — key/value detail
- `pm access group list` — table: GroupID, Members, Comment
- `pm access role list` — table: RoleID, Special, Privileges

### 7d — Backup Jobs (vzdump)

**API layer (`src/api/endpoints/vzdump.ts`):**
- `BackupJob` — id, enabled, schedule, storage, node, vmid, mode, compress, mailnotification, mailto
- `CreateBackupJobParams` — storage (required), schedule, node, vmid, mode, compress
- `listBackupJobs(client)` → `GET /cluster/backup`
- `getBackupJob(client, id)` → `GET /cluster/backup/{id}`
- `createBackupJob(client, params)` → `POST /cluster/backup`
- `deleteBackupJob(client, id)` → `DELETE /cluster/backup/{id}`

**Service layer (`src/services/vzdump.ts`):** `listBackupJobsService`, `getBackupJobService`, `createBackupJobService`, `deleteBackupJobService`

**CLI commands (`src/cli/commands/backup/`):**
- `pm backup list` — table: ID, Enabled, Schedule, Storage, Node, VMIDs, Mode, Compress
- `pm backup show <id>` — key/value detail
- `pm backup create --storage <name> [--schedule <cron>] [--node <node>] [--vmid <ids>] [--mode snapshot|suspend|stop] [--compress <type>]` — requires confirm
- `pm backup delete <id>` — requires confirm

## Checklist

- [x] 7a — Cluster + HA status
- [x] 7b — Network configuration
- [x] 7c — User and permission management
- [x] 7d — Backup jobs (vzdump)
- [x] `src/cli/program.ts` updated — all 4 command groups registered
- [x] Typecheck passes (`pnpm typecheck`)
- [x] Build passes (`pnpm build`)
- [x] `README.md` updated — phase marked ✅, features list updated
- [x] `docs/COMMANDS.md` updated — example output and new commands documented
- [x] `CLAUDE.md` updated — new layers, helpers, or patterns reflected

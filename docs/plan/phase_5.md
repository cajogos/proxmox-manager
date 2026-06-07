# Phase 5: Node Management

## Requirements

- Implement node-level management commands
- Node operations are high-risk — shutdown/reboot require double-confirmation
- Commands to implement:

| Command | Description |
|---|---|
| `node list` | List all nodes with status, CPU, memory |
| `node status <node>` | Detailed node status and resource usage |
| `node shutdown <node>` | Shutdown a node (DANGEROUS) |
| `node reboot <node>` | Reboot a node (DANGEROUS) |
| `node services list <node>` | List Proxmox services on a node |
| `node services restart <node> <service>` | Restart a Proxmox service |
| `node tasks <node>` | Show recent tasks on a node |
| `node tasks log <node> <upid>` | Show log for a specific task |
| `node version <node>` | Show Proxmox version on a node |

- `node shutdown` and `node reboot` must:
  - Check protected nodes list
  - Show all running VMs/containers that will be affected
  - Require explicit typed confirmation: "I understand this will affect N VMs"
- Protected nodes list from `config.json` `safeguards.protectedNodes`

## Implementation

Created `src/api/endpoints/node.ts` with all node API calls — reuses `getNodes()` from `vm.ts` for node listing. Added `cpu`, `mem`, `maxmem`, `disk`, `maxdisk`, `uptime`, and `pveversion` optional fields to the shared `NodeInfo` interface in `vm.ts`. Created `src/services/node.ts` with 9 service functions. Created all CLI command files under `src/cli/commands/node/` including `services/` and `tasks/` subgroups. `node shutdown` and `node reboot` use a two-step confirmation: standard yes/no prompt followed by typing "I understand". Both fetch affected running workloads before prompting. Registered `registerNodeCommands` in `src/cli/program.ts`.

## Checklist

- [x] `src/api/endpoints/node.ts` — all node API calls
- [x] `src/cli/commands/node/` — all commands
- [x] `node shutdown`/`reboot` show affected VMs before confirming
- [x] Protected nodes respected
- [x] All actions in audit log
- [x] `pnpm build` + `pnpm typecheck` pass
- [x] `README.md` updated — phase marked ✅, features list updated
- [x] `docs/COMMANDS.md` updated — example output and new commands documented
- [x] `CLAUDE.md` updated — new layers, helpers, or patterns reflected

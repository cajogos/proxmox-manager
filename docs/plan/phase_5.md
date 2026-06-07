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

_To be detailed at the start of Phase 4._

## Checklist

- [ ] `src/api/endpoints/node.ts` — all node API calls
- [ ] `src/cli/commands/node/` — all commands
- [ ] `node shutdown`/`reboot` show affected VMs before confirming
- [ ] Protected nodes respected
- [ ] All actions in audit log
- [ ] `pnpm build` + `pnpm typecheck` pass
- [ ] README.md updated with Phase 4 tutorial

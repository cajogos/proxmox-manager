# Phase 4: LXC Container Management

## Requirements

- Implement full lifecycle management for LXC containers
- Mirror the VM command structure where applicable
- Commands to implement:

| Command | Description |
|---|---|
| `lxc list` | List all containers across nodes |
| `lxc status <ctid>` | Show detailed container status |
| `lxc start <ctid>` | Start a stopped container |
| `lxc stop <ctid>` | Hard stop a running container |
| `lxc shutdown <ctid>` | Graceful shutdown |
| `lxc reboot <ctid>` | Reboot a container |
| `lxc suspend <ctid>` | Suspend a container |
| `lxc resume <ctid>` | Resume a container |
| `lxc snapshot create <ctid> <name>` | Create a snapshot |
| `lxc snapshot list <ctid>` | List snapshots |
| `lxc snapshot delete <ctid> <name>` | Delete a snapshot |
| `lxc snapshot rollback <ctid> <name>` | Rollback to snapshot |
| `lxc delete <ctid>` | Delete a container |
| `lxc config <ctid>` | Show container configuration |
| `lxc exec <ctid> <command>` | Execute a command inside the container |

- `lxc exec` must require explicit `--yes` or confirmation — never run silently
- Protected containers list applies from `config.json` `safeguards.protectedContainers`

## Implementation

Created `src/api/endpoints/lxc.ts` mirroring the VM endpoint structure at `/nodes/{node}/lxc/{vmid}/...`. `lxc exec` uses `child_process.spawnSync` to SSH to the node and run `pct exec` — requires key-based root SSH access. Created `src/services/lxc.ts` with `resolveLXCNode()` helper. Created all CLI command files under `src/cli/commands/lxc/`, including a snapshot subgroup. `lxc delete` requires double-confirmation (typed container name). `lxc exec` always prompts even with `--yes` since the spec says it must never run silently. Registered `registerLXCCommands` in `src/cli/program.ts`.

## Checklist

- [x] `src/api/endpoints/lxc.ts` — all LXC API calls
- [x] `src/cli/commands/lxc/` — all commands
- [x] `lxc exec` requires confirmation
- [x] Protected containers respected
- [x] All actions in audit log
- [x] `pnpm build` + `pnpm typecheck` pass
- [x] `README.md` updated — phase marked ✅, features list updated
- [x] `docs/COMMANDS.md` updated — example output and new commands documented
- [x] `CLAUDE.md` updated — new layers, helpers, or patterns reflected

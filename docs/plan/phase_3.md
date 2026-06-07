# Phase 3: LXC Container Management

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

_To be detailed at the start of Phase 3._

## Checklist

- [ ] `src/api/endpoints/lxc.ts` — all LXC API calls
- [ ] `src/cli/commands/lxc/` — all commands
- [ ] `lxc exec` requires confirmation
- [ ] Protected containers respected
- [ ] All actions in audit log
- [ ] `pnpm build` + `pnpm typecheck` pass
- [ ] README.md updated with Phase 3 tutorial

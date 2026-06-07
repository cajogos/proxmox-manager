# Phase 6: Storage Management

## Requirements

- Implement storage pool inspection and management
- Commands to implement:

| Command | Description |
|---|---|
| `storage list` | List all storage pools across nodes |
| `storage status <storage>` | Detailed storage pool status and usage |
| `storage content list <storage>` | List contents (ISOs, templates, disk images) |
| `storage content upload <storage> <file>` | Upload an ISO or template |
| `storage content delete <storage> <volid>` | Delete a volume |
| `storage backup list` | List all backup files |
| `storage backup delete <volid>` | Delete a backup |

- Deleting volumes/backups is irreversible — always require confirmation
- Upload shows progress indication
- `--node <name>` flag to scope to a specific node

## Implementation

_To be detailed at the start of Phase 5._

## Checklist

- [ ] `src/api/endpoints/storage.ts` — all storage API calls
- [ ] `src/cli/commands/storage/` — all commands
- [ ] Delete operations always confirm
- [ ] Upload shows progress
- [ ] All actions in audit log
- [ ] `pnpm build` + `pnpm typecheck` pass
- [ ] README.md updated with Phase 5 tutorial

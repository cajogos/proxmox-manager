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

Added `upload<T>()` method to `src/api/client.ts` with `timeout: 0`, `maxBodyLength: Infinity`, and `onUploadProgress` callback. Extended `startSpinner()` to return a `setText()` method for live upload progress updates. Created `src/api/endpoints/storage.ts` with `listAllStorage()` (deduplicates across nodes by highest `total`), `getStorageStatus`, `listStorageContent`, `deleteStorageContent`, `uploadStorageContent` (uses native `FormData` + `Blob` for Node.js 24), and `listAllBackups()`. Created `src/services/storage.ts` with 6 service functions. Created CLI commands under `src/cli/commands/storage/` including `content/` and `backup/` subgroups. Registered `registerStorageCommands` in `src/cli/program.ts`.

## Checklist

- [x] `src/api/endpoints/storage.ts` — all storage API calls
- [x] `src/cli/commands/storage/` — all commands
- [x] Delete operations always confirm
- [x] Upload shows progress
- [x] All actions in audit log
- [x] `pnpm build` + `pnpm typecheck` pass
- [x] `README.md` updated — phase marked ✅, features list updated
- [x] `docs/COMMANDS.md` updated — example output and new commands documented
- [x] `CLAUDE.md` updated — new layers, helpers, or patterns reflected

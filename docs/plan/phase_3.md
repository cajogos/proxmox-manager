# Phase 3: Full VM Lifecycle Management

## Requirements

- Implement all lifecycle actions for QEMU VMs
- Every destructive action must pass through the full safeguard pipeline:
  1. Protected-resource check
  2. Dry-run check
  3. Confirmation prompt (unless `--yes`)
  4. Audit log entry (success, failure, cancelled, dry-run)
- Commands to implement:

| Command | Description |
|---|---|
| `vm list` | List all VMs across nodes (Phase 1) |
| `vm status <vmid>` | Show detailed status of a specific VM |
| `vm start <vmid>` | Start a stopped VM |
| `vm stop <vmid>` | Hard stop a running VM |
| `vm shutdown <vmid>` | Graceful ACPI shutdown |
| `vm reboot <vmid>` | Reboot a running VM |
| `vm suspend <vmid>` | Suspend a VM |
| `vm resume <vmid>` | Resume a suspended VM |
| `vm snapshot create <vmid> <name>` | Create a snapshot |
| `vm snapshot list <vmid>` | List snapshots |
| `vm snapshot delete <vmid> <name>` | Delete a snapshot |
| `vm snapshot rollback <vmid> <name>` | Rollback to snapshot (DANGEROUS) |
| `vm delete <vmid>` | Delete a VM permanently |
| `vm config <vmid>` | Show VM configuration |

- All commands accept `--node <name>` to target a specific node (or auto-discover)
- `vm delete` requires double-confirmation: the user must type the VM name to confirm
- `vm snapshot rollback` is highlighted as a high-risk operation

## Implementation

Extended `src/api/endpoints/vm.ts` with all lifecycle API calls. Added service functions to `src/services/vm.ts` with `resolveVMNode()` helper for auto-discovery. Created individual command files under `src/cli/commands/vm/`. `checkDryRun` simplified to a pure boolean check; all dry-run messaging uses `dryRunMsg()` from the Phase 2 palette. `vm delete` requires double-confirm (typed VM name). `vm snapshot rollback` shows a high-risk warning before confirm. All destructive commands run the full safeguard pipeline.

## Checklist

- [x] `src/api/endpoints/vm.ts` — extended with all lifecycle API calls
- [x] `src/cli/commands/vm/status.ts`
- [x] `src/cli/commands/vm/start.ts`
- [x] `src/cli/commands/vm/stop.ts`
- [x] `src/cli/commands/vm/shutdown.ts`
- [x] `src/cli/commands/vm/reboot.ts`
- [x] `src/cli/commands/vm/suspend.ts`
- [x] `src/cli/commands/vm/resume.ts`
- [x] `src/cli/commands/vm/snapshot/` (create, list, delete, rollback)
- [x] `src/cli/commands/vm/delete.ts` (double-confirm)
- [x] `src/cli/commands/vm/config.ts`
- [x] Safeguard pipeline verified on all destructive actions
- [x] All actions appear in audit log
- [x] `pnpm build` + `pnpm typecheck` pass
- [x] `README.md` updated — phase marked ✅, features list updated
- [x] `docs/COMMANDS.md` updated — example output and new commands documented
- [x] `CLAUDE.md` updated — new layers, helpers, or patterns reflected

# Phase 2: Full VM Lifecycle Management

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

_To be detailed at the start of Phase 2._

## Checklist

- [ ] `src/api/endpoints/vm.ts` — extended with all lifecycle API calls
- [ ] `src/cli/commands/vm/status.ts`
- [ ] `src/cli/commands/vm/start.ts`
- [ ] `src/cli/commands/vm/stop.ts`
- [ ] `src/cli/commands/vm/shutdown.ts`
- [ ] `src/cli/commands/vm/reboot.ts`
- [ ] `src/cli/commands/vm/suspend.ts`
- [ ] `src/cli/commands/vm/resume.ts`
- [ ] `src/cli/commands/vm/snapshot/` (create, list, delete, rollback)
- [ ] `src/cli/commands/vm/delete.ts` (double-confirm)
- [ ] `src/cli/commands/vm/config.ts`
- [ ] Safeguard pipeline verified on all destructive actions
- [ ] All actions appear in audit log
- [ ] `pnpm build` + `pnpm typecheck` pass
- [ ] README.md updated with Phase 2 tutorial

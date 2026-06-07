# VM Commands

All commands auto-discover the VM's node from the Proxmox API. Pass `--node <name>` to skip discovery.
Destructive commands require confirmation unless `--yes` is passed.

## `vm list`

List all VMs across all nodes. Shows a compact table with colour-coded status, human-readable memory, and a summary line.

```bash
./pm vm list
./pm vm list --format json
./pm vm list --format csv
./pm --profile homelab vm list
```

```
┌──────┬──────────────────┬─────────┬──────┬──────┬────────┬──────────┬──────┐
│ VMID │ Name             │ Status  │ Node │ CPUs │ Memory │ Template │ Tags │
├──────┼──────────────────┼─────────┼──────┼──────┼────────┼──────────┼──────┤
│  100 │ ubuntu-server    │ running │ pve  │    2 │ 2.0 GB │ -        │ -    │
│  101 │ docker-host      │ running │ pve  │    4 │ 8.0 GB │ -        │ -    │
│  200 │ windows-template │ stopped │ pve  │    2 │ 4.0 GB │ template │ -    │
└──────┴──────────────────┴─────────┴──────┴──────┴────────┴──────────┴──────┘
3 VMs — 2 running · 1 stopped
```

## `vm status <vmid>`

Show the current power state, CPU, memory, disk, and uptime for a single VM.

```bash
./pm vm status 100
./pm vm status 100 --format json
```

## `vm config <vmid>`

Show the full hardware configuration of a VM — CPU type, memory, disks, network interfaces, boot order, and options.

```bash
./pm vm config 100
./pm vm config 100 --format json
```

## Lifecycle Actions

Control the power state of a VM. All actions are confirmed before execution unless `--yes` is passed.

| Command | What it does |
|---|---|
| `vm start` | Power on the VM |
| `vm stop` | Immediately cut power (hard stop) |
| `vm shutdown` | Send an ACPI shutdown signal (graceful) |
| `vm reboot` | Graceful restart via ACPI |
| `vm suspend` | Suspend the VM to RAM |
| `vm resume` | Resume a suspended VM |

```bash
./pm vm start 100
./pm vm stop 100
./pm vm shutdown 100
./pm vm reboot 100
./pm vm suspend 100
./pm vm resume 100
./pm vm stop 100 --yes        # skip confirm
./pm vm stop 100 --dry-run    # print intent, no API call
```

## `vm delete <vmid>`

Permanently delete a VM and all its disks. Requires two confirmations: a yes/no prompt followed by typing the VM name exactly.

```bash
./pm vm delete 100
```

## `vm migrate <vmid> <target-node>`

Move a VM to a different Proxmox node. Checks preconditions (shared storage, CPU compatibility) before starting, then returns a task UPID you can track.

```bash
./pm vm migrate 100 pve2
./pm vm migrate 100 pve2 --online            # live migration — no downtime
./pm vm migrate 100 pve2 --with-local-disks  # also move local disk images
./pm vm migrate 100 pve2 --dry-run
```

## `vm clone <vmid> <newid>`

Create a copy of a VM under a new ID. By default creates a linked clone (shares the base disk); use `--full` for a fully independent copy.

```bash
./pm vm clone 100 101
./pm vm clone 100 101 --name my-clone
./pm vm clone 100 101 --full
```

## `vm resize <vmid> <disk> <size>`

Grow a VM disk. Prefix size with `+` to add capacity on top of the current size, or supply an absolute value to set it directly. Only expansion is supported — shrinking requires manual steps inside the guest.

```bash
./pm vm resize 100 scsi0 +10G    # add 10 GB
./pm vm resize 100 scsi0 50G     # set to exactly 50 GB
```

## Snapshot Commands

Snapshots capture the full VM state (RAM + disk) at a point in time. They are stored on the same storage as the VM.

### `vm snapshot list <vmid>`

List all snapshots for a VM, showing name, creation time, and description.

```bash
./pm vm snapshot list 100
```

### `vm snapshot create <vmid> <name>`

Take a new snapshot. Optionally attach a description for future reference.

```bash
./pm vm snapshot create 100 before-update
./pm vm snapshot create 100 pre-upgrade --description "Before kernel upgrade"
```

### `vm snapshot delete <vmid> <name>`

Remove a snapshot. The VM itself is unaffected.

```bash
./pm vm snapshot delete 100 before-update
```

### `vm snapshot rollback <vmid> <name>`

Revert the VM to a previous snapshot. **Destructive** — all changes since the snapshot was taken are permanently discarded. Shows a warning and requires confirmation.

```bash
./pm vm snapshot rollback 100 before-update
```

# VM Commands

All commands auto-discover the VM's node. Pass `--node <name>` to skip discovery.
Destructive commands require confirmation unless `--yes` is passed.

## `vm list`

List all VMs across all nodes.

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

```bash
./pm vm status 100
./pm vm status 100 --format json
```

## `vm config <vmid>`

```bash
./pm vm config 100
./pm vm config 100 --format json
```

## Lifecycle Actions

```bash
./pm vm start 100
./pm vm stop 100
./pm vm shutdown 100          # graceful ACPI shutdown
./pm vm reboot 100
./pm vm suspend 100
./pm vm resume 100
./pm vm stop 100 --yes        # skip confirm
./pm vm stop 100 --dry-run    # print intent, no API call
```

## `vm delete <vmid>`

Requires two confirmations: a yes/no prompt followed by typing the VM name.

```bash
./pm vm delete 100
```

## `vm migrate <vmid> <target-node>`

Migrate a VM to another node. Checks preconditions before migrating and returns a task UPID.

```bash
./pm vm migrate 100 pve2
./pm vm migrate 100 pve2 --online            # live migration (no downtime)
./pm vm migrate 100 pve2 --with-local-disks  # migrate VMs with local disks (confirms)
./pm vm migrate 100 pve2 --dry-run
```

## `vm clone <vmid> <newid>`

Clone a VM to a new ID.

```bash
./pm vm clone 100 101
./pm vm clone 100 101 --name my-clone
./pm vm clone 100 101 --full              # full (not linked) clone
```

## `vm resize <vmid> <disk> <size>`

Grow a VM disk. Size is specified with a `+` prefix to add capacity or an absolute value.

```bash
./pm vm resize 100 scsi0 +10G    # add 10 GB
./pm vm resize 100 scsi0 50G     # set to 50 GB
```

## Snapshot Commands

### `vm snapshot list <vmid>`

```bash
./pm vm snapshot list 100
```

### `vm snapshot create <vmid> <name>`

```bash
./pm vm snapshot create 100 before-update
./pm vm snapshot create 100 pre-upgrade --description "Before kernel upgrade"
```

### `vm snapshot delete <vmid> <name>`

```bash
./pm vm snapshot delete 100 before-update
```

### `vm snapshot rollback <vmid> <name>`

High-risk: shows a warning and requires confirmation. Current VM state is permanently overwritten.

```bash
./pm vm snapshot rollback 100 before-update
```

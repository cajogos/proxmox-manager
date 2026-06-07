# LXC Commands

Manage LXC containers. Container IDs use the `<ctid>` argument.
All commands auto-discover the container's node. Pass `--node <name>` to skip discovery.

## `lxc list`

List all LXC containers across all nodes with status, CPU, memory, and uptime.

```bash
./pm lxc list
./pm lxc list --format json
```

## `lxc status <ctid>`

Show the current power state, CPU, memory, and uptime for a single container.

```bash
./pm lxc status 200
```

## `lxc config <ctid>`

Show the full configuration of a container — CPU, memory, disk, network, and options.

```bash
./pm lxc config 200
```

## Lifecycle Actions

Control the power state of a container. All actions are confirmed before execution unless `--yes` is passed.

| Command | What it does |
|---|---|
| `lxc start` | Start the container |
| `lxc stop` | Immediately cut power (hard stop) |
| `lxc shutdown` | Graceful shutdown via init system |
| `lxc reboot` | Graceful restart |
| `lxc suspend` | Freeze the container |
| `lxc resume` | Unfreeze a suspended container |

```bash
./pm lxc start 200
./pm lxc stop 200
./pm lxc shutdown 200
./pm lxc reboot 200
./pm lxc suspend 200
./pm lxc resume 200
```

## `lxc delete <ctid>`

Permanently delete a container and its root filesystem. Same double-confirmation as `vm delete`.

```bash
./pm lxc delete 200
```

## `lxc exec <ctid> [command...]`

Run a command inside a running container. Uses `ssh root@<host> pct exec` under the hood — requires SSH key-based root access to the Proxmox node.

```bash
./pm lxc exec 200 -- hostname
./pm lxc exec 200 -- apt-get update
```

## `lxc clone <ctid> <newid>`

Create a copy of a container under a new ID.

```bash
./pm lxc clone 200 201
./pm lxc clone 200 201 --name my-clone
```

## `lxc resize <ctid> <disk> <size>`

Grow a container disk. Use a `+` prefix to add capacity on top of the current size.

```bash
./pm lxc resize 200 rootfs +5G
```

## Snapshot Commands

### `lxc snapshot list <ctid>`

List all snapshots for a container.

```bash
./pm lxc snapshot list 200
```

### `lxc snapshot create <ctid> <name>`

Take a snapshot of the container's current state.

```bash
./pm lxc snapshot create 200 before-update
```

### `lxc snapshot delete <ctid> <name>`

Remove a snapshot. The container itself is unaffected.

```bash
./pm lxc snapshot delete 200 before-update
```

### `lxc snapshot rollback <ctid> <name>`

Revert the container to a previous snapshot. **Destructive** — all changes since the snapshot are permanently discarded. Requires confirmation.

```bash
./pm lxc snapshot rollback 200 before-update
```

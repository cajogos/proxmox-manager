# LXC Commands

Same command structure as VMs. Container IDs use the `<ctid>` argument.
All commands auto-discover the container's node. Pass `--node <name>` to skip discovery.

## `lxc list`

```bash
./pm lxc list
./pm lxc list --format json
```

## `lxc status <ctid>` / `lxc config <ctid>`

```bash
./pm lxc status 200
./pm lxc config 200
```

## Lifecycle Actions

```bash
./pm lxc start 200
./pm lxc stop 200
./pm lxc shutdown 200
./pm lxc reboot 200
./pm lxc suspend 200
./pm lxc resume 200
```

## `lxc delete <ctid>`

Same double-confirmation as `vm delete`.

```bash
./pm lxc delete 200
```

## `lxc exec <ctid> [command...]`

Executes a command inside the container via `ssh root@<host> pct exec`. Requires SSH key-based root access to the Proxmox node.

```bash
./pm lxc exec 200 -- hostname
./pm lxc exec 200 -- apt-get update
```

## `lxc clone <ctid> <newid>`

Clone a container to a new ID.

```bash
./pm lxc clone 200 201
./pm lxc clone 200 201 --name my-clone
```

## `lxc resize <ctid> <disk> <size>`

Grow a container disk.

```bash
./pm lxc resize 200 rootfs +5G
```

## Snapshot Commands

### `lxc snapshot list <ctid>`

```bash
./pm lxc snapshot list 200
```

### `lxc snapshot create <ctid> <name>`

```bash
./pm lxc snapshot create 200 before-update
```

### `lxc snapshot delete <ctid> <name>`

```bash
./pm lxc snapshot delete 200 before-update
```

### `lxc snapshot rollback <ctid> <name>`

High-risk: requires confirmation. Current container state is permanently overwritten.

```bash
./pm lxc snapshot rollback 200 before-update
```

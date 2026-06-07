# Node Commands

## `node list`

List all Proxmox nodes in the cluster with online status, CPU usage, memory, disk, and uptime.

```bash
./pm node list
```

```
┌──────┬────────┬───────┬──────────────────────────┬──────────────────────────┬────────┐
│ Name │ Status │ CPU%  │ Memory                   │ Disk                     │ Uptime │
├──────┼────────┼───────┼──────────────────────────┼──────────────────────────┼────────┤
│ pve  │ online │ 12.4% │ 8.2 GB / 32.0 GB         │ 48.3 GB / 500.0 GB       │ 2d 14h │
└──────┴────────┴───────┴──────────────────────────┴──────────────────────────┴────────┘
1 node — 1 online · 0 offline
```

## `node status <node>`

Show detailed resource usage for a single node — CPU, memory, disk, network I/O, and kernel version.

```bash
./pm node status pve
./pm node status pve --format json
```

## `node version <node>`

Show the Proxmox VE version and package versions installed on the node.

```bash
./pm node version pve
```

## `node shutdown <node>` / `node reboot <node>`

Shut down or reboot a node. **High-risk** — before proceeding, the command fetches the count of running VMs and containers on that node and warns you. Requires a yes/no confirmation followed by typing `"I understand"` (case-insensitive).

```bash
./pm node shutdown pve
./pm node reboot pve
./pm node shutdown pve --dry-run    # print intent, no API call
```

## `node services list <node>`

List all system services on the node (e.g. `pveproxy`, `pvedaemon`, `corosync`) and their current state.

```bash
./pm node services list pve
```

## `node services restart <node> <service>`

Restart a specific system service on the node. Useful for applying config changes without a full reboot.

```bash
./pm node services restart pve pveproxy
```

## `node tasks list <node>`

List recent tasks on the node — backups, migrations, VM starts, API calls — with status and timestamps.

```bash
./pm node tasks list pve
./pm node tasks list pve --limit 50
```

## `node tasks log <node> <upid>`

Stream the full log output of a task identified by its UPID (Unique Process ID). UPIDs appear in task list output and are returned by long-running commands like `vm migrate`.

```bash
./pm node tasks log pve "UPID:pve:00001234:5:..."
```

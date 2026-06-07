# Node Commands

## `node list`

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

```bash
./pm node status pve
./pm node status pve --format json
```

## `node version <node>`

```bash
./pm node version pve
```

## `node shutdown <node>` / `node reboot <node>`

High-risk: fetches running workload count, shows a warning, requires yes/no confirm, then requires typing `"I understand"`.

```bash
./pm node shutdown pve
./pm node reboot pve
./pm node shutdown pve --dry-run
```

## `node services list <node>`

```bash
./pm node services list pve
```

## `node services restart <node> <service>`

```bash
./pm node services restart pve pveproxy
```

## `node tasks list <node>`

```bash
./pm node tasks list pve
./pm node tasks list pve --limit 50
```

## `node tasks log <node> <upid>`

```bash
./pm node tasks log pve "UPID:pve:00001234:5:..."
```

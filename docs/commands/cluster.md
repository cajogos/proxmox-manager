# Cluster Commands

## `cluster status`

Show the status of all nodes in the Proxmox cluster.

```bash
./pm cluster status
```

```
┌──────┬──────┬────────┬─────────────────┬──────────┬───────┐
│ Name │ Type │ ID     │ IP              │ Online   │ Nodes │
├──────┼──────┼────────┼─────────────────┼──────────┼───────┤
│ pve  │ node │ node/1 │ 192.168.1.180   │ online   │ -     │
└──────┴──────┴────────┴─────────────────┴──────────┴───────┘
1 cluster entry
```

## `cluster resources`

List all cluster resources. Optionally filter by type.

```bash
./pm cluster resources
./pm cluster resources --type vm
./pm cluster resources --type node
./pm cluster resources --type storage
```

## `cluster ha`

Show HA status for all managed resources.

```bash
./pm cluster ha
```

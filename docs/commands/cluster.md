# Cluster Commands

## `cluster status`

Show the membership and online state of all nodes in the Proxmox cluster, including node type, ID, IP address, and quorum information.

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

List all resources known to the cluster — VMs, containers, nodes, storage pools — in a single unified view. Optionally filter by resource type.

```bash
./pm cluster resources
./pm cluster resources --type vm
./pm cluster resources --type node
./pm cluster resources --type storage
```

## `cluster ha`

Show the High Availability status of all HA-managed resources, including their current state, assigned node, and CRM/LRM state.

```bash
./pm cluster ha
```

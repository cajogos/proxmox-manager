# Network Commands

## `network list <node>`

List network interfaces on a node.

```bash
./pm network list pve
```

```
┌────────┬────────┬────────┬──────────────────┬────────┬───────────┬──────────────┐
│ Iface  │ Type   │ Method │ Address          │ Active │ Autostart │ Bridge Ports │
├────────┼────────┼────────┼──────────────────┼────────┼───────────┼──────────────┤
│ eno1   │ eth    │ manual │ -                │ yes    │ yes       │ -            │
│ vmbr0  │ bridge │ static │ 192.168.1.180/24 │ yes    │ yes       │ eno1         │
└────────┴────────┴────────┴──────────────────┴────────┴───────────┴──────────────┘
2 interface(s)
```

## `network show <node> <iface>`

Show full detail for a single interface.

```bash
./pm network show pve vmbr0
```

## `network create <node>`

Create a new network interface on a node. Use `--type` to specify bridge, bond, or VLAN.

```bash
./pm network create pve --type bridge --iface vmbr1 --address 10.0.0.1/24
```

## `network update <node> <iface>`

Update an existing network interface configuration.

```bash
./pm network update pve vmbr1 --comments "VM network"
```

## `network delete <node> <iface>`

Delete a network interface configuration. Requires confirmation.

```bash
./pm network delete pve vmbr1
```

## `network apply <node>`

Apply pending network configuration changes on a node.

```bash
./pm network apply pve
```

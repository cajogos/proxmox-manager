# Network Commands

## `network list <node>`

List all network interfaces configured on a node — bridges, bonds, VLANs, and physical NICs — with their type, IP address, and active/autostart state.

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

Show the full configuration detail for a single network interface, including all options set in `/etc/network/interfaces`.

```bash
./pm network show pve vmbr0
```

## `network create <node>`

Create a new network interface on a node. Changes are staged and do not take effect until `network apply` is run.

```bash
./pm network create pve --type bridge --iface vmbr1 --address 10.0.0.1/24
```

## `network update <node> <iface>`

Update an existing interface configuration. Changes are staged and do not take effect until `network apply` is run.

```bash
./pm network update pve vmbr1 --comments "VM network"
```

## `network delete <node> <iface>`

Remove a network interface configuration from a node. Changes are staged and do not take effect until `network apply` is run. Requires confirmation.

```bash
./pm network delete pve vmbr1
```

## `network apply <node>`

Apply all pending (staged) network configuration changes on the node. This activates new or modified interfaces without requiring a reboot.

```bash
./pm network apply pve
```

# Firewall Commands

Manage Proxmox firewall rules at the cluster level, per VM, and per LXC container. Rules are applied in order by position index (0-based).

## Cluster Firewall

### `firewall cluster list`

List all firewall rules applied at the cluster level, showing position, action, direction, and match criteria.

```bash
./pm firewall cluster list
```

### `firewall cluster create`

Add a new rule to the cluster firewall. At minimum, `--action` and `--type` are required.

```bash
./pm firewall cluster create --action ACCEPT --type in --proto tcp --dport 22
./pm firewall cluster create --action DROP --type in --source 10.0.0.0/8 --comment "Block LAN"
./pm firewall cluster create --macro SSH --action ACCEPT --type in
```

| Flag | Description |
|---|---|
| `--action <action>` | `ACCEPT`, `DROP`, or `REJECT` |
| `--type <dir>` | Direction: `in` or `out` |
| `--source <addr>` | Source address/CIDR |
| `--dest <addr>` | Destination address/CIDR |
| `--proto <proto>` | Protocol: `tcp`, `udp`, `icmp`, etc. |
| `--dport <port>` | Destination port or range (e.g. `80`, `8000:8080`) |
| `--sport <port>` | Source port or range |
| `--macro <name>` | Proxmox firewall macro (e.g. `SSH`, `HTTP`, `HTTPS`) |
| `--comment <text>` | Human-readable label for the rule |
| `--enable` | Enable the rule immediately on creation |

### `firewall cluster delete <pos>`

Delete the cluster firewall rule at the given position index. All subsequent rules shift up by one.

```bash
./pm firewall cluster delete 0
```

## VM Firewall

### `firewall vm list <vmid>`

List all firewall rules for a specific VM.

```bash
./pm firewall vm list 100
./pm firewall vm list 100 --node pve
```

### `firewall vm create <vmid>`

Add a firewall rule to a VM. Accepts the same flags as `firewall cluster create`.

```bash
./pm firewall vm create 100 --action ACCEPT --type in --proto tcp --dport 80
```

### `firewall vm delete <vmid> <pos>`

Delete a VM firewall rule by position index.

```bash
./pm firewall vm delete 100 0
```

## LXC Firewall

### `firewall lxc list <ctid>`

List all firewall rules for a specific LXC container.

```bash
./pm firewall lxc list 200
```

### `firewall lxc create <ctid>`

Add a firewall rule to a container. Accepts the same flags as `firewall cluster create`.

```bash
./pm firewall lxc create 200 --action ACCEPT --type in --proto tcp --dport 443
```

### `firewall lxc delete <ctid> <pos>`

Delete a container firewall rule by position index.

```bash
./pm firewall lxc delete 200 0
```

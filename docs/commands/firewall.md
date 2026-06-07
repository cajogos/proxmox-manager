# Firewall Commands

Manage Proxmox firewall rules at the cluster level, per VM, and per LXC container.

## Cluster Firewall

### `firewall cluster list`

```bash
./pm firewall cluster list
```

### `firewall cluster create`

Add a rule to the cluster firewall.

```bash
./pm firewall cluster create --action ACCEPT --type in --proto tcp --dport 22
./pm firewall cluster create --action DROP --type in --source 10.0.0.0/8 --comment "Block LAN"
./pm firewall cluster create --macro SSH --action ACCEPT --type in
```

| Flag | Description |
|---|---|
| `--action <action>` | `ACCEPT`, `DROP`, or `REJECT` |
| `--type <dir>` | `in` or `out` |
| `--source <addr>` | Source address/CIDR |
| `--dest <addr>` | Destination address/CIDR |
| `--proto <proto>` | Protocol: `tcp`, `udp`, `icmp`, etc. |
| `--dport <port>` | Destination port or range |
| `--sport <port>` | Source port or range |
| `--macro <name>` | Proxmox firewall macro (e.g. `SSH`, `HTTP`) |
| `--comment <text>` | Rule comment |
| `--enable` | Enable rule immediately |

### `firewall cluster delete <pos>`

Delete a cluster firewall rule by its position index.

```bash
./pm firewall cluster delete 0
```

## VM Firewall

### `firewall vm list <vmid>`

```bash
./pm firewall vm list 100
./pm firewall vm list 100 --node pve
```

### `firewall vm create <vmid>`

Add a rule to a VM's firewall. Accepts the same flags as `firewall cluster create`.

```bash
./pm firewall vm create 100 --action ACCEPT --type in --proto tcp --dport 80
```

### `firewall vm delete <vmid> <pos>`

```bash
./pm firewall vm delete 100 0
```

## LXC Firewall

### `firewall lxc list <ctid>`

```bash
./pm firewall lxc list 200
```

### `firewall lxc create <ctid>`

Add a rule to a container's firewall. Accepts the same flags as `firewall cluster create`.

```bash
./pm firewall lxc create 200 --action ACCEPT --type in --proto tcp --dport 443
```

### `firewall lxc delete <ctid> <pos>`

```bash
./pm firewall lxc delete 200 0
```

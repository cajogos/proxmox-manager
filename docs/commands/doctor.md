# Doctor Command

## `doctor`

A full first-run health check that combines config validation, connectivity testing, and a live cluster summary in one command. Unlike `config check`, it also fetches node-level detail (PVE version, CPU, memory, disk, uptime) for every reachable node.

```bash
./pm doctor
```

Output:

```
proxmox-manager doctor
Checking your configuration and connectivity…

Configuration
  ✓ config.json loaded successfully
  Profiles: homelab
  Default profile: homelab
  Audit log: /home/user/.proxmox-manager/audit.log
  ✓ defaultProfile is set

Connectivity
  ✓ Profile "homelab" — reachable
    Nodes: pve
    TLS: self-signed allowed

Cluster — "homelab"
  ✓ pve (pve/8.2.4)
    CPU: 12%
    Memory: 45% of 32.0 GB
    Disk: 22%
    Uptime: 5d

✓ All profiles connected successfully.
```

Exits with a non-zero code if any profile fails.

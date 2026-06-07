# Doctor Command

## `doctor`

Connectivity test + version check + config summary in one command. Good first-run experience.

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

Exits non-zero if any profile fails.

# Config Commands

## `config check`

Validate `config.json` — checks that the file parses correctly, all required fields are present, and then attempts to connect to each configured profile's Proxmox host. Useful for initial setup and CI health checks.

```bash
./pm config check
```

Output:

```
Config file: OK
Profiles found: homelab
Default profile: homelab
Audit log: /home/user/.proxmox-manager/audit.log

✓  [homelab] Connected — 1 node visible
```

Exits with a non-zero code if any profile fails to connect, making it suitable as a pre-flight check in scripts and CI pipelines.

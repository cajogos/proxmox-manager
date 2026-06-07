# Config Commands

## `config check`

Validate `config.json`, resolve all profiles, and confirm connectivity to each host. Useful for onboarding and CI.

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

Exits non-zero if any profile fails to connect.

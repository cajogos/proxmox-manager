# Proxmox API Tokens

This guide walks through creating an API token in Proxmox VE and adding it to your proxmox-manager config.

## Why API tokens?

API tokens are safer than passwords: they can be scoped to specific permissions, revoked independently, and never give full account access when privilege separation is enabled.

## Step 1: Create a dedicated user (recommended)

In the Proxmox web UI, go to **Datacenter → Permissions → Users** and click **Add**.

| Field | Value |
|---|---|
| User name | `proxmox-manager` |
| Realm | `pam` or `pve` |
| Password | Any (won't be used for API access) |

Using a dedicated user makes it easy to audit and revoke access later.

## Step 2: Assign permissions

Go to **Datacenter → Permissions** and click **Add → User Permission**.

| Field | Value |
|---|---|
| Path | `/` (root — all resources) |
| User | `proxmox-manager@pam` |
| Role | `PVEAdmin` (or a custom role — see below) |
| Propagate | checked |

### Minimum permissions (custom role)

If you want to restrict access, create a custom role at **Datacenter → Permissions → Roles** with these privileges:

- `VM.Audit`, `VM.Config.CDROM`, `VM.Config.CPU`, `VM.Config.Disk`, `VM.Config.HWType`, `VM.Config.Memory`, `VM.Config.Network`, `VM.Config.Options`, `VM.PowerMgmt`, `VM.Clone`, `VM.Migrate`, `VM.Snapshot`, `VM.Snapshot.Rollback`, `VM.Allocate`
- `Sys.Audit`, `Sys.Modify`
- `Datastore.Audit`, `Datastore.AllocateSpace`, `Datastore.AllocateTemplate`
- `SDN.Audit`
- `User.Modify` (for access management commands)

## Step 3: Create the API token

Go to **Datacenter → Permissions → API Tokens** and click **Add**.

| Field | Value |
|---|---|
| User | `proxmox-manager@pam` |
| Token ID | `proxmox-manager` |
| Privilege Separation | unchecked (recommended for simplicity) |

Click **Add**. Proxmox shows the token secret **once** — copy it immediately.

## Step 4: Add to config

The token ID shown in the UI is `user@realm!token-name`. Add it to your `config.json`:

```json
{
  "profiles": {
    "homelab": {
      "host": "192.168.1.100",
      "port": 8006,
      "API_TOKEN_ID": "proxmox-manager@pam!proxmox-manager",
      "API_TOKEN_SECRET": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "rejectUnauthorized": false
    }
  }
}
```

## Step 5: Verify

```bash
./pm doctor
```

A successful run shows all green checks. If you see a `401 Unauthorized` error, double-check the token ID format — it must include `@realm!token-name`.

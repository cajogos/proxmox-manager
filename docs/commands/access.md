# Access Commands

Manage Proxmox users, groups, roles, and API tokens. These map directly to Proxmox's built-in permission system.

## `access user list`

List all users in the Proxmox realm, showing their enabled state, group membership, and email.

```bash
./pm access user list
```

```
┌──────────────┬──────┬───────────────────┬─────────┬────────┬─────────┐
│ UserID       │ Name │ Email             │ Enabled │ Groups │ Comment │
├──────────────┼──────┼───────────────────┼─────────┼────────┼─────────┤
│ root@pam     │ -    │ -                 │ yes     │ -      │ -       │
│ admin@pam    │ -    │ admin@example.com │ yes     │ admins │ -       │
└──────────────┴──────┴───────────────────┴─────────┴────────┴─────────┘
2 user(s)
```

## `access user show <userid>`

Show all details for a single user, including their realm, expiry, group memberships, and existing API tokens.

```bash
./pm access user show root@pam
```

## `access group list`

List all groups. Groups are used to assign permissions to multiple users at once via ACLs.

```bash
./pm access group list
```

## `access role list`

List all roles and the privilege set each role grants. Proxmox ships with built-in roles (`Administrator`, `PVEVMAdmin`, etc.); custom roles can also be created via the web UI.

```bash
./pm access role list
```

## `access token list <userid>`

List all API tokens belonging to a user, showing token ID, expiry, and privilege separation setting.

```bash
./pm access token list root@pam
```

## `access token create <userid> <tokenid>`

Create a new API token for a user. The token secret is printed **once** immediately after creation — it cannot be retrieved again. Store it securely.

```bash
./pm access token create root@pam my-token
./pm access token create root@pam ci-token --comment "CI pipeline" --privsep 1
./pm access token create root@pam temp-token --expire 1767225600
```

| Flag | Description |
|---|---|
| `--comment <text>` | Human-readable label for the token |
| `--expire <epoch>` | Expiry as a Unix timestamp (0 = no expiry) |
| `--privsep 0\|1` | Privilege separation: `1` limits the token to its own ACLs, `0` gives it the full user permissions |

## `access token delete <userid> <tokenid>`

Permanently revoke an API token. Once deleted, any automation using that token will lose access immediately. Requires confirmation.

```bash
./pm access token delete root@pam my-token
./pm access token delete root@pam my-token --yes
./pm access token delete root@pam my-token --dry-run
```

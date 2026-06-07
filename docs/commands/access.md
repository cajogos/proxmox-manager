# Access Commands

## `access user list`

List all Proxmox users.

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

Show detail for a single user.

```bash
./pm access user show root@pam
```

## `access group list`

List all groups.

```bash
./pm access group list
```

## `access role list`

List all roles.

```bash
./pm access role list
```

## `access token list <userid>`

List API tokens for a user.

```bash
./pm access token list root@pam
```

## `access token create <userid> <tokenid>`

Create an API token. The secret value is printed **once** and cannot be retrieved again.

```bash
./pm access token create root@pam my-token
./pm access token create root@pam ci-token --comment "CI pipeline" --privsep 1
./pm access token create root@pam temp-token --expire 1767225600
```

| Flag | Description |
|---|---|
| `--comment <text>` | Token comment |
| `--expire <epoch>` | Expiry as Unix timestamp (0 = no expiry) |
| `--privsep 0\|1` | Privilege separation (1 = limited to token's ACLs, 0 = inherit user) |

## `access token delete <userid> <tokenid>`

Delete an API token. Requires confirmation.

```bash
./pm access token delete root@pam my-token
./pm access token delete root@pam my-token --yes
./pm access token delete root@pam my-token --dry-run
```

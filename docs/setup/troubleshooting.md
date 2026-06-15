# Troubleshooting

Common errors and how to fix them.

## TLS certificate error

**Error:** `unable to verify the first certificate` or `self-signed certificate`

**Cause:** Proxmox uses a self-signed TLS certificate by default, and Node.js rejects it.

**Fix:** Set `rejectUnauthorized: false` in your profile:

```json
{
  "profiles": {
    "homelab": {
      "rejectUnauthorized": false
    }
  }
}
```

Never set this on a public-facing server.

## 401 Unauthorized

**Error:** `Request failed: 401` or `authentication failure`

**Cause:** Wrong token ID format or wrong secret.

**Fix:** The token ID must be in the exact format `user@realm!token-name`, for example:

```
root@pam!proxmox-manager
admin@pve!my-token
```

Check the Proxmox UI under `Datacenter → Permissions → API Tokens` to confirm the exact ID. The secret is only shown once at creation — if lost, delete and recreate the token.

## Connection refused / ECONNREFUSED

**Error:** `connect ECONNREFUSED 192.168.1.100:8006`

**Cause:** The Proxmox host is unreachable, or the port is wrong.

**Fix:**
1. Confirm the host IP is correct and reachable: `ping 192.168.1.100`
2. Confirm port 8006 is open: `curl -k https://192.168.1.100:8006`
3. Check that `pveproxy` is running on the Proxmox host: `systemctl status pveproxy`

## `./pm doctor` output interpretation

`doctor` runs a series of connectivity and permission checks:

| Check | What it tests |
|---|---|
| Config loaded | `config.json` exists and parses correctly |
| Profile exists | `defaultProfile` (or `--profile`) exists in config |
| API reachable | HTTP GET to `/api2/json/version` succeeds |
| Auth valid | API token is accepted (not 401) |
| Node list | Can list cluster nodes (basic read permission) |

A red X on "API reachable" means network/TLS issues. A red X on "Auth valid" means the token ID or secret is wrong.

## Config file not found

**Error:** `Cannot find config file`

**Fix:** Run `./pm` from the project root directory, or copy `config.example.json` to `config.json`:

```bash
cp config.example.json config.json
```

## Web UI shows blank page

**Cause:** Usually a Vite proxy misconfiguration or the API server isn't running.

**Fix:**
1. In dev mode, ensure both processes are running: `pnpm web:dev`
2. Check the browser console for network errors
3. Confirm the API server is up: `curl http://localhost:3000/health`

## TypeScript build errors

**Fix:** Run `pnpm typecheck` to see the errors. The most common cause is missing types for new packages. Run `pnpm add -D @types/package-name` to add them.

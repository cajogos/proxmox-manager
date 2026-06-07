# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # compile TypeScript → dist/
pnpm typecheck      # type-check without emitting (run before every commit)
pnpm start          # run via tsx (dev mode, no build needed)
```

Run the CLI:
```bash
node dist/index.js <command> [options]               # compiled
./node_modules/.bin/tsx src/index.ts <command>       # dev
```

> `pnpm start -- <args>` does not work in pnpm v11 — it forwards `--` literally to tsx. Use `node dist/index.js` or `tsx src/index.ts` directly.

There are no tests yet. Type-check is the primary correctness gate.

## Architecture

**Stack:** TypeScript 6 (CommonJS, strict), Commander.js v15, Axios, Zod v4, chalk v4.

**Entry point:** `src/index.ts` → `src/cli/program.ts` (Commander root + global flags) → command modules.

### Key layers

| Layer | Path | Role |
|---|---|---|
| Config | `src/config/` | Zod-validated config loading; auto-detects legacy vs. new format |
| API client | `src/api/client.ts` | Axios wrapper with token auth and self-signed TLS; all requests go through here |
| API endpoints | `src/api/endpoints/` | Per-resource functions (`vm.ts`, future: `lxc.ts`, `node.ts`, …) |
| Safeguards | `src/safeguards/` | Three independent guards run before every destructive action |
| Audit log | `src/audit/logger.ts` | Appends one JSON line per action to a configurable path |
| Output | `src/output/formatter.ts` | Renders `Record<string, unknown>[]` as table / json / csv |
| CLI commands | `src/cli/commands/` | One subdirectory per resource type; each registers subcommands onto a `Command` |

### Safeguard pipeline (destructive commands only)

Every mutating command must run these three checks **in order** before calling the API:

1. `checkProtected(type, id, safeguards)` — throws if the resource is in the protected list
2. `checkDryRun(isDryRun, action, resource)` — prints intent and returns `true` to skip execution
3. `confirmAction(action, resource, skipConfirm)` — interactive prompt; respects `--yes`

Then call the API and call `audit()` with the result regardless of success or failure.

### Adding a new command

Follow the pattern in `src/cli/commands/vm/`:

1. Create `src/api/endpoints/<resource>.ts` with typed API calls via `ProxmoxClient`.
2. Create `src/cli/commands/<resource>/` with `index.ts` (registers the command group) and one file per subcommand.
3. Each action: `loadConfig()` → `resolveProfile()` → `configureAuditLog()` → safeguard pipeline → API call → `audit()`.
4. Register the new command group in `src/cli/program.ts`.
5. Update `docs/plan/phase_N.md` checklist and `README.md` tutorial section.

### Config format (Zod v4)

`z.record()` requires two arguments in Zod v4: `z.record(z.string(), ValueSchema)`. The loader auto-upgrades the legacy flat format (`{ "profile-name": { API_TOKEN_ID, API_TOKEN_SECRET } }`) to the structured format at runtime — `config.json` itself is never rewritten.

**Proxmox API:** `https://<host>:<port>/api2/json`. All responses wrap data in `{ data: T }`. The client unwraps it automatically. Auth header: `PVEAPIToken=<API_TOKEN_ID>=<API_TOKEN_SECRET>`.

### Development phases

Implementation is split into phases tracked in `docs/plan/phase_*.md`. Each phase doc has a **Requirements** section at the top and a tickable **Checklist** at the bottom. After completing any phase, update the checklist, write a mini-tutorial, and update `README.md`.

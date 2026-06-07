# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # compile TypeScript → dist/
pnpm typecheck      # type-check without emitting (run before every commit)
pnpm cli            # run CLI via tsx (dev mode, no build needed)
pnpm web            # run API server via tsx (dev mode)
pnpm web:dev        # run API server + Vite dev server concurrently
pnpm web:server     # API server only (alias for pnpm web)
pnpm web:ui         # Vite dev server only (cd web && pnpm dev)
pnpm build:web      # production build of the React app → web/dist/
```

Run the CLI directly:
```bash
./pm <command> [options]                             # dev (preferred — no pnpm noise)
node dist/index.js <command> [options]               # compiled
./node_modules/.bin/tsx src/index.ts <command>       # dev (explicit)
```

> `pnpm cli` always echoes the command to stderr — use `./pm` instead.

There are no tests yet. Type-check is the primary correctness gate.

## Architecture

**Stack:** TypeScript 6 (CommonJS, strict), Commander.js v15, Axios, Zod v4, chalk v4.

**Entry point:** `src/index.ts` → `src/cli/program.ts` (Commander root + global flags) → command modules.

### Key layers

| Layer | Path | Role |
|---|---|---|
| Config | `src/config/` | Zod-validated config loading; auto-detects legacy vs. new format |
| API client | `src/api/client.ts` | Axios wrapper with token auth and self-signed TLS; all requests go through here |
| API endpoints | `src/api/endpoints/vm.ts` | VM API calls — list, status, config, lifecycle actions, snapshot CRUD; exports `getNodes()` and `NodeInfo` |
| API endpoints | `src/api/endpoints/lxc.ts` | LXC API calls — same set as VM plus `execLXC()` (SSH via child_process) |
| API endpoints | `src/api/endpoints/node.ts` | Node API calls — status, version, shutdown/reboot, services, tasks; reuses `getNodes()` from vm.ts |
| API endpoints | `src/api/endpoints/storage.ts` | Storage API calls — list pools (dedup by node), content, upload, delete; `listAllBackups()` |
| API endpoints | `src/api/endpoints/cluster.ts` | Cluster API calls — status entries, resources (with optional type filter), HA status |
| API endpoints | `src/api/endpoints/network.ts` | Network API calls — list interfaces per node, get single interface detail |
| API endpoints | `src/api/endpoints/access.ts` | Access API calls — users, groups, roles |
| API endpoints | `src/api/endpoints/vzdump.ts` | Backup job API calls — list, get, create, delete scheduled jobs |
| **Services** | `src/services/vm.ts` | VM business logic — `resolveVMNode()` for auto-discovery, service functions returning `CommandResult<T>` |
| **Services** | `src/services/lxc.ts` | LXC business logic — mirrors vm.ts, adds `execLXCService()` |
| **Services** | `src/services/node.ts` | Node business logic — 9 service functions; safeguards handled in CLI layer |
| **Services** | `src/services/storage.ts` | Storage business logic — 6 service functions; `--node` required for node-scoped calls |
| **Services** | `src/services/cluster.ts` | Cluster business logic — 3 service functions |
| **Services** | `src/services/network.ts` | Network business logic — 2 service functions |
| **Services** | `src/services/access.ts` | Access business logic — 4 service functions (users, groups, roles) |
| **Services** | `src/services/vzdump.ts` | Backup job business logic — 4 service functions |
| Safeguards | `src/safeguards/` | Three independent guards run before every destructive action |
| Audit log | `src/audit/logger.ts` | Appends one JSON line per action; `source` field distinguishes `"cli"` from `"web"` |
| Output | `src/output/formatter.ts` | Renders `Record<string, unknown>[]` as table / json / csv; accepts `OutputOptions` for column alignment and summary line |
| Output helpers | `src/output/colors.ts` | `statusColor()`, `successMsg()`, `errorMsg()`, `warnMsg()`, `dryRunMsg()` |
| Output helpers | `src/output/humanize.ts` | `humanMB()`, `humanSeconds()`, `humanBytes()` |
| Output helpers | `src/output/spinner.ts` | `startSpinner(text)` — thin ora v5 wrapper; returns `stop()` and `setText(t)` for live progress updates |
| CLI commands | `src/cli/commands/` | Thin wrappers: call a service, format the result, write the audit entry |
| Web server | `src/server/index.ts` | Bootstrap: loads config, mounts middleware and routers, listens on `SERVER_PORT` (default 3000) |
| Web middleware | `src/server/middleware/profile.ts` | Resolves profile from `?profile=` query or `X-Profile` header; attaches to `req.profileName` |
| Web middleware | `src/server/middleware/error.ts` | Express 5 catch-all error handler: `(err, req, res, next)` → `{ ok: false, error }` |
| Web routes | `src/server/routes/` | Route files: `vms.ts`, `lxc.ts`, `nodes.ts`, `storage.ts` — each exports a factory `xxxRouter(config)` |
| Web UI | `web/` | React + Vite frontend; own `package.json` + `tsconfig.json`; workspace member via `pnpm-workspace.yaml` |
| Web API client | `web/src/api/client.ts` | Typed `fetch` wrappers: `getVMs`, `getLXC`, `getNodes`, `getStorage`, `vmAction`, `lxcAction` |

### Safeguard pipeline (destructive commands only)

Every mutating command must run these three checks **in order** before calling the API:

1. `checkProtected(type, id, safeguards)` — throws if the resource is in the protected list
2. `checkDryRun(isDryRun, action, resource)` — prints intent and returns `true` to skip execution
3. `confirmAction(action, resource, skipConfirm)` — interactive prompt; respects `--yes`

Then call the API and call `audit()` with the result regardless of success or failure.

**Node shutdown/reboot additional flow:** after the standard safeguard pipeline, fetch running VMs + LXC on the target node, show an affected-workload count warning, then require typing `"I understand"` (case-insensitive) before proceeding.

### Adding a new command

Follow the pattern in `src/cli/commands/vm/` and `src/services/vm.ts`:

1. Create `src/api/endpoints/<resource>.ts` — raw API calls via `ProxmoxClient`.
2. Create `src/services/<resource>.ts` — service functions returning `CommandResult<T>` (see `src/services/types.ts`). These are the shared layer.
3. Create `src/cli/commands/<resource>/` — thin CLI wrappers: `loadConfig()` → call service → format output → `audit()`.
4. Add route handlers in `src/server/` that call the same service functions and return JSON.
5. Register the command group in `src/cli/program.ts`.
6. Update `docs/plan/phase_N.md` checklist and `docs/COMMANDS.md` with new commands.

### Config format (Zod v4)

`z.record()` requires two arguments in Zod v4: `z.record(z.string(), ValueSchema)`. The loader auto-upgrades the legacy flat format (`{ "profile-name": { API_TOKEN_ID, API_TOKEN_SECRET } }`) to the structured format at runtime — `config.json` itself is never rewritten.

**Proxmox API:** `https://<host>:<port>/api2/json`. All responses wrap data in `{ data: T }`. The client unwraps it automatically. Auth header: `PVEAPIToken=<API_TOKEN_ID>=<API_TOKEN_SECRET>`.

### Development phases

Phases 1–8 are complete. The remaining work is tracked in two files:

- **`docs/plan/final_phase.md`** — Incomplete scope from phases 7–8 (VM live migration, API token CRUD, web routes + UI pages for cluster/network/access/backup). Each section has a Requirements block and a tickable Checklist.
- **`docs/plan/ideas.md`** — Future ideas and observations, not yet committed to.

After completing any item from `final_phase.md`:

1. Tick all relevant checklist items in `docs/plan/final_phase.md`
2. Update `README.md` — add any new features to the Features list
3. Update `docs/COMMANDS.md` — update example output and add new commands
4. Update `CLAUDE.md` — reflect new layers, helpers, or patterns added

### CLI output conventions (Phase 2+)

Every command must follow this pattern:

- **Spinner** — `startSpinner(text)` before any API call; `spinner.stop()` immediately after
- **Status color** — use `statusColor(status)` from `src/output/colors.ts`; apply only for table format
- **Humanize** — memory via `humanMB(mb)`, uptime via `humanSeconds(s)`, disk via `humanBytes(b)`
- **Boolean columns** — template/flag fields: `chalk.dim('label')` (table) or plain string (json/csv), `-` for false
- **Summary line** — compute count + per-status breakdown; pass as `opts.summary` to `output()`
- **Column alignment** — pass `colAligns` to `output()`: right-align numeric columns (IDs, counts, sizes)
- **Message palette** — use `successMsg()`, `errorMsg()`, `warnMsg()`, `dryRunMsg()` for all non-data output
- **Upload progress** — `startSpinner()` returns `setText(t)` to update spinner text in-place; pass `(pct) => spinner.setText(...)` as `onProgress` to upload services
- **`output()` arg order** — always `output(data, format, opts?)` — data first. Cast `opts.format as OutputFormat` when passing from Commander's `string`-typed options. Import `OutputFormat` from `src/output/formatter.ts`.
- **Profile name** — always call `const { name: profileName } = resolveProfile(config, opts.profile)` before setting `auditBase.profile`; never use `opts.profile ?? config.defaultProfile` (both can be undefined)

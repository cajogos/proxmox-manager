# Phase 1: Core Infrastructure + VM Listing

## Requirements

- Scaffold the TypeScript project with pnpm, `.nvmrc` (v24.16.0), and `tsconfig.json`
- Implement a config system supporting both legacy flat format and the new structured format
  - Legacy: `{ "profile-name": { "API_TOKEN_ID": "...", "API_TOKEN_SECRET": "..." } }`
  - New: `{ "defaultProfile": "...", "auditLog": {...}, "profiles": {...} }`
  - Missing fields (host, port, rejectUnauthorized, safeguards) default to safe values
- Implement an API client that authenticates via Proxmox API tokens
  - Header: `Authorization: PVEAPIToken=<API_TOKEN_ID>=<API_TOKEN_SECRET>`
  - Supports self-signed TLS certificates via `rejectUnauthorized: false`
- Implement an audit logger that writes every action as a JSON line
  - Default path: `~/.proxmox-manager/audit.log`
  - Configurable path via `config.json`
  - Creates the directory if it does not exist
- Implement safeguard primitives:
  - `dryRun.ts` — print intent and return early without executing
  - `confirm.ts` — interactive yes/no prompt before destructive actions
  - `protected.ts` — reject actions on resources in the protected list
- Implement an output formatter supporting `--format table|json|csv`
- Implement the Commander.js CLI with global flags:
  - `--profile <name>` — select config profile
  - `--format <format>` — output format (default: `table`)
  - `--dry-run` — simulate without executing
  - `--yes` — skip confirmation prompts
- Implement the first real command: `vm list`
  - Lists all VMs across all nodes with: VMID, Name, Status, Node, CPUs, Memory, Template flag
  - Every execution is recorded in the audit log (success or failure)

## Implementation

### Files Created

| File | Purpose |
|---|---|
| `src/index.ts` | CLI entry point with shebang |
| `src/cli/program.ts` | Commander root program + global flags |
| `src/cli/commands/vm/index.ts` | VM command group registration |
| `src/cli/commands/vm/list.ts` | `vm list` action |
| `src/api/client.ts` | Axios Proxmox API client |
| `src/api/endpoints/vm.ts` | VM-specific API calls |
| `src/config/types.ts` | Zod schemas + inferred types |
| `src/config/loader.ts` | Config file loading + profile resolution |
| `src/audit/logger.ts` | JSON-lines audit log writer |
| `src/safeguards/dryRun.ts` | Dry-run check helper |
| `src/safeguards/confirm.ts` | Interactive confirmation prompt |
| `src/safeguards/protected.ts` | Protected-resource guard |
| `src/output/formatter.ts` | table / json / csv formatter |

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `commander` | ^12 | CLI framework |
| `axios` | ^1 | HTTP client |
| `zod` | ^3 | Config validation |
| `prompts` | ^2 | Interactive prompts |
| `cli-table3` | ^0.6 | Table output |
| `chalk` | ^4 | Coloured terminal output |
| `tsx` | ^4 | Dev-time TypeScript runner |
| `typescript` | ^5 | Compiler |
| `@types/node` | ^22 | Node.js types |
| `@types/prompts` | ^2 | Prompts types |
| `@types/cli-table3` | ^0.6 | cli-table3 types |

## Checklist

- [x] `.nvmrc` set to `v24.16.0`
- [x] `package.json` created with scripts and bin entry
- [x] `tsconfig.json` configured (CommonJS, strict, ES2022)
- [x] `.gitignore` extended (`dist/`, `node_modules/`, `logs/`)
- [x] `config.example.json` created
- [x] `src/config/types.ts` — Zod schemas
- [x] `src/config/loader.ts` — legacy + new format support
- [x] `src/api/client.ts` — token auth + self-signed cert
- [x] `src/api/endpoints/vm.ts` — list VMs across nodes
- [x] `src/audit/logger.ts` — JSON-lines audit writer
- [x] `src/safeguards/dryRun.ts`
- [x] `src/safeguards/confirm.ts`
- [x] `src/safeguards/protected.ts`
- [x] `src/output/formatter.ts` — table/json/csv
- [x] `src/cli/program.ts` — Commander root + global flags
- [x] `src/cli/commands/vm/index.ts`
- [x] `src/cli/commands/vm/list.ts`
- [x] `src/index.ts`
- [x] `pnpm install` — all dependencies installed
- [x] `pnpm build` — compiles with no errors
- [x] `pnpm typecheck` — no type errors
- [x] `pnpm start -- --help` — CLI help displayed
- [x] `pnpm start -- vm list --format table` — VMs listed
- [x] `pnpm start -- vm list --format json` — JSON output verified
- [x] `~/.proxmox-manager/audit.log` written after each command
- [x] README.md updated with Phase 1 tutorial

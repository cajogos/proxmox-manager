# Phase 8: CLI Aesthetics

> **Recommended order:** Complete before Phase 2 so every new command inherits the patterns.

## Requirements

### Status colorization
- `running` → `chalk.green`
- `stopped` → `chalk.red`
- `suspended` → `chalk.yellow`
- Any other status → `chalk.gray`
- Applied at the service layer so both table and JSON/CSV strip it correctly via the existing `stripAnsi` path

### Human-readable values
- Memory: raw MB → `4 096 MB` shown as `4.0 GB` (or `512 MB` left as MB below 1 024)
- Uptime seconds (Phase 2+): formatted as `3d 14h 22m`
- Disk sizes in GB/TB wherever exposed

### Compact table layout
- Remove per-row horizontal separators (currently every row has `├──┼──┤` lines)
- Keep top/bottom border and header separator only
- Achieved via `cli-table3` `compact: true` option

### Column alignment
- Numeric columns (VMID, CPUs, Memory) right-aligned
- String columns left-aligned (default)

### Summary line
- Printed below every listing table in `chalk.gray`
- Format: `8 VMs — 7 running · 1 stopped` (counts derived from the data, not a separate API call)
- Omitted for `--format json` and `--format csv`

### Template / boolean columns
- `Yes` → `chalk.dim('template')`, `No` → `-` (or blank)
- Reduces noise in the common case where nothing is a template

### Consistent message palette
All non-data output uses a fixed palette — applied in CLI command wrappers and error handlers:

| Intent | Style |
|---|---|
| Success | `chalk.green('✓')` prefix |
| Error | `chalk.red('✗')` prefix |
| Warning | `chalk.yellow('!')` prefix |
| Dry-run notice | `chalk.cyan('[dry-run]')` prefix |
| Info / dim secondary text | `chalk.gray` |

### Spinner for API calls
- Show an `ora` spinner while waiting for any Proxmox API response
- Spinner stops (and is cleared) before output is printed
- Disabled automatically when stdout is not a TTY (`ora` handles this)

### `--no-color` / TTY awareness
- chalk already respects `NO_COLOR` and non-TTY stdout — no extra work needed
- Verify JSON/CSV paths produce clean output (already handled by `stripAnsi`)

## New dependency

| Package | Purpose |
|---|---|
| `ora` | Elegant terminal spinner |

## Files to change

| File | Change |
|---|---|
| `src/output/formatter.ts` | Compact table, column alignment, summary line, boolean rendering |
| `src/output/colors.ts` | **New** — `statusColor(status)`, `successMsg()`, `errorMsg()`, `warnMsg()`, `dryRunMsg()` helpers |
| `src/output/humanize.ts` | **New** — `humanMB(mb)`, `humanSeconds(s)`, `humanBytes(b)` |
| `src/output/spinner.ts` | **New** — thin `ora` wrapper: `startSpinner(text)` → returns `{ stop() }` |
| `src/cli/commands/vm/list.ts` | Use spinner; pass status through `statusColor` before handing to formatter |
| Any future command | Follow same pattern: spinner → service call → stop spinner → format |

## Checklist

- [ ] `ora` installed
- [ ] `src/output/colors.ts` — status and message palette helpers
- [ ] `src/output/humanize.ts` — MB/bytes/seconds formatters
- [ ] `src/output/spinner.ts` — ora wrapper
- [ ] `src/output/formatter.ts` — compact layout, right-aligned numeric columns, summary line, boolean rendering
- [ ] `vm list` — spinner active during API call, status colored, memory humanized, template column compact
- [ ] JSON output clean (no ANSI in any field)
- [ ] CSV output clean
- [ ] `--no-color` verified (run with `NO_COLOR=1 ./pm vm list`)
- [ ] Non-TTY verified (run `./pm vm list | cat` — no spinner, no ANSI)
- [ ] `pnpm build` + `pnpm typecheck` pass
- [ ] README.md updated with Phase 8 screenshot/example

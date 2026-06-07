# Backup Commands

Manage `vzdump` scheduled backup jobs. These are cluster-level jobs that run on a cron schedule and write backup archives to a designated storage pool.

## `backup list`

List all scheduled backup jobs with their ID, enabled state, schedule, target storage, scope (node/VMs), backup mode, and compression.

```bash
./pm backup list
```

```
┌──────────────────────┬─────────┬─────────────┬─────────┬──────┬───────┬──────────┬──────────┐
│ ID                   │ Enabled │ Schedule    │ Storage │ Node │ VMIDs │ Mode     │ Compress │
├──────────────────────┼─────────┼─────────────┼─────────┼──────┼───────┼──────────┼──────────┤
│ backup-nightly       │ yes     │ 0 2 * * *   │ backups │ all  │ all   │ snapshot │ zstd     │
└──────────────────────┴─────────┴─────────────┴─────────┴──────┴───────┴──────────┴──────────┘
1 backup job(s)
```

## `backup show <id>`

Show the full configuration of a single backup job, including all options not shown in the list view.

```bash
./pm backup show backup-nightly
```

## `backup create`

Create a new scheduled backup job. The `--storage` flag is required; all other options have defaults. Prompts for confirmation before creating.

```bash
./pm backup create --storage backups --schedule "0 3 * * *" --mode snapshot --compress zstd
./pm backup create --storage backups --node pve --vmid 100,101 --yes
```

| Flag | Description |
|---|---|
| `--storage <name>` | Storage pool to write backup archives to (required) |
| `--schedule <cron>` | Cron expression for when to run (default: `0 0 * * *`) |
| `--node <name>` | Restrict backups to a specific node (default: all nodes) |
| `--vmid <ids>` | Comma-separated VM/LXC IDs to back up (default: all) |
| `--mode <mode>` | How to quiesce the guest: `snapshot` (no downtime), `suspend`, or `stop` |
| `--compress <algo>` | Compression algorithm: `zstd` (recommended), `gzip`, `lzo`, or `0` (none) |

## `backup delete <id>`

Delete a scheduled backup job. This removes the job definition only — existing backup archives on storage are not affected. Prompts for confirmation.

```bash
./pm backup delete backup-nightly
./pm backup delete backup-nightly --yes
```

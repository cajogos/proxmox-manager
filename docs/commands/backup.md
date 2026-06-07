# Backup Commands

## `backup list`

List all scheduled backup jobs.

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

Show detail for a single backup job.

```bash
./pm backup show backup-nightly
```

## `backup create`

Create a new scheduled backup job. Requires `--storage`. Prompts for confirmation.

```bash
./pm backup create --storage backups --schedule "0 3 * * *" --mode snapshot --compress zstd
./pm backup create --storage backups --node pve --vmid 100,101 --yes
```

| Flag | Description |
|---|---|
| `--storage <name>` | Storage pool to write backups to (required) |
| `--schedule <cron>` | Cron expression (default: `0 0 * * *`) |
| `--node <name>` | Restrict to a specific node (default: all) |
| `--vmid <ids>` | Comma-separated VM/LXC IDs (default: all) |
| `--mode <mode>` | Backup mode: `snapshot`, `suspend`, or `stop` |
| `--compress <algo>` | Compression: `zstd`, `gzip`, `lzo`, or `0` |

## `backup delete <id>`

Delete a backup job. Prompts for confirmation.

```bash
./pm backup delete backup-nightly
./pm backup delete backup-nightly --yes
```

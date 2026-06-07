# Storage Commands

## `storage list`

List all storage pools across the cluster — type, node, capacity, usage percentage, and supported content types. Pools that appear on multiple nodes are deduplicated.

```bash
./pm storage list
```

```
┌───────────┬─────────┬──────┬──────────┬──────────┬──────────┬───────┬──────────────────────┐
│ Name      │ Type    │ Node │ Avail    │ Used     │ Total    │ Used% │ Content              │
├───────────┼─────────┼──────┼──────────┼──────────┼──────────┼───────┼──────────────────────┤
│ local     │ dir     │ pve  │ 400.0 GB │ 100.0 GB │ 500.0 GB │ 20.0% │ iso,vztmpl,backup    │
│ local-zfs │ zfspool │ pve  │ 120.0 GB │  80.0 GB │ 200.0 GB │ 40.0% │ images,rootdir       │
└───────────┴─────────┴──────┴──────────┴──────────┴──────────┴───────┴──────────────────────┘
2 storage pool(s)
```

## `storage status <storage>`

Show detailed status for a single storage pool on a specific node, including type, path, and enabled content types. Requires `--node <name>`.

```bash
./pm storage status local --node pve
```

## `storage content list <storage>`

List all content items (ISOs, templates, backups, disk images) inside a storage pool. Requires `--node <name>`. Filter by type with `--type`.

```bash
./pm storage content list local --node pve
./pm storage content list local --node pve --type iso
./pm storage content list local --node pve --type backup
```

## `storage content upload <storage> <file>`

Upload a local file to a storage pool. Shows live upload progress via the spinner. Requires `--node <name>`. Default content type is `iso`; use `--content vztmpl` for container templates.

```bash
./pm storage content upload local ubuntu-24.04.iso --node pve
./pm storage content upload local debian-12.tar.zst --node pve --content vztmpl
```

## `storage content delete <storage> <volid>`

Delete a content item from a storage pool by its volume ID. Requires `--node <name>` and confirmation.

```bash
./pm storage content delete local "local:iso/ubuntu-24.04.iso" --node pve
```

## `storage backup list`

List all backup archive files (`.vma`, `.tar`) across all nodes and storage pools that have `backup` in their content type.

```bash
./pm storage backup list
./pm storage backup list --format json
```

## `storage backup delete <volid>`

Delete a backup archive. Requires `--node <name>`, `--storage <name>`, and confirmation.

```bash
./pm storage backup delete "local:backup/vzdump-qemu-100-2026_06_01.vma.zst" \
  --node pve --storage local
```

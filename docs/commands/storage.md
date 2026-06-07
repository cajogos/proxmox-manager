# Storage Commands

## `storage list`

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

Requires `--node <name>`.

```bash
./pm storage status local --node pve
```

## `storage content list <storage>`

Requires `--node <name>`. Optionally filter by `--type iso|vztmpl|backup`.

```bash
./pm storage content list local --node pve
./pm storage content list local --node pve --type iso
```

## `storage content upload <storage> <file>`

Requires `--node <name>`. Shows live upload progress. Default content type is `iso`; use `--content vztmpl` for templates.

```bash
./pm storage content upload local ubuntu-24.04.iso --node pve
./pm storage content upload local debian-12.tar.zst --node pve --content vztmpl
```

## `storage content delete <storage> <volid>`

Requires `--node <name>`. Requires confirmation.

```bash
./pm storage content delete local "local:iso/ubuntu-24.04.iso" --node pve
```

## `storage backup list`

Lists all backup files across all nodes and storage pools.

```bash
./pm storage backup list
./pm storage backup list --format json
```

## `storage backup delete <volid>`

Requires `--node <name>` and `--storage <name>`. Requires confirmation.

```bash
./pm storage backup delete "local:backup/vzdump-qemu-100-2026_06_01.vma.zst" \
  --node pve --storage local
```

# Phase 7: Full API Coverage

## Requirements

- Cover remaining Proxmox API surface areas not handled in phases 1–5
- This phase is defined incrementally — scoped at the start of each sub-phase

### Planned Sub-phases

| Sub-phase | Area |
|---|---|
| 6a | Cluster management (cluster status, HA, migrations) |
| 6b | Network configuration (bridges, bonds, VLANs per node) |
| 6c | Firewall rules (datacenter and per-VM/node) |
| 6d | User and permission management (users, groups, roles, API tokens) |
| 6e | Certificate management (ACME, custom certs) |
| 6f | Backup jobs (scheduled backups via vzdump) |
| 6g | Replication jobs |
| 6h | SDN (Software Defined Networking) |

### General Requirements (all sub-phases)

- All write/destructive operations pass through the safeguard pipeline
- All actions logged to audit log
- `--format table|json|csv` supported on all listing commands
- Protected resource lists respected

## Implementation

_To be detailed at the start of each sub-phase._

## Checklist

- [ ] 6a — Cluster management
- [ ] 6b — Network configuration
- [ ] 6c — Firewall rules
- [ ] 6d — User and permission management
- [ ] 6e — Certificate management
- [ ] 6f — Backup jobs
- [ ] 6g — Replication jobs
- [ ] 6h — SDN
- [ ] Full API surface audit (compare against Proxmox API docs)
- [ ] README.md updated with Phase 6 capabilities

# Ideas & Future Observations

Things noticed during the implementation phases that are worth revisiting — not committed to, not prioritised.

## CLI

- **Storage auto-discovery** — `storage content list` requires `--node`; could auto-discover the first available node that holds the storage pool, mirroring the `resolveVMNode()` pattern used for VMs and LXC.

- **Network write commands** — Phase 7b (network) is read-only. Proxmox supports creating and applying bridge/bond/VLAN config via `POST /nodes/{node}/network` and `PUT /nodes/{node}/network`. Useful for provisioning automation.

- **VM/LXC clone** — `POST /nodes/{node}/qemu/{vmid}/clone` and its LXC equivalent are high-value operations not yet exposed. Would fit naturally next to `vm delete`.

- **VM/LXC resize disk** — `PUT /nodes/{node}/qemu/{vmid}/resize` for growing a disk without snapshot/rollback risk.

- **Firewall rules** — Per-VM and cluster-level firewall management (`/cluster/firewall`, `/nodes/{node}/qemu/{vmid}/firewall`).

- **SDN (Software-Defined Networking)** — `/cluster/sdn` endpoints for VNets, zones, and subnets — relevant for large multi-tenant setups.

## Web UI

- **WebSocket interactive shell** — `lxc exec` currently shells out via SSH + `child_process.spawnSync`. A proper interactive terminal in the web UI would use a WebSocket relay to the Proxmox `vnc`/`term` endpoint or directly to the node.

- **Web-parity for destructive actions** — The web UI only exposes start/shutdown/stop. Snapshot management, node reboot, storage upload/delete, and backup job management are all CLI-only. A dedicated "advanced" panel per resource would close the gap.

- **Web routes for cluster/network/access/backup** — The Express API server only has routes for VMs, LXC, nodes, and storage. Cluster status, network interfaces, users/groups/roles, and scheduled backup jobs are not reachable from the browser.

- **Tailwind / shadcn build phase** — Tailwind CSS v4 and shadcn/ui were added in a standalone commit with no accompanying phase doc. A proper UI redesign phase should document the component library conventions, theming decisions, and which pages have been migrated.

- **Real-time updates** — Long-poll or SSE to push task status updates to the browser without manual refresh.

## Infrastructure

- **Test suite** — There are no tests. Unit tests for service functions (mocking the API client) and integration tests against a test Proxmox instance would catch regressions that `pnpm typecheck` cannot.

- **Config validation CLI command** — A `pm config check` command that validates `config.json`, resolves all profiles, and confirms connectivity to each host. Useful for onboarding and CI checks.

- **`pm doctor`** — Connectivity test + version check + config summary in one command. Good first-run experience.

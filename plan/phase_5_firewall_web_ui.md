# Phase 5: Firewall Web UI

**Priority: MEDIUM** — CLI has full firewall CRUD; this brings it to the web UI.

## Goal

Add a Firewall section to the web UI covering cluster-level, per-VM, and per-LXC firewall rules.

---

## Requirements

### Navigation
- Add "Firewall" entry to the sidebar `Layout.tsx`

### Firewall Page (`/firewall`)
Tabs:
1. **Cluster Rules** — rules at the cluster level
2. **VM Rules** — selector for a VM (dropdown), then rules list
3. **LXC Rules** — selector for a container, then rules list

### Rules Table (per tab)
Columns: Position, Type (IN/OUT), Action (ACCEPT/DROP/REJECT), Source, Destination, Protocol, Port, Comment, Enabled

Actions per row:
- Delete (with confirmation)
- Toggle enabled/disabled

### Create Rule Dialog
Fields: Type (IN/OUT), Action (ACCEPT/DROP/REJECT), Source (CIDR/IP/alias), Destination, Protocol, Dest Port, Comment, Enabled

---

## Implementation Checklist

### API Routes (new)
- [ ] `GET /api/firewall/cluster` — list cluster rules
- [ ] `POST /api/firewall/cluster` — create cluster rule
- [ ] `DELETE /api/firewall/cluster/:pos` — delete cluster rule
- [ ] `GET /api/firewall/vms/:vmid` — list VM rules
- [ ] `POST /api/firewall/vms/:vmid` — create VM rule
- [ ] `DELETE /api/firewall/vms/:vmid/:pos` — delete VM rule
- [ ] `GET /api/firewall/lxc/:vmid` — list LXC rules
- [ ] `POST /api/firewall/lxc/:vmid` — create LXC rule
- [ ] `DELETE /api/firewall/lxc/:vmid/:pos` — delete LXC rule
- [ ] `src/server/routes/firewall.ts` — new route file (follow existing route pattern)
- [ ] Mount in `src/server/index.ts`

### Web
- [ ] `web/src/api/client.ts` — add firewall functions
- [ ] `web/src/pages/Firewall.tsx` — new page with tabs
- [ ] `web/src/components/FirewallRulesTable.tsx` — reusable rules table
- [ ] `web/src/components/CreateFirewallRuleDialog.tsx`
- [ ] `web/src/components/Layout.tsx` — add Firewall nav entry
- [ ] `web/src/App.tsx` — register `/firewall` route

### Reuse
- Services already exist: `src/services/firewall.ts` (cluster, VM, LXC CRUD)
- API endpoints already exist: `src/api/endpoints/firewall.ts`

---

## Key Files

| File | Change |
|---|---|
| `src/services/firewall.ts` | Read-only — already complete |
| `src/server/routes/firewall.ts` | New file |
| `src/server/index.ts` | Mount firewall router |
| `web/src/api/client.ts` | Add firewall calls |
| `web/src/pages/Firewall.tsx` | New file |
| `web/src/components/Layout.tsx` | Add nav entry |
| `web/src/App.tsx` | Register route |

---

## Verification

```bash
pnpm web:dev

# Firewall appears in sidebar
# Cluster Rules tab: create a rule, verify it appears, delete it
# VM Rules tab: pick a VM, create rule, delete rule
# LXC Rules tab: same
# Check audit log: firewall actions logged with source: 'web'
```

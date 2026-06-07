# Phase 8: Web UI

## Requirements

- Add a React + Vite web frontend in `web/` alongside the existing CLI `src/`
- Add an Express API server in `src/server/` that exposes Proxmox operations as REST endpoints
  - Reuses the existing `ProxmoxClient`, config loader, audit logger, and safeguard pipeline
  - All write operations pass through the same safeguard pipeline as the CLI
  - API server reads `config.json` from the same search paths as the CLI
- The web frontend communicates only with the local API server — Proxmox credentials never reach the browser
- Every action taken via the Web UI is written to the audit log identically to CLI actions (with `source: "web"` in the entry)
- The API server and Web UI are startable with a single command (`pnpm web:dev`)

### Folder structure

```
proxmox-manager/
├── src/
│   └── server/
│       ├── index.ts              # Bootstrap: load config, mount middleware and routes, listen
│       ├── middleware/
│       │   ├── error.ts          # Catch-all Express error handler
│       │   └── profile.ts        # Extract profile from query or X-Profile header
│       └── routes/
│           ├── vms.ts            # GET /api/vms, GET /api/vms/:vmid, POST /api/vms/:vmid/:action
│           ├── lxc.ts            # GET /api/lxc, GET /api/lxc/:ctid, POST /api/lxc/:ctid/:action
│           ├── nodes.ts          # GET /api/nodes, GET /api/nodes/:node, /services, /tasks
│           └── storage.ts        # GET /api/storage, GET /api/storage/:storage/content
├── web/
│   ├── index.html
│   ├── vite.config.ts            # Proxy /api and /health → http://localhost:3000
│   ├── package.json              # Separate: react, react-dom, react-router-dom, vite, typescript
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx               # Routes: / → VMs, /lxc, /nodes, /storage
│       ├── api/client.ts         # Typed fetch wrappers (getVMs, getLXC, getNodes, getStorage, vmAction, lxcAction)
│       ├── components/Layout.tsx # Nav sidebar + <Outlet />
│       └── pages/
│           ├── VMs.tsx           # VM list with Start/Shutdown/Stop actions
│           ├── LXC.tsx           # Container list with actions
│           ├── Nodes.tsx         # Node list with CPU/memory/uptime
│           ├── Storage.tsx       # Storage pool list
│           └── NotFound.tsx
└── pnpm-workspace.yaml           # Includes both . and web
```

## Implementation

### 8a — Server restructure

Rewrote `src/server/index.ts` from a monolith into a routed architecture:
- `profileMiddleware` attaches resolved profile name to `req.profileName` (from `?profile=` or `X-Profile` header)
- `errorHandler` is a standard Express 5 catch-all: `(err, req, res, next)` → `{ ok: false, error }`
- Each route file exports a factory function `xxxRouter(config)` returning an Express `Router`
- VM and LXC action routes dispatch to `vmActionService`/`lxcActionService` with a validated action set

### 8b — React + Vite scaffold

- `web/` has its own `package.json` and `tsconfig.json` — entirely separate from CLI TypeScript build
- `pnpm-workspace.yaml` extended to include `web` so `pnpm install` at root installs both
- Vite proxies `/api` and `/health` to `http://localhost:3000` in dev mode
- Pages use inline styles, no CSS framework — dark theme matching the CLI aesthetic

### 8c — Scripts

```bash
pnpm web:server    # API server only (tsx src/server/index.ts)
pnpm web:ui        # Vite dev server only (cd web && pnpm dev)
pnpm web:dev       # Both concurrently (requires concurrently devDep)
pnpm build:web     # Production build of the React app (cd web && pnpm build)
```

## Checklist

- [x] API server restructured into middleware + routed architecture
- [x] `src/server/middleware/error.ts` — catch-all error handler
- [x] `src/server/middleware/profile.ts` — profile resolution from query/header
- [x] `src/server/routes/vms.ts` — GET /api/vms, GET /api/vms/:vmid, POST /api/vms/:vmid/:action
- [x] `src/server/routes/lxc.ts` — GET /api/lxc, GET /api/lxc/:ctid, POST /api/lxc/:ctid/:action
- [x] `src/server/routes/nodes.ts` — GET /api/nodes, /:node, /services, /tasks, /tasks/:upid/log
- [x] `src/server/routes/storage.ts` — GET /api/storage, /:storage/content
- [x] Audit log entries include `source: "web"` for all VM and LXC actions
- [x] React + Vite scaffold in `web/`
- [x] `web/src/api/client.ts` — typed fetch wrappers for all endpoints
- [x] Global layout with navigation sidebar (`Layout.tsx`)
- [x] VM list page with Start / Shutdown / Stop action buttons
- [x] LXC list page with Start / Shutdown / Stop action buttons
- [x] Node list and status page (CPU %, memory, uptime)
- [x] Storage list page
- [x] `pnpm web:dev` starts both API server and Vite concurrently
- [x] `pnpm build:web` compiles the React app
- [x] `concurrently` added as root devDependency
- [x] `pnpm-workspace.yaml` updated to include `web`
- [x] `README.md` updated — phase marked ✅, features list updated
- [x] `docs/COMMANDS.md` updated — API endpoint examples added
- [x] `CLAUDE.md` updated — server layers documented

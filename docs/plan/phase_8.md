# Phase 8: Web UI

## Requirements

- Add a React + Vite web frontend in `web/` alongside the existing CLI `src/`
- Add an Express/Fastify API server in `src/server/` that exposes Proxmox operations as REST endpoints
  - Reuses the existing `ProxmoxClient`, config loader, audit logger, and safeguard pipeline
  - All write operations pass through the same safeguard pipeline as the CLI
  - API server reads `config.json` from the same search paths as the CLI
- The web frontend communicates only with the local API server — Proxmox credentials never reach the browser
- Authentication between the browser and the API server (at minimum: a shared secret or session token configured in `config.json`)
- Web UI must implement at minimum everything exposed by Phase 1–6 CLI commands
- Every action taken via the Web UI is written to the audit log identically to CLI actions (with `source: "web"` in the entry)
- The API server and Web UI should be startable with a single command

### Suggested sub-phases

| Sub-phase | Scope |
|---|---|
| 7a | API server scaffold (Express/Fastify, auth middleware, health endpoint) |
| 7b | VM endpoints wired to existing API client + safeguards |
| 7c | React + Vite scaffold in `web/`, global layout, connection to API server |
| 7d | VM list and status pages |
| 7e | VM lifecycle actions (start, stop, shutdown, reboot, snapshots) |
| 7f | LXC, Node, Storage pages |
| 7g | Audit log viewer page |
| 7h | Settings/profile management page |

### Folder structure (proposed)

```
proxmox-manager/
├── src/                  # Existing CLI source
│   └── server/           # New: Express/Fastify API server
│       ├── index.ts      # Server entry point
│       ├── middleware/   # Auth, error handling, audit
│       └── routes/       # Per-resource route handlers
├── web/                  # New: React + Vite frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json      # Separate package.json for web deps
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       ├── pages/
│       └── api/          # Typed fetch wrappers for the API server
└── dist/                 # CLI output (existing)
└── dist-web/             # Web build output
```

## Implementation

_To be detailed at the start of Phase 7._

## Checklist

- [ ] API server scaffold with auth middleware
- [ ] VM REST endpoints (GET /api/vms, POST /api/vms/:id/start, etc.)
- [ ] Safeguard pipeline wired into API server routes
- [ ] Audit log entries include `source: "web"`
- [ ] React + Vite scaffold in `web/`
- [ ] Global layout with navigation
- [ ] VM list page
- [ ] VM detail / action page
- [ ] LXC list and action page
- [ ] Node list and status page
- [ ] Storage list page
- [ ] Audit log viewer page
- [ ] Single start command (`pnpm run web` or similar)
- [ ] `pnpm build` compiles both CLI and Web UI
- [ ] `README.md` updated — phase marked ✅, features list updated
- [ ] `docs/COMMANDS.md` updated — example output and new commands documented
- [ ] `CLAUDE.md` updated — new layers, helpers, or patterns reflected

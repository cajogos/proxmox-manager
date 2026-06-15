# Web UI

proxmox-manager includes a React web UI served by the same Express API server.

## Development mode

Run the API server and Vite dev server together:

```bash
pnpm web:dev
```

This starts:
- Express API server on `http://localhost:3000`
- Vite dev server on `http://localhost:5173` (proxies `/api` requests to port 3000)

Open `http://localhost:5173` in your browser. Hot module reload is active — changes to `web/src/**` apply instantly.

### Separate processes

If you need to run them independently:

```bash
pnpm web:server   # API server only (port 3000)
pnpm web:ui       # Vite dev server only (port 5173)
```

## Production deployment

### Step 1: Build the React app

```bash
pnpm build:web
```

This compiles the frontend to `web/dist/`.

### Step 2: Start the server

```bash
pnpm web
```

The Express server serves the static files from `web/dist/` and falls back to `index.html` for any unmatched route (SPA mode). The UI and API run on the same port.

### Custom port

Set the port via environment variable or `serverPort` in `config.json`:

```bash
SERVER_PORT=8080 pnpm web
```

## Profile selection

The web UI sends requests to the API with no profile by default, which uses the `defaultProfile` from config. To target a specific profile, append `?profile=name` to any API request, or set the `X-Profile` header.

## WebSocket terminal

The terminal feature uses WebSocket at `ws://localhost:3000/ws/terminal/{ctid}`. It works in both development (via Vite proxy) and production.

## SSE task streaming

Long-running Proxmox tasks stream status via Server-Sent Events at `GET /api/tasks/:upid/stream`. The web UI polls this endpoint to show live task progress.

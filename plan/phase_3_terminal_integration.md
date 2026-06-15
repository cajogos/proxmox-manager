# Phase 3: Terminal Integration (Web UI)

**Priority: MEDIUM** — Backend already complete; this is purely a UI wiring task.

## Goal

Connect the existing `Terminal.tsx` xterm.js component to the existing WebSocket backend (`/ws/terminal/{ctid}`) so users can open a terminal directly in the browser for LXC containers.

---

## Current State

- **Backend:** `src/server/terminal.ts` — WebSocket upgrade at `/ws/terminal/{ctid}` proxies to Proxmox termproxy + vncwebsocket. Already wired in `src/server/index.ts`.
- **Frontend:** `web/src/components/Terminal.tsx` — xterm.js component exists but is not rendered anywhere in the page tree.
- **Missing:** a "Terminal" button on the LXC page that opens the terminal for a specific container.

---

## Requirements

- "Terminal" button on each LXC row (running containers only)
- Clicking opens a full-screen or panel-style xterm.js terminal
- Terminal connects to `ws://localhost:3000/ws/terminal/{ctid}`
- Closing the panel disconnects the WebSocket
- Profile passed as query parameter if needed

---

## Implementation Checklist

- [ ] Read `web/src/components/Terminal.tsx` — confirm props interface (expects `ctid: number`?)
- [ ] Read `src/server/terminal.ts` — confirm auth/query param requirements
- [ ] Add "Terminal" button to LXC table rows in `web/src/pages/LXC.tsx` (only for `status === 'running'`)
- [ ] Add terminal panel/modal state: `terminalCtid: number | null`
- [ ] Render `<Terminal ctid={terminalCtid} />` conditionally
- [ ] Add close button / ESC handler to dismiss

---

## Key Files

| File | Change |
|---|---|
| `web/src/pages/LXC.tsx` | Add "Terminal" button per row, terminal panel state |
| `web/src/components/Terminal.tsx` | Verify/adjust props; ensure it connects to correct WS URL |
| `src/server/terminal.ts` | Read-only audit (likely no changes needed) |

---

## Verification

```bash
# Start server
pnpm web:dev

# Open http://localhost:5173 → LXC page
# Running container should show "Terminal" button
# Click → xterm.js terminal opens, connects to container shell
# Type commands, verify output, close terminal
```

# Phase 8: Docs Section — Setup Guides & LLM-Friendly Layer ✅ COMPLETE

**Priority: MEDIUM** — Onboarding friction reduction; also enables AI assistants to self-serve context about the tool.

## Goal

Extend the existing docs infrastructure with a **Setup & Configuration** section (new markdown files) and an **LLM-friendly layer** (`/llms.txt` endpoint + consolidated raw-markdown API) so that both humans browsing the UI and LLMs fetching context can understand how to set the tool up and use it.

---

## Current State

- `docs/commands/*.md` — 13 per-command reference files
- `GET /api/docs` → list of files; `GET /api/docs/:file` → raw markdown
- `Documentation.tsx` — sidebar + `react-markdown` renderer, currently shows only "Commands" section
- No setup/onboarding content exists anywhere

---

## Requirements

### 8.1 — Setup Guide Markdown Files

New directory: `docs/setup/`

| File | Content |
|---|---|
| `quickstart.md` | Install → config → first `./pm doctor` run; 5-minute path to working state |
| `proxmox-api-tokens.md` | Step-by-step: create a Proxmox API token with the required permissions, copy values into config |
| `configuration.md` | Full `config.json` schema (profiles, `defaultProfile`, `serverPort`, `safeguards`, `auditLog`); legacy format upgrade note |
| `web-ui.md` | Running `pnpm web:dev` vs production (`pnpm build:web` + `pnpm web`); proxy config; port defaults |
| `troubleshooting.md` | Common errors: TLS self-signed cert, wrong token format, unreachable Proxmox host, `doctor` output interpretation |

Each file should be clean, structured markdown — short paragraphs, code blocks for commands/JSON, no decorative HTML.

### 8.2 — Extended Docs API

Extend `src/server/routes/docs.ts` to serve from two sections:

```
GET /api/docs              → { sections: [{ name, files: [{ name, file, section }] }] }
GET /api/docs/:section/:file  → raw markdown content
```

Backward-compat: keep `GET /api/docs/:file` (commands section only) for any existing consumers.

Two sections:
- `commands` → `docs/commands/*.md` (existing)
- `setup` → `docs/setup/*.md` (new)

### 8.3 — LLM-Friendly Endpoints

**`GET /llms.txt`** (plain text, `text/plain`)

A single file following the [`llms.txt` convention](https://llmstxt.org/) served at the root. Contains:
- One-paragraph project description
- Bulleted list of key capabilities
- Config file schema (inlined)
- Link list to each doc section with a one-line description

Served directly by Express before SPA fallback — not a markdown file, a generated response.

**`GET /api/docs/llms-context`** (JSON)

Returns a single consolidated markdown string — all setup guide files concatenated with `---` separators. Useful for pasting into an LLM context window or fetching programmatically.

```json
{ "ok": true, "data": "# Setup Guides\n\n## Quick Start\n..." }
```

### 8.4 — Updated Web UI Docs Page

Split the sidebar into two collapsible sections:

```
▼ Setup & Configuration
    Quick Start
    Proxmox API Tokens
    Configuration
    Web UI
    Troubleshooting

▼ Command Reference
    Global Flags
    vm
    lxc
    ...
```

Default selected: "Quick Start" (first setup doc) instead of first command.

Add a small "Copy LLM context" button (top-right of docs page) that fetches `/api/docs/llms-context` and copies the raw markdown to the clipboard. One click for users who want to paste project context into an AI assistant.

---

## Implementation Checklist

### Content
- [ ] Write `docs/setup/quickstart.md`
- [ ] Write `docs/setup/proxmox-api-tokens.md`
- [ ] Write `docs/setup/configuration.md`
- [ ] Write `docs/setup/web-ui.md`
- [ ] Write `docs/setup/troubleshooting.md`

### Backend
- [ ] Extend `src/server/routes/docs.ts`:
  - Update `GET /api/docs` to return sections
  - Add `GET /api/docs/:section/:file` (validate both params)
  - Add `GET /api/docs/llms-context` (concatenate setup docs)
  - Add `GET /llms.txt` directly in `src/server/index.ts` (before SPA fallback)
- [ ] Keep backward-compat `GET /api/docs/:file` for commands

### Web UI
- [ ] Update `web/src/api/client.ts` — update `getDocs()` / `getDocFile()` for new section-based API
- [ ] Update `web/src/pages/Documentation.tsx`:
  - Two-section sidebar (Setup & Configuration, Command Reference)
  - Collapsible sections using `<details>` or state-driven accordion
  - Default to first setup doc on load
  - "Copy LLM context" button (top-right)

---

## Key Files

| File | Change |
|---|---|
| `docs/setup/*.md` | New files (5) |
| `src/server/routes/docs.ts` | Add sections, `llms-context` endpoint |
| `src/server/index.ts` | Add `GET /llms.txt` handler |
| `web/src/api/client.ts` | Update `getDocs`, `getDocFile` |
| `web/src/pages/Documentation.tsx` | Two-section sidebar, copy button |

---

## LLM-Friendliness Principles

All markdown in `docs/setup/` must follow these rules so LLMs can extract structured information reliably:

- Use ATX headings (`#`, `##`, `###`) — no underline style
- Wrap every shell command in a fenced code block with `bash` language tag
- Wrap every JSON snippet in a fenced code block with `json` language tag
- No HTML in markdown files
- Keep paragraphs short (3–4 sentences max)
- Lead each section with a one-sentence summary of what it covers

---

## Verification

```bash
# Setup docs render in UI
pnpm web:dev
# → open /docs → "Setup & Configuration" section visible
# → Quick Start is default selection
# → all 5 setup docs render without errors

# LLM endpoints
curl http://localhost:3000/llms.txt          # returns plain text
curl http://localhost:3000/api/docs/llms-context | jq .data  # returns joined markdown

# Copy button
# → click "Copy LLM context" on docs page → paste into terminal → see raw markdown

# Backward compat
curl http://localhost:3000/api/docs/vm.md    # still works
```

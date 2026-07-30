---
name: Testing AI Workforce SaaS
description: How to run and end-to-end test the AI Workforce SaaS monorepo (FastAPI backend + React/Vite frontend).
---

# Testing AI Workforce SaaS

## Run it
- Backend: `cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --port 8000`
  - No API keys needed — uses a deterministic simulation AI provider (seeds data on startup).
  - API prefix is **`/api/v1`** (e.g. `POST /api/v1/auth/login`). Health is at `/health` (no prefix).
- Frontend: `cd frontend && npm install && npm run dev` → http://localhost:5173. Vite proxies `/api` and `/ws` → :8000.

## Login
Demo: `founder@acme.ai` / `password`.

## Key flow mechanics (for adversarial tests)
- Creating a goal (New goal modal; LinkedIn+Instagram preselected; title required to enable "Launch workforce") POSTs a task and the orchestrator drives ~11+ steps at `STEP_DELAY=0.5s`, stopping at "Requesting approval" (status `waiting_approval`, ~83%).
- The task-detail **timeline** updates live via a react-query poll every 2s. The **Content tab** does NOT poll (`["content"]` query has no refetchInterval) — generated posts only appear after a page refresh. Expect to reload to see content.
- Publishing + Analytics steps run only after **all** approvals for the task are resolved (Approvals page → Approve). Then the task resumes to Completed/100% and creates ScheduledPosts (+3h, then +1 day per extra post).
- The green **"Live"** badge in the top bar = WebSocket connected (`/ws?token=...`).

## Known cosmetic quirks (not bugs)
- Subtitle says "18 autonomous employees" / Billing "18 AI employees" but 20 agent cards render (Dashboard says 20).
- Knowledge Base Upload button and Billing are intentionally static/simulated in Phase 1.

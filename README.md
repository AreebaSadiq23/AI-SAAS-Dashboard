# AI Workforce SaaS

A production-oriented **AI Workforce** platform for autonomous social media management.
This is not a chatbot — it is a team of autonomous AI employees coordinated by a **Master
Orchestrator** that turns a business goal into researched, written, approved, scheduled and
analyzed social media content.

> User gives a goal → the Orchestrator plans it → specialized agents execute → one deliverable comes back.

## Monorepo layout

```
ai-workforce-saas/
├── backend/          FastAPI + clean architecture (orchestrator, agents, WebSockets, JWT)
│   └── app/
│       ├── core/           config + security (JWT / password hashing)
│       ├── schemas/        Pydantic request/response models
│       ├── repositories/   repository pattern over the data store
│       ├── services/       service layer + orchestrator + AI agents
│       ├── api/routes/     versioned REST API
│       ├── ws/             WebSocket connection manager (live task timeline)
│       └── data/           realistic seeded demo data
├── frontend/         React 19 + TypeScript + Vite + Tailwind + Zustand + TanStack Query
│   └── src/
│       ├── components/     reusable UI + layout
│       ├── pages/          one page per dashboard section
│       ├── lib/            API client, query hooks, websocket
│       └── store/          Zustand stores (auth, theme)
└── docker-compose.yml
```

## Architecture

- **Master Orchestrator** — receives a goal, decomposes it into tasks, assigns each to the
  correct agent, tracks progress, retries failures, merges results and returns one deliverable.
  No agent calls another agent directly; all communication flows through the Orchestrator.
- **AI employees** — Planner, Research, SEO, Content Writer, Brand Voice, platform agents
  (LinkedIn / Instagram / Facebook / X / TikTok / Pinterest / Threads / YouTube), Image Prompt,
  Approval, Publishing, Analytics, Memory, Notification. Each agent exposes responsibilities,
  goals, inputs, outputs, memory, status, logs and events.
- **Live task timeline** — every task streams step events (`planning → researching → …
  → completed`) over a WebSocket so the UI shows real-time progress.
- **Clean architecture** — API → service layer → repository → data store, with Pydantic
  schemas and dependency injection. The default data store is in-memory (seeded with realistic
  data) so the app runs with zero infrastructure; a PostgreSQL/Redis-backed store is the
  intended production drop-in.

## Quick start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:5173

Demo login: `founder@acme.ai` / `password`

### Docker
```bash
docker compose up --build
```

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion,
TanStack Query, Zustand, Recharts.

**Backend:** FastAPI, Python, Pydantic v2, JWT, WebSockets, (Redis + PostgreSQL + background
workers as production drop-ins).

**AI:** provider-agnostic layer with adapters for OpenAI, Anthropic, Gemini and Ollama. The MVP
ships with a deterministic simulation provider so the full workflow runs without API keys.

## Roadmap

- **Phase 1 (this repo):** full architecture, orchestrator + agent framework, live task
  timeline, complete dashboard with realistic data, JWT auth, dark/light mode.
- **Phase 2:** real social OAuth connectors, live AI provider calls, Postgres + Redis +
  background workers, Stripe billing.
# AI-SAAS-Dashboard

# Test Report — AI Workforce SaaS (Phase 1)

**How tested:** Ran the app locally — FastAPI backend (`uvicorn` :8000, deterministic simulation provider) + React/Vite frontend (:5173, proxying `/api` and `/ws`). Logged in as `founder@acme.ai` and exercised every golden path end-to-end in the browser, driving a real goal from creation → live timeline → approval → scheduling → analytics.

**Overall:** All 7 planned tests passed. No console errors across the entire run. Two non-blocking issues noted (see below).

---

## Issues found (non-blocking)

1. **Content tab needs a manual refresh (minor UX).** On the task detail page, after the writer agent finishes, the **Content** tab still showed the empty-state ("Content will appear here once the writer agent finishes") until I reloaded the page. Cause: the task query polls every 2s but the `["content"]` query has no `refetchInterval`, so newly generated content doesn't appear live like the timeline does. After refresh, both posts rendered correctly. Not a correctness bug, but the content does not appear "live" the way the timeline does.
2. **"18 employees" label vs 20 agents (cosmetic).** The AI Workforce page subtitle says "18 autonomous employees" and Billing says "All 18 AI employees", but the Dashboard says "20 agents" and 20 agent cards actually render (across 5 category groups). Inconsistent copy; functionality is fine.

Neither blocked any flow. Phase-1 simulated items (Upload disabled "coming in phase 2", static billing) behaved as intended.

---

## Test results

### 1. Login → populated Dashboard — PASS
Landed on Dashboard with 2 active tasks, 2 completed, 2 pending approvals, 44.5k followers, a rendered reach chart, and a green **Live** badge (WebSocket connected).

![Dashboard populated](https://app.devin.ai/attachments/b54510e9-5549-4948-b024-3a519afeb2a8/ss_bc676eec.png)

### 2. AI Workforce — 20 agents grouped, detail view — PASS
20 agents render in 5 category groups (Orchestrator / Strategy / Content / Platform specialists / Operations). Opening Content Writer Agent shows Responsibilities, Goals, Inputs, Outputs, Memory, and Recent events.

![Agent detail panel](https://app.devin.ai/attachments/89de949a-0767-4ee5-8f82-4ab592cae7aa/ss_6278d12b.png)

### 3. Create goal → live timeline — PASS (primary)
Created "Grow LinkedIn & Instagram" (LinkedIn + Instagram). Navigated to `/tasks/:id` with an 11+ step timeline. Steps advanced in real time **without manual refresh**: 25% (SEO running) → 83% ("Needs approval") captured in successive screenshots.

| Mid-progress (25%) | Advanced to 83% "Needs approval" |
| --- | --- |
| ![25%](https://app.devin.ai/attachments/8425210f-7e53-4be0-8f85-65668ea09220/ss_0ce93412.png) | ![83%](https://app.devin.ai/attachments/8af4c742-817a-44b2-9c29-dc95280853ca/ss_becdf270.png) |

Content tab (after refresh) shows 2 platform-ready posts with body text, hashtags, and image prompts:

![Content tab](https://app.devin.ai/attachments/9c468eb3-7272-4f4a-a9f7-a40a415fdaa9/ss_fee641c8.png)

### 4. Approvals resume the task — PASS
Approved both posts on the Approvals page → they moved to the **Resolved / approved** section, and the task resumed through Publishing + Analytics to **Completed / 100%**.

| Both approvals resolved | Task Completed 100% |
| --- | --- |
| ![Resolved](https://app.devin.ai/attachments/b7fe43e8-5818-4313-bc14-25d653f97698/ss_9309e647.png) | ![Completed](https://app.devin.ai/attachments/99468461-7588-4e44-99ce-8b1454a245a6/ss_e63fb253.png) |

### 5. Scheduled Posts + Calendar — PASS
Both approved posts appear scheduled (LinkedIn Jul 27, Instagram Jul 28 — matching the +3h/+1day offset) and show on their calendar days.

![Calendar](https://app.devin.ai/attachments/fd9d92df-dd1b-4a36-8965-8bee3e318774/ss_709ced79.png)

### 6. Analytics + range toggle — PASS
All widgets render (6 metric cards, reach/engagement area chart, follower line chart, platform bar chart, top posts, top hashtags, best times, insights). The **7d** toggle genuinely changed the dataset (X-axis → Jul 21–27; Reach 267k→55.8k; Conversions 372→73).

![Analytics 7d](https://app.devin.ai/attachments/9e0a2ffe-7a87-4c84-b496-c91f878d3492/ss_zoom_4db38c52.png)

### 7. Remaining sections + dark mode — PASS
- **Projects (kanban):** columns render; new task in Completed.
- **Connected Accounts:** Facebook "Connect" flipped to connected (green dot + Disconnect).
- **Knowledge Base:** 5 docs render (Upload disabled — phase 2).
- **Notifications:** mark-read decremented badge 5→4.
- **Settings:** edited Workspace name and Save → button showed "Saved"; value persisted.
- **Billing:** 3 plans (Growth = Current) + 3 paid invoices.
- **Dark/light mode:** top-bar toggle switched the whole app and stayed in sync with the Settings toggle; persisted across navigation.

| Account toggled connected | Light mode switch |
| --- | --- |
| ![FB connected](https://app.devin.ai/attachments/f16a2570-de5f-4dc4-81c8-54f3c4aa49e9/ss_zoom_f86caa35.png) | ![Light mode](https://app.devin.ai/attachments/175c0b2b-2f8f-4703-9f68-e3c04c9617f7/ss_c258154d.png) |

---

**Environment:** backend `uvicorn app.main:app --port 8000` (venv, `requirements.txt`); frontend `npm run dev` (:5173). API prefix is `/api/v1`. Demo login `founder@acme.ai` / `password`.

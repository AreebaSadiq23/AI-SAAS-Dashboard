# Test Plan — AI Workforce SaaS (Phase 1)

Environment: frontend http://localhost:5173 (Vite, proxies /api → :8000, /ws → :8000), backend uvicorn :8000. Already logged in as founder@acme.ai / password before recording.

Grounding notes:
- Routes: App.tsx (Dashboard `/`, `/workforce`, `/tasks`, `/tasks/:id`, `/approvals`, `/scheduled`, `/calendar`, `/analytics`, `/accounts`, `/knowledge`, `/notifications`, `/settings`, `/billing`).
- Timeline: orchestrator builds 11 steps (6 base + N platforms + image/approval/publishing/analytics), STEP_DELAY=0.5s. Runs up to "Requesting approval" then sets status `waiting_approval` (orchestrator.run_task). Publishing+analytics run only after approval (resume_after_approval).
- "Live" badge in top bar = WebSocket `connected` (Layout.tsx:140, useTaskSocket.ts).
- Approval decision → content status approved, schedules posts +3h/+1day offsets (content.py, _schedule_posts).

## Test 1 — Login already done; verify Dashboard populated (precondition)
Steps: Observe Dashboard after login.
PASS: Shows non-zero active tasks / followers / a reach chart with rendered data (not empty placeholders, no error). Top bar shows green "Live" badge.
FAIL: Blank cards, zeros everywhere, console errors, or "Offline"/no Live badge.

## Test 2 — AI Workforce agents
Steps: Click "AI Workforce" nav. Count agents; confirm grouped by category. Click one agent card (e.g. Content Writer).
PASS: ~20 agents shown in category groups; detail view/modal shows responsibilities, goals, inputs, outputs, events.
FAIL: Fewer/no agents, no grouping, or detail missing those sections.

## Test 3 — Create goal → live timeline (PRIMARY)
Steps: Click New goal/New task. Title "Grow LinkedIn & Instagram", ensure LinkedIn + Instagram platforms selected, submit.
PASS: Navigates to `/tasks/:id`. Timeline shows 11 steps. Steps advance from Planning → ... WITHOUT manual refresh (spinner icon moves down; progress % increases). Ends at "Requesting approval" with status "Waiting for approval". Content tab shows 2 posts (LinkedIn + Instagram) with body text, hashtags (#...), and image prompt text. "Live" badge green throughout.
FAIL: No navigation, steps stuck at 0/pending, requires refresh to advance, no content generated, or missing hashtags/image prompts.
Evidence: capture mid-progress screenshot (steps partially complete) to prove real-time advancement, plus final waiting-approval state.

## Test 4 — Approvals resume the task
Steps: Go to Approvals. Confirm pending items for the new task (2). Click Approve on both.
PASS: Item(s) move from pending to resolved/approved section. Return to the task detail: status advances to Publishing then Completed (100%), publishing + analytics steps complete.
FAIL: Approve does nothing, item stays pending, or task never resumes past waiting_approval.

## Test 5 — Scheduled Posts + Calendar reflect approved content
Steps: Open Scheduled Posts, then Content Calendar.
PASS: The approved posts appear as scheduled entries (title + platform + future date). Calendar shows them on their scheduled day.
FAIL: Empty scheduled list / calendar despite approvals, or errors.

## Test 6 — Analytics renders + range toggle
Steps: Open Analytics. Toggle 7d / 30d / 90d.
PASS: Metric cards, reach/engagement area chart, follower line chart, platform bar chart, top posts, hashtags, best times, insights all render with data. Switching range changes chart data/points without error.
FAIL: Any chart blank/broken, toggle throws error or does nothing.

## Test 7 — Spot-check remaining sections + dark mode (regression-ish)
Steps: Visit Projects (kanban), Connected Accounts (toggle connect/disconnect on one), Knowledge Base, Notifications (mark one read), Settings (edit profile name + save; toggle dark mode), Billing.
PASS: Each renders without error. Account toggle flips connected state and persists. Notification mark-read updates. Settings save persists name (no error). Dark mode toggle flips whole app theme (light↔dark) and persists across navigation.
FAIL: Any page errors/blank, toggle/save no-op or error, dark mode doesn't switch.

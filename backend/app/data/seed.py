"""Seed the in-memory store with realistic demo data.

Creates a demo founder account, a fully onboarded workspace, the full AI
workforce, connected accounts, a knowledge base, and several tasks in different
states (completed, running, waiting for approval) with generated content,
approvals, scheduled posts and notifications.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.security import hash_password
from app.data.store import get_store
from app.schemas.agent import Agent, AgentEvent
from app.schemas.analytics import Notification
from app.schemas.auth import UserPublic
from app.schemas.common import (
    AgentStatus,
    ApprovalStatus,
    ContentStatus,
    NotificationType,
    Platform,
    StepStatus,
    TaskStatus,
)
from app.schemas.content import (
    Approval,
    ConnectedAccount,
    ContentItem,
    KnowledgeDoc,
    ScheduledPost,
)
from app.schemas.task import Task, TaskLog, TaskStep
from app.schemas.workspace import BusinessProfile, Workspace
from app.services.agents.catalog import AGENT_CATALOG
from app.services.ai_provider import get_provider


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


AGENT_STATS = {
    "orchestrator": (128, AgentStatus.working),
    "planner": (46, AgentStatus.idle),
    "research": (52, AgentStatus.idle),
    "seo": (48, AgentStatus.idle),
    "content_writer": (61, AgentStatus.working),
    "brand_voice": (57, AgentStatus.idle),
    "image_prompt": (44, AgentStatus.idle),
    "approval": (39, AgentStatus.waiting),
    "publishing": (33, AgentStatus.idle),
    "analytics": (41, AgentStatus.idle),
    "memory": (72, AgentStatus.idle),
    "notification": (88, AgentStatus.idle),
}


def _seed_agents() -> None:
    store = get_store()
    for defn in AGENT_CATALOG:
        tasks_completed, status = AGENT_STATS.get(defn["key"], (30, AgentStatus.idle))
        memory: list[str] = []
        if defn["key"] == "memory":
            memory = [
                "LinkedIn carousels outperform text posts by 34% for this audience.",
                "Best posting window: Tue–Thu, 9–11am local.",
                "Hook style 'contrarian takes' drives the highest saves.",
            ]
        elif defn["category"] in {"strategy", "content"}:
            memory = ["Audience responds to concrete outcomes over features."]
        agent = Agent(
            id=_id("agent"),
            key=defn["key"],
            name=defn["name"],
            role=defn["role"],
            category=defn["category"],
            description=defn["description"],
            avatar=defn["avatar"],
            responsibilities=defn["responsibilities"],
            goals=defn["goals"],
            inputs=defn["inputs"],
            outputs=defn["outputs"],
            status=status,
            memory=memory,
            tasks_completed=tasks_completed,
            success_rate=round(94 + (tasks_completed % 6) + 0.0, 1),
            events=[
                AgentEvent(
                    id=_id("evt"),
                    timestamp=_now() - timedelta(minutes=5 + i * 7),
                    level="info" if i else "success",
                    message=msg,
                )
                for i, msg in enumerate(
                    ["Completed a hand-off from the Orchestrator", "Recalled campaign context"]
                )
            ],
        )
        store.agents[agent.key] = agent


def _seed_user_and_workspace() -> tuple[str, str]:
    store = get_store()
    user_id = _id("user")
    ws_id = _id("ws")
    user = UserPublic(
        id=user_id,
        email="founder@acme.ai",
        name="Ava Founder",
        role="owner",
        avatar_url=None,
        workspace_id=ws_id,
    )
    store.users[user_id] = user
    store.credentials[user_id] = hash_password("password")
    store.email_index["founder@acme.ai"] = user_id

    profile = BusinessProfile(
        company_name="Acme AI",
        website="https://acme.ai",
        industry="B2B SaaS — AI productivity",
        target_audience="Founders, marketers and ops leaders at 10–200 person startups",
        products=["AI Workforce Platform", "Autonomous Campaign Engine"],
        services=["Done-for-you social growth", "AI strategy consulting"],
        brand_colors=["#6366F1", "#8B5CF6", "#0EA5E9"],
        brand_tone="Confident, insightful, human — never hypey",
        goals=[
            "Grow LinkedIn following to 25k",
            "Build a consistent Instagram presence",
            "Establish thought leadership on X",
        ],
        languages=["English", "Spanish"],
        countries=["United States", "United Kingdom", "Germany"],
        competitors=["Jasper", "Buffer", "Hootsuite", "Lately.ai"],
        social_links={
            "linkedin": "https://linkedin.com/company/acme-ai",
            "instagram": "https://instagram.com/acme.ai",
            "x": "https://x.com/acmeai",
        },
    )
    store.workspaces[ws_id] = Workspace(
        id=ws_id,
        name="Acme AI",
        owner_id=user_id,
        profile=profile,
        onboarding_complete=True,
    )
    return user_id, ws_id


def _seed_accounts(ws_id: str) -> None:
    store = get_store()
    data = [
        (Platform.linkedin, "@acme-ai", True, 18240),
        (Platform.instagram, "@acme.ai", True, 9430),
        (Platform.x, "@acmeai", True, 12680),
        (Platform.youtube, "Acme AI", True, 4120),
        (Platform.facebook, "Acme AI", False, 0),
        (Platform.tiktok, "@acme.ai", False, 0),
    ]
    for platform, handle, connected, followers in data:
        acc = ConnectedAccount(
            id=_id("acct"),
            workspace_id=ws_id,
            platform=platform,
            handle=handle,
            connected=connected,
            followers=followers,
            connected_at=_now() - timedelta(days=45) if connected else None,
        )
        store.accounts[acc.id] = acc


def _seed_knowledge(ws_id: str) -> None:
    store = get_store()
    docs = [
        ("Brand Guidelines 2026.pdf", "pdf", 2480, "Voice, colors, logo usage and do/don'ts."),
        ("Q3 Product Launch Brief.pdf", "pdf", 940, "Positioning and messaging for the launch."),
        ("Customer Personas.doc", "doc", 610, "Three core personas with pains and goals."),
        ("Competitor Teardown.link", "link", 0, "Analysis of Jasper and Buffer positioning."),
        ("Tone of Voice Notes", "note", 12, "Confident, concrete, never hypey."),
    ]
    for name, kind, size, summary in docs:
        doc = KnowledgeDoc(
            id=_id("kb"),
            workspace_id=ws_id,
            name=name,
            kind=kind,
            size_kb=size,
            added_at=_now() - timedelta(days=size % 20 + 1),
            summary=summary,
        )
        store.knowledge[doc.id] = doc


def _plan_steps(platforms: list[Platform]) -> list[TaskStep]:
    base = [
        ("Planning strategy", "planner"),
        ("Researching niche & audience", "research"),
        ("Analyzing competitors", "research"),
        ("SEO & keyword optimization", "seo"),
        ("Writing content", "content_writer"),
        ("Applying brand voice", "brand_voice"),
    ]
    steps = [TaskStep(id=_id("step"), name=n, agent_key=k) for n, k in base]
    for p in platforms:
        steps.append(
            TaskStep(id=_id("step"), name=f"Optimizing for {p.value}", agent_key=p.value)
        )
    steps.append(
        TaskStep(id=_id("step"), name="Generating image prompts", agent_key="image_prompt")
    )
    steps.append(TaskStep(id=_id("step"), name="Requesting approval", agent_key="approval"))
    steps.append(TaskStep(id=_id("step"), name="Publishing", agent_key="publishing"))
    steps.append(TaskStep(id=_id("step"), name="Analyzing performance", agent_key="analytics"))
    return steps


def _content(ws_id: str, task_id: str, platform: Platform, topic: str,
             status: ContentStatus, scheduled_at: datetime | None) -> ContentItem:
    ai = get_provider()
    now = _now()
    return ContentItem(
        id=_id("content"),
        workspace_id=ws_id,
        task_id=task_id,
        platform=platform,
        title=f"{topic} — {platform.value.title()}",
        body=ai.write_post(platform, topic, "Confident, insightful, human"),
        hashtags=ai.hashtags(topic),
        image_prompt=ai.image_prompt(platform, topic, ["#6366F1", "#8B5CF6"]),
        status=status,
        scheduled_at=scheduled_at,
        created_at=now - timedelta(hours=6),
        updated_at=now,
    )


def _seed_tasks(ws_id: str) -> None:
    store = get_store()
    now = _now()

    # 1. Completed campaign with scheduled posts
    t1_platforms = [Platform.linkedin, Platform.x]
    t1 = Task(
        id=_id("task"),
        workspace_id=ws_id,
        title="Launch-week thought leadership",
        goal="Grow my LinkedIn and X for my AI SaaS during launch week.",
        platforms=t1_platforms,
        status=TaskStatus.completed,
        progress=100,
        orchestrator_summary="Delivered 2 platform-ready posts, scheduled and tracked.",
        steps=_plan_steps(t1_platforms),
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(days=1, hours=20),
    )
    for i, step in enumerate(t1.steps):
        step.status = StepStatus.completed
        step.started_at = t1.created_at + timedelta(minutes=i * 2)
        step.completed_at = t1.created_at + timedelta(minutes=i * 2 + 1)
    t1.logs = [
        TaskLog(id=_id("log"), timestamp=t1.created_at + timedelta(minutes=i),
                agent_key=k, message=m)
        for i, (k, m) in enumerate([
            ("orchestrator", "Received goal and planned 12 steps"),
            ("research", "Compiled niche and competitor insights"),
            ("content_writer", "Drafted 2 posts"),
            ("approval", "Content approved by founder@acme.ai"),
            ("publishing", "Scheduled 2 posts at optimal times"),
            ("orchestrator", "Merged outputs into final deliverable"),
        ])
    ]
    for p in t1_platforms:
        item = _content(ws_id, t1.id, p, "Launch-week thought leadership",
                        ContentStatus.scheduled, now + timedelta(hours=6))
        store.content[item.id] = item
        t1.content_ids.append(item.id)
        sched = ScheduledPost(
            id=_id("sched"), workspace_id=ws_id, content_id=item.id, platform=p,
            title=item.title, scheduled_at=item.scheduled_at or now, status=ContentStatus.scheduled,
        )
        store.scheduled[sched.id] = sched
    store.tasks[t1.id] = t1

    # 2. In-progress task
    t2_platforms = [Platform.instagram]
    t2 = Task(
        id=_id("task"),
        workspace_id=ws_id,
        title="Instagram carousel series on AI workflows",
        goal="Create an educational Instagram carousel series about AI workflows.",
        platforms=t2_platforms,
        status=TaskStatus.in_progress,
        progress=45,
        orchestrator_summary="Content Writer is drafting the carousel copy…",
        steps=_plan_steps(t2_platforms),
        created_at=now - timedelta(hours=1),
        updated_at=now - timedelta(minutes=2),
    )
    for i, step in enumerate(t2.steps):
        if i < 4:
            step.status = StepStatus.completed
            step.completed_at = now - timedelta(minutes=30 - i * 5)
        elif i == 4:
            step.status = StepStatus.running
            step.started_at = now - timedelta(minutes=2)
    t2.logs = [
        TaskLog(id=_id("log"), timestamp=now - timedelta(minutes=30 - i * 5),
                agent_key=k, message=m)
        for i, (k, m) in enumerate([
            ("orchestrator", "Planned the carousel campaign"),
            ("research", "Analyzed top-performing carousels in the niche"),
            ("seo", "Selected keywords and hashtag sets"),
            ("content_writer", "Started drafting slide copy"),
        ])
    ]
    store.tasks[t2.id] = t2

    # 3. Waiting-for-approval task with pending approvals
    t3_platforms = [Platform.x, Platform.linkedin]
    t3 = Task(
        id=_id("task"),
        workspace_id=ws_id,
        title="Why an AI workforce beats a chatbot",
        goal="Publish a contrarian thought-leadership angle across X and LinkedIn.",
        platforms=t3_platforms,
        status=TaskStatus.waiting_approval,
        progress=75,
        orchestrator_summary="Content is ready and awaiting your approval before publishing.",
        steps=_plan_steps(t3_platforms),
        created_at=now - timedelta(hours=3),
        updated_at=now - timedelta(minutes=10),
    )
    for step in t3.steps:
        if step.agent_key in {"publishing", "analytics"}:
            continue
        step.status = StepStatus.completed
        step.completed_at = now - timedelta(minutes=12)
    for p in t3_platforms:
        item = _content(ws_id, t3.id, p, "Why an AI workforce beats a chatbot",
                        ContentStatus.in_review, None)
        store.content[item.id] = item
        t3.content_ids.append(item.id)
        appr = Approval(
            id=_id("appr"), workspace_id=ws_id, content_id=item.id, platform=p,
            title=item.title, preview=item.body[:180], status=ApprovalStatus.pending,
            requested_at=now - timedelta(minutes=10),
        )
        store.approvals[appr.id] = appr
    store.tasks[t3.id] = t3

    # 4. Completed YouTube script task
    t4_platforms = [Platform.youtube]
    t4 = Task(
        id=_id("task"),
        workspace_id=ws_id,
        title="YouTube script: AI employees explained",
        goal="Write a YouTube script explaining AI employees to founders.",
        platforms=t4_platforms,
        status=TaskStatus.completed,
        progress=100,
        orchestrator_summary="Delivered 1 script, title and description.",
        steps=_plan_steps(t4_platforms),
        created_at=now - timedelta(days=4),
        updated_at=now - timedelta(days=3, hours=22),
    )
    for step in t4.steps:
        step.status = StepStatus.completed
        step.completed_at = t4.created_at + timedelta(minutes=8)
    item = _content(ws_id, t4.id, Platform.youtube, "AI employees explained",
                    ContentStatus.published, now - timedelta(days=3))
    item.status = ContentStatus.published
    store.content[item.id] = item
    t4.content_ids.append(item.id)
    store.tasks[t4.id] = t4


def _seed_notifications(ws_id: str) -> None:
    store = get_store()
    now = _now()
    items = [
        (NotificationType.approval_required, "Approval required",
         "2 posts from 'Why an AI workforce beats a chatbot' are ready for review.",
         False, 10),
        (NotificationType.task_complete, "Task complete",
         "'Launch-week thought leadership' is done — 2 posts delivered.", True, 60 * 20),
        (NotificationType.publish_success, "Posts scheduled",
         "2 posts were scheduled at optimal times.", True, 60 * 20),
        (NotificationType.analytics_available, "Analytics available",
         "Performance tracking is live for 'YouTube script: AI employees explained'.",
         True, 60 * 24 * 3),
    ]
    for ntype, title, body, read, mins in items:
        n = Notification(
            id=_id("notif"), workspace_id=ws_id, type=ntype, title=title, body=body,
            read=read, created_at=now - timedelta(minutes=mins),
        )
        store.notifications[n.id] = n


def seed_if_empty() -> None:
    store = get_store()
    with store.lock:
        if store.seeded:
            return
        _seed_agents()
        _user_id, ws_id = _seed_user_and_workspace()
        _seed_accounts(ws_id)
        _seed_knowledge(ws_id)
        _seed_tasks(ws_id)
        _seed_notifications(ws_id)
        store.seeded = True

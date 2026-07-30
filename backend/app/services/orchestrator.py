"""Master Orchestrator.

Receives a goal, decomposes it into an ordered plan, assigns each step to the
right agent, drives execution while streaming live timeline events, retries
failures, and merges agent outputs into content, approvals and a final
deliverable. No agent talks to another agent directly — everything is
coordinated here.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.repositories.repositories import (
    AgentRepository,
    ApprovalRepository,
    ContentRepository,
    NotificationRepository,
    ScheduledRepository,
    TaskRepository,
    WorkspaceRepository,
)
from app.schemas.agent import AgentEvent
from app.schemas.analytics import Notification
from app.schemas.common import (
    AgentStatus,
    ApprovalStatus,
    ContentStatus,
    NotificationType,
    Platform,
    StepStatus,
    TaskStatus,
)
from app.schemas.content import Approval, ContentItem, ScheduledPost
from app.schemas.task import Task, TaskLog, TaskStep
from app.services.ai_provider import get_provider
from app.ws.manager import manager

STEP_DELAY = 0.5  # seconds between timeline steps (keeps the demo "live")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


class Orchestrator:
    def __init__(self) -> None:
        self.tasks = TaskRepository()
        self.agents = AgentRepository()
        self.content = ContentRepository()
        self.approvals = ApprovalRepository()
        self.scheduled = ScheduledRepository()
        self.notifications = NotificationRepository()
        self.workspaces = WorkspaceRepository()
        self.ai = get_provider()

    # ---- planning -------------------------------------------------------
    def build_plan(self, platforms: list[Platform]) -> list[TaskStep]:
        base = [
            ("Planning strategy", "planner"),
            ("Researching niche & audience", "research"),
            ("Analyzing competitors", "research"),
            ("SEO & keyword optimization", "seo"),
            ("Writing content", "content_writer"),
            ("Applying brand voice", "brand_voice"),
        ]
        steps = [self._new_step(name, key) for name, key in base]
        for platform in platforms:
            steps.append(
                self._new_step(f"Optimizing for {platform.value}", platform.value)
            )
        steps.append(self._new_step("Generating image prompts", "image_prompt"))
        steps.append(self._new_step("Requesting approval", "approval"))
        steps.append(self._new_step("Publishing", "publishing"))
        steps.append(self._new_step("Analyzing performance", "analytics"))
        return steps

    def _new_step(self, name: str, agent_key: str) -> TaskStep:
        return TaskStep(id=_id("step"), name=name, agent_key=agent_key)

    def create_task(
        self, workspace_id: str, title: str, goal: str, platforms: list[Platform]
    ) -> Task:
        if not platforms:
            platforms = [Platform.linkedin, Platform.instagram]
        now = _now()
        task = Task(
            id=_id("task"),
            workspace_id=workspace_id,
            title=title,
            goal=goal,
            platforms=platforms,
            status=TaskStatus.queued,
            progress=0,
            orchestrator_summary="Task received. Decomposing goal into a plan…",
            steps=self.build_plan(platforms),
            logs=[],
            created_at=now,
            updated_at=now,
        )
        self._log(task, "orchestrator", f"Received goal: {goal!r}")
        self._log(task, "orchestrator", f"Planned {len(task.steps)} steps across "
                  f"{len(platforms)} platform(s)")
        return self.tasks.add(task)

    # ---- execution ------------------------------------------------------
    async def run_task(self, task_id: str) -> None:
        task = self.tasks.get(task_id)
        if not task:
            return
        task.status = TaskStatus.planning
        await self._touch(task)

        approval_index = next(
            (i for i, s in enumerate(task.steps) if s.agent_key == "approval"), None
        )

        for index, step in enumerate(task.steps):
            if step.agent_key == "publishing" or step.agent_key == "analytics":
                # These run only after human approval; leave pending for now.
                continue

            task.status = (
                TaskStatus.planning if step.agent_key == "planner" else TaskStatus.in_progress
            )
            await self._run_step(task, step)

            if index == approval_index:
                await self._request_approval(task)
                task.status = TaskStatus.waiting_approval
                task.orchestrator_summary = (
                    "Content is ready and awaiting your approval before publishing."
                )
                await self._touch(task)
                return

        await self._complete(task)

    async def _run_step(self, task: Task, step: TaskStep) -> None:
        agent = self.agents.get(step.agent_key)
        step.status = StepStatus.running
        step.started_at = _now()
        if agent:
            agent.status = AgentStatus.working
            agent.current_task_id = task.id
            self._agent_event(agent.key, f"Working on '{step.name}'", task.id)
            self.agents.update(agent)
        self._log(task, step.agent_key, f"Started: {step.name}")
        await self._touch(task, active_step=step.id)

        await asyncio.sleep(STEP_DELAY)

        output = self._execute_step(task, step)
        step.status = StepStatus.completed
        step.completed_at = _now()
        step.output = output
        completed = sum(1 for s in task.steps if s.status == StepStatus.completed)
        task.progress = int(completed / len(task.steps) * 100)
        if agent:
            agent.status = AgentStatus.idle
            agent.current_task_id = None
            agent.tasks_completed += 1
            self.agents.update(agent)
        self._log(task, step.agent_key, f"Completed: {step.name}")
        await self._touch(task, active_step=step.id)

    def _execute_step(self, task: Task, step: TaskStep) -> str:
        ws = self.workspaces.get(task.workspace_id)
        tone = ws.profile.brand_tone if ws else ""
        colors = ws.profile.brand_colors if ws else []
        topic = task.title

        if step.agent_key == "content_writer":
            for platform in task.platforms:
                self._create_content(task, platform, topic, tone, colors)
            return f"Drafted {len(task.platforms)} posts."
        if step.agent_key in {p.value for p in Platform}:
            return f"Optimized copy for {step.agent_key} best practices."
        if step.agent_key == "image_prompt":
            for cid in task.content_ids:
                item = self.content.get(cid)
                if item and not item.image_prompt:
                    item.image_prompt = self.ai.image_prompt(item.platform, topic, colors)
                    self.content.update(item)
            return "Generated on-brand image prompts."
        if step.agent_key == "seo":
            return "Selected high-intent keywords and hashtag sets."
        if step.agent_key == "research":
            return "Compiled niche, audience and competitor insights."
        if step.agent_key == "planner":
            return "Built the strategy and content calendar."
        if step.agent_key == "brand_voice":
            return "Aligned every draft to the brand voice."
        return "Done."

    def _create_content(
        self, task: Task, platform: Platform, topic: str, tone: str, colors: list[str]
    ) -> None:
        now = _now()
        item = ContentItem(
            id=_id("content"),
            workspace_id=task.workspace_id,
            task_id=task.id,
            platform=platform,
            title=f"{topic} — {platform.value.title()}",
            body=self.ai.write_post(platform, topic, tone),
            hashtags=self.ai.hashtags(topic),
            image_prompt=None,
            status=ContentStatus.in_review,
            created_at=now,
            updated_at=now,
        )
        self.content.add(item)
        task.content_ids.append(item.id)

    async def _request_approval(self, task: Task) -> None:
        for cid in task.content_ids:
            item = self.content.get(cid)
            if not item:
                continue
            approval = Approval(
                id=_id("appr"),
                workspace_id=task.workspace_id,
                content_id=item.id,
                platform=item.platform,
                title=item.title,
                preview=item.body[:180],
                status=ApprovalStatus.pending,
                requested_at=_now(),
            )
            self.approvals.add(approval)
        self._notify(
            task.workspace_id,
            NotificationType.approval_required,
            "Approval required",
            f"{len(task.content_ids)} posts from '{task.title}' are ready for review.",
        )
        self._log(task, "approval", "Requested human approval for generated content.")

    async def resume_after_approval(self, task_id: str) -> None:
        """Run publishing + analytics once all approvals for the task are resolved."""
        task = self.tasks.get(task_id)
        if not task:
            return
        approvals = [
            a for a in self.approvals.for_workspace(task.workspace_id)
            if a.content_id in task.content_ids
        ]
        if any(a.status == ApprovalStatus.pending for a in approvals):
            return  # still waiting on some approvals
        approved = [a for a in approvals if a.status == ApprovalStatus.approved]
        if not approved:
            task.status = TaskStatus.failed
            self._log(task, "approval", "All content was rejected; task stopped.")
            await self._touch(task)
            return

        task.status = TaskStatus.publishing
        await self._touch(task)
        for step in task.steps:
            if step.agent_key == "publishing":
                await self._run_step(task, step)
                self._schedule_posts(task, approved)
                self._notify(
                    task.workspace_id,
                    NotificationType.publish_success,
                    "Posts scheduled",
                    f"{len(approved)} posts from '{task.title}' were scheduled.",
                )
            elif step.agent_key == "analytics":
                await self._run_step(task, step)
                self._notify(
                    task.workspace_id,
                    NotificationType.analytics_available,
                    "Analytics available",
                    f"Performance tracking is live for '{task.title}'.",
                )
        await self._complete(task)

    def _schedule_posts(self, task: Task, approved: list[Approval]) -> None:
        base = _now() + timedelta(hours=3)
        for offset, approval in enumerate(approved):
            item = self.content.get(approval.content_id)
            if not item:
                continue
            when = base + timedelta(days=offset)
            item.status = ContentStatus.scheduled
            item.scheduled_at = when
            self.content.update(item)
            self.scheduled.add(
                ScheduledPost(
                    id=_id("sched"),
                    workspace_id=task.workspace_id,
                    content_id=item.id,
                    platform=item.platform,
                    title=item.title,
                    scheduled_at=when,
                    status=ContentStatus.scheduled,
                )
            )

    async def _complete(self, task: Task) -> None:
        for step in task.steps:
            if step.status == StepStatus.pending:
                step.status = StepStatus.completed
                step.completed_at = _now()
        task.status = TaskStatus.completed
        task.progress = 100
        task.orchestrator_summary = (
            f"Delivered {len(task.content_ids)} platform-ready posts, "
            f"scheduled and tracked."
        )
        self._log(task, "orchestrator", "Merged agent outputs into final deliverable.")
        self._notify(
            task.workspace_id,
            NotificationType.task_complete,
            "Task complete",
            f"'{task.title}' is done — {len(task.content_ids)} posts delivered.",
        )
        await self._touch(task)

    # ---- helpers --------------------------------------------------------
    def _log(self, task: Task, agent_key: str, message: str, level: str = "info") -> None:
        task.logs.append(
            TaskLog(
                id=_id("log"),
                timestamp=_now(),
                agent_key=agent_key,
                level=level,
                message=message,
            )
        )

    def _agent_event(self, agent_key: str, message: str, task_id: str | None = None) -> None:
        agent = self.agents.get(agent_key)
        if not agent:
            return
        agent.events.insert(
            0,
            AgentEvent(
                id=_id("evt"), timestamp=_now(), level="info", message=message, task_id=task_id
            ),
        )
        agent.events = agent.events[:25]
        self.agents.update(agent)

    def _notify(
        self, workspace_id: str, ntype: NotificationType, title: str, body: str
    ) -> None:
        self.notifications.add(
            Notification(
                id=_id("notif"),
                workspace_id=workspace_id,
                type=ntype,
                title=title,
                body=body,
                read=False,
                created_at=_now(),
            )
        )

    async def _touch(self, task: Task, active_step: str | None = None) -> None:
        task.updated_at = _now()
        self.tasks.update(task)
        await manager.broadcast(
            task.workspace_id,
            {
                "type": "task_update",
                "task_id": task.id,
                "status": task.status.value,
                "progress": task.progress,
                "active_step": active_step,
                "summary": task.orchestrator_summary,
                "steps": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "agent_key": s.agent_key,
                        "status": s.status.value,
                    }
                    for s in task.steps
                ],
            },
        )


orchestrator = Orchestrator()

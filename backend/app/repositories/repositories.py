"""Concrete repositories bound to the in-memory store."""

from __future__ import annotations

from app.data.store import get_store
from app.repositories.base import InMemoryRepository
from app.schemas.agent import Agent
from app.schemas.analytics import Notification
from app.schemas.auth import UserPublic
from app.schemas.content import (
    Approval,
    ConnectedAccount,
    ContentItem,
    KnowledgeDoc,
    ScheduledPost,
)
from app.schemas.task import Task
from app.schemas.workspace import Workspace


class UserRepository(InMemoryRepository[UserPublic]):
    def __init__(self) -> None:
        super().__init__(get_store().users, lambda u: u.id)

    def get_by_email(self, email: str) -> UserPublic | None:
        user_id = get_store().email_index.get(email.lower())
        return self.get(user_id) if user_id else None


class WorkspaceRepository(InMemoryRepository[Workspace]):
    def __init__(self) -> None:
        super().__init__(get_store().workspaces, lambda w: w.id)


class AgentRepository(InMemoryRepository[Agent]):
    def __init__(self) -> None:
        super().__init__(get_store().agents, lambda a: a.key)


class TaskRepository(InMemoryRepository[Task]):
    def __init__(self) -> None:
        super().__init__(get_store().tasks, lambda t: t.id)

    def for_workspace(self, workspace_id: str) -> list[Task]:
        return self.list(lambda t: t.workspace_id == workspace_id)


class ContentRepository(InMemoryRepository[ContentItem]):
    def __init__(self) -> None:
        super().__init__(get_store().content, lambda c: c.id)

    def for_workspace(self, workspace_id: str) -> list[ContentItem]:
        return self.list(lambda c: c.workspace_id == workspace_id)


class ApprovalRepository(InMemoryRepository[Approval]):
    def __init__(self) -> None:
        super().__init__(get_store().approvals, lambda a: a.id)

    def for_workspace(self, workspace_id: str) -> list[Approval]:
        return self.list(lambda a: a.workspace_id == workspace_id)


class ScheduledRepository(InMemoryRepository[ScheduledPost]):
    def __init__(self) -> None:
        super().__init__(get_store().scheduled, lambda s: s.id)

    def for_workspace(self, workspace_id: str) -> list[ScheduledPost]:
        return self.list(lambda s: s.workspace_id == workspace_id)


class AccountRepository(InMemoryRepository[ConnectedAccount]):
    def __init__(self) -> None:
        super().__init__(get_store().accounts, lambda a: a.id)

    def for_workspace(self, workspace_id: str) -> list[ConnectedAccount]:
        return self.list(lambda a: a.workspace_id == workspace_id)


class KnowledgeRepository(InMemoryRepository[KnowledgeDoc]):
    def __init__(self) -> None:
        super().__init__(get_store().knowledge, lambda k: k.id)

    def for_workspace(self, workspace_id: str) -> list[KnowledgeDoc]:
        return self.list(lambda k: k.workspace_id == workspace_id)


class NotificationRepository(InMemoryRepository[Notification]):
    def __init__(self) -> None:
        super().__init__(get_store().notifications, lambda n: n.id)

    def for_workspace(self, workspace_id: str) -> list[Notification]:
        return self.list(lambda n: n.workspace_id == workspace_id)

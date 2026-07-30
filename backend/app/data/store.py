"""In-memory data store.

A single process-wide store that stands in for a database. It is intentionally
simple so the whole platform runs with zero infrastructure, while the repository
layer keeps the rest of the app decoupled from this choice — a PostgreSQL-backed
store can be dropped in without touching services or routes.
"""

from __future__ import annotations

from threading import RLock
from typing import Any

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


class DataStore:
    """Process-wide collections keyed by id."""

    def __init__(self) -> None:
        self.lock = RLock()
        self.users: dict[str, UserPublic] = {}
        self.credentials: dict[str, str] = {}  # user_id -> hashed password
        self.email_index: dict[str, str] = {}  # email -> user_id
        self.workspaces: dict[str, Workspace] = {}
        self.agents: dict[str, Agent] = {}  # key -> Agent (single shared workforce)
        self.tasks: dict[str, Task] = {}
        self.content: dict[str, ContentItem] = {}
        self.approvals: dict[str, Approval] = {}
        self.scheduled: dict[str, ScheduledPost] = {}
        self.accounts: dict[str, ConnectedAccount] = {}
        self.knowledge: dict[str, KnowledgeDoc] = {}
        self.notifications: dict[str, Notification] = {}
        self.seeded = False

    def reset(self) -> None:
        with self.lock:
            for collection in (
                self.users,
                self.credentials,
                self.email_index,
                self.workspaces,
                self.agents,
                self.tasks,
                self.content,
                self.approvals,
                self.scheduled,
                self.accounts,
                self.knowledge,
                self.notifications,
            ):
                collection.clear()  # type: ignore[attr-defined]
            self.seeded = False


_store: DataStore | None = None


def get_store() -> DataStore:
    global _store
    if _store is None:
        _store = DataStore()
    return _store


def dump_state() -> dict[str, Any]:
    """Debug helper — counts per collection."""
    store = get_store()
    return {
        "users": len(store.users),
        "workspaces": len(store.workspaces),
        "agents": len(store.agents),
        "tasks": len(store.tasks),
        "content": len(store.content),
        "approvals": len(store.approvals),
        "scheduled": len(store.scheduled),
        "accounts": len(store.accounts),
        "knowledge": len(store.knowledge),
        "notifications": len(store.notifications),
    }

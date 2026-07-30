"""Content, approvals, scheduling, connected accounts."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ApprovalStatus, ContentStatus, Platform


class ContentItem(BaseModel):
    id: str
    workspace_id: str
    task_id: str | None = None
    platform: Platform
    title: str
    body: str
    hashtags: list[str] = Field(default_factory=list)
    image_prompt: str | None = None
    status: ContentStatus = ContentStatus.draft
    scheduled_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class Approval(BaseModel):
    id: str
    workspace_id: str
    content_id: str
    platform: Platform
    title: str
    preview: str
    status: ApprovalStatus = ApprovalStatus.pending
    requested_at: datetime
    resolved_at: datetime | None = None
    comment: str | None = None


class ApprovalDecision(BaseModel):
    approve: bool
    comment: str | None = None


class ScheduledPost(BaseModel):
    id: str
    workspace_id: str
    content_id: str
    platform: Platform
    title: str
    scheduled_at: datetime
    status: ContentStatus = ContentStatus.scheduled


class ConnectedAccount(BaseModel):
    id: str
    workspace_id: str
    platform: Platform
    handle: str
    connected: bool = True
    followers: int = 0
    connected_at: datetime | None = None


class KnowledgeDoc(BaseModel):
    id: str
    workspace_id: str
    name: str
    kind: str  # pdf | doc | link | note
    size_kb: int = 0
    added_at: datetime
    summary: str = ""

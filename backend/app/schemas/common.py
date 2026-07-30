"""Shared enums and base schema types."""

from enum import Enum


class Platform(str, Enum):
    linkedin = "linkedin"
    instagram = "instagram"
    facebook = "facebook"
    x = "x"
    tiktok = "tiktok"
    pinterest = "pinterest"
    threads = "threads"
    youtube = "youtube"


class AgentStatus(str, Enum):
    idle = "idle"
    working = "working"
    waiting = "waiting"
    error = "error"
    offline = "offline"


class TaskStatus(str, Enum):
    queued = "queued"
    planning = "planning"
    in_progress = "in_progress"
    waiting_approval = "waiting_approval"
    publishing = "publishing"
    completed = "completed"
    failed = "failed"


class StepStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class ContentStatus(str, Enum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"
    scheduled = "scheduled"
    published = "published"


class ApprovalStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class NotificationType(str, Enum):
    task_complete = "task_complete"
    approval_required = "approval_required"
    publish_success = "publish_success"
    publish_failed = "publish_failed"
    analytics_available = "analytics_available"

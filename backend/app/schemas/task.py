"""Task + timeline schemas."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import Platform, StepStatus, TaskStatus


class TaskStep(BaseModel):
    id: str
    name: str
    agent_key: str
    status: StepStatus = StepStatus.pending
    started_at: datetime | None = None
    completed_at: datetime | None = None
    output: str | None = None


class TaskLog(BaseModel):
    id: str
    timestamp: datetime
    agent_key: str
    level: str = "info"
    message: str


class Task(BaseModel):
    id: str
    workspace_id: str
    title: str
    goal: str
    platforms: list[Platform] = Field(default_factory=list)
    status: TaskStatus = TaskStatus.queued
    progress: int = 0  # 0-100
    orchestrator_summary: str = ""
    steps: list[TaskStep] = Field(default_factory=list)
    logs: list[TaskLog] = Field(default_factory=list)
    content_ids: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    goal: str = Field(min_length=1, max_length=2000)
    platforms: list[Platform] = Field(default_factory=list)


class TaskSummary(BaseModel):
    id: str
    title: str
    status: TaskStatus
    progress: int
    platforms: list[Platform]
    created_at: datetime
    updated_at: datetime

"""AI agent schemas."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import AgentStatus


class AgentEvent(BaseModel):
    id: str
    timestamp: datetime
    level: str = "info"  # info | success | warning | error
    message: str
    task_id: str | None = None


class Agent(BaseModel):
    id: str
    key: str
    name: str
    role: str
    category: str  # orchestrator | strategy | content | platform | ops
    description: str
    avatar: str  # emoji or icon key
    responsibilities: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    inputs: list[str] = Field(default_factory=list)
    outputs: list[str] = Field(default_factory=list)
    status: AgentStatus = AgentStatus.idle
    memory: list[str] = Field(default_factory=list)
    tasks_completed: int = 0
    success_rate: float = 100.0
    current_task_id: str | None = None
    events: list[AgentEvent] = Field(default_factory=list)

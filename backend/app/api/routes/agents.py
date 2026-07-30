"""AI workforce (agent) routes."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.repositories.repositories import AgentRepository
from app.schemas.agent import Agent

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[Agent])
def list_agents(_: object = Depends(get_current_user)) -> list[Agent]:
    return sorted(AgentRepository().list(), key=lambda a: (a.category != "orchestrator", a.name))


@router.get("/{agent_key}", response_model=Agent)
def get_agent(agent_key: str, _: object = Depends(get_current_user)) -> Agent:
    agent = AgentRepository().get(agent_key)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

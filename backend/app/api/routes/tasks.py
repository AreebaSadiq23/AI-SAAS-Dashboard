"""Task routes — create a goal, watch it execute live."""

import asyncio

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_workspace
from app.repositories.repositories import TaskRepository
from app.schemas.task import Task, TaskCreate, TaskSummary
from app.schemas.workspace import Workspace
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskSummary])
def list_tasks(workspace: Workspace = Depends(get_current_workspace)) -> list[TaskSummary]:
    tasks = TaskRepository().for_workspace(workspace.id)
    tasks.sort(key=lambda t: t.created_at, reverse=True)
    return [
        TaskSummary(
            id=t.id, title=t.title, status=t.status, progress=t.progress,
            platforms=t.platforms, created_at=t.created_at, updated_at=t.updated_at,
        )
        for t in tasks
    ]


@router.post("", response_model=Task, status_code=201)
async def create_task(
    payload: TaskCreate, workspace: Workspace = Depends(get_current_workspace)
) -> Task:
    task = orchestrator.create_task(
        workspace.id, payload.title, payload.goal, payload.platforms
    )
    # Drive the workflow in the background; the UI follows via WebSocket.
    asyncio.create_task(orchestrator.run_task(task.id))
    return task


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: str, workspace: Workspace = Depends(get_current_workspace)) -> Task:
    task = TaskRepository().get(task_id)
    if not task or task.workspace_id != workspace.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

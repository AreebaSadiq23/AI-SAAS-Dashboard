"""Workspace + onboarding routes."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_workspace
from app.repositories.repositories import WorkspaceRepository
from app.schemas.workspace import Workspace, WorkspaceUpdate

router = APIRouter(prefix="/workspace", tags=["workspace"])


@router.get("", response_model=Workspace)
def get_workspace(workspace: Workspace = Depends(get_current_workspace)) -> Workspace:
    return workspace


@router.patch("", response_model=Workspace)
def update_workspace(
    payload: WorkspaceUpdate, workspace: Workspace = Depends(get_current_workspace)
) -> Workspace:
    if payload.name is not None:
        workspace.name = payload.name
    if payload.profile is not None:
        workspace.profile = payload.profile
    return WorkspaceRepository().update(workspace)


@router.post("/onboarding/complete", response_model=Workspace)
def complete_onboarding(workspace: Workspace = Depends(get_current_workspace)) -> Workspace:
    workspace.onboarding_complete = True
    return WorkspaceRepository().update(workspace)

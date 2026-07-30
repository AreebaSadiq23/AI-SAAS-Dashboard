"""Content, approvals, scheduled posts, connected accounts, knowledge base."""

import asyncio

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_workspace
from app.repositories.repositories import (
    AccountRepository,
    ApprovalRepository,
    ContentRepository,
    KnowledgeRepository,
    ScheduledRepository,
)
from app.schemas.common import ApprovalStatus, ContentStatus
from app.schemas.content import (
    Approval,
    ApprovalDecision,
    ConnectedAccount,
    ContentItem,
    KnowledgeDoc,
    ScheduledPost,
)
from app.schemas.workspace import Workspace
from app.services.orchestrator import orchestrator

router = APIRouter(tags=["content"])


@router.get("/content", response_model=list[ContentItem])
def list_content(workspace: Workspace = Depends(get_current_workspace)) -> list[ContentItem]:
    items = ContentRepository().for_workspace(workspace.id)
    items.sort(key=lambda c: c.updated_at, reverse=True)
    return items


@router.get("/approvals", response_model=list[Approval])
def list_approvals(workspace: Workspace = Depends(get_current_workspace)) -> list[Approval]:
    items = ApprovalRepository().for_workspace(workspace.id)
    items.sort(key=lambda a: (a.status != ApprovalStatus.pending, a.requested_at))
    return items


@router.post("/approvals/{approval_id}/decision", response_model=Approval)
async def decide_approval(
    approval_id: str,
    decision: ApprovalDecision,
    workspace: Workspace = Depends(get_current_workspace),
) -> Approval:
    repo = ApprovalRepository()
    approval = repo.get(approval_id)
    if not approval or approval.workspace_id != workspace.id:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = ApprovalStatus.approved if decision.approve else ApprovalStatus.rejected
    approval.comment = decision.comment
    from datetime import datetime, timezone

    approval.resolved_at = datetime.now(timezone.utc)
    repo.update(approval)

    content = ContentRepository().get(approval.content_id)
    if content:
        content.status = (
            ContentStatus.approved if decision.approve else ContentStatus.rejected
        )
        ContentRepository().update(content)
        if content.task_id:
            asyncio.create_task(orchestrator.resume_after_approval(content.task_id))
    return approval


@router.get("/scheduled", response_model=list[ScheduledPost])
def list_scheduled(workspace: Workspace = Depends(get_current_workspace)) -> list[ScheduledPost]:
    items = ScheduledRepository().for_workspace(workspace.id)
    items.sort(key=lambda s: s.scheduled_at)
    return items


@router.get("/accounts", response_model=list[ConnectedAccount])
def list_accounts(workspace: Workspace = Depends(get_current_workspace)) -> list[ConnectedAccount]:
    return AccountRepository().for_workspace(workspace.id)


@router.post("/accounts/{account_id}/toggle", response_model=ConnectedAccount)
def toggle_account(
    account_id: str, workspace: Workspace = Depends(get_current_workspace)
) -> ConnectedAccount:
    repo = AccountRepository()
    account = repo.get(account_id)
    if not account or account.workspace_id != workspace.id:
        raise HTTPException(status_code=404, detail="Account not found")
    account.connected = not account.connected
    return repo.update(account)


@router.get("/knowledge", response_model=list[KnowledgeDoc])
def list_knowledge(workspace: Workspace = Depends(get_current_workspace)) -> list[KnowledgeDoc]:
    items = KnowledgeRepository().for_workspace(workspace.id)
    items.sort(key=lambda k: k.added_at, reverse=True)
    return items

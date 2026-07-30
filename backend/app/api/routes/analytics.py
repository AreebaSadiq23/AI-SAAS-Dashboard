"""Analytics + notifications + dashboard summary routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_workspace
from app.repositories.repositories import (
    AccountRepository,
    ApprovalRepository,
    NotificationRepository,
    TaskRepository,
)
from app.schemas.analytics import AnalyticsOverview, Notification
from app.schemas.common import ApprovalStatus, TaskStatus
from app.schemas.workspace import Workspace
from app.services.analytics_service import analytics_service

router = APIRouter(tags=["analytics"])


class DashboardSummary(BaseModel):
    active_tasks: int
    completed_tasks: int
    pending_approvals: int
    connected_accounts: int
    total_followers: int
    unread_notifications: int


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(
    workspace: Workspace = Depends(get_current_workspace),
) -> DashboardSummary:
    tasks = TaskRepository().for_workspace(workspace.id)
    accounts = [a for a in AccountRepository().for_workspace(workspace.id) if a.connected]
    approvals = ApprovalRepository().for_workspace(workspace.id)
    notifs = NotificationRepository().for_workspace(workspace.id)
    active = sum(
        1 for t in tasks
        if t.status in {TaskStatus.in_progress, TaskStatus.planning,
                        TaskStatus.waiting_approval, TaskStatus.publishing, TaskStatus.queued}
    )
    return DashboardSummary(
        active_tasks=active,
        completed_tasks=sum(1 for t in tasks if t.status == TaskStatus.completed),
        pending_approvals=sum(1 for a in approvals if a.status == ApprovalStatus.pending),
        connected_accounts=len(accounts),
        total_followers=sum(a.followers for a in accounts),
        unread_notifications=sum(1 for n in notifs if not n.read),
    )


@router.get("/analytics", response_model=AnalyticsOverview)
def analytics_overview(
    days: int = 30, workspace: Workspace = Depends(get_current_workspace)
) -> AnalyticsOverview:
    return analytics_service.overview(workspace.id, days=days)


@router.get("/notifications", response_model=list[Notification])
def list_notifications(
    workspace: Workspace = Depends(get_current_workspace),
) -> list[Notification]:
    items = NotificationRepository().for_workspace(workspace.id)
    items.sort(key=lambda n: n.created_at, reverse=True)
    return items


@router.post("/notifications/{notification_id}/read", response_model=Notification)
def mark_read(
    notification_id: str, workspace: Workspace = Depends(get_current_workspace)
) -> Notification:
    repo = NotificationRepository()
    n = repo.get(notification_id)
    if not n or n.workspace_id != workspace.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read = True
    return repo.update(n)


@router.post("/notifications/read-all")
def mark_all_read(workspace: Workspace = Depends(get_current_workspace)) -> dict[str, int]:
    repo = NotificationRepository()
    count = 0
    for n in repo.for_workspace(workspace.id):
        if not n.read:
            n.read = True
            repo.update(n)
            count += 1
    _ = datetime.now(timezone.utc)
    return {"marked_read": count}

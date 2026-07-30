"""End-to-end style tests over the API using the in-memory store."""

import asyncio

import pytest
from fastapi.testclient import TestClient

from app.data.store import get_store
from app.main import app
from app.services.orchestrator import orchestrator


@pytest.fixture()
def client() -> TestClient:
    get_store().reset()
    with TestClient(app) as c:  # triggers lifespan -> seed
        yield c


def _auth_headers(client: TestClient) -> dict[str, str]:
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "founder@acme.ai", "password": "password"},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_health(client: TestClient) -> None:
    assert client.get("/health").json()["status"] == "ok"


def test_login_and_me(client: TestClient) -> None:
    headers = _auth_headers(client)
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "founder@acme.ai"


def test_register_creates_workspace(client: TestClient) -> None:
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "new@user.io", "name": "New User", "password": "secret1"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["user"]["workspace_id"]


def test_agents_seeded(client: TestClient) -> None:
    headers = _auth_headers(client)
    agents = client.get("/api/v1/agents", headers=headers).json()
    keys = {a["key"] for a in agents}
    assert "orchestrator" in keys
    assert len(agents) >= 18


def test_dashboard_and_analytics(client: TestClient) -> None:
    headers = _auth_headers(client)
    summary = client.get("/api/v1/dashboard/summary", headers=headers).json()
    assert summary["connected_accounts"] >= 1
    analytics = client.get("/api/v1/analytics", headers=headers).json()
    assert len(analytics["cards"]) == 6
    assert len(analytics["timeseries"]) == 30


def test_requires_auth(client: TestClient) -> None:
    assert client.get("/api/v1/agents").status_code == 401


def test_seeded_approval_can_be_decided(client: TestClient) -> None:
    headers = _auth_headers(client)
    approvals = client.get("/api/v1/approvals", headers=headers).json()
    pending = [a for a in approvals if a["status"] == "pending"]
    assert pending, "expected seeded pending approvals"
    resp = client.post(
        f"/api/v1/approvals/{pending[0]['id']}/decision",
        headers=headers,
        json={"approve": True},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "approved"


def test_seeded_lookups_use_consistent_ids(client: TestClient) -> None:
    """Guards against dict keys diverging from entity ids in the seed."""
    from app.data.store import get_store

    store = get_store()
    for coll in (store.approvals, store.scheduled, store.tasks, store.content):
        for key, entity in coll.items():
            assert key == entity.id


def test_orchestrator_runs_task_to_approval() -> None:
    get_store().reset()
    with TestClient(app):
        ws_id = next(iter(get_store().workspaces))
        task = orchestrator.create_task(ws_id, "Test goal", "Grow LinkedIn", [])
        asyncio.get_event_loop().run_until_complete(orchestrator.run_task(task.id))
        refreshed = get_store().tasks[task.id]
        assert refreshed.status.value == "waiting_approval"
        assert refreshed.content_ids  # content was generated

"""WebSocket connection manager for the live task timeline.

Clients subscribe per workspace and receive real-time events as the Orchestrator
drives tasks through their steps.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, workspace_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(workspace_id, set()).add(websocket)

    async def disconnect(self, workspace_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            conns = self._connections.get(workspace_id)
            if conns and websocket in conns:
                conns.remove(websocket)
                if not conns:
                    self._connections.pop(workspace_id, None)

    async def broadcast(self, workspace_id: str, message: dict[str, Any]) -> None:
        async with self._lock:
            targets = list(self._connections.get(workspace_id, set()))
        dead: list[WebSocket] = []
        for ws in targets:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(workspace_id, ws)


manager = ConnectionManager()

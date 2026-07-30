"""WebSocket endpoint for the live task timeline."""

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_access_token
from app.repositories.repositories import UserRepository
from app.ws.manager import manager

router = APIRouter()


@router.websocket("/ws")
async def task_stream(websocket: WebSocket, token: str = Query(default="")) -> None:
    user_id = decode_access_token(token)
    user = UserRepository().get(user_id) if user_id else None
    if not user or not user.workspace_id:
        await websocket.close(code=4401)
        return
    workspace_id = user.workspace_id
    await manager.connect(workspace_id, websocket)
    try:
        await websocket.send_json({"type": "connected", "workspace_id": workspace_id})
        while True:
            # Keep the connection alive; inbound messages are treated as pings.
            await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        await manager.disconnect(workspace_id, websocket)
    except Exception:
        await manager.disconnect(workspace_id, websocket)

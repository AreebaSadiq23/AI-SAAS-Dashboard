"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    agents,
    analytics,
    auth,
    content,
    tasks,
    workspaces,
    ws,
)
from app.core.config import settings
from app.data.seed import seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_if_empty()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI Workforce SaaS — autonomous social media management.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}


api = settings.api_v1_prefix
app.include_router(auth.router, prefix=api)
app.include_router(workspaces.router, prefix=api)
app.include_router(agents.router, prefix=api)
app.include_router(tasks.router, prefix=api)
app.include_router(content.router, prefix=api)
app.include_router(analytics.router, prefix=api)
app.include_router(ws.router)  # /ws (no version prefix)

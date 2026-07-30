"""Authentication + registration service."""

from __future__ import annotations

from uuid import uuid4

from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.data.store import get_store
from app.repositories.repositories import UserRepository, WorkspaceRepository
from app.schemas.auth import Token, UserPublic, UserRegister
from app.schemas.workspace import BusinessProfile, Workspace


def _id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


class AuthService:
    def __init__(self) -> None:
        self.users = UserRepository()
        self.workspaces = WorkspaceRepository()

    def register(self, payload: UserRegister) -> Token:
        store = get_store()
        if self.users.get_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
            )
        user_id = _id("user")
        ws_id = _id("ws")
        workspace = Workspace(
            id=ws_id,
            name=f"{payload.name}'s workspace",
            owner_id=user_id,
            profile=BusinessProfile(),
            onboarding_complete=False,
        )
        self.workspaces.add(workspace)
        user = UserPublic(
            id=user_id,
            email=payload.email,
            name=payload.name,
            role="owner",
            workspace_id=ws_id,
        )
        self.users.add(user)
        store.credentials[user_id] = hash_password(payload.password)
        store.email_index[payload.email.lower()] = user_id
        return self._token(user)

    def login(self, email: str, password: str) -> Token:
        store = get_store()
        user = self.users.get_by_email(email)
        if not user or not verify_password(password, store.credentials.get(user.id, "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )
        return self._token(user)

    def _token(self, user: UserPublic) -> Token:
        return Token(access_token=create_access_token(user.id), user=user)


auth_service = AuthService()

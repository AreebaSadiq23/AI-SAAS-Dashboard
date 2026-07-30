"""Auth routes."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import Token, UserLogin, UserPublic, UserRegister
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(payload: UserRegister) -> Token:
    return auth_service.register(payload)


@router.post("/login", response_model=Token)
def login(payload: UserLogin) -> Token:
    return auth_service.login(payload.email, payload.password)


@router.get("/me", response_model=UserPublic)
def me(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return user

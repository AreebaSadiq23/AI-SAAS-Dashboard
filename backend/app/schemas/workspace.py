"""Workspace + onboarding schemas."""

from pydantic import BaseModel, Field


class BusinessProfile(BaseModel):
    company_name: str = ""
    website: str = ""
    industry: str = ""
    target_audience: str = ""
    products: list[str] = Field(default_factory=list)
    services: list[str] = Field(default_factory=list)
    brand_colors: list[str] = Field(default_factory=list)
    brand_tone: str = ""
    goals: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    countries: list[str] = Field(default_factory=list)
    competitors: list[str] = Field(default_factory=list)
    social_links: dict[str, str] = Field(default_factory=dict)


class WorkspaceBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    profile: BusinessProfile = Field(default_factory=BusinessProfile)


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(BaseModel):
    name: str | None = None
    profile: BusinessProfile | None = None


class Workspace(WorkspaceBase):
    id: str
    owner_id: str
    onboarding_complete: bool = False

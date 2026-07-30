"""Analytics + notification schemas."""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import NotificationType, Platform


class MetricCard(BaseModel):
    key: str
    label: str
    value: float
    unit: str = ""
    change_pct: float = 0.0


class TimeseriesPoint(BaseModel):
    date: str
    reach: int
    impressions: int
    engagement: int
    followers: int


class PlatformBreakdown(BaseModel):
    platform: Platform
    reach: int
    engagement_rate: float
    followers: int
    posts: int


class TopPost(BaseModel):
    id: str
    platform: Platform
    title: str
    reach: int
    engagement_rate: float
    likes: int
    comments: int
    shares: int


class HashtagStat(BaseModel):
    tag: str
    reach: int
    posts: int
    engagement_rate: float


class BestTime(BaseModel):
    platform: Platform
    day: str
    hour: int
    score: float


class AnalyticsOverview(BaseModel):
    cards: list[MetricCard]
    timeseries: list[TimeseriesPoint]
    platform_breakdown: list[PlatformBreakdown]
    top_posts: list[TopPost]
    hashtags: list[HashtagStat]
    best_times: list[BestTime]
    insights: list[str]


class Notification(BaseModel):
    id: str
    workspace_id: str
    type: NotificationType
    title: str
    body: str
    read: bool = False
    created_at: datetime

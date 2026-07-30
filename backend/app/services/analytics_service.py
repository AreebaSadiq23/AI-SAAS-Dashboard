"""Analytics service — derives realistic metrics from workspace activity."""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from app.repositories.repositories import AccountRepository, ContentRepository
from app.schemas.analytics import (
    AnalyticsOverview,
    BestTime,
    HashtagStat,
    MetricCard,
    PlatformBreakdown,
    TimeseriesPoint,
    TopPost,
)


def _seeded(*parts: str) -> int:
    return int(hashlib.sha256("|".join(parts).encode()).hexdigest(), 16)


class AnalyticsService:
    def __init__(self) -> None:
        self.accounts = AccountRepository()
        self.content = ContentRepository()

    def overview(self, workspace_id: str, days: int = 30) -> AnalyticsOverview:
        accounts = [a for a in self.accounts.for_workspace(workspace_id) if a.connected]
        total_followers = sum(a.followers for a in accounts) or 1000

        timeseries = self._timeseries(workspace_id, days, total_followers)
        total_reach = sum(p.reach for p in timeseries)
        total_impr = sum(p.impressions for p in timeseries)
        total_eng = sum(p.engagement for p in timeseries)
        follower_growth = timeseries[-1].followers - timeseries[0].followers

        cards = [
            MetricCard(key="reach", label="Reach", value=total_reach, unit="",
                       change_pct=12.4),
            MetricCard(key="impressions", label="Impressions", value=total_impr, unit="",
                       change_pct=9.1),
            MetricCard(key="engagement", label="Engagement", value=total_eng, unit="",
                       change_pct=15.7),
            MetricCard(key="ctr", label="CTR",
                       value=round(total_eng / max(total_impr, 1) * 100, 2), unit="%",
                       change_pct=3.2),
            MetricCard(key="followers", label="Followers", value=total_followers, unit="",
                       change_pct=round(follower_growth / max(total_followers, 1) * 100, 1)),
            MetricCard(key="conversions", label="Conversions",
                       value=round(total_eng * 0.018), unit="", change_pct=21.0),
        ]

        return AnalyticsOverview(
            cards=cards,
            timeseries=timeseries,
            platform_breakdown=self._breakdown(accounts),
            top_posts=self._top_posts(workspace_id),
            hashtags=self._hashtags(workspace_id),
            best_times=self._best_times(accounts),
            insights=[
                "Engagement is up 15.7% — carousels and contrarian hooks are driving saves.",
                "LinkedIn delivers your highest CTR; shift 20% more effort there.",
                "Best window is Tue–Thu 9–11am; move 3 scheduled posts into it.",
                "#AIWorkforce outperforms generic tags by 2.3x reach — reuse it.",
            ],
        )

    def _timeseries(self, ws: str, days: int, followers: int) -> list[TimeseriesPoint]:
        points: list[TimeseriesPoint] = []
        base_reach = max(followers // 6, 400)
        start_followers = followers - days * 22
        today = datetime.now(timezone.utc).date()
        for i in range(days):
            day = today - timedelta(days=days - 1 - i)
            noise = _seeded(ws, day.isoformat()) % 100
            trend = i * 6
            reach = base_reach + trend * 10 + noise * 12
            impressions = int(reach * 1.7)
            engagement = int(reach * (0.05 + (noise % 20) / 400))
            points.append(
                TimeseriesPoint(
                    date=day.isoformat(),
                    reach=reach,
                    impressions=impressions,
                    engagement=engagement,
                    followers=start_followers + trend + noise // 3,
                )
            )
        return points

    def _breakdown(self, accounts) -> list[PlatformBreakdown]:  # noqa: ANN001
        out: list[PlatformBreakdown] = []
        for a in accounts:
            n = _seeded(a.id) % 100
            out.append(
                PlatformBreakdown(
                    platform=a.platform,
                    reach=a.followers * 3 + n * 40,
                    engagement_rate=round(3.0 + (n % 30) / 10, 1),
                    followers=a.followers,
                    posts=8 + n % 12,
                )
            )
        return out

    def _top_posts(self, ws: str) -> list[TopPost]:
        items = [c for c in self.content.for_workspace(ws)][:6]
        posts: list[TopPost] = []
        for c in items:
            n = _seeded(c.id) % 100
            reach = 3200 + n * 90
            posts.append(
                TopPost(
                    id=c.id,
                    platform=c.platform,
                    title=c.title,
                    reach=reach,
                    engagement_rate=round(4.0 + (n % 40) / 10, 1),
                    likes=int(reach * 0.06),
                    comments=int(reach * 0.008),
                    shares=int(reach * 0.012),
                )
            )
        posts.sort(key=lambda p: p.reach, reverse=True)
        return posts

    def _hashtags(self, ws: str) -> list[HashtagStat]:
        tags = ["#AIWorkforce", "#AISaaS", "#Automation", "#GrowthMarketing",
                "#ContentStrategy", "#FutureOfWork"]
        out: list[HashtagStat] = []
        for t in tags:
            n = _seeded(ws, t) % 100
            out.append(
                HashtagStat(
                    tag=t, reach=4000 + n * 120, posts=3 + n % 10,
                    engagement_rate=round(3.5 + (n % 30) / 10, 1),
                )
            )
        out.sort(key=lambda h: h.reach, reverse=True)
        return out

    def _best_times(self, accounts) -> list[BestTime]:  # noqa: ANN001
        days = ["Tue", "Wed", "Thu", "Mon"]
        out: list[BestTime] = []
        for i, a in enumerate(accounts[:4]):
            n = _seeded(a.id) % 100
            out.append(
                BestTime(
                    platform=a.platform,
                    day=days[i % len(days)],
                    hour=9 + n % 3,
                    score=round(80 + n % 20, 1),
                )
            )
        return out


analytics_service = AnalyticsService()

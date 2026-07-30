"""Provider-agnostic AI layer.

The platform is designed to support multiple providers (OpenAI, Anthropic,
Gemini, Ollama). To keep the whole workflow runnable with zero API keys, the
default provider is a deterministic *simulation* that produces realistic,
platform-aware content. Real providers can be added behind the same interface.
"""

from __future__ import annotations

import hashlib
from typing import Protocol

from app.core.config import settings
from app.schemas.common import Platform

_PLATFORM_STYLE: dict[Platform, str] = {
    Platform.linkedin: "professional, long-form, story-led",
    Platform.instagram: "visual, punchy caption with a carousel idea",
    Platform.facebook: "warm and community-focused",
    Platform.x: "short, sharp and quotable",
    Platform.tiktok: "video-first hook and script beat",
    Platform.pinterest: "evergreen, keyword-rich",
    Platform.threads: "conversational and community-first",
    Platform.youtube: "a title, hook and description",
}

_HASHTAG_BANK = [
    "AISaaS", "AIWorkforce", "Automation", "GrowthMarketing", "SocialMedia",
    "ContentStrategy", "FutureOfWork", "BuildInPublic", "MarketingAI", "SaaS",
    "LinkedInTips", "CreatorEconomy", "B2BMarketing", "Startup", "ProductLed",
]


class AIProvider(Protocol):
    def complete(self, system: str, prompt: str) -> str: ...


class SimulationProvider:
    """Deterministic content generator used when no API key is configured."""

    def complete(self, system: str, prompt: str) -> str:
        seed = int(hashlib.sha256((system + prompt).encode()).hexdigest(), 16)
        return f"[sim:{seed % 100000}] {prompt[:80]}"

    def write_post(self, platform: Platform, topic: str, brand_tone: str) -> str:
        style = _PLATFORM_STYLE.get(platform, "engaging")
        tone = brand_tone or "confident and helpful"
        if platform == Platform.linkedin:
            return (
                f"Most teams treat {topic} as a cost. The best treat it as leverage.\n\n"
                f"Here's the shift: instead of one marketer doing everything, imagine an "
                f"autonomous workforce that researches, writes, approves and publishes — "
                f"while you focus on the goal.\n\n"
                f"3 things that changed for us:\n"
                f"1. Strategy in minutes, not weeks\n"
                f"2. On-brand content at 10x the volume\n"
                f"3. Every post learns from the last\n\n"
                f"What would you automate first? ({tone} voice)"
            )
        if platform == Platform.x:
            return f"{topic} isn't a headcount problem. It's an orchestration problem. 🧵"
        if platform == Platform.youtube:
            return (
                f"Title: How we automated {topic} with an AI workforce\n"
                f"Hook: What if a team of AI employees ran your socials end to end?\n"
                f"Description: A deep dive into orchestrating autonomous agents for {topic}."
            )
        return (
            f"{topic} — done for you by an AI workforce. "
            f"Swipe to see how autonomous agents plan, create and publish. "
            f"({style}, {tone})"
        )

    def hashtags(self, topic: str, count: int = 6) -> list[str]:
        seed = int(hashlib.sha256(topic.encode()).hexdigest(), 16)
        picks: list[str] = []
        i = 0
        while len(picks) < count and i < len(_HASHTAG_BANK) * 2:
            tag = _HASHTAG_BANK[(seed + i) % len(_HASHTAG_BANK)]
            if tag not in picks:
                picks.append(tag)
            i += 1
        return [f"#{t}" for t in picks]

    def image_prompt(self, platform: Platform, topic: str, colors: list[str]) -> str:
        palette = ", ".join(colors) if colors else "brand gradient of indigo and violet"
        return (
            f"Editorial hero image for a {platform.value} post about {topic}. "
            f"Clean modern SaaS aesthetic, soft studio lighting, subtle 3D glass shapes, "
            f"palette: {palette}. Negative space for text. High detail, 4k."
        )


def get_provider() -> SimulationProvider:
    # Only the simulation provider is bundled; real adapters plug in here based on
    # settings.ai_provider and the configured API keys.
    _ = settings.ai_provider
    return SimulationProvider()

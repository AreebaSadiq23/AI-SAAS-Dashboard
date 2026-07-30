"""Catalog of AI employees that make up the workforce.

Each entry is a static definition of an agent's role, responsibilities, goals,
inputs and outputs. The Orchestrator uses this catalog to know which agents
exist and what each one is capable of.
"""

from __future__ import annotations

from typing import TypedDict


class AgentDef(TypedDict):
    key: str
    name: str
    role: str
    category: str
    description: str
    avatar: str
    responsibilities: list[str]
    goals: list[str]
    inputs: list[str]
    outputs: list[str]


AGENT_CATALOG: list[AgentDef] = [
    {
        "key": "orchestrator",
        "name": "Master Orchestrator",
        "role": "Chief of Staff",
        "category": "orchestrator",
        "description": (
            "Receives user goals, breaks them into tasks, assigns them to the right "
            "agents, tracks progress, retries failures and merges results into one "
            "deliverable. All agent communication flows through the Orchestrator."
        ),
        "avatar": "compass",
        "responsibilities": [
            "Decompose business goals into an ordered task plan",
            "Assign each step to the most capable agent",
            "Coordinate hand-offs between agents",
            "Retry failed steps and escalate blockers",
            "Merge agent outputs into a single deliverable",
        ],
        "goals": ["Turn one goal into a finished, approved, scheduled campaign"],
        "inputs": ["User business goals", "Workspace profile", "Agent status"],
        "outputs": ["Task plan", "Assignments", "Final deliverable"],
    },
    {
        "key": "planner",
        "name": "Planner Agent",
        "role": "Strategy Planner",
        "category": "strategy",
        "description": "Turns goals into a content strategy and calendar.",
        "avatar": "map",
        "responsibilities": [
            "Define objectives and KPIs",
            "Build a multi-platform content calendar",
            "Balance content pillars and cadence",
        ],
        "goals": ["Produce an actionable strategy and calendar"],
        "inputs": ["Business goals", "Research findings"],
        "outputs": ["Strategy", "Content calendar"],
    },
    {
        "key": "research",
        "name": "Research Agent",
        "role": "Market Researcher",
        "category": "strategy",
        "description": "Researches the niche, audience and competitors.",
        "avatar": "search",
        "responsibilities": [
            "Analyze the niche and trends",
            "Profile the target audience",
            "Benchmark competitors",
        ],
        "goals": ["Surface insights that sharpen strategy and content"],
        "inputs": ["Industry", "Competitors", "Audience"],
        "outputs": ["Research brief", "Competitor analysis"],
    },
    {
        "key": "seo",
        "name": "SEO Agent",
        "role": "SEO Specialist",
        "category": "strategy",
        "description": "Optimizes content for discovery and search.",
        "avatar": "trending-up",
        "responsibilities": [
            "Identify keywords and search intent",
            "Optimize titles, hooks and descriptions",
            "Recommend high-performing hashtags",
        ],
        "goals": ["Maximize organic reach and discoverability"],
        "inputs": ["Topic", "Platform", "Audience"],
        "outputs": ["Keywords", "Optimized copy", "Hashtag sets"],
    },
    {
        "key": "content_writer",
        "name": "Content Writer Agent",
        "role": "Copywriter",
        "category": "content",
        "description": "Writes platform-ready posts, captions and scripts.",
        "avatar": "pen",
        "responsibilities": [
            "Draft posts from the strategy and research",
            "Adapt copy to each platform's format",
            "Craft strong hooks and CTAs",
        ],
        "goals": ["Produce publish-ready copy that converts"],
        "inputs": ["Strategy", "Keywords", "Brand voice"],
        "outputs": ["Post drafts", "Captions", "Scripts"],
    },
    {
        "key": "brand_voice",
        "name": "Brand Voice Agent",
        "role": "Brand Guardian",
        "category": "content",
        "description": "Ensures every asset matches the brand voice and guidelines.",
        "avatar": "megaphone",
        "responsibilities": [
            "Apply brand tone and terminology",
            "Enforce brand guidelines",
            "Flag off-brand phrasing",
        ],
        "goals": ["Keep every asset consistently on-brand"],
        "inputs": ["Draft content", "Brand guidelines"],
        "outputs": ["On-brand content"],
    },
    {
        "key": "image_prompt",
        "name": "Image Prompt Agent",
        "role": "Visual Director",
        "category": "content",
        "description": "Generates image prompts and visual concepts.",
        "avatar": "image",
        "responsibilities": [
            "Turn posts into visual concepts",
            "Write detailed image-generation prompts",
            "Keep visuals on-brand",
        ],
        "goals": ["Give every post a scroll-stopping visual concept"],
        "inputs": ["Post content", "Brand colors"],
        "outputs": ["Image prompts", "Visual concepts"],
    },
    {
        "key": "approval",
        "name": "Approval Agent",
        "role": "Quality Gate",
        "category": "ops",
        "description": "Routes content for human approval and tracks decisions.",
        "avatar": "check-circle",
        "responsibilities": [
            "Package content for review",
            "Request human approval",
            "Record decisions and comments",
        ],
        "goals": ["Nothing publishes without passing the quality gate"],
        "inputs": ["Finished content"],
        "outputs": ["Approval requests", "Decisions"],
    },
    {
        "key": "publishing",
        "name": "Publishing Agent",
        "role": "Publisher",
        "category": "ops",
        "description": "Schedules and publishes approved content to platforms.",
        "avatar": "send",
        "responsibilities": [
            "Schedule posts at optimal times",
            "Publish to connected accounts",
            "Handle publish retries and failures",
        ],
        "goals": ["Publish reliably at the best times"],
        "inputs": ["Approved content", "Best times"],
        "outputs": ["Scheduled posts", "Publish results"],
    },
    {
        "key": "analytics",
        "name": "Analytics Agent",
        "role": "Data Analyst",
        "category": "ops",
        "description": "Tracks performance and produces actionable insights.",
        "avatar": "bar-chart",
        "responsibilities": [
            "Collect reach, engagement and growth metrics",
            "Compare platforms and posts",
            "Recommend improvements",
        ],
        "goals": ["Turn performance data into better future content"],
        "inputs": ["Published posts", "Platform metrics"],
        "outputs": ["Reports", "Insights"],
    },
    {
        "key": "memory",
        "name": "Memory Agent",
        "role": "Knowledge Keeper",
        "category": "ops",
        "description": "Stores learnings so the workforce improves over time.",
        "avatar": "database",
        "responsibilities": [
            "Persist strategy and performance learnings",
            "Recall relevant context for new tasks",
            "Maintain the knowledge base",
        ],
        "goals": ["Make every campaign smarter than the last"],
        "inputs": ["Task results", "Analytics"],
        "outputs": ["Memory entries", "Recalled context"],
    },
    {
        "key": "notification",
        "name": "Notification Agent",
        "role": "Comms",
        "category": "ops",
        "description": "Notifies users of key events.",
        "avatar": "bell",
        "responsibilities": [
            "Notify on task completion",
            "Alert when approval is required",
            "Report publish and analytics events",
        ],
        "goals": ["Keep the user informed at the right moments"],
        "inputs": ["System events"],
        "outputs": ["Notifications"],
    },
]

# Platform agents share a template.
_PLATFORM_AGENTS = [
    ("linkedin", "LinkedIn Agent", "Professional, long-form storytelling, SEO optimized"),
    ("instagram", "Instagram Agent", "Visual, short captions, carousels, reels and stories"),
    ("facebook", "Facebook Agent", "Community-focused posts and engagement"),
    ("x", "X (Twitter) Agent", "Short, punchy, engaging posts and threads"),
    ("tiktok", "TikTok Agent", "Video-first hooks and trend-aware scripts"),
    ("pinterest", "Pinterest Agent", "Evergreen, keyword-rich pins"),
    ("threads", "Threads Agent", "Conversational, community-first posts"),
    ("youtube", "YouTube Agent", "Scripts, titles and descriptions"),
]

for _key, _name, _desc in _PLATFORM_AGENTS:
    AGENT_CATALOG.append(
        {
            "key": _key,
            "name": _name,
            "role": "Platform Specialist",
            "category": "platform",
            "description": _desc,
            "avatar": _key,
            "responsibilities": [
                f"Adapt content to {_name.split(' Agent')[0]} best practices",
                "Apply platform-native formatting",
                "Optimize for the platform's algorithm",
            ],
            "goals": [f"Maximize performance on {_name.split(' Agent')[0]}"],
            "inputs": ["On-brand content", "Platform strategy"],
            "outputs": ["Platform-optimized post"],
        }
    )


CATALOG_BY_KEY: dict[str, AgentDef] = {a["key"]: a for a in AGENT_CATALOG}

export type Platform =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "pinterest"
  | "threads"
  | "youtube";

export type AgentStatus = "idle" | "working" | "waiting" | "error" | "offline";

export type TaskStatus =
  | "queued"
  | "planning"
  | "in_progress"
  | "waiting_approval"
  | "publishing"
  | "completed"
  | "failed";

export type StepStatus = "pending" | "running" | "completed" | "failed";

export type ContentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type NotificationType =
  | "task_complete"
  | "approval_required"
  | "publish_success"
  | "publish_failed"
  | "analytics_available";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
  workspace_id: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface BusinessProfile {
  company_name: string;
  website: string;
  industry: string;
  target_audience: string;
  products: string[];
  services: string[];
  brand_colors: string[];
  brand_tone: string;
  goals: string[];
  languages: string[];
  countries: string[];
  competitors: string[];
  social_links: Record<string, string>;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  profile: BusinessProfile;
  onboarding_complete: boolean;
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  task_id: string | null;
}

export interface Agent {
  id: string;
  key: string;
  name: string;
  role: string;
  category: string;
  description: string;
  avatar: string;
  responsibilities: string[];
  goals: string[];
  inputs: string[];
  outputs: string[];
  status: AgentStatus;
  memory: string[];
  tasks_completed: number;
  success_rate: number;
  current_task_id: string | null;
  events: AgentEvent[];
}

export interface TaskStep {
  id: string;
  name: string;
  agent_key: string;
  status: StepStatus;
  started_at: string | null;
  completed_at: string | null;
  output: string | null;
}

export interface TaskLog {
  id: string;
  timestamp: string;
  agent_key: string;
  level: string;
  message: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  title: string;
  goal: string;
  platforms: Platform[];
  status: TaskStatus;
  progress: number;
  orchestrator_summary: string;
  steps: TaskStep[];
  logs: TaskLog[];
  content_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  platforms: Platform[];
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  workspace_id: string;
  task_id: string | null;
  platform: Platform;
  title: string;
  body: string;
  hashtags: string[];
  image_prompt: string | null;
  status: ContentStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  workspace_id: string;
  content_id: string;
  platform: Platform;
  title: string;
  preview: string;
  status: ApprovalStatus;
  requested_at: string;
  resolved_at: string | null;
  comment: string | null;
}

export interface ScheduledPost {
  id: string;
  workspace_id: string;
  content_id: string;
  platform: Platform;
  title: string;
  scheduled_at: string;
  status: ContentStatus;
}

export interface ConnectedAccount {
  id: string;
  workspace_id: string;
  platform: Platform;
  handle: string;
  connected: boolean;
  followers: number;
  connected_at: string | null;
}

export interface KnowledgeDoc {
  id: string;
  workspace_id: string;
  name: string;
  kind: string;
  size_kb: number;
  added_at: string;
  summary: string;
}

export interface MetricCard {
  key: string;
  label: string;
  value: number;
  unit: string;
  change_pct: number;
}

export interface TimeseriesPoint {
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  followers: number;
}

export interface PlatformBreakdown {
  platform: Platform;
  reach: number;
  engagement_rate: number;
  followers: number;
  posts: number;
}

export interface TopPost {
  id: string;
  platform: Platform;
  title: string;
  reach: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface HashtagStat {
  tag: string;
  reach: number;
  posts: number;
  engagement_rate: number;
}

export interface BestTime {
  platform: Platform;
  day: string;
  hour: number;
  score: number;
}

export interface AnalyticsOverview {
  cards: MetricCard[];
  timeseries: TimeseriesPoint[];
  platform_breakdown: PlatformBreakdown[];
  top_posts: TopPost[];
  hashtags: HashtagStat[];
  best_times: BestTime[];
  insights: string[];
}

export interface Notification {
  id: string;
  workspace_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  active_tasks: number;
  completed_tasks: number;
  pending_approvals: number;
  connected_accounts: number;
  total_followers: number;
  unread_notifications: number;
}

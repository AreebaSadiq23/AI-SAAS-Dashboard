import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  ArrowUpRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { agentApi, analyticsApi, notificationApi, taskApi } from "@/lib/api";
import { TASK_STATUS_META } from "@/lib/platforms";
import { formatNumber, timeAgo } from "@/lib/utils";
import { Card, PageLoader, ProgressBar, SectionTitle } from "@/components/ui";
import { AgentAvatar } from "@/components/AgentAvatar";
import { PlatformBadge } from "@/components/PlatformBadge";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { useAuth } from "@/store/auth";

export default function DashboardPage() {
  const [dialog, setDialog] = useState(false);
  const user = useAuth((s) => s.user);
  const { data: summary } = useQuery({ queryKey: ["dashboard"], queryFn: analyticsApi.dashboard });
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: taskApi.list });
  const { data: agents } = useQuery({ queryKey: ["agents"], queryFn: agentApi.list });
  const { data: analytics } = useQuery({
    queryKey: ["analytics", 30],
    queryFn: () => analyticsApi.overview(30),
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.list,
  });

  if (!summary || !tasks || !agents) return <PageLoader />;

  const activeTasks = tasks.filter((t) =>
    ["in_progress", "planning", "waiting_approval", "publishing", "queued"].includes(t.status),
  );
  const workingAgents = agents.filter((a) => a.status === "working" || a.status === "waiting");

  const stats = [
    {
      label: "Active tasks",
      value: summary.active_tasks,
      icon: Sparkles,
      tint: "from-blue-500 to-cyan-500",
    },
    {
      label: "Completed",
      value: summary.completed_tasks,
      icon: CheckCircle2,
      tint: "from-emerald-500 to-teal-500",
    },
    {
      label: "Pending approvals",
      value: summary.pending_approvals,
      icon: BadgeCheck,
      tint: "from-purple-500 to-fuchsia-500",
    },
    {
      label: "Total followers",
      value: formatNumber(summary.total_followers),
      icon: Users,
      tint: "from-brand-500 to-violet-500",
    },
  ];

  return (
    <>
      <SectionTitle
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Here's what your AI workforce is doing today."
        action={
          <button className="btn-primary" onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4" /> New goal
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.tint} text-white`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Active tasks</h2>
              <Link to="/tasks" className="text-sm font-medium text-brand-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activeTasks.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  No active tasks. Launch a new goal to get started.
                </p>
              )}
              {activeTasks.map((t) => {
                const meta = TASK_STATUS_META[t.status];
                return (
                  <Link
                    key={t.id}
                    to={`/tasks/${t.id}`}
                    className="block rounded-xl border border-slate-100 p-4 transition hover:border-brand-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-brand-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{t.title}</p>
                      <span className={`badge ${meta.className}`}>{meta.label}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={t.progress} />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {t.progress}%
                      </span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {t.platforms.map((p) => (
                        <PlatformBadge key={p} platform={p} />
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {analytics && (
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Reach — last 30 days</h2>
                  <p className="flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" /> +12.4% vs previous period
                  </p>
                </div>
                <Link
                  to="/analytics"
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Details
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.timeseries}>
                  <defs>
                    <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }}
                    labelStyle={{ color: "#64748b" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#reachFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Workforce</h2>
              <Link
                to="/workforce"
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10">
              <Bot className="h-5 w-5 text-brand-600" />
              <p className="text-sm">
                <b>{workingAgents.length}</b> of {agents.length} agents active now
              </p>
            </div>
            <div className="space-y-3">
              {agents.slice(0, 6).map((a) => (
                <Link
                  key={a.key}
                  to="/workforce"
                  className="flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <AgentAvatar avatarKey={a.avatar} status={a.status} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <p className="truncate text-xs capitalize text-slate-400">
                      {a.status}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent activity</h2>
              <Link
                to="/notifications"
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                All
              </Link>
            </div>
            <div className="space-y-3">
              {(notifications ?? []).slice(0, 5).map((n) => (
                <div key={n.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-slate-400">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {dialog && <NewTaskDialog onClose={() => setDialog(false)} />}
    </>
  );
}

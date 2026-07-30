import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Lightbulb } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { PLATFORM_META } from "@/lib/platforms";
import { formatDate, formatNumber } from "@/lib/utils";
import { Card, PageLoader, SectionTitle } from "@/components/ui";
import { PlatformBadge } from "@/components/PlatformBadge";

const RANGES = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => analyticsApi.overview(days),
  });
  if (!data) return <PageLoader />;

  return (
    <>
      <SectionTitle
        title="Analytics"
        subtitle="Performance across every connected platform, with actionable insights."
        action={
          <div className="flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-800">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  days === r.days
                    ? "bg-brand-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {data.cards.map((c) => {
          const positive = c.change_pct >= 0;
          return (
            <Card key={c.key} className="p-4">
              <p className="text-xs text-slate-400">{c.label}</p>
              <p className="mt-1 text-xl font-bold">
                {c.unit === "%" ? `${c.value}%` : formatNumber(c.value)}
              </p>
              <p
                className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${
                  positive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(c.change_pct)}%
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Reach & engagement</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.timeseries}>
              <defs>
                <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="e" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} stroke="#94a3b8" />
              <YAxis tickFormatter={formatNumber} fontSize={11} stroke="#94a3b8" width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="reach" stroke="#6366f1" fill="url(#r)" strokeWidth={2} />
              <Area type="monotone" dataKey="engagement" stroke="#22c55e" fill="url(#e)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Follower growth</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} stroke="#94a3b8" />
              <YAxis tickFormatter={formatNumber} fontSize={11} stroke="#94a3b8" width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Reach by platform</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.platform_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis
                dataKey="platform"
                tickFormatter={(p) => PLATFORM_META[p as keyof typeof PLATFORM_META].label}
                fontSize={11}
                stroke="#94a3b8"
              />
              <YAxis tickFormatter={formatNumber} fontSize={11} stroke="#94a3b8" width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="reach" radius={[6, 6, 0, 0]}>
                {data.platform_breakdown.map((p) => (
                  <Cell key={p.platform} fill={PLATFORM_META[p.platform].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Top hashtags</h2>
          <div className="space-y-3">
            {data.hashtags.map((h) => {
              const max = Math.max(...data.hashtags.map((x) => x.reach));
              return (
                <div key={h.tag}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-brand-600">{h.tag}</span>
                    <span className="text-slate-400">
                      {formatNumber(h.reach)} · {h.engagement_rate}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                      style={{ width: `${(h.reach / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Top posts</h2>
          <div className="space-y-3">
            {data.top_posts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <div className="mb-1">
                    <PlatformBadge platform={p.platform} />
                  </div>
                  <p className="truncate text-sm font-medium">{p.title}</p>
                </div>
                <div className="flex shrink-0 gap-4 text-right text-xs text-slate-400">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {formatNumber(p.reach)}
                    </p>
                    reach
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {p.engagement_rate}%
                    </p>
                    eng.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold">Best times to post</h2>
            <div className="space-y-2">
              {data.best_times.map((b) => (
                <div
                  key={b.platform}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                >
                  <PlatformBadge platform={b.platform} />
                  <span className="text-sm font-medium">
                    {b.day} · {b.hour}:00
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Lightbulb className="h-5 w-5 text-amber-500" /> Insights
            </h2>
            <ul className="space-y-2.5">
              {data.insights.map((ins, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {ins}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

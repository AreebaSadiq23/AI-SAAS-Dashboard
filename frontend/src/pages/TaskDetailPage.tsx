import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Hash,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { contentApi, taskApi } from "@/lib/api";
import { TASK_STATUS_META } from "@/lib/platforms";
import type { StepStatus } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { Card, PageLoader, ProgressBar, SectionTitle } from "@/components/ui";
import { AgentAvatar } from "@/components/AgentAvatar";
import { PlatformBadge } from "@/components/PlatformBadge";

const STEP_ICON: Record<StepStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  running: <Loader2 className="h-5 w-5 animate-spin text-brand-500" />,
  pending: <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />,
  failed: <Circle className="h-5 w-5 text-red-500" />,
};

type Tab = "timeline" | "content" | "logs";

export default function TaskDetailPage() {
  const { taskId = "" } = useParams();
  const [tab, setTab] = useState<Tab>("timeline");

  const { data: task } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskApi.get(taskId),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status && !["completed", "failed"].includes(status) ? 2000 : false;
    },
  });
  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: contentApi.list,
    refetchInterval: () => {
      const status = task?.status;
      return status && !["completed", "failed"].includes(status) ? 2000 : false;
    },
  });

  if (!task) return <PageLoader />;
  const meta = TASK_STATUS_META[task.status];
  const taskContent = (content ?? []).filter((c) => c.task_id === task.id);

  return (
    <>
      <Link to="/tasks" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </Link>
      <SectionTitle
        title={task.title}
        subtitle={task.goal}
        action={<span className={`badge ${meta.className}`}>{meta.label}</span>}
      />

      <Card className="mb-6 bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-500/10 dark:to-violet-500/10">
        <div className="flex items-start gap-3">
          <AgentAvatar avatarKey="compass" status="working" size={40} />
          <div className="flex-1">
            <p className="text-sm font-semibold">Master Orchestrator</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {task.orchestrator_summary}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={task.progress} />
              </div>
              <span className="text-xs font-medium text-slate-500">{task.progress}%</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-5 flex gap-2">
        {(["timeline", "content", "logs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t ? "btn-primary px-4 py-2 text-sm capitalize" : "btn-outline px-4 py-2 text-sm capitalize"
            }
          >
            {t}
            {t === "content" && taskContent.length > 0 ? ` (${taskContent.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <Card>
          <div className="space-y-1">
            {task.steps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {STEP_ICON[step.status]}
                  {i < task.steps.length - 1 && (
                    <span
                      className={`my-1 w-0.5 flex-1 ${
                        step.status === "completed"
                          ? "bg-emerald-300 dark:bg-emerald-700"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium ${
                        step.status === "pending" ? "text-slate-400" : ""
                      }`}
                    >
                      {step.name}
                    </p>
                    {step.completed_at && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(step.completed_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs capitalize text-slate-400">
                    {step.agent_key.replace(/_/g, " ")} agent
                  </p>
                  {step.output && (
                    <p className="mt-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:bg-slate-800/50">
                      {step.output}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "content" && (
        <div className="grid gap-4 md:grid-cols-2">
          {taskContent.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500">
                Content will appear here once the writer agent finishes.
              </p>
            </Card>
          )}
          {taskContent.map((c) => (
            <Card key={c.id}>
              <div className="mb-2 flex items-center justify-between">
                <PlatformBadge platform={c.platform} />
                <span className="badge bg-slate-100 capitalize text-slate-500 dark:bg-slate-800">
                  {c.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
                <FileText className="h-4 w-4 text-slate-400" /> {c.title}
              </p>
              <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                {c.body}
              </p>
              {c.hashtags.length > 0 && (
                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-brand-600">
                  <Hash className="h-3 w-3" />
                  {c.hashtags.join(" ")}
                </p>
              )}
              {c.image_prompt && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/50">
                  <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {c.image_prompt}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <Card>
          <div className="space-y-2 font-mono text-xs">
            {task.logs.length === 0 && (
              <p className="text-slate-400">No logs yet.</p>
            )}
            {task.logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="shrink-0 text-slate-400">{timeAgo(log.timestamp)}</span>
                <span className="shrink-0 font-semibold text-brand-600">
                  [{log.agent_key}]
                </span>
                <span className="text-slate-600 dark:text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

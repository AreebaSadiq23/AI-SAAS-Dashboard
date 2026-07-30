import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { taskApi } from "@/lib/api";
import { TASK_STATUS_META } from "@/lib/platforms";
import type { TaskStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Card, EmptyState, PageLoader, ProgressBar, SectionTitle } from "@/components/ui";
import { PlatformBadge } from "@/components/PlatformBadge";
import { NewTaskDialog } from "@/components/NewTaskDialog";

const FILTERS: { key: TaskStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "waiting_approval", label: "Needs approval" },
  { key: "completed", label: "Completed" },
];

export default function TasksPage() {
  const [dialog, setDialog] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: taskApi.list });
  if (!tasks) return <PageLoader />;

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "in_progress")
      return ["in_progress", "planning", "publishing", "queued"].includes(t.status);
    return t.status === filter;
  });

  return (
    <>
      <SectionTitle
        title="Tasks"
        subtitle="Every goal your workforce is executing, with live progress."
        action={
          <button className="btn-primary" onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4" /> New goal
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              filter === f.key
                ? "btn-primary px-3.5 py-1.5 text-sm"
                : "btn-outline px-3.5 py-1.5 text-sm"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Give your AI workforce a business goal and watch it execute end to end."
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((t) => {
            const meta = TASK_STATUS_META[t.status];
            return (
              <Link key={t.id} to={`/tasks/${t.id}`}>
                <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-xs text-slate-400">
                        Updated {timeAgo(t.updated_at)}
                      </p>
                    </div>
                    <span className={`badge ${meta.className}`}>{meta.label}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar value={t.progress} />
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {t.progress}%
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {dialog && <NewTaskDialog onClose={() => setDialog(false)} />}
    </>
  );
}

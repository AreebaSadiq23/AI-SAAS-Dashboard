import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/lib/api";
import { TASK_STATUS_META } from "@/lib/platforms";
import type { TaskStatus } from "@/lib/types";
import { PageLoader, ProgressBar, SectionTitle } from "@/components/ui";
import { PlatformBadge } from "@/components/PlatformBadge";

const COLUMNS: { statuses: TaskStatus[]; label: string }[] = [
  { label: "Queued", statuses: ["queued", "planning"] },
  { label: "In progress", statuses: ["in_progress", "publishing"] },
  { label: "Needs approval", statuses: ["waiting_approval"] },
  { label: "Completed", statuses: ["completed", "failed"] },
];

export default function ProjectsPage() {
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: taskApi.list });
  if (!tasks) return <PageLoader />;

  return (
    <>
      <SectionTitle
        title="Projects"
        subtitle="A board view of every campaign across its lifecycle."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => col.statuses.includes(t.status));
          return (
            <div key={col.label} className="rounded-2xl bg-slate-100/60 p-3 dark:bg-slate-800/40">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold">{col.label}</p>
                <span className="badge bg-white text-slate-500 dark:bg-slate-900">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((t) => {
                  const meta = TASK_STATUS_META[t.status];
                  return (
                    <Link
                      key={t.id}
                      to={`/tasks/${t.id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{t.title}</p>
                      </div>
                      <span className={`badge ${meta.className}`}>{meta.label}</span>
                      <div className="mt-3">
                        <ProgressBar value={t.progress} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} />
                        ))}
                      </div>
                    </Link>
                  );
                })}
                {items.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

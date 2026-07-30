import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { contentApi } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { EmptyState, PageLoader, SectionTitle } from "@/components/ui";
import { PlatformIcon } from "@/components/PlatformBadge";
import { PLATFORM_META } from "@/lib/platforms";

export default function ScheduledPage() {
  const { data: scheduled } = useQuery({ queryKey: ["scheduled"], queryFn: contentApi.scheduled });
  if (!scheduled) return <PageLoader />;

  return (
    <>
      <SectionTitle
        title="Scheduled Posts"
        subtitle="Approved content queued for publishing at optimal times."
      />
      {scheduled.length === 0 ? (
        <EmptyState
          icon={<Send className="h-10 w-10" />}
          title="Nothing scheduled yet"
          description="Approve generated content and the Publishing agent will queue it here."
        />
      ) : (
        <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {scheduled.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-4">
              <PlatformIcon platform={s.platform} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-xs text-slate-400">{PLATFORM_META[s.platform].label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatDateTime(s.scheduled_at)}</p>
                <span className="badge bg-cyan-100 capitalize text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

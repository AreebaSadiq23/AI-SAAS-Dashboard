import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  CheckCheck,
  CheckCircle2,
  Send,
  XCircle,
} from "lucide-react";
import { notificationApi } from "@/lib/api";
import type { NotificationType } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { EmptyState, PageLoader, SectionTitle } from "@/components/ui";

const ICON: Record<NotificationType, React.ReactNode> = {
  task_complete: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  approval_required: <BadgeCheck className="h-5 w-5 text-purple-500" />,
  publish_success: <Send className="h-5 w-5 text-cyan-500" />,
  publish_failed: <XCircle className="h-5 w-5 text-red-500" />,
  analytics_available: <BarChart3 className="h-5 w-5 text-brand-500" />,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.list,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const markRead = useMutation({ mutationFn: notificationApi.markRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate });

  if (!notifications) return <PageLoader />;

  return (
    <>
      <SectionTitle
        title="Notifications"
        subtitle="Every important event from your workforce."
        action={
          <button
            className="btn-outline"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || notifications.every((n) => n.read)}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-10 w-10" />} title="No notifications" />
      ) : (
        <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                n.read ? "opacity-60" : ""
              }`}
            >
              <div className="mt-0.5">{ICON[n.type]}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{timeAgo(n.created_at)}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

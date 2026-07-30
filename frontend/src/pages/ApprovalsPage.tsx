import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Check, X } from "lucide-react";
import { contentApi } from "@/lib/api";
import type { Approval } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Card, EmptyState, PageLoader, SectionTitle } from "@/components/ui";
import { PlatformBadge } from "@/components/PlatformBadge";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { data: approvals } = useQuery({
    queryKey: ["approvals"],
    queryFn: contentApi.approvals,
  });

  const mutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      contentApi.decide(id, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled"] });
    },
  });

  if (!approvals) return <PageLoader />;
  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  return (
    <>
      <SectionTitle
        title="Approvals"
        subtitle="Review AI-generated content before it publishes."
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={<BadgeCheck className="h-10 w-10" />}
          title="You're all caught up"
          description="No content is waiting for your approval right now."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <PlatformBadge platform={a.platform} />
                    <span className="text-xs text-slate-400">
                      requested {timeAgo(a.requested_at)}
                    </span>
                  </div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {a.preview}…
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ id: a.id, approve: true })}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    className="btn-outline"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ id: a.id, approve: false })}
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Resolved
          </h2>
          <div className="space-y-3">
            {resolved.map((a: Approval) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={a.platform} />
                  <span className="text-sm">{a.title}</span>
                </div>
                <span
                  className={`badge capitalize ${
                    a.status === "approved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

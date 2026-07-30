import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "@/lib/api";
import { ALL_PLATFORMS, PLATFORM_META } from "@/lib/platforms";
import { formatNumber } from "@/lib/utils";
import { Card, PageLoader, SectionTitle } from "@/components/ui";
import { PlatformIcon } from "@/components/PlatformBadge";
import type { Platform } from "@/lib/types";

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery({ queryKey: ["accounts"], queryFn: contentApi.accounts });
  const mutation = useMutation({
    mutationFn: (id: string) => contentApi.toggleAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  if (!accounts) return <PageLoader />;

  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));

  return (
    <>
      <SectionTitle
        title="Connected Accounts"
        subtitle="Connect the platforms your workforce should publish to."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_PLATFORMS.map((platform: Platform) => {
          const account = byPlatform.get(platform);
          const meta = PLATFORM_META[platform];
          const connected = account?.connected ?? false;
          return (
            <Card key={platform} className="flex flex-col">
              <div className="flex items-center gap-3">
                <PlatformIcon platform={platform} size={44} />
                <div className="flex-1">
                  <p className="font-semibold">{meta.label}</p>
                  <p className="text-xs text-slate-400">
                    {connected ? account?.handle : "Not connected"}
                  </p>
                </div>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    connected ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              </div>
              {connected && (
                <p className="mt-3 text-sm text-slate-500">
                  <b className="text-slate-800 dark:text-slate-100">
                    {formatNumber(account?.followers ?? 0)}
                  </b>{" "}
                  followers
                </p>
              )}
              <button
                className={connected ? "btn-outline mt-4" : "btn-primary mt-4"}
                disabled={mutation.isPending || !account}
                onClick={() => account && mutation.mutate(account.id)}
              >
                {connected ? "Disconnect" : "Connect"}
              </button>
            </Card>
          );
        })}
      </div>
    </>
  );
}

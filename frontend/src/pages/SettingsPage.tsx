import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Palette } from "lucide-react";
import { workspaceApi } from "@/lib/api";
import type { BusinessProfile } from "@/lib/types";
import { Card, PageLoader, SectionTitle } from "@/components/ui";
import { useTheme } from "@/store/theme";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const { data: workspace } = useQuery({ queryKey: ["workspace"], queryFn: workspaceApi.get });
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setProfile(workspace.profile);
    }
  }, [workspace]);

  const mutation = useMutation({
    mutationFn: () => workspaceApi.update({ name, profile: profile ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (!workspace || !profile) return <PageLoader />;

  const setField = (key: keyof BusinessProfile, value: string | string[]) =>
    setProfile({ ...profile, [key]: value });
  const list = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <SectionTitle title="Settings" subtitle="Manage your workspace and brand profile." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-semibold">Business profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Workspace name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Company</label>
                <input
                  className="input"
                  value={profile.company_name}
                  onChange={(e) => setField("company_name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Website</label>
                <input
                  className="input"
                  value={profile.website}
                  onChange={(e) => setField("website", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Industry</label>
                <input
                  className="input"
                  value={profile.industry}
                  onChange={(e) => setField("industry", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Target audience</label>
                <input
                  className="input"
                  value={profile.target_audience}
                  onChange={(e) => setField("target_audience", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Brand tone</label>
                <input
                  className="input"
                  value={profile.brand_tone}
                  onChange={(e) => setField("brand_tone", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Goals (comma separated)</label>
                <input
                  className="input"
                  value={profile.goals.join(", ")}
                  onChange={(e) => setField("goals", list(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Competitors (comma separated)</label>
                <input
                  className="input"
                  value={profile.competitors.join(", ")}
                  onChange={(e) => setField("competitors", list(e.target.value))}
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                className="btn-primary"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {saved ? <Check className="h-4 w-4" /> : null}
                {saved ? "Saved" : "Save changes"}
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Palette className="h-5 w-5 text-brand-500" /> Brand colors
            </h2>
            <div className="flex gap-2">
              {profile.brand_colors.map((c) => (
                <div key={c} className="text-center">
                  <div
                    className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-700"
                    style={{ background: c }}
                  />
                  <p className="mt-1 text-xs text-slate-400">{c}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Appearance</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Dark mode</span>
              <button
                onClick={toggle}
                className={`relative h-6 w-11 rounded-full transition ${
                  theme === "dark" ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    theme === "dark" ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

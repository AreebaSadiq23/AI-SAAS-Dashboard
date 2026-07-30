import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bot, Check } from "lucide-react";
import { workspaceApi } from "@/lib/api";
import { ALL_PLATFORMS, PLATFORM_META } from "@/lib/platforms";
import type { BusinessProfile, Platform } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const STEPS = ["Company", "Brand", "Goals", "Review"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    company_name: "",
    website: "",
    industry: "",
    target_audience: "",
    products: [],
    services: [],
    brand_colors: ["#6366F1", "#8B5CF6"],
    brand_tone: "",
    goals: [],
    languages: ["English"],
    countries: [],
    competitors: [],
    social_links: {},
  });
  const [platforms, setPlatforms] = useState<Platform[]>(["linkedin", "instagram"]);

  if (!token) {
    navigate("/login");
    return null;
  }

  const set = (k: keyof BusinessProfile, v: string | string[]) =>
    setProfile((p) => ({ ...p, [k]: v }));
  const list = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  const finish = async () => {
    setSaving(true);
    try {
      await workspaceApi.update({
        name: `${profile.company_name || "My"} workspace`,
        profile: {
          ...profile,
          social_links: Object.fromEntries(platforms.map((p) => [p, ""])),
        },
      });
      await workspaceApi.completeOnboarding();
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">Set up your workspace</span>
        </div>

        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  i <= step
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded",
                    i < step ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-800",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tell us about your company</h2>
              <div>
                <label className="label">Company name</label>
                <input
                  className="input"
                  value={profile.company_name}
                  onChange={(e) => set("company_name", e.target.value)}
                  placeholder="Acme AI"
                />
              </div>
              <div>
                <label className="label">Website</label>
                <input
                  className="input"
                  value={profile.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://acme.ai"
                />
              </div>
              <div>
                <label className="label">Industry</label>
                <input
                  className="input"
                  value={profile.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  placeholder="B2B SaaS"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your brand & audience</h2>
              <div>
                <label className="label">Target audience</label>
                <input
                  className="input"
                  value={profile.target_audience}
                  onChange={(e) => set("target_audience", e.target.value)}
                  placeholder="Founders and marketers at startups"
                />
              </div>
              <div>
                <label className="label">Brand tone</label>
                <input
                  className="input"
                  value={profile.brand_tone}
                  onChange={(e) => set("brand_tone", e.target.value)}
                  placeholder="Confident, insightful, human"
                />
              </div>
              <div>
                <label className="label">Competitors (comma separated)</label>
                <input
                  className="input"
                  value={profile.competitors.join(", ")}
                  onChange={(e) => set("competitors", list(e.target.value))}
                  placeholder="Jasper, Buffer"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Goals & platforms</h2>
              <div>
                <label className="label">Goals (comma separated)</label>
                <input
                  className="input"
                  value={profile.goals.join(", ")}
                  onChange={(e) => set("goals", list(e.target.value))}
                  placeholder="Grow LinkedIn to 25k, build on X"
                />
              </div>
              <div>
                <label className="label">Platforms to manage</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map((p) => {
                    const active = platforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setPlatforms((prev) =>
                            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                          )
                        }
                        className={cn(
                          "rounded-xl border px-3 py-1.5 text-sm font-medium",
                          active
                            ? "border-transparent text-white"
                            : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300",
                        )}
                        style={active ? { background: PLATFORM_META[p].color } : undefined}
                      >
                        {PLATFORM_META[p].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold">Review</h2>
              <Row label="Company" value={profile.company_name || "—"} />
              <Row label="Industry" value={profile.industry || "—"} />
              <Row label="Audience" value={profile.target_audience || "—"} />
              <Row label="Tone" value={profile.brand_tone || "—"} />
              <Row label="Goals" value={profile.goals.join(", ") || "—"} />
              <Row
                label="Platforms"
                value={platforms.map((p) => PLATFORM_META[p].label).join(", ")}
              />
              <p className="pt-2 text-sm text-slate-500">
                Your AI workforce will analyze this and start building a strategy.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              className="btn-ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button className="btn-primary" onClick={finish} disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-white" /> : null}
                Launch my workforce
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-800">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

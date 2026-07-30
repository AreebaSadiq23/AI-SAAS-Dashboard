import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { taskApi } from "@/lib/api";
import { ALL_PLATFORMS, PLATFORM_META } from "@/lib/platforms";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui";

const EXAMPLES = [
  "Grow my LinkedIn and Instagram for my AI SaaS.",
  "Launch a thought-leadership series about the future of work.",
  "Promote our new feature with a week of coordinated posts.",
];

export function NewTaskDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["linkedin", "instagram"]);

  const mutation = useMutation({
    mutationFn: () => taskApi.create({ title, goal, platforms }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
      navigate(`/tasks/${task.id}`);
    },
  });

  const toggle = (p: Platform) =>
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative z-10 w-full max-w-lg p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Give your workforce a goal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The Orchestrator plans it and assigns the right agents.
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="label">Title</label>
        <input
          className="input"
          placeholder="e.g. Launch-week thought leadership"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label mt-4">Business goal</label>
        <textarea
          className="input min-h-[90px] resize-none"
          placeholder="Describe what you want to achieve…"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setGoal(ex);
                if (!title) setTitle(ex.replace(/\.$/, "").slice(0, 48));
              }}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
            >
              {ex}
            </button>
          ))}
        </div>

        <label className="label mt-4">Platforms</label>
        <div className="flex flex-wrap gap-2">
          {ALL_PLATFORMS.map((p) => {
            const active = platforms.includes(p);
            const meta = PLATFORM_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => toggle(p)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-transparent text-white"
                    : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300",
                )}
                style={active ? { background: meta.color } : undefined}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <button
          className="btn-primary mt-6 w-full"
          disabled={!title || !goal || platforms.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? <Spinner className="h-4 w-4 text-white" /> : (
            <Sparkles className="h-4 w-4" />
          )}
          Launch workforce
        </button>
      </div>
    </div>
  );
}

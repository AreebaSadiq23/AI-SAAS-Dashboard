import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { agentApi } from "@/lib/api";
import type { Agent } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { PageLoader, SectionTitle } from "@/components/ui";
import { AgentAvatar } from "@/components/AgentAvatar";

const CATEGORY_LABEL: Record<string, string> = {
  orchestrator: "Orchestrator",
  strategy: "Strategy",
  content: "Content",
  platform: "Platform specialists",
  ops: "Operations",
};

const STATUS_BADGE: Record<string, string> = {
  working: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  waiting: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  error: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  offline: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

function AgentDetail({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white p-6 dark:bg-slate-900">
        <button className="btn-ghost absolute right-4 top-4" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <AgentAvatar avatarKey={agent.avatar} status={agent.status} size={52} />
          <div>
            <h2 className="text-xl font-bold">{agent.name}</h2>
            <p className="text-sm text-slate-500">{agent.role}</p>
          </div>
        </div>
        <span className={`badge mt-3 capitalize ${STATUS_BADGE[agent.status]}`}>
          {agent.status}
        </span>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{agent.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-2xl font-bold">{agent.tasks_completed}</p>
            <p className="text-xs text-slate-400">Tasks completed</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-2xl font-bold">{agent.success_rate}%</p>
            <p className="text-xs text-slate-400">Success rate</p>
          </div>
        </div>

        <Detail label="Responsibilities" items={agent.responsibilities} />
        <Detail label="Goals" items={agent.goals} />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Detail label="Inputs" items={agent.inputs} compact />
          <Detail label="Outputs" items={agent.outputs} compact />
        </div>

        {agent.memory.length > 0 && (
          <div className="mt-4">
            <p className="label">Memory</p>
            <div className="space-y-2">
              {agent.memory.map((m, i) => (
                <p
                  key={i}
                  className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200"
                >
                  {m}
                </p>
              ))}
            </div>
          </div>
        )}

        {agent.events.length > 0 && (
          <div className="mt-4">
            <p className="label">Recent events</p>
            <div className="space-y-2.5 border-l border-slate-200 pl-4 dark:border-slate-700">
              {agent.events.map((e) => (
                <div key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                  <p className="text-sm">{e.message}</p>
                  <p className="text-xs text-slate-400">{timeAgo(e.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  items,
  compact,
}: {
  label: string;
  items: string[];
  compact?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="label">{label}</p>
      <ul className={compact ? "space-y-1" : "space-y-1.5"}>
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkforcePage() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const { data: agents } = useQuery({ queryKey: ["agents"], queryFn: agentApi.list });
  if (!agents) return <PageLoader />;

  const groups = ["orchestrator", "strategy", "content", "platform", "ops"];

  return (
    <>
      <SectionTitle
        title="AI Workforce"
        subtitle={`${agents.length} autonomous employees, coordinated by the Master Orchestrator.`}
      />

      {groups.map((cat) => {
        const list = agents.filter((a) => a.category === cat);
        if (list.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {CATEGORY_LABEL[cat]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setSelected(a)}
                  className="card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <AgentAvatar avatarKey={a.avatar} status={a.status} size={44} />
                    <span className={`badge capitalize ${STATUS_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.role}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {a.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span>{a.tasks_completed} tasks</span>
                    <span>·</span>
                    <span>{a.success_rate}% success</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {selected && <AgentDetail agent={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { contentApi } from "@/lib/api";
import { PLATFORM_META } from "@/lib/platforms";
import type { ScheduledPost } from "@/lib/types";
import { PageLoader, SectionTitle } from "@/components/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function CalendarPage() {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const { data: scheduled } = useQuery({ queryKey: ["scheduled"], queryFn: contentApi.scheduled });
  if (!scheduled) return <PageLoader />;

  const byDay = new Map<string, ScheduledPost[]>();
  for (const s of scheduled) {
    const key = new Date(s.scheduled_at).toDateString();
    byDay.set(key, [...(byDay.get(key) ?? []), s]);
  }

  const weeks = monthMatrix(cursor.getFullYear(), cursor.getMonth());
  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SectionTitle
        title="Content Calendar"
        subtitle="Everything your workforce has scheduled, at a glance."
        action={
          <div className="flex items-center gap-2">
            <button
              className="btn-ghost"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[9rem] text-center text-sm font-semibold">
              {monthLabel}
            </span>
            <button
              className="btn-ghost"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="card overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((day, i) => {
            const posts = day ? (byDay.get(day.toDateString()) ?? []) : [];
            const isToday = day && day.toDateString() === now.toDateString();
            return (
              <div
                key={i}
                className="min-h-[110px] border-b border-r border-slate-100 p-2 last:border-r-0 dark:border-slate-800/70"
              >
                {day && (
                  <>
                    <p
                      className={`mb-1 text-xs font-semibold ${
                        isToday
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    <div className="space-y-1">
                      {posts.map((p) => (
                        <div
                          key={p.id}
                          className="truncate rounded-md px-1.5 py-1 text-[11px] font-medium text-white"
                          style={{ background: PLATFORM_META[p.platform].color }}
                          title={p.title}
                        >
                          {p.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

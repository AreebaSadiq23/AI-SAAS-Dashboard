import type { Platform, TaskStatus } from "@/lib/types";

export const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; short: string }
> = {
  linkedin: { label: "LinkedIn", color: "#0A66C2", short: "in" },
  instagram: { label: "Instagram", color: "#E1306C", short: "ig" },
  facebook: { label: "Facebook", color: "#1877F2", short: "fb" },
  x: { label: "X", color: "#0F1419", short: "X" },
  tiktok: { label: "TikTok", color: "#000000", short: "tk" },
  pinterest: { label: "Pinterest", color: "#E60023", short: "pin" },
  threads: { label: "Threads", color: "#000000", short: "th" },
  youtube: { label: "YouTube", color: "#FF0000", short: "yt" },
};

export const ALL_PLATFORMS: Platform[] = [
  "linkedin",
  "instagram",
  "x",
  "facebook",
  "tiktok",
  "youtube",
  "pinterest",
  "threads",
];

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  queued: {
    label: "Queued",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  planning: {
    label: "Planning",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  in_progress: {
    label: "In progress",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  waiting_approval: {
    label: "Needs approval",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  },
  publishing: {
    label: "Publishing",
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
};

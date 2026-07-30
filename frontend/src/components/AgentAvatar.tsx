import {
  BarChart3,
  Bell,
  CheckCircle2,
  Compass,
  Database,
  Image as ImageIcon,
  Map,
  Megaphone,
  PenLine,
  Search,
  Send,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PlatformIcon } from "@/components/PlatformBadge";
import type { AgentStatus, Platform } from "@/lib/types";
import { PLATFORM_META } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  map: Map,
  search: Search,
  "trending-up": TrendingUp,
  pen: PenLine,
  megaphone: Megaphone,
  image: ImageIcon,
  "check-circle": CheckCircle2,
  send: Send,
  "bar-chart": BarChart3,
  database: Database,
  bell: Bell,
};

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-slate-300 dark:bg-slate-600",
  working: "bg-emerald-500 animate-pulse",
  waiting: "bg-amber-500",
  error: "bg-red-500",
  offline: "bg-slate-300 dark:bg-slate-600",
};

export function AgentAvatar({
  avatarKey,
  status,
  size = 44,
}: {
  avatarKey: string;
  status?: AgentStatus;
  size?: number;
}) {
  const isPlatform = avatarKey in PLATFORM_META;
  const Icon = ICONS[avatarKey];
  return (
    <div className="relative">
      {isPlatform ? (
        <PlatformIcon platform={avatarKey as Platform} size={size} />
      ) : (
        <div
          className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white"
          style={{ width: size, height: size }}
        >
          {Icon ? <Icon style={{ width: size * 0.5, height: size * 0.5 }} /> : "AI"}
        </div>
      )}
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900",
            STATUS_DOT[status],
          )}
        />
      )}
    </div>
  );
}

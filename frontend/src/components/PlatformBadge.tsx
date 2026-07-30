import { PLATFORM_META } from "@/lib/platforms";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlatformIcon({
  platform,
  size = 28,
}: {
  platform: Platform;
  size?: number;
}) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className="flex items-center justify-center rounded-lg font-bold text-white"
      style={{ background: meta.color, width: size, height: size, fontSize: size * 0.4 }}
      title={meta.label}
    >
      {meta.short}
    </span>
  );
}

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className={cn(
        "badge border",
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}33`,
        background: `${meta.color}12`,
      }}
    >
      {meta.label}
    </span>
  );
}

"use client"

import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface PlayerStreakIndicatorProps {
  streak: number
  isHot?: boolean
  className?: string
}

export function PlayerStreakIndicator({
  streak,
  isHot = false,
  className,
}: PlayerStreakIndicatorProps) {
  const { t } = useTranslation()

  if (streak <= 0) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 font-mono text-[10px] tracking-wide uppercase tabular-nums",
        isHot ? "text-primary" : "text-muted-foreground",
        className
      )}
      aria-label={`${streak} ${t("common.streak")}`}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-1.5 rounded-full",
          isHot ? "bg-primary shadow-[0_0_8px_color-mix(in_oklch,var(--primary),transparent_55%)]" : "bg-muted-foreground/60"
        )}
      />
      <span>
        {streak} {t("common.streak")}
      </span>
    </div>
  )
}

"use client"

import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import type { TRoundStickState } from "@/lib/round-sticks"

const stickStyles: Record<TRoundStickState, string> = {
  upcoming: "bg-foreground/14",
  skipped: "bg-muted-foreground/32",
  correct: "bg-primary/80",
  wrong: "bg-destructive/65",
  idle: "bg-foreground/12",
}

interface PlayerRoundSticksProps {
  sticks: TRoundStickState[]
  className?: string
}

export function PlayerRoundSticks({
  sticks,
  className,
}: PlayerRoundSticksProps) {
  const { t } = useTranslation()

  const correct = sticks.filter((stick) => stick === "correct").length
  const wrong = sticks.filter((stick) => stick === "wrong").length
  const skipped = sticks.filter((stick) => stick === "skipped").length
  const remaining = sticks.filter((stick) => stick === "upcoming").length

  const ariaLabel =
    correct + wrong + skipped + remaining > 0
      ? t("players.answerStats", {
          correct,
          wrong,
          skipped,
          remaining,
        })
      : t("players.roundProgress")

  return (
    <div
      className={cn("flex items-stretch gap-px", className)}
      role="img"
      aria-label={ariaLabel}
    >
      {sticks.map((stick, index) => (
        <span
          key={index}
          className={cn(
            "h-1 min-w-0 flex-1 rounded-full",
            stickStyles[stick]
          )}
        />
      ))}
    </div>
  )
}

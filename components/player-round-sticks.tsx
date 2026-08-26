"use client"

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

function describeSticks(sticks: TRoundStickState[]): string {
  const correct = sticks.filter((stick) => stick === "correct").length
  const wrong = sticks.filter((stick) => stick === "wrong").length
  const skipped = sticks.filter((stick) => stick === "skipped").length
  const remaining = sticks.filter((stick) => stick === "upcoming").length

  const parts = [
    correct > 0 ? `${correct} correct` : null,
    wrong > 0 ? `${wrong} wrong` : null,
    skipped > 0 ? `${skipped} skipped` : null,
    remaining > 0 ? `${remaining} left` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(", ") : "Round progress"
}

export function PlayerRoundSticks({
  sticks,
  className,
}: PlayerRoundSticksProps) {
  return (
    <div
      className={cn("flex items-stretch gap-px", className)}
      role="img"
      aria-label={describeSticks(sticks)}
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

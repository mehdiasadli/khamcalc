import { formatPercent } from "@/lib/stats-format"
import type { TPlayerAnswerStats } from "@/lib/player-answer-stats"
import { cn } from "@/lib/utils"

interface PlayerAnswerStatsProps {
  stats: TPlayerAnswerStats
  className?: string
}

function getAccuracyColor(accuracy: number): string {
  const weight = Math.round(Math.max(0, Math.min(1, accuracy)) * 100)

  return `color-mix(in oklch, var(--destructive) ${100 - weight}%, var(--primary) ${weight}%)`
}

function MetaSep() {
  return <span className="text-muted-foreground/45"> // </span>
}

export function PlayerAnswerStats({ stats, className }: PlayerAnswerStatsProps) {
  const { correctCount, wrongCount, accuracy } = stats
  const hasAttempts = correctCount + wrongCount > 0

  return (
    <p
      className={cn(
        "font-mono text-[11px] leading-none tabular-nums tracking-wide",
        className
      )}
      role="group"
      aria-label={
        hasAttempts
          ? `${correctCount} correct, ${wrongCount} wrong, ${formatPercent(accuracy)} accuracy`
          : "No answers yet"
      }
      translate="no"
    >
      <span className="text-primary">{correctCount}</span>
      <MetaSep />
      <span className={wrongCount > 0 ? "text-destructive" : "text-muted-foreground/70"}>
        {wrongCount}
      </span>
      {hasAttempts && accuracy !== null ? (
        <>
          <MetaSep />
          <span style={{ color: getAccuracyColor(accuracy) }}>
            {formatPercent(accuracy)}
          </span>
        </>
      ) : null}
    </p>
  )
}

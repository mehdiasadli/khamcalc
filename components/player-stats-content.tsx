"use client"

import type { TPlayerStats } from "@/lib/analytics"
import { formatPointDelta, formatScore } from "@/lib/scoring-format"
import { useFormat, useTranslation } from "@/lib/i18n/context"
import { PlayerHeatmap } from "@/components/stats/player-heatmap"
import type { TGameConfig } from "@/schemas/config.schema"
import type { TGameState } from "@/schemas/game.schema"
import { Badge } from "@/components/ui/badge"

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

interface PlayerStatsContentProps {
  player: TPlayerStats
  game: TGameState
  config: TGameConfig
  showHeatmap?: boolean
}

export function PlayerStatsContent({
  player,
  game,
  config,
  showHeatmap = true,
}: PlayerStatsContentProps) {
  const { t } = useTranslation()
  const { formatPercent } = useFormat()

  const roundPoints = Object.entries(player.pointsPerRound)
    .filter(([, points]) => points !== 0)
    .map(([round, points]) =>
      `${t("common.roundShort", { round })}: ${formatPointDelta(points)}`
    )
    .join(" · ")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-base font-medium">{player.name}</p>
          <p className="text-xs text-muted-foreground">
            {t("players.rank", { rank: player.rank })}
            {player.removed ? t("players.removedFromScoring") : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="font-mono text-2xl tabular-nums">
            {formatScore(player.score)}
          </span>
          <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
            {t("common.pts")}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {t("players.correctBadge", { count: player.correctCount })}
        </Badge>
        <Badge variant="outline">
          {t("players.wrongBadge", { count: player.wrongCount })}
        </Badge>
        {player.longestCorrectStreak > 0 ? (
          <Badge variant="outline">
            {t("stats.streakBadgeShort", {
              count: player.longestCorrectStreak,
            })}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <StatRow
          label={t("stats.accuracy")}
          value={formatPercent(player.accuracy)}
        />
        {roundPoints ? (
          <p className="text-xs text-muted-foreground">{roundPoints}</p>
        ) : null}
      </div>

      {showHeatmap ? (
        <PlayerHeatmap
          game={game}
          config={config}
          playerId={player.playerId}
          playerName={player.name}
        />
      ) : null}
    </div>
  )
}

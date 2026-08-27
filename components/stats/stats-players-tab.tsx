"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import { formatScore, formatPointDelta } from "@/lib/scoring-format"
import { useFormat, useTranslation } from "@/lib/i18n/context"
import type { TGameConfig } from "@/schemas/config.schema"
import type { TGameState } from "@/schemas/game.schema"

import { PlayerHeatmap } from "@/components/stats/player-heatmap"
import { StatsStreakChart } from "@/components/stats/stats-streak-chart"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatsPlayersTabProps {
  analytics: TGameAnalytics
  game: TGameState
  config: TGameConfig
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

export function StatsPlayersTab({
  analytics,
  game,
  config,
}: StatsPlayersTabProps) {
  const { t } = useTranslation()
  const { formatDecimal, formatPercent } = useFormat()
  const players = [...analytics.players].sort((a, b) => a.rank - b.rank)

  if (players.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("stats.noPlayerStats")}</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StatsStreakChart analytics={analytics} />

      {players.map((player) => {
        const roundPoints = Object.entries(player.pointsPerRound)
          .filter(([, points]) => points !== 0)
          .map(([round, points]) =>
            `${t("common.roundShort", { round })}: ${formatPointDelta(points)}`
          )
          .join(" · ")

        return (
          <Card key={player.playerId} size="sm" className="ring-foreground/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle className="truncate">{player.name}</CardTitle>
                  <CardDescription>
                    {t("players.rank", { rank: player.rank })}
                    {player.removed ? t("players.removedFromScoring") : ""}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-xl tabular-nums">
                    {formatScore(player.score)}
                  </span>
                  <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                    {t("common.pts")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
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
                {player.roundsLed > 0 ? (
                  <Badge variant="outline">
                    {t("stats.ledRounds", { count: player.roundsLed })}
                  </Badge>
                ) : null}
              </div>

              <StatRow
                label={t("stats.accuracy")}
                value={formatPercent(player.accuracy)}
              />
              <StatRow
                label={t("stats.participation")}
                value={formatPercent(player.participationRate)}
              />
              <StatRow
                label={t("players.idleQuestions")}
                value={String(player.idleQuestionCount)}
              />
              <StatRow
                label={t("players.wrongCorrectRatio")}
                value={
                  player.wrongBeforeCorrectRatio === null
                    ? "—"
                    : formatDecimal(player.wrongBeforeCorrectRatio)
                }
              />
              <StatRow
                label={t("players.comeback")}
                value={
                  player.comebackDelta === null
                    ? "—"
                    : `${formatPointDelta(player.comebackDelta)} ${t("common.pts")}`
                }
              />
              {roundPoints ? (
                <p className="pt-1 text-xs text-muted-foreground">{roundPoints}</p>
              ) : null}

              <PlayerHeatmap
                className="pt-2 border-t border-border/50"
                game={game}
                config={config}
                playerId={player.playerId}
                playerName={player.name}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

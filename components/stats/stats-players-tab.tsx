"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import { formatDecimal, formatPercent } from "@/lib/stats-format"

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
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

export function StatsPlayersTab({ analytics }: StatsPlayersTabProps) {
  const players = [...analytics.players].sort((a, b) => a.rank - b.rank)

  if (players.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No players in this game.</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StatsStreakChart analytics={analytics} />

      {players.map((player) => {
        const roundPoints = Object.entries(player.pointsPerRound)
          .filter(([, points]) => points > 0)
          .map(([round, points]) => `R${round}: ${points}`)
          .join(" · ")

        return (
          <Card key={player.playerId} size="sm" className="ring-foreground/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle className="truncate">{player.name}</CardTitle>
                  <CardDescription>
                    Rank #{player.rank}
                    {player.removed ? " · Removed from scoring" : ""}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-xl tabular-nums">
                    {player.score}
                  </span>
                  <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                    pts
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {player.correctCount} correct
                </Badge>
                <Badge variant="outline">{player.wrongCount} wrong</Badge>
                {player.longestCorrectStreak > 0 ? (
                  <Badge variant="outline">
                    Streak {player.longestCorrectStreak}
                  </Badge>
                ) : null}
                {player.roundsLed > 0 ? (
                  <Badge variant="outline">Led {player.roundsLed} rounds</Badge>
                ) : null}
              </div>

              <StatRow label="Accuracy" value={formatPercent(player.accuracy)} />
              <StatRow
                label="Participation"
                value={formatPercent(player.participationRate)}
              />
              <StatRow label="Idle questions" value={String(player.idleQuestionCount)} />
              <StatRow
                label="Wrong / correct ratio"
                value={
                  player.wrongBeforeCorrectRatio === null
                    ? "—"
                    : formatDecimal(player.wrongBeforeCorrectRatio)
                }
              />
              <StatRow
                label="Comeback (last 2 rounds)"
                value={
                  player.comebackDelta === null
                    ? "—"
                    : `${player.comebackDelta >= 0 ? "+" : ""}${player.comebackDelta} pts`
                }
              />
              {roundPoints ? (
                <p className="pt-1 text-xs text-muted-foreground">{roundPoints}</p>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

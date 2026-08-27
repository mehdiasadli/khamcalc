"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import type { TPlayer } from "@/schemas/player.schema"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"

interface StatsLeaderboardTimelineProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

export function StatsLeaderboardTimeline({
  analytics,
  players,
}: StatsLeaderboardTimelineProps) {
  const { t } = useTranslation()
  const { leaderboardTimeline } = analytics

  function getPlayerName(playerId: string | null) {
    if (!playerId) return "—"
    return (
      players.find((player) => player.id === playerId)?.name ?? t("common.unknown")
    )
  }

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>{t("stats.leaderboardTimeline")}</CardTitle>
        <CardDescription>{t("stats.leaderboardEmpty")}</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboardTimeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("stats.leaderboardEmpty")}
          </p>
        ) : (
          <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
            {leaderboardTimeline.map((entry) => (
              <li key={entry.round} className="relative">
                <span className="absolute top-1 -left-[calc(0.5rem+1px)] size-2 rounded-full bg-primary" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-mono text-xs text-muted-foreground">
                    {t("stats.afterRound", { round: entry.round })}
                  </p>
                  <p className="font-medium">
                    {getPlayerName(entry.leaderId)}
                    <span className="ml-2 font-mono text-sm text-muted-foreground tabular-nums">
                      {entry.leaderScore} {t("common.pts")}
                    </span>
                  </p>
                  {entry.tiedLeaderIds.length > 1 ? (
                    <p className="text-xs text-muted-foreground">
                      {t("stats.tiedWith", {
                        names: entry.tiedLeaderIds
                          .filter((id) => id !== entry.leaderId)
                          .map((id) => getPlayerName(id))
                          .join(", "),
                      })}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

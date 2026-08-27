"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import { formatScore } from "@/lib/scoring-format"
import type { TPlayer } from "@/schemas/player.schema"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/context"

interface StatsRoundBreakdownTableProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

export function StatsRoundBreakdownTable({
  analytics,
  players,
}: StatsRoundBreakdownTableProps) {
  const { t } = useTranslation()
  const { roundBreakdown } = analytics

  function getPlayerName(playerId: string | null) {
    if (!playerId) return "—"
    return (
      players.find((player) => player.id === playerId)?.name ?? t("common.unknown")
    )
  }

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>{t("stats.roundBreakdown")}</CardTitle>
        <CardDescription>{t("stats.roundBreakdownEmpty")}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {roundBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("stats.roundBreakdownEmpty")}
          </p>
        ) : (
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-medium text-muted-foreground">
                  {t("common.round")}
                </th>
                {players.map((player) => (
                  <th
                    key={player.id}
                    className="pb-2 pr-4 font-medium text-muted-foreground"
                  >
                    {player.name}
                    {player.removedAt ? " *" : ""}
                  </th>
                ))}
                <th className="pb-2 font-medium text-muted-foreground">
                  {t("common.leader")}
                </th>
              </tr>
            </thead>
            <tbody>
              {roundBreakdown.map((row) => (
                <tr key={row.round} className="border-b border-border/60">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {t("common.roundShort", { round: row.round })}
                      </span>
                      <Badge variant={row.complete ? "secondary" : "outline"}>
                        {row.complete ? t("common.done") : t("common.live")}
                      </Badge>
                    </div>
                  </td>
                  {players.map((player) => (
                    <td
                      key={player.id}
                      className="py-2 pr-4 font-mono tabular-nums"
                    >
                      {formatScore(row.cumulativeScores[player.id] ?? 0)}
                    </td>
                  ))}
                  <td className="py-2 font-medium">
                    {getPlayerName(row.leaderId)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}

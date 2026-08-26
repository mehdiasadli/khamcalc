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

interface StatsRoundBreakdownTableProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

function getPlayerName(players: TPlayer[], playerId: string | null) {
  if (!playerId) return "—"
  return players.find((player) => player.id === playerId)?.name ?? "Unknown"
}

export function StatsRoundBreakdownTable({
  analytics,
  players,
}: StatsRoundBreakdownTableProps) {
  const { roundBreakdown } = analytics

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>Round breakdown</CardTitle>
        <CardDescription>Cumulative scores at end of each round</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {roundBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rounds yet.</p>
        ) : (
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-medium text-muted-foreground">
                  Round
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
                  Leader
                </th>
              </tr>
            </thead>
            <tbody>
              {roundBreakdown.map((row) => (
                <tr key={row.round} className="border-b border-border/60">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">R{row.round}</span>
                      <Badge variant={row.complete ? "secondary" : "outline"}>
                        {row.complete ? "Done" : "Live"}
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
                    {getPlayerName(players, row.leaderId)}
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

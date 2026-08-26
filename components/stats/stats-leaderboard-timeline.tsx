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

interface StatsLeaderboardTimelineProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

function getPlayerName(players: TPlayer[], playerId: string | null) {
  if (!playerId) return "—"
  return players.find((player) => player.id === playerId)?.name ?? "Unknown"
}

export function StatsLeaderboardTimeline({
  analytics,
  players,
}: StatsLeaderboardTimelineProps) {
  const { leaderboardTimeline } = analytics

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>Leaderboard timeline</CardTitle>
        <CardDescription>#1 after each completed round</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboardTimeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed rounds yet.
          </p>
        ) : (
          <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
            {leaderboardTimeline.map((entry) => (
              <li key={entry.round} className="relative">
                <span className="absolute top-1 -left-[calc(0.5rem+1px)] size-2 rounded-full bg-primary" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-mono text-xs text-muted-foreground">
                    After round {entry.round}
                  </p>
                  <p className="font-medium">
                    {getPlayerName(players, entry.leaderId)}
                    <span className="ml-2 font-mono text-sm text-muted-foreground tabular-nums">
                      {entry.leaderScore} pts
                    </span>
                  </p>
                  {entry.tiedLeaderIds.length > 1 ? (
                    <p className="text-xs text-muted-foreground">
                      Tied with{" "}
                      {entry.tiedLeaderIds
                        .filter((id) => id !== entry.leaderId)
                        .map((id) => getPlayerName(players, id))
                        .join(", ")}
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

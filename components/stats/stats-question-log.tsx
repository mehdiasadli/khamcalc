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
import { cn } from "@/lib/utils"

interface StatsQuestionLogProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

function getPlayerName(players: TPlayer[], playerId: string | null) {
  if (!playerId) return "—"
  return players.find((player) => player.id === playerId)?.name ?? "Unknown"
}

export function StatsQuestionLog({
  analytics,
  players,
}: StatsQuestionLogProps) {
  const { questionLog } = analytics

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>Question log</CardTitle>
        <CardDescription>{questionLog.length} recorded questions</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {questionLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          questionLog.map((entry) => (
            <details
              key={`${entry.round}:${entry.question}`}
              className="group rounded-2xl border border-border/60 px-3 py-2"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm marker:content-none">
                <span className="font-mono text-xs text-muted-foreground">
                  R{entry.round} · Q{entry.question}
                </span>
                <span
                  className={cn(
                    "truncate text-right",
                    entry.skipped && "text-muted-foreground"
                  )}
                >
                  {entry.skipped
                    ? "Skipped"
                    : entry.correctPlayerId
                      ? getPlayerName(players, entry.correctPlayerId)
                      : "Unanswered"}
                </span>
              </summary>
              <div className="mt-2 flex flex-col gap-1 border-t border-border/60 pt-2 text-sm">
                {entry.skipped ? (
                  <p className="text-muted-foreground">
                    Host skipped without marking answers.
                  </p>
                ) : (
                  <>
                    <p>
                      Correct:{" "}
                      {entry.correctPlayerId
                        ? getPlayerName(players, entry.correctPlayerId)
                        : "—"}
                    </p>
                    <p className="text-muted-foreground">
                      Incorrect:{" "}
                      {entry.wrongPlayerIds.length > 0
                        ? entry.wrongPlayerIds
                            .map((id) => getPlayerName(players, id))
                            .join(", ")
                        : "—"}
                    </p>
                  </>
                )}
              </div>
            </details>
          ))
        )}
      </CardContent>
    </Card>
  )
}

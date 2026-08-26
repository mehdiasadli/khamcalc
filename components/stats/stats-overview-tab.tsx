"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import {
  formatDecimal,
  formatDuration,
} from "@/lib/stats-format"
import type { TPlayer } from "@/schemas/player.schema"

import {
  StatsChartPlaceholder,
  StatsMetricCard,
} from "@/components/stats/stats-metric-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatsOverviewTabProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

function getPlayerName(players: TPlayer[], playerId: string | null) {
  if (!playerId) return "—"
  return players.find((player) => player.id === playerId)?.name ?? "Unknown"
}

export function StatsOverviewTab({ analytics, players }: StatsOverviewTabProps) {
  const { overview, roundBreakdown, leaderboardTimeline, questionLog } =
    analytics

  const progressHint = [
    `Round ${overview.progress.currentRound}`,
    `Question ${overview.progress.currentQuestion}`,
    overview.progress.maxRounds !== null
      ? `of ${overview.progress.maxRounds} rounds`
      : "unlimited rounds",
    overview.progress.questionsPerRound !== null
      ? `${overview.progress.questionsPerRound} Q/R`
      : "unlimited Q/R",
  ].join(" · ")

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <StatsMetricCard
          label="Questions"
          value={String(overview.questionsPlayed)}
          hint={`${overview.skippedCount} skipped`}
        />
        <StatsMetricCard
          label="Correct"
          value={String(overview.totalCorrect)}
          hint={`${overview.totalIncorrectMarks} incorrect marks`}
        />
        <StatsMetricCard
          label="Avg wrong / Q"
          value={formatDecimal(overview.averageWrongPerQuestion)}
        />
        <StatsMetricCard
          label="Duration"
          value={formatDuration(overview.elapsedMs)}
          hint={overview.presetName ?? "Custom preset"}
        />
      </div>

      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>{progressHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">
            {overview.progress.status === "finished"
              ? "Finished"
              : overview.progress.status === "playing"
                ? "Live"
                : "Idle"}
          </Badge>
        </CardContent>
      </Card>

      <StatsChartPlaceholder
        title="Score progress"
        description="Round-by-round line chart with player toggles"
      />

      <StatsChartPlaceholder
        title="Correct vs incorrect"
        description="Per-player bar comparison"
      />

      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>Round breakdown</CardTitle>
          <CardDescription>Cumulative scores at end of each round</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {roundBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rounds yet.</p>
          ) : (
            roundBreakdown.map((row) => (
              <div
                key={row.round}
                className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Round {row.round}</p>
                  <Badge variant={row.complete ? "secondary" : "outline"}>
                    {row.complete ? "Complete" : "In progress"}
                  </Badge>
                </div>
                <ul className="flex flex-col gap-1">
                  {players.map((player) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {player.name}
                        {player.removedAt ? " (removed)" : ""}
                      </span>
                      <span className="font-mono tabular-nums">
                        {row.cumulativeScores[player.id] ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
                {row.leaderId ? (
                  <p className="text-xs text-muted-foreground">
                    Leader: {getPlayerName(players, row.leaderId)}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>Leaderboard timeline</CardTitle>
          <CardDescription>Who held #1 after each completed round</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {leaderboardTimeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed rounds yet.
            </p>
          ) : (
            leaderboardTimeline.map((entry) => (
              <div
                key={entry.round}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-muted-foreground">After R{entry.round}</span>
                <span className="font-medium">
                  {getPlayerName(players, entry.leaderId)}{" "}
                  <span className="font-mono text-muted-foreground tabular-nums">
                    ({entry.leaderScore})
                  </span>
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>Question log</CardTitle>
          <CardDescription>
            {questionLog.length} recorded · full chart view coming next
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {questionLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions yet.</p>
          ) : (
            questionLog.slice(-8).map((entry) => (
              <div
                key={`${entry.round}:${entry.question}`}
                className="flex flex-col gap-0.5 border-b border-border/60 pb-2 text-sm last:border-b-0 last:pb-0"
              >
                <p className="font-mono text-xs text-muted-foreground">
                  R{entry.round} · Q{entry.question}
                  {entry.skipped ? " · skipped" : ""}
                </p>
                <p>
                  {entry.skipped
                    ? "Skipped"
                    : entry.correctPlayerId
                      ? `Correct: ${getPlayerName(players, entry.correctPlayerId)}`
                      : "No correct answer"}
                </p>
                {entry.wrongPlayerIds.length > 0 ? (
                  <p className="text-muted-foreground">
                    Wrong:{" "}
                    {entry.wrongPlayerIds
                      .map((id) => getPlayerName(players, id))
                      .join(", ")}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import {
  formatDecimal,
  formatDuration,
} from "@/lib/stats-format"
import type { TPlayer } from "@/schemas/player.schema"

import { StatsLeaderboardTimeline } from "@/components/stats/stats-leaderboard-timeline"
import { StatsMetricCard } from "@/components/stats/stats-metric-card"
import { StatsPlayerBarChart } from "@/components/stats/stats-player-bar-chart"
import { StatsQuestionLog } from "@/components/stats/stats-question-log"
import { StatsRoundBreakdownTable } from "@/components/stats/stats-round-breakdown-table"
import { StatsScoreLineChart } from "@/components/stats/stats-score-line-chart"
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

export function StatsOverviewTab({ analytics, players }: StatsOverviewTabProps) {
  const { overview } = analytics

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

      <StatsScoreLineChart analytics={analytics} players={players} />
      <StatsPlayerBarChart analytics={analytics} />
      <StatsRoundBreakdownTable analytics={analytics} players={players} />
      <StatsLeaderboardTimeline analytics={analytics} players={players} />
      <StatsQuestionLog analytics={analytics} players={players} />
    </div>
  )
}

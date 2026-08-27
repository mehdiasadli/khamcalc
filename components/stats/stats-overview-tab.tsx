"use client"

import type { TGameAnalytics } from "@/lib/analytics"
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
import { useFormat, useTranslation } from "@/lib/i18n/context"
import { getLocalizedPresetName } from "@/lib/i18n/helpers"
import { useAppStore } from "@/stores"

interface StatsOverviewTabProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

export function StatsOverviewTab({ analytics, players }: StatsOverviewTabProps) {
  const { t } = useTranslation()
  const { formatDecimal, formatDuration } = useFormat()
  const config = useAppStore((state) => state.config)
  const { overview } = analytics

  const progressHint = [
    t("game.roundQuestion", {
      round: overview.progress.currentRound,
      question: overview.progress.currentQuestion,
    }),
    overview.progress.maxRounds !== null
      ? t("stats.progressOfRounds", { count: overview.progress.maxRounds })
      : t("stats.unlimitedRounds"),
    overview.progress.questionsPerRound !== null
      ? t("stats.questionsPerRound", {
          count: overview.progress.questionsPerRound,
        })
      : t("stats.unlimitedQuestions"),
  ].join(" · ")

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <StatsMetricCard
          label={t("stats.questions")}
          value={String(overview.questionsPlayed)}
          hint={t("stats.skippedCount", { count: overview.skippedCount })}
        />
        <StatsMetricCard
          label={t("stats.correctMarks")}
          value={String(overview.totalCorrect)}
          hint={t("stats.incorrectMarks", {
            count: overview.totalIncorrectMarks,
          })}
        />
        <StatsMetricCard
          label={t("stats.avgWrong")}
          value={formatDecimal(overview.averageWrongPerQuestion)}
        />
        <StatsMetricCard
          label={t("stats.duration")}
          value={formatDuration(overview.elapsedMs)}
          hint={getLocalizedPresetName(config, t)}
        />
      </div>

      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>{t("stats.progress")}</CardTitle>
          <CardDescription>{progressHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">
            {overview.progress.status === "finished"
              ? t("common.finished")
              : overview.progress.status === "playing"
                ? t("common.live")
                : t("common.idle")}
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

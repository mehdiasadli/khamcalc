"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { TGameAnalytics } from "@/lib/analytics"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useTranslation } from "@/lib/i18n/context"

interface StatsPlayerBarChartProps {
  analytics: TGameAnalytics
}

export function StatsPlayerBarChart({ analytics }: StatsPlayerBarChartProps) {
  const { t } = useTranslation()

  const barChartConfig = useMemo(
    () =>
      ({
        correct: {
          label: t("common.correct"),
          color: "var(--chart-1)",
        },
        incorrect: {
          label: t("common.incorrect"),
          color: "var(--destructive)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const data = useMemo(
    () =>
      analytics.players
        .filter((player) => !player.removed)
        .map((player) => ({
          name: player.name,
          correct: player.correctCount,
          incorrect: player.wrongCount,
        })),
    [analytics.players]
  )

  if (data.length === 0) {
    return (
      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>{t("stats.playerBreakdown")}</CardTitle>
          <CardDescription>{t("stats.playerBreakdownEmpty")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("stats.playerBreakdownEmpty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>{t("stats.playerBreakdown")}</CardTitle>
        <CardDescription>{t("stats.playerBreakdownEmpty")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig} className="aspect-[4/3] min-h-56 w-full">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              angle={data.length > 4 ? -25 : 0}
              textAnchor={data.length > 4 ? "end" : "middle"}
              height={data.length > 4 ? 56 : 32}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="correct"
              fill="var(--color-correct)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="incorrect"
              fill="var(--color-incorrect)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

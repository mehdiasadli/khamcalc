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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useTranslation } from "@/lib/i18n/context"

interface StatsStreakChartProps {
  analytics: TGameAnalytics
}

export function StatsStreakChart({ analytics }: StatsStreakChartProps) {
  const { t } = useTranslation()

  const streakChartConfig = useMemo(
    () =>
      ({
        streak: {
          label: t("stats.longestStreak"),
          color: "var(--chart-2)",
        },
      }) satisfies ChartConfig,
    [t]
  )

  const data = useMemo(
    () =>
      [...analytics.players]
        .filter((player) => player.longestCorrectStreak > 0)
        .sort((a, b) => b.longestCorrectStreak - a.longestCorrectStreak)
        .map((player) => ({
          name: player.name,
          streak: player.longestCorrectStreak,
        })),
    [analytics.players]
  )

  if (data.length === 0) {
    return (
      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>{t("stats.streakChart")}</CardTitle>
          <CardDescription>{t("stats.streakChartEmpty")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("stats.streakChartEmpty")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>{t("stats.streakChart")}</CardTitle>
        <CardDescription>{t("stats.streakChartEmpty")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={streakChartConfig}
          className="aspect-[5/2] min-h-40 w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="streak"
              fill="var(--color-streak)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

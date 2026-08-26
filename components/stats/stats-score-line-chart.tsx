"use client"

import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import type { TGameAnalytics } from "@/lib/analytics"
import { buildPlayerChartConfig } from "@/lib/chart-colors"
import type { TPlayer } from "@/schemas/player.schema"

import { Badge } from "@/components/ui/badge"
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

interface StatsScoreLineChartProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

export function StatsScoreLineChart({
  analytics,
  players,
}: StatsScoreLineChartProps) {
  const activePlayers = players.filter((player) => !player.removedAt)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(activePlayers.map((player) => player.id))
  )

  const chartPlayers = useMemo(
    () => activePlayers.filter((player) => selectedIds.has(player.id)),
    [activePlayers, selectedIds]
  )

  const chartConfig = useMemo(
    () => buildPlayerChartConfig(chartPlayers) satisfies ChartConfig,
    [chartPlayers]
  )

  const data = useMemo(
    () =>
      analytics.roundBreakdown.map((row) => ({
        round: `R${row.round}`,
        ...Object.fromEntries(
          activePlayers.map((player) => [
            player.id,
            row.cumulativeScores[player.id] ?? 0,
          ])
        ),
      })),
    [analytics.roundBreakdown, activePlayers]
  )

  function togglePlayer(playerId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(playerId)) {
        if (next.size === 1) return next
        next.delete(playerId)
      } else {
        next.add(playerId)
      }

      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(activePlayers.map((player) => player.id)))
  }

  if (activePlayers.length === 0 || data.length === 0) {
    return (
      <Card size="sm" className="ring-foreground/5">
        <CardHeader>
          <CardTitle>Score progress</CardTitle>
          <CardDescription>Cumulative score by round</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Play a round to see score trends.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>Score progress</CardTitle>
        <CardDescription>
          Cumulative score by round · toggle players below
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {activePlayers.map((player) => {
            const selected = selectedIds.has(player.id)

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className="rounded-full focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring"
              >
                <Badge variant={selected ? "default" : "outline"}>
                  {player.name}
                </Badge>
              </button>
            )
          })}
          {selectedIds.size < activePlayers.length ? (
            <button
              type="button"
              onClick={selectAll}
              className="rounded-full focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring"
            >
              <Badge variant="ghost">All</Badge>
            </button>
          ) : null}
        </div>

        <ChartContainer config={chartConfig} className="aspect-[4/3] min-h-56 w-full">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="round"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {chartPlayers.map((player) => (
              <Line
                key={player.id}
                type="monotone"
                dataKey={player.id}
                stroke={`var(--color-${player.id})`}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

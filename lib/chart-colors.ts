export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--muted-foreground)",
] as const

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function buildPlayerChartConfig(
  players: Array<{ id: string; name: string }>
) {
  return Object.fromEntries(
    players.map((player, index) => [
      player.id,
      {
        label: player.name,
        color: getChartColor(index),
      },
    ])
  )
}

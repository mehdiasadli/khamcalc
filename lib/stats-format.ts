export function formatDuration(ms: number | null): string {
  if (ms === null || ms < 0) return "—"

  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return "<1m"
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—"
  return `${Math.round(value * 100)}%`
}

export function formatDecimal(value: number, digits = 1): string {
  return value.toFixed(digits)
}

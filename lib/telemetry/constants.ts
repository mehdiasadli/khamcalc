export const GA_MEASUREMENT_ID_ENV = "NEXT_PUBLIC_GA_MEASUREMENT_ID"

export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  return id || undefined
}

export function isGaEnabled(): boolean {
  return Boolean(getGaMeasurementId())
}

export const GA_EVENTS = {
  gameStarted: "game_started",
  gameFinished: "game_finished",
  shareOpened: "share_opened",
  exportUsed: "export_used",
} as const

import { sendGAEvent } from "@next/third-parties/google"

import { detectPresetKey } from "@/lib/config"
import type { TGameConfig } from "@/schemas/config.schema"
import { GA_EVENTS, isGaEnabled } from "@/lib/telemetry/constants"

type TGaEventParams = Record<string, string | number | boolean>

function trackEvent(eventName: string, params?: TGaEventParams): void {
  if (!isGaEnabled() || typeof window === "undefined") {
    return
  }

  sendGAEvent("event", eventName, params ?? {})
}

function getPresetKey(config: TGameConfig): string {
  return detectPresetKey(config) ?? "custom"
}

export function trackGameStarted(input: {
  config: TGameConfig
  playerCount: number
}): void {
  trackEvent(GA_EVENTS.gameStarted, {
    preset_key: getPresetKey(input.config),
    player_count: input.playerCount,
  })
}

export function trackGameFinished(input: {
  config: TGameConfig
  playerCount: number
  questionsPlayed: number
}): void {
  trackEvent(GA_EVENTS.gameFinished, {
    preset_key: getPresetKey(input.config),
    player_count: input.playerCount,
    questions_played: input.questionsPlayed,
  })
}

export function trackShareOpened(source: "stats"): void {
  trackEvent(GA_EVENTS.shareOpened, { source })
}

export function trackExportUsed(exportType: "heatmap_png"): void {
  trackEvent(GA_EVENTS.exportUsed, { export_type: exportType })
}

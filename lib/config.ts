import { configPresets, type TConfigPresetName } from "@/lib/config-presets"
import type { TGameConfig } from "@/schemas/config.schema"
import { scoringConfigsEqual } from "@/lib/scoring"

export function configMatches(a: TGameConfig, b: TGameConfig): boolean {
  return (
    a.questionsPerRound === b.questionsPerRound &&
    a.maxRounds === b.maxRounds &&
    scoringConfigsEqual(a.scoring, b.scoring)
  )
}

export function detectPresetKey(config: TGameConfig): TConfigPresetName | null {
  for (const [key, preset] of Object.entries(configPresets)) {
    if (configMatches(config, preset.config)) {
      return key as TConfigPresetName
    }
  }

  return null
}

export function detectPresetName(config: TGameConfig): string | null {
  const key = detectPresetKey(config)
  return key ? configPresets[key].name : null
}

export function formatConfigValue(value: number | null): string {
  return value === null ? "No limit" : String(value)
}

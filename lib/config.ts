import type { TGameConfig } from "@/schemas/config.schema"
import { scoringConfigsEqual } from "@/lib/scoring"
import { configPresets } from "@/lib/config-presets"

export function configMatches(a: TGameConfig, b: TGameConfig): boolean {
  return (
    a.questionsPerRound === b.questionsPerRound &&
    a.maxRounds === b.maxRounds &&
    scoringConfigsEqual(a.scoring, b.scoring)
  )
}

export function formatConfigValue(value: number | null): string {
  return value === null ? "No limit" : String(value)
}

export function detectPresetName(config: TGameConfig): string | null {
  for (const preset of Object.values(configPresets)) {
    if (configMatches(config, preset.config)) {
      return preset.name
    }
  }

  return null
}

import type { TGameConfig } from "@/schemas/config.schema"

export function configMatches(a: TGameConfig, b: TGameConfig): boolean {
  return (
    a.questionsPerRound === b.questionsPerRound &&
    a.maxRounds === b.maxRounds
  )
}

export function formatConfigValue(value: number | null): string {
  return value === null ? "No limit" : String(value)
}

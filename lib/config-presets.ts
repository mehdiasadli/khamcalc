import type { TGameConfig } from "@/schemas/config.schema"

export interface TConfigPreset {
  name: string
  config: TGameConfig
}

export const configPresets = {
  khamsa: {
    name: "Khamsa",
    config: {
      questionsPerRound: 5,
      maxRounds: null,
    },
  },
  brainRing: {
    name: "Brain Ring",
    config: {
      questionsPerRound: null,
      maxRounds: 1,
    },
  },
} as const satisfies Record<string, TConfigPreset>

export type TConfigPresetName = keyof typeof configPresets

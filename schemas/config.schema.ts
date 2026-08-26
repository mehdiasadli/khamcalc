import z from "zod"

import {
  ScoringConfigSchema,
  defaultScoringConfig,
} from "@/schemas/scoring.schema"

const nullablePositiveInt = z
  .number()
  .int("Must be a whole number")
  .positive("Must be greater than 0")
  .nullable()

export const GameConfigSchema = z.object({
  questionsPerRound: nullablePositiveInt,
  maxRounds: nullablePositiveInt,
  scoring: ScoringConfigSchema,
})

export type TGameConfig = z.infer<typeof GameConfigSchema>

export const UpdateGameConfigSchema = GameConfigSchema.partial()

export type TUpdateGameConfig = z.infer<typeof UpdateGameConfigSchema>

export { defaultScoringConfig }

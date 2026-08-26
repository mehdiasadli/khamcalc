import z from "zod"

const nullablePositiveInt = z
  .number()
  .int("Must be a whole number")
  .positive("Must be greater than 0")
  .nullable()

export const GameConfigSchema = z.object({
  questionsPerRound: nullablePositiveInt,
  maxRounds: nullablePositiveInt,
})

export type TGameConfig = z.infer<typeof GameConfigSchema>

export const UpdateGameConfigSchema = GameConfigSchema.partial()

export type TUpdateGameConfig = z.infer<typeof UpdateGameConfigSchema>

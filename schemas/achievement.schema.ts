import z from "zod"

export const AchievementTypeSchema = z.enum([
  "ace",
  "abyss",
  "ghost",
  "masterclass",
  "catastrophe",
])

export type TAchievementType = z.infer<typeof AchievementTypeSchema>

export const GameAchievementSchema = z.object({
  playerId: z.uuid(),
  type: AchievementTypeSchema,
  count: z.number().int().positive(),
  earnedAtRound: z.number().int().positive(),
})

export type TGameAchievement = z.infer<typeof GameAchievementSchema>

import z from "zod"

export const WrongDeductionModeSchema = z.enum([
  "none",
  "question_value",
  "fixed",
])

export type TWrongDeductionMode = z.infer<typeof WrongDeductionModeSchema>

export const ScoringModeSchema = z.enum(["linear", "flat"])

export type TScoringMode = z.infer<typeof ScoringModeSchema>

export const ScoringOverrideSchema = z.object({
  round: z.number().int().positive(),
  question: z.number().int().positive(),
  correctPoints: z.number().int(),
  wrongPoints: z.number().int().optional(),
})

export type TScoringOverride = z.infer<typeof ScoringOverrideSchema>

export const ScoringConfigSchema = z.object({
  mode: ScoringModeSchema,
  basePoints: z.number().int().positive(),
  incrementPerQuestion: z.number().int().min(0),
  incrementPerRound: z.number().int().min(0),
  roundMultiplier: z.number().positive(),
  wrongDeduction: WrongDeductionModeSchema,
  wrongFixedAmount: z.number().int().positive(),
  allowNegativeScores: z.boolean(),
  minScore: z.number().int().nullable(),
  showQuestionValue: z.boolean(),
  overrides: z.array(ScoringOverrideSchema),
})

export type TScoringConfig = z.infer<typeof ScoringConfigSchema>

export const UpdateScoringConfigSchema = ScoringConfigSchema.partial()

export type TUpdateScoringConfig = z.infer<typeof UpdateScoringConfigSchema>

export const defaultScoringConfig: TScoringConfig = {
  mode: "flat",
  basePoints: 100,
  incrementPerQuestion: 0,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "none",
  wrongFixedAmount: 1,
  allowNegativeScores: false,
  minScore: null,
  showQuestionValue: true,
  overrides: [],
}

export const khamsaScoringConfig: TScoringConfig = {
  mode: "linear",
  basePoints: 100,
  incrementPerQuestion: 100,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "question_value",
  wrongFixedAmount: 1,
  allowNegativeScores: true,
  minScore: null,
  showQuestionValue: true,
  overrides: [],
}

export const brainRingScoringConfig: TScoringConfig = {
  mode: "flat",
  basePoints: 1,
  incrementPerQuestion: 0,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "question_value",
  wrongFixedAmount: 1,
  allowNegativeScores: true,
  minScore: null,
  showQuestionValue: true,
  overrides: [],
}

/** Clue values rise through the round; wrong answers cost the clue amount. */
export const jeopardyScoringConfig: TScoringConfig = {
  mode: "linear",
  basePoints: 200,
  incrementPerQuestion: 200,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "question_value",
  wrongFixedAmount: 1,
  allowNegativeScores: true,
  minScore: null,
  showQuestionValue: true,
  overrides: [],
}

/** Climbing ladder; wrong answers do not deduct (safe-progression style). */
export const millionaireScoringConfig: TScoringConfig = {
  mode: "linear",
  basePoints: 100,
  incrementPerQuestion: 100,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "none",
  wrongFixedAmount: 1,
  allowNegativeScores: false,
  minScore: null,
  showQuestionValue: true,
  overrides: [],
}

/** One point per correct answer; wrong answers are free. */
export const pubQuizScoringConfig: TScoringConfig = {
  mode: "flat",
  basePoints: 1,
  incrementPerQuestion: 0,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "none",
  wrongFixedAmount: 1,
  allowNegativeScores: false,
  minScore: null,
  showQuestionValue: false,
  overrides: [],
}

/** Flat starter-style scoring; buzz in, no penalty for misses. */
export const universityChallengeScoringConfig: TScoringConfig = {
  mode: "flat",
  basePoints: 10,
  incrementPerQuestion: 0,
  incrementPerRound: 0,
  roundMultiplier: 1,
  wrongDeduction: "none",
  wrongFixedAmount: 1,
  allowNegativeScores: false,
  minScore: null,
  showQuestionValue: true,
  overrides: [],
}

/** Stakes double each round; wrong answers still cost the question value. */
export const doubleDownScoringConfig: TScoringConfig = {
  mode: "linear",
  basePoints: 100,
  incrementPerQuestion: 100,
  incrementPerRound: 0,
  roundMultiplier: 2,
  wrongDeduction: "question_value",
  wrongFixedAmount: 1,
  allowNegativeScores: true,
  minScore: 0,
  showQuestionValue: true,
  overrides: [],
}

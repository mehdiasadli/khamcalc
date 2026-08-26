import z from "zod"

export const POINTS_PER_CORRECT = 100

export const GameStatusSchema = z.enum(["idle", "playing", "finished"])

export type TGameStatus = z.infer<typeof GameStatusSchema>

export const QuestionPositionSchema = z.object({
  round: z.number().int().positive(),
  question: z.number().int().positive(),
})

export type TQuestionPosition = z.infer<typeof QuestionPositionSchema>

export const QuestionRecordSchema = z.object({
  round: z.number().int().positive(),
  question: z.number().int().positive(),
  correctPlayerId: z.uuid().nullable(),
  wrongPlayerIds: z.array(z.uuid()),
})

export type TQuestionRecord = z.infer<typeof QuestionRecordSchema>

export const GameStateSchema = z.object({
  status: GameStatusSchema,
  currentRound: z.number().int().positive(),
  currentQuestion: z.number().int().positive(),
  furthestRound: z.number().int().positive(),
  furthestQuestion: z.number().int().positive(),
  scores: z.record(z.string(), z.number().int().min(0)),
  questions: z.array(QuestionRecordSchema),
  startedAt: z.iso.datetime().nullable(),
  finishedAt: z.iso.datetime().nullable(),
})

export type TGameState = z.infer<typeof GameStateSchema>

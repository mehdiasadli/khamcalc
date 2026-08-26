import type { TQuestionRecord } from "@/schemas/game.schema"

export interface TPlayerAnswerStats {
  correctCount: number
  wrongCount: number
  accuracy: number | null
}

export function getPlayerAnswerStats(
  playerId: string,
  questions: TQuestionRecord[]
): TPlayerAnswerStats {
  const correctCount = questions.filter(
    (record) => record.correctPlayerId === playerId
  ).length
  const wrongCount = questions.filter((record) =>
    record.wrongPlayerIds.includes(playerId)
  ).length
  const attempts = correctCount + wrongCount

  return {
    correctCount,
    wrongCount,
    accuracy: attempts > 0 ? correctCount / attempts : null,
  }
}

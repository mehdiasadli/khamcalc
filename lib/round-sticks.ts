import type { TQuestionRecord } from "@/schemas/game.schema"

export type TRoundStickState =
  | "upcoming"
  | "skipped"
  | "correct"
  | "wrong"
  | "idle"

const MAX_ROUND_STICKS = 10

function findQuestionRecord(
  questions: TQuestionRecord[],
  round: number,
  question: number
): TQuestionRecord | undefined {
  return questions.find(
    (record) => record.round === round && record.question === question
  )
}

export function getRoundStickCount(
  round: number,
  currentQuestion: number,
  questions: TQuestionRecord[],
  questionsPerRound: number | null
): number {
  if (questionsPerRound !== null) {
    return questionsPerRound
  }

  const recordedInRound = questions
    .filter((record) => record.round === round)
    .map((record) => record.question)

  const maxRecorded =
    recordedInRound.length > 0 ? Math.max(...recordedInRound) : 0

  return Math.max(currentQuestion, maxRecorded)
}

export function shouldShowRoundSticks(questionCount: number): boolean {
  return questionCount > 0 && questionCount <= MAX_ROUND_STICKS
}

export function getPlayerRoundSticks(
  playerId: string,
  round: number,
  currentQuestion: number,
  questions: TQuestionRecord[],
  questionsPerRound: number | null
): TRoundStickState[] | null {
  const questionCount = getRoundStickCount(
    round,
    currentQuestion,
    questions,
    questionsPerRound
  )

  if (!shouldShowRoundSticks(questionCount)) {
    return null
  }

  return Array.from({ length: questionCount }, (_, index) => {
    const question = index + 1

    if (question > currentQuestion) {
      return "upcoming"
    }

    const record = findQuestionRecord(questions, round, question)

    if (!record) {
      return "upcoming"
    }

    if (record.skipped) {
      return "skipped"
    }

    if (record.correctPlayerId === playerId) {
      return "correct"
    }

    if (record.wrongPlayerIds.includes(playerId)) {
      return "wrong"
    }

    return "idle"
  })
}

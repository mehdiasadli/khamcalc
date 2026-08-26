import type { TGameConfig } from "@/schemas/config.schema"
import {
  POINTS_PER_CORRECT,
  type TGameState,
  type TQuestionPosition,
  type TQuestionRecord,
} from "@/schemas/game.schema"

export function createEmptyScores(playerIds: string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map((id) => [id, 0]))
}

export function recalculateScores(
  questions: TQuestionRecord[],
  playerIds: string[]
): Record<string, number> {
  const scores = createEmptyScores(playerIds)

  for (const record of questions) {
    if (!record.correctPlayerId) continue
    scores[record.correctPlayerId] =
      (scores[record.correctPlayerId] ?? 0) + POINTS_PER_CORRECT
  }

  return scores
}

export function questionKey(round: number, question: number): string {
  return `${round}:${question}`
}

export function findQuestionRecord(
  questions: TQuestionRecord[],
  position: TQuestionPosition
): TQuestionRecord | undefined {
  return questions.find(
    (record) =>
      record.round === position.round && record.question === position.question
  )
}

export function upsertQuestionRecord(
  questions: TQuestionRecord[],
  record: TQuestionRecord
): TQuestionRecord[] {
  const index = questions.findIndex(
    (item) => item.round === record.round && item.question === record.question
  )

  if (index === -1) return [...questions, record]

  const next = [...questions]
  next[index] = record
  return next
}

export function removeQuestionsForRound(
  questions: TQuestionRecord[],
  round: number
): TQuestionRecord[] {
  return questions.filter((record) => record.round !== round)
}

export function removeQuestionRecord(
  questions: TQuestionRecord[],
  position: TQuestionPosition
): TQuestionRecord[] {
  return questions.filter(
    (record) =>
      !(
        record.round === position.round && record.question === position.question
      )
  )
}

export function questionHasAnswers(
  record: TQuestionRecord | undefined
): boolean {
  if (!record) return false

  if (record.skipped) return true

  return Boolean(record.correctPlayerId) || record.wrongPlayerIds.length > 0
}

export function isQuestionSkipped(record: TQuestionRecord | undefined): boolean {
  return record?.skipped ?? false
}

export function getLeadingEdge(
  questions: TQuestionRecord[],
  fallback: TQuestionPosition
): TQuestionPosition {
  if (questions.length === 0) return fallback

  return questions.reduce<TQuestionPosition>((leading, record) => {
    if (record.round > leading.round) {
      return { round: record.round, question: record.question }
    }

    if (record.round === leading.round && record.question > leading.question) {
      return { round: record.round, question: record.question }
    }

    return leading
  }, fallback)
}

export function isAtLastRound(round: number, config: TGameConfig): boolean {
  return config.maxRounds !== null && round >= config.maxRounds
}

export function isAtLastQuestionOfRound(
  question: number,
  config: TGameConfig
): boolean {
  return (
    config.questionsPerRound !== null && question >= config.questionsPerRound
  )
}

export function canManualNext(
  position: TQuestionPosition,
  config: TGameConfig
): boolean {
  if (isAtLastRound(position.round, config)) {
    if (
      config.questionsPerRound === null ||
      isAtLastQuestionOfRound(position.question, config)
    ) {
      return false
    }
  }

  return true
}

export function shouldShowFinish(
  position: TQuestionPosition,
  config: TGameConfig
): boolean {
  if (!isAtLastRound(position.round, config)) return false

  if (config.questionsPerRound === null) return true

  return isAtLastQuestionOfRound(position.question, config)
}

export function getNextPosition(
  position: TQuestionPosition,
  config: TGameConfig
): TQuestionPosition | null {
  const { round, question } = position

  if (config.questionsPerRound === null) {
    return { round, question: question + 1 }
  }

  if (question < config.questionsPerRound) {
    return { round, question: question + 1 }
  }

  if (isAtLastRound(round, config)) {
    return null
  }

  return { round: round + 1, question: 1 }
}

export function getPreviousPosition(
  position: TQuestionPosition
): TQuestionPosition | null {
  const { round, question } = position

  if (question > 1) {
    return { round, question: question - 1 }
  }

  if (round > 1) {
    return { round: round - 1, question: Number.MAX_SAFE_INTEGER }
  }

  return null
}

export function resolvePreviousPosition(
  position: TQuestionPosition,
  config: TGameConfig,
  questions: TQuestionRecord[]
): TQuestionPosition | null {
  const previous = getPreviousPosition(position)
  if (!previous) return null

  if (previous.question === Number.MAX_SAFE_INTEGER) {
    const previousRound = previous.round
    const roundQuestions = questions.filter(
      (record) => record.round === previousRound
    )

    if (roundQuestions.length > 0) {
      const lastQuestion = Math.max(
        ...roundQuestions.map((record) => record.question)
      )
      return { round: previousRound, question: lastQuestion }
    }

    if (config.questionsPerRound !== null) {
      return { round: previousRound, question: config.questionsPerRound }
    }

    const leadingEdge = getLeadingEdge(questions, {
      round: previousRound,
      question: 1,
    })

    if (leadingEdge.round === previousRound) {
      return leadingEdge
    }

    return { round: previousRound, question: 1 }
  }

  return previous
}

export function createInitialGameState(playerIds: string[]): TGameState {
  return {
    status: "playing",
    currentRound: 1,
    currentQuestion: 1,
    furthestRound: 1,
    furthestQuestion: 1,
    scores: createEmptyScores(playerIds),
    questions: [],
    achievements: [],
    startedAt: new Date().toISOString(),
    finishedAt: null,
  }
}

export function getQuestionDisabledPlayerIds(
  record: TQuestionRecord | undefined
): string[] {
  return record?.wrongPlayerIds ?? []
}

export function isPlayerDisabledForQuestion(
  record: TQuestionRecord | undefined,
  playerId: string
): boolean {
  return record?.wrongPlayerIds.includes(playerId) ?? false
}

export function areAllPlayersWrong(
  record: TQuestionRecord,
  playerIds: string[]
): boolean {
  if (playerIds.length === 0) return false
  if (record.correctPlayerId) return false

  return playerIds.every((id) => record.wrongPlayerIds.includes(id))
}

export function advanceFurthest(
  game: TGameState,
  round: number,
  question: number
): Pick<TGameState, "furthestRound" | "furthestQuestion"> {
  if (round > game.furthestRound) {
    return { furthestRound: round, furthestQuestion: question }
  }

  if (round === game.furthestRound && question > game.furthestQuestion) {
    return { furthestRound: round, furthestQuestion: question }
  }

  return {
    furthestRound: game.furthestRound,
    furthestQuestion: game.furthestQuestion,
  }
}

export function getAdvanceAfterQuestion(
  game: TGameState,
  config: TGameConfig
): Pick<
  TGameState,
  "currentRound" | "currentQuestion" | "furthestRound" | "furthestQuestion"
> {
  const nextPosition = getNextPosition(
    {
      round: game.currentRound,
      question: game.currentQuestion,
    },
    config
  )

  if (nextPosition) {
    return {
      currentRound: nextPosition.round,
      currentQuestion: nextPosition.question,
      ...advanceFurthest(game, nextPosition.round, nextPosition.question),
    }
  }

  return {
    currentRound: game.currentRound,
    currentQuestion: game.currentQuestion,
    ...advanceFurthest(game, game.currentRound, game.currentQuestion),
  }
}

export function isAtLeadingEdge(game: TGameState): boolean {
  return (
    game.currentRound === game.furthestRound &&
    game.currentQuestion === game.furthestQuestion
  )
}

export function canGoPrevious(
  game: TGameState,
  config: TGameConfig
): boolean {
  return (
    resolvePreviousPosition(
      {
        round: game.currentRound,
        question: game.currentQuestion,
      },
      config,
      game.questions
    ) !== null
  )
}

export function getCurrentQuestionRecord(
  game: TGameState
): TQuestionRecord | undefined {
  return findQuestionRecord(game.questions, {
    round: game.currentRound,
    question: game.currentQuestion,
  })
}

export function getPlayerScore(game: TGameState, playerId: string): number {
  return game.scores[playerId] ?? 0
}

export function createSkippedQuestionRecord(
  position: TQuestionPosition
): TQuestionRecord {
  return {
    round: position.round,
    question: position.question,
    correctPlayerId: null,
    wrongPlayerIds: [],
    skipped: true,
  }
}

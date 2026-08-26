import type { TQuestionRecord } from "@/schemas/game.schema"
import type {
  TScoringConfig,
  TScoringOverride,
} from "@/schemas/scoring.schema"

function sortQuestions(questions: TQuestionRecord[]): TQuestionRecord[] {
  return [...questions].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round
    return a.question - b.question
  })
}

function findOverride(
  scoring: TScoringConfig,
  round: number,
  question: number
): TScoringOverride | undefined {
  return scoring.overrides.find(
    (override) => override.round === round && override.question === question
  )
}

function applyRoundScaling(value: number, round: number, scoring: TScoringConfig) {
  let next = value + (round - 1) * scoring.incrementPerRound

  if (scoring.roundMultiplier !== 1) {
    next = Math.round(next * scoring.roundMultiplier ** (round - 1))
  }

  return next
}

export function getQuestionCorrectPoints(
  scoring: TScoringConfig,
  round: number,
  question: number
): number {
  const override = findOverride(scoring, round, question)

  if (override) {
    return override.correctPoints
  }

  const incrementPerQuestion =
    scoring.mode === "flat" ? 0 : scoring.incrementPerQuestion

  const baseValue =
    scoring.basePoints + (question - 1) * incrementPerQuestion

  return applyRoundScaling(baseValue, round, scoring)
}

export function getWrongDeductionPoints(
  scoring: TScoringConfig,
  round: number,
  question: number
): number {
  const override = findOverride(scoring, round, question)

  if (override?.wrongPoints !== undefined) {
    return override.wrongPoints
  }

  switch (scoring.wrongDeduction) {
    case "none":
      return 0
    case "question_value":
      return getQuestionCorrectPoints(scoring, round, question)
    case "fixed":
      return scoring.wrongFixedAmount
    default:
      return 0
  }
}

function applyScoreBounds(score: number, scoring: TScoringConfig): number {
  if (!scoring.allowNegativeScores) {
    return Math.max(0, score)
  }

  if (scoring.minScore !== null) {
    return Math.max(scoring.minScore, score)
  }

  return score
}

export function recalculateScores(
  questions: TQuestionRecord[],
  playerIds: string[],
  scoring: TScoringConfig
): Record<string, number> {
  const scores = Object.fromEntries(playerIds.map((id) => [id, 0]))

  for (const record of sortQuestions(questions)) {
    if (record.correctPlayerId) {
      scores[record.correctPlayerId] =
        (scores[record.correctPlayerId] ?? 0) +
        getQuestionCorrectPoints(scoring, record.round, record.question)
    }

    for (const playerId of record.wrongPlayerIds) {
      scores[playerId] =
        (scores[playerId] ?? 0) -
        getWrongDeductionPoints(scoring, record.round, record.question)
    }
  }

  return Object.fromEntries(
    playerIds.map((id) => [id, applyScoreBounds(scores[id] ?? 0, scoring)])
  )
}

export function getPlayerRoundNetScore(
  playerId: string,
  round: number,
  questions: TQuestionRecord[],
  scoring: TScoringConfig
): number {
  let score = 0

  for (const record of questions) {
    if (record.round !== round) continue

    if (record.correctPlayerId === playerId) {
      score += getQuestionCorrectPoints(scoring, record.round, record.question)
    }

    if (record.wrongPlayerIds.includes(playerId)) {
      score -= getWrongDeductionPoints(scoring, record.round, record.question)
    }
  }

  return score
}

export function getCumulativeScoresThroughRound(
  questions: TQuestionRecord[],
  playerIds: string[],
  throughRound: number,
  scoring: TScoringConfig
): Record<string, number> {
  const filtered = questions.filter((record) => record.round <= throughRound)

  return recalculateScores(filtered, playerIds, scoring)
}

export function getRoundScores(
  questions: TQuestionRecord[],
  playerIds: string[],
  round: number,
  scoring: TScoringConfig
): Record<string, number> {
  return Object.fromEntries(
    playerIds.map((playerId) => [
      playerId,
      getPlayerRoundNetScore(playerId, round, questions, scoring),
    ])
  )
}

export function scoringConfigsEqual(
  a: TScoringConfig,
  b: TScoringConfig
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function normalizeScoringConfig(
  scoring: TScoringConfig
): TScoringConfig {
  if (scoring.mode === "flat") {
    return {
      ...scoring,
      incrementPerQuestion: 0,
    }
  }

  return scoring
}

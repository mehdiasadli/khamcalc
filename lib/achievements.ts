import type { TGameAchievement } from "@/schemas/achievement.schema"
import type { TGameConfig } from "@/schemas/config.schema"
import type { TGameState, TQuestionRecord } from "@/schemas/game.schema"

export function isRoundComplete(
  round: number,
  game: TGameState,
  config: TGameConfig
): boolean {
  if (game.currentRound > round) return true
  if (game.currentRound < round) return false

  if (config.questionsPerRound !== null) {
    return game.currentQuestion > config.questionsPerRound
  }

  return game.status === "finished"
}

export function getRoundQuestionNumbers(
  round: number,
  questions: TQuestionRecord[],
  config: TGameConfig
): number[] {
  if (config.questionsPerRound !== null) {
    return Array.from({ length: config.questionsPerRound }, (_, index) => index + 1)
  }

  const inRound = questions
    .filter((record) => record.round === round)
    .map((record) => record.question)

  if (inRound.length === 0) return []

  const maxQuestion = Math.max(...inRound)
  return Array.from({ length: maxQuestion }, (_, index) => index + 1)
}

export function detectAceForRound(
  round: number,
  questions: TQuestionRecord[],
  config: TGameConfig
): string | null {
  const questionNumbers = getRoundQuestionNumbers(round, questions, config)
  if (questionNumbers.length === 0) return null

  let acePlayerId: string | null = null

  for (const question of questionNumbers) {
    const record = questions.find(
      (item) => item.round === round && item.question === question
    )

    if (!record || record.skipped || !record.correctPlayerId) {
      return null
    }

    if (acePlayerId === null) {
      acePlayerId = record.correctPlayerId
    } else if (acePlayerId !== record.correctPlayerId) {
      return null
    }
  }

  if (!acePlayerId) return null

  for (const question of questionNumbers) {
    const record = questions.find(
      (item) => item.round === round && item.question === question
    )

    if (record?.wrongPlayerIds.includes(acePlayerId)) {
      return null
    }
  }

  return acePlayerId
}

export function recomputeAchievements(
  game: TGameState,
  config: TGameConfig
): TGameAchievement[] {
  const aceCounts = new Map<
    string,
    { count: number; earnedAtRound: number }
  >()

  const maxRound = Math.max(
    game.furthestRound,
    ...game.questions.map((record) => record.round),
    0
  )

  for (let round = 1; round <= maxRound; round++) {
    if (!isRoundComplete(round, game, config)) continue

    const acePlayerId = detectAceForRound(round, game.questions, config)
    if (!acePlayerId) continue

    const existing = aceCounts.get(acePlayerId)

    aceCounts.set(acePlayerId, {
      count: (existing?.count ?? 0) + 1,
      earnedAtRound: round,
    })
  }

  return Array.from(aceCounts.entries()).map(([playerId, data]) => ({
    playerId,
    type: "ace" as const,
    count: data.count,
    earnedAtRound: data.earnedAtRound,
  }))
}

export function getPlayerAchievements(
  achievements: TGameAchievement[],
  playerId: string
): TGameAchievement[] {
  return achievements.filter((achievement) => achievement.playerId === playerId)
}

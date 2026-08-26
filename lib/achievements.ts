import type { TGameAchievement } from "@/schemas/achievement.schema"
import type { TGameConfig } from "@/schemas/config.schema"
import {
  POINTS_PER_CORRECT,
  type TGameState,
  type TQuestionRecord,
} from "@/schemas/game.schema"

type AchievementBucket = Map<
  string,
  Map<TGameAchievement["type"], { count: number; earnedAtRound: number }>
>

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

function getQuestionRecord(
  round: number,
  question: number,
  questions: TQuestionRecord[]
): TQuestionRecord | undefined {
  return questions.find(
    (item) => item.round === round && item.question === question
  )
}

function getCompletedRounds(
  game: TGameState,
  config: TGameConfig,
  maxRound: number
): number[] {
  return Array.from({ length: maxRound }, (_, index) => index + 1).filter(
    (round) => isRoundComplete(round, game, config)
  )
}

function getPlayerRoundScore(
  playerId: string,
  round: number,
  questions: TQuestionRecord[]
): number {
  let score = 0

  for (const record of questions) {
    if (record.round !== round || record.correctPlayerId !== playerId) {
      continue
    }

    score += POINTS_PER_CORRECT
  }

  return score
}

function countPlayerWrongInRound(
  playerId: string,
  round: number,
  questions: TQuestionRecord[]
): number {
  return questions.filter(
    (record) =>
      record.round === round && record.wrongPlayerIds.includes(playerId)
  ).length
}

function incrementAchievement(
  buckets: AchievementBucket,
  playerId: string,
  type: TGameAchievement["type"],
  earnedAtRound: number
) {
  const playerBucket = buckets.get(playerId) ?? new Map()
  const existing = playerBucket.get(type)

  playerBucket.set(type, {
    count: (existing?.count ?? 0) + 1,
    earnedAtRound,
  })
  buckets.set(playerId, playerBucket)
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
    const record = getQuestionRecord(round, question, questions)

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
    const record = getQuestionRecord(round, question, questions)

    if (record?.wrongPlayerIds.includes(acePlayerId)) {
      return null
    }
  }

  return acePlayerId
}

export function detectAbyssForRound(
  playerId: string,
  round: number,
  questions: TQuestionRecord[],
  config: TGameConfig
): boolean {
  const questionNumbers = getRoundQuestionNumbers(round, questions, config)
  if (questionNumbers.length === 0) return false

  for (const question of questionNumbers) {
    const record = getQuestionRecord(round, question, questions)

    if (!record || record.skipped) {
      return false
    }

    if (record.correctPlayerId === playerId) {
      return false
    }

    if (!record.wrongPlayerIds.includes(playerId)) {
      return false
    }
  }

  return true
}

export function detectGhostForRound(
  playerId: string,
  round: number,
  questions: TQuestionRecord[],
  config: TGameConfig
): boolean {
  const questionNumbers = getRoundQuestionNumbers(round, questions, config)
  if (questionNumbers.length === 0) return false

  for (const question of questionNumbers) {
    const record = getQuestionRecord(round, question, questions)

    if (!record) {
      continue
    }

    if (
      record.correctPlayerId === playerId ||
      record.wrongPlayerIds.includes(playerId)
    ) {
      return false
    }
  }

  return true
}

export function detectMasterclassForGame(
  playerId: string,
  game: TGameState,
  completedRounds: number[]
): boolean {
  if (completedRounds.length === 0) {
    return false
  }

  return completedRounds.every(
    (round) => getPlayerRoundScore(playerId, round, game.questions) > 0
  )
}

export function detectCatastropheForGame(
  playerId: string,
  game: TGameState,
  completedRounds: number[]
): boolean {
  if (completedRounds.length === 0) {
    return false
  }

  return completedRounds.every((round) => {
    const roundScore = getPlayerRoundScore(playerId, round, game.questions)
    const wrongCount = countPlayerWrongInRound(playerId, round, game.questions)

    return roundScore === 0 && wrongCount > 0
  })
}

export function recomputeAchievements(
  game: TGameState,
  config: TGameConfig,
  playerIds: string[]
): TGameAchievement[] {
  const buckets: AchievementBucket = new Map()

  const maxRound = Math.max(
    game.furthestRound,
    ...game.questions.map((record) => record.round),
    0
  )

  const completedRounds = getCompletedRounds(game, config, maxRound)

  for (const round of completedRounds) {
    const acePlayerId = detectAceForRound(round, game.questions, config)

    if (acePlayerId) {
      incrementAchievement(buckets, acePlayerId, "ace", round)
    }

    for (const playerId of playerIds) {
      if (detectAbyssForRound(playerId, round, game.questions, config)) {
        incrementAchievement(buckets, playerId, "abyss", round)
      }

      if (detectGhostForRound(playerId, round, game.questions, config)) {
        incrementAchievement(buckets, playerId, "ghost", round)
      }
    }
  }

  if (game.status === "finished") {
    const finalRound = completedRounds.at(-1) ?? maxRound

    for (const playerId of playerIds) {
      if (detectMasterclassForGame(playerId, game, completedRounds)) {
        incrementAchievement(buckets, playerId, "masterclass", finalRound)
      }

      if (detectCatastropheForGame(playerId, game, completedRounds)) {
        incrementAchievement(buckets, playerId, "catastrophe", finalRound)
      }
    }
  }

  const achievements: TGameAchievement[] = []

  for (const [playerId, typeMap] of buckets) {
    for (const [type, data] of typeMap) {
      achievements.push({
        playerId,
        type,
        count: data.count,
        earnedAtRound: data.earnedAtRound,
      })
    }
  }

  return achievements
}

export function getPlayerAchievements(
  achievements: TGameAchievement[],
  playerId: string
): TGameAchievement[] {
  return achievements.filter((achievement) => achievement.playerId === playerId)
}

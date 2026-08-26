import { isRoundComplete } from "@/lib/achievements"
import { detectPresetName } from "@/lib/config"
import {
  getCumulativeScoresThroughRound,
  getRoundScores,
  recalculateScores,
} from "@/lib/scoring"
import { getLongestCorrectStreak } from "@/lib/streaks"
import { formatDuration, formatPercent } from "@/lib/stats-format"
import type { TGameState, TQuestionRecord } from "@/schemas/game.schema"
import type { TGameConfig } from "@/schemas/config.schema"
import type { TPlayer } from "@/schemas/player.schema"
import { getPlayerAnswerStats } from "@/lib/player-answer-stats"

export interface TGameProgress {
  currentRound: number
  currentQuestion: number
  maxRounds: number | null
  questionsPerRound: number | null
  status: TGameState["status"]
}

export interface TGameOverviewMetrics {
  questionsPlayed: number
  skippedCount: number
  totalCorrect: number
  totalIncorrectMarks: number
  averageWrongPerQuestion: number
  elapsedMs: number | null
  progress: TGameProgress
  presetName: string | null
}

export interface TPlayerStats {
  playerId: string
  name: string
  removed: boolean
  score: number
  rank: number
  correctCount: number
  wrongCount: number
  accuracy: number | null
  pointsPerRound: Record<number, number>
  participationRate: number
  firstCorrectByRound: Record<number, number | null>
  wrongBeforeCorrectRatio: number | null
  roundsLed: number
  idleQuestionCount: number
  comebackDelta: number | null
  longestCorrectStreak: number
}

export interface TRoundBreakdownRow {
  round: number
  complete: boolean
  cumulativeScores: Record<string, number>
  leaderId: string | null
}

export interface TQuestionLogEntry {
  round: number
  question: number
  skipped: boolean
  correctPlayerId: string | null
  wrongPlayerIds: string[]
}

export interface TLeaderboardTimelineEntry {
  round: number
  leaderId: string | null
  leaderScore: number
  tiedLeaderIds: string[]
}

export interface TGameAnalytics {
  overview: TGameOverviewMetrics
  players: TPlayerStats[]
  roundBreakdown: TRoundBreakdownRow[]
  questionLog: TQuestionLogEntry[]
  leaderboardTimeline: TLeaderboardTimelineEntry[]
}

export interface TAnalyticsInput {
  game: TGameState
  config: TGameConfig
  players: TPlayer[]
  now?: Date
}

function sortQuestions(questions: TQuestionRecord[]): TQuestionRecord[] {
  return [...questions].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round
    return a.question - b.question
  })
}

function getPlayerIds(players: TPlayer[]): string[] {
  return players.map((player) => player.id)
}

function getPlayerNameMap(players: TPlayer[]): Map<string, string> {
  return new Map(players.map((player) => [player.id, player.name]))
}

function getRoundNumbers(game: TGameState): number[] {
  const maxRound = Math.max(
    game.currentRound,
    ...game.questions.map((record) => record.round),
    0
  )

  if (maxRound === 0) return []

  return Array.from({ length: maxRound }, (_, index) => index + 1)
}

function getLeadersFromScores(
  scores: Record<string, number>
): { leaderIds: string[]; topScore: number } {
  const entries = Object.entries(scores)

  if (entries.length === 0) {
    return { leaderIds: [], topScore: 0 }
  }

  const topScore = Math.max(...entries.map(([, score]) => score))
  const allZero = entries.every(([, score]) => score === 0)

  if (allZero) {
    return { leaderIds: [], topScore: 0 }
  }

  return {
    leaderIds: entries
      .filter(([, score]) => score === topScore)
      .map(([id]) => id),
    topScore,
  }
}

function rankPlayersByScore(
  players: TPlayer[],
  scores: Record<string, number>
): Map<string, number> {
  const sorted = [...players].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
  )

  const ranks = new Map<string, number>()

  sorted.forEach((player, index) => {
    ranks.set(player.id, index + 1)
  })

  return ranks
}

function getPlayerParticipationCount(
  playerId: string,
  questions: TQuestionRecord[]
): number {
  return questions.filter(
    (record) =>
      record.correctPlayerId === playerId ||
      record.wrongPlayerIds.includes(playerId)
  ).length
}

function getFirstCorrectByRound(
  playerId: string,
  questions: TQuestionRecord[],
  rounds: number[]
): Record<number, number | null> {
  const result: Record<number, number | null> = {}

  for (const round of rounds) {
    const first = questions
      .filter(
        (record) =>
          record.round === round && record.correctPlayerId === playerId
      )
      .sort((a, b) => a.question - b.question)[0]

    result[round] = first?.question ?? null
  }

  return result
}

function getCompletedRounds(
  game: TGameState,
  config: TGameConfig,
  rounds: number[]
): number[] {
  return rounds.filter((round) => isRoundComplete(round, game, config))
}

function getComebackDelta(
  playerId: string,
  questions: TQuestionRecord[],
  completedRounds: number[],
  scoring: TGameState["scoringConfig"]
): number | null {
  if (completedRounds.length < 2) return null

  const previousRound = completedRounds.at(-2)
  const latestRound = completedRounds.at(-1)

  if (previousRound === undefined || latestRound === undefined) return null

  const previousScore = getCumulativeScoresThroughRound(
    questions,
    [playerId],
    previousRound,
    scoring
  )[playerId]
  const latestScore = getCumulativeScoresThroughRound(
    questions,
    [playerId],
    latestRound,
    scoring
  )[playerId]

  return latestScore - previousScore
}

export function getGameOverviewMetrics(input: TAnalyticsInput): TGameOverviewMetrics {
  const { game, config } = input
  const questions = sortQuestions(game.questions)
  const questionsPlayed = questions.length
  const skippedCount = questions.filter((record) => record.skipped).length
  const totalCorrect = questions.filter((record) => record.correctPlayerId).length
  const totalIncorrectMarks = questions.reduce(
    (sum, record) => sum + record.wrongPlayerIds.length,
    0
  )

  const elapsedMs = game.startedAt
    ? (game.finishedAt
        ? new Date(game.finishedAt)
        : (input.now ?? new Date())
      ).getTime() - new Date(game.startedAt).getTime()
    : null

  return {
    questionsPlayed,
    skippedCount,
    totalCorrect,
    totalIncorrectMarks,
    averageWrongPerQuestion:
      questionsPlayed > 0 ? totalIncorrectMarks / questionsPlayed : 0,
    elapsedMs,
    progress: {
      currentRound: game.currentRound,
      currentQuestion: game.currentQuestion,
      maxRounds: config.maxRounds,
      questionsPerRound: config.questionsPerRound,
      status: game.status,
    },
    presetName: detectPresetName(config),
  }
}

export function getQuestionLog(game: TGameState): TQuestionLogEntry[] {
  return sortQuestions(game.questions).map((record) => ({
    round: record.round,
    question: record.question,
    skipped: record.skipped,
    correctPlayerId: record.correctPlayerId,
    wrongPlayerIds: [...record.wrongPlayerIds],
  }))
}

export function getRoundBreakdown(input: TAnalyticsInput): TRoundBreakdownRow[] {
  const { game, config, players } = input
  const playerIds = getPlayerIds(players)
  const rounds = getRoundNumbers(game)

  return rounds.map((round) => {
    const cumulativeScores = getCumulativeScoresThroughRound(
      game.questions,
      playerIds,
      round,
      game.scoringConfig
    )
    const { leaderIds } = getLeadersFromScores(cumulativeScores)

    return {
      round,
      complete: isRoundComplete(round, game, config),
      cumulativeScores,
      leaderId: leaderIds[0] ?? null,
    }
  })
}

export function getLeaderboardTimeline(
  input: TAnalyticsInput
): TLeaderboardTimelineEntry[] {
  const { game, config, players } = input
  const playerIds = getPlayerIds(players)
  const rounds = getRoundNumbers(game)

  return rounds
    .filter((round) => isRoundComplete(round, game, config))
    .map((round) => {
      const cumulativeScores = getCumulativeScoresThroughRound(
        game.questions,
        playerIds,
        round,
        game.scoringConfig
      )
      const { leaderIds, topScore } = getLeadersFromScores(cumulativeScores)

      return {
        round,
        leaderId: leaderIds[0] ?? null,
        leaderScore: topScore,
        tiedLeaderIds: leaderIds,
      }
    })
}

export function getPlayerStatsList(input: TAnalyticsInput): TPlayerStats[] {
  const { game, players } = input
  const questions = sortQuestions(game.questions)
  const playerIds = getPlayerIds(players)
  const rounds = getRoundNumbers(game)
  const completedRounds = getCompletedRounds(game, input.config, rounds)
  const ranks = rankPlayersByScore(players, game.scores)

  const roundBreakdown = getRoundBreakdown(input)
  const roundsLedByPlayer = new Map<string, number>()

  for (const row of roundBreakdown) {
    if (!row.complete || !row.leaderId) continue
    roundsLedByPlayer.set(
      row.leaderId,
      (roundsLedByPlayer.get(row.leaderId) ?? 0) + 1
    )
  }

  return players.map((player) => {
    const answerStats = getPlayerAnswerStats(player.id, questions)
    const correctCount = answerStats.correctCount
    const wrongCount = answerStats.wrongCount
    const participationCount = getPlayerParticipationCount(player.id, questions)

    const pointsPerRound: Record<number, number> = {}
    for (const round of rounds) {
      pointsPerRound[round] =
        getRoundScores(
          questions,
          playerIds,
          round,
          game.scoringConfig
        )[player.id] ?? 0
    }

    return {
      playerId: player.id,
      name: player.name,
      removed: Boolean(player.removedAt),
      score: game.scores[player.id] ?? 0,
      rank: ranks.get(player.id) ?? players.length,
      correctCount,
      wrongCount,
      accuracy: answerStats.accuracy,
      pointsPerRound,
      participationRate:
        questions.length > 0 ? participationCount / questions.length : 0,
      firstCorrectByRound: getFirstCorrectByRound(player.id, questions, rounds),
      wrongBeforeCorrectRatio:
        correctCount > 0 ? wrongCount / correctCount : null,
      roundsLed: roundsLedByPlayer.get(player.id) ?? 0,
      idleQuestionCount: questions.length - participationCount,
      comebackDelta: getComebackDelta(
        player.id,
        questions,
        completedRounds,
        game.scoringConfig
      ),
      longestCorrectStreak: getLongestCorrectStreak(player.id, questions),
    }
  })
}

export function getGameAnalytics(input: TAnalyticsInput): TGameAnalytics {
  return {
    overview: getGameOverviewMetrics(input),
    players: getPlayerStatsList(input),
    roundBreakdown: getRoundBreakdown(input),
    questionLog: getQuestionLog(input.game),
    leaderboardTimeline: getLeaderboardTimeline(input),
  }
}

export function formatGameSummary(input: TAnalyticsInput): string {
  const analytics = getGameAnalytics(input)
  const { overview, players, leaderboardTimeline } = analytics
  const nameById = getPlayerNameMap(input.players)

  const statusLabel =
    overview.progress.status === "finished"
      ? "Finished"
      : overview.progress.status === "playing"
        ? "Live"
        : "Idle"

  const presetLabel = overview.presetName ?? "Custom"
  const progressLabel = [
    `Round ${overview.progress.currentRound}`,
    `Question ${overview.progress.currentQuestion}`,
  ].join(" · ")

  const rankedPlayers = [...players].sort((a, b) => a.rank - b.rank)
  const scoreboardLines = rankedPlayers.map((player, index) => {
    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  "
    const removedSuffix = player.removed ? " (removed)" : ""
    return `${medal} ${player.name}${removedSuffix} — ${player.score} pts`
  })

  const statLines = rankedPlayers.map((player) => {
    const attempts = player.correctCount + player.wrongCount
    const attemptLabel =
      attempts > 0
        ? `${player.correctCount}/${attempts} (${formatPercent(player.accuracy)})`
        : "no attempts"
    const streakLabel =
      player.longestCorrectStreak > 0
        ? ` · streak ${player.longestCorrectStreak}`
        : ""
    return `- ${player.name}: ${attemptLabel}${streakLabel}`
  })

  const latestLeader = leaderboardTimeline.at(-1)
  const leaderLine = latestLeader?.leaderId
    ? `Leader after R${latestLeader.round}: ${nameById.get(latestLeader.leaderId) ?? "Unknown"} (${latestLeader.leaderScore} pts)`
    : null

  const lines = [
    `KhamCalc — ${presetLabel} (${statusLabel})`,
    progressLabel,
    `Duration: ${formatDuration(overview.elapsedMs)}`,
    `Questions: ${overview.questionsPlayed} played (${overview.skippedCount} skipped)`,
    "",
    "Scores",
    ...scoreboardLines,
    "",
    "Player stats",
    ...statLines,
  ]

  if (leaderLine) {
    lines.push("", leaderLine)
  }

  return lines.join("\n")
}

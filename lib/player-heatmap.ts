import type { TGameState, TQuestionRecord } from "@/schemas/game.schema"
import type { TGameConfig } from "@/schemas/config.schema"
import { getRoundStickCount } from "@/lib/round-sticks"

export type THeatmapCellState =
  | "correct"
  | "wrong"
  | "skipped"
  | "not_reached"
  | "idle"

export interface TPlayerHeatmap {
  rounds: number[]
  questions: number[]
  /** rows = questions, columns = rounds */
  cells: THeatmapCellState[][]
}

export interface TPlayerHeatmapInput {
  game: TGameState
  config: TGameConfig
  playerId: string
}

function findQuestionRecord(
  questions: TQuestionRecord[],
  round: number,
  question: number
): TQuestionRecord | undefined {
  return questions.find(
    (record) => record.round === round && record.question === question
  )
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

function getEffectiveCurrentQuestion(
  round: number,
  game: TGameState,
  questionsPerRound: number | null
): number {
  if (round > game.currentRound) {
    return 0
  }

  if (round < game.currentRound) {
    const recordedInRound = game.questions
      .filter((record) => record.round === round)
      .map((record) => record.question)

    const maxRecorded =
      recordedInRound.length > 0 ? Math.max(...recordedInRound) : 0

    if (questionsPerRound !== null) {
      return questionsPerRound
    }

    return maxRecorded
  }

  return getRoundStickCount(
    round,
    game.currentQuestion,
    game.questions,
    questionsPerRound
  )
}

function getCellState(
  playerId: string,
  round: number,
  question: number,
  game: TGameState,
  questionsPerRound: number | null
): THeatmapCellState {
  const reachableQuestion = getEffectiveCurrentQuestion(
    round,
    game,
    questionsPerRound
  )

  if (question > reachableQuestion || reachableQuestion === 0) {
    return "not_reached"
  }

  const record = findQuestionRecord(game.questions, round, question)

  if (!record) {
    return "not_reached"
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
}

export function getPlayerHeatmap(input: TPlayerHeatmapInput): TPlayerHeatmap {
  const { game, config, playerId } = input
  const rounds = getRoundNumbers(game)

  if (rounds.length === 0) {
    return { rounds: [], questions: [], cells: [] }
  }

  const questionsPerRound = config.questionsPerRound
  const maxQuestions = Math.max(
    ...rounds.map((round) =>
      getEffectiveCurrentQuestion(round, game, questionsPerRound)
    ),
    0
  )

  if (maxQuestions === 0) {
    return { rounds, questions: [], cells: [] }
  }

  const questions = Array.from({ length: maxQuestions }, (_, index) => index + 1)

  const cells = questions.map((question) =>
    rounds.map((round) =>
      getCellState(playerId, round, question, game, questionsPerRound)
    )
  )

  return { rounds, questions, cells }
}

/** Fixed colors for PNG export (light background). */
export const HEATMAP_EXPORT_COLORS: Record<THeatmapCellState, string> = {
  correct: "#16a34a",
  wrong: "#dc2626",
  skipped: "#9ca3af",
  not_reached: "#f3f4f6",
  idle: "#e5e7eb",
}

export interface THeatmapExportOptions {
  /** Used for the download filename only. */
  playerName: string
  heatmap: TPlayerHeatmap
  roundLabel: (round: number) => string
  questionLabel: (question: number) => string
}

export function exportPlayerHeatmapPng(options: THeatmapExportOptions): void {
  const { playerName, heatmap, roundLabel, questionLabel } = options
  const { rounds, questions, cells } = heatmap

  if (rounds.length === 0 || questions.length === 0) {
    return
  }

  const cellSize = 14
  const gap = 2
  const labelWidth = 28
  const headerHeight = 20
  const padding = 12

  const gridWidth = rounds.length * (cellSize + gap) - gap
  const gridHeight = questions.length * (cellSize + gap) - gap
  const width = padding * 2 + labelWidth + gridWidth
  const height = padding * 2 + headerHeight + gridHeight

  const canvas = document.createElement("canvas")
  canvas.width = width * 2
  canvas.height = height * 2

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.scale(2, 2)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  const gridLeft = padding + labelWidth
  const gridTop = padding + headerHeight

  ctx.font = "10px system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.fillStyle = "#6b7280"

  rounds.forEach((round, roundIndex) => {
    const x = gridLeft + roundIndex * (cellSize + gap) + cellSize / 2
    ctx.fillText(roundLabel(round), x, gridTop - 6)
  })

  ctx.textAlign = "right"
  questions.forEach((question, questionIndex) => {
    const y = gridTop + questionIndex * (cellSize + gap) + cellSize * 0.72
    ctx.fillText(questionLabel(question), gridLeft - 6, y)
  })

  cells.forEach((row, questionIndex) => {
    row.forEach((state, roundIndex) => {
      const x = gridLeft + roundIndex * (cellSize + gap)
      const y = gridTop + questionIndex * (cellSize + gap)
      ctx.fillStyle = HEATMAP_EXPORT_COLORS[state]
      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, 2)
      ctx.fill()
    })
  })

  const link = document.createElement("a")
  link.download = `${playerName.replace(/\s+/g, "-").toLowerCase()}-heatmap.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

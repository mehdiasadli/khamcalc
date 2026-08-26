import {
  AddPlayerSchema,
  RemovePlayerSchema,
  UpdatePlayerSchema,
  type TPlayer,
} from "@/schemas/player.schema"
import {
  GameConfigSchema,
  UpdateGameConfigSchema,
  type TGameConfig,
} from "@/schemas/config.schema"
import type { TGameState, TQuestionRecord } from "@/schemas/game.schema"
import { recomputeAchievements } from "@/lib/achievements"
import {
  advanceFurthest,
  areAllPlayersWrong,
  canManualNext,
  createInitialGameState,
  createSkippedQuestionRecord,
  findQuestionRecord,
  getAdvanceAfterQuestion,
  getNextPosition,
  isAtLeadingEdge,
  isPlayerDisabledForQuestion,
  questionHasAnswers,
  recalculateScores,
  removeQuestionRecord,
  resolvePreviousPosition,
  upsertQuestionRecord,
} from "@/lib/game"
import {
  getActivePlayerCount,
  getActivePlayerIds,
  getActivePlayers,
  MAX_PLAYERS,
  MIN_PLAYERS,
  reorderPlayerIds,
} from "@/lib/players"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TAppState {
  config: TGameConfig
  players: TPlayer[]
  playerOrder: string[]
  game: TGameState | null
}

export interface TAppActions {
  setConfig: (input: Partial<TGameConfig>) => void
  applyConfigPreset: (config: TGameConfig) => void

  addPlayer: (name: string) => TPlayer
  updatePlayer: (id: string, name: string) => void
  removePlayer: (id: string) => void
  reorderPlayers: (fromIndex: number, toIndex: number) => void

  enterGame: () => void
  resetGame: () => void
  finishGame: () => void

  markWrong: (playerId: string) => void
  markCorrect: (playerId: string) => void
  prevQuestion: () => void
  nextQuestion: () => void
  undoQuestion: () => void
  undoCorrect: (playerId: string) => void
}

export interface TAppStore extends TAppState, TAppActions {}

export const initialConfig: TGameConfig = {
  questionsPerRound: 5,
  maxRounds: null,
}

export const initialAppState: TAppState = {
  config: initialConfig,
  players: [],
  playerOrder: [],
  game: null,
}

function assertGame(game: TGameState | null): asserts game is TGameState {
  if (!game) {
    throw new Error("No active game session")
  }

  if (game.status === "finished") {
    throw new Error("Game is finished")
  }
}

function syncScoresWithPlayers(
  scores: Record<string, number>,
  playerIds: string[]
): Record<string, number> {
  return Object.fromEntries(playerIds.map((id) => [id, scores[id] ?? 0]))
}

function withAchievements(game: TGameState, config: TGameConfig): TGameState {
  return {
    ...game,
    achievements: recomputeAchievements(game, config),
  }
}

function getAllPlayerIds(players: TPlayer[]): string[] {
  return players.map((player) => player.id)
}

function getQuestionRecordOrDefault(game: TGameState): TQuestionRecord {
  return (
    findQuestionRecord(game.questions, {
      round: game.currentRound,
      question: game.currentQuestion,
    }) ?? {
      round: game.currentRound,
      question: game.currentQuestion,
      correctPlayerId: null,
      wrongPlayerIds: [],
      skipped: false,
    }
  )
}

function ensureUniquePlayerName(
  players: TPlayer[],
  name: string,
  excludeId?: string
): void {
  const duplicate = getActivePlayers(players).some(
    (player) =>
      player.name.toLowerCase() === name.toLowerCase() &&
      player.id !== excludeId
  )

  if (duplicate) {
    throw new Error("A player with this name already exists")
  }
}

export const useAppStore = create<TAppStore>()(
  persist(
    (set, get) => ({
      ...initialAppState,

      setConfig: (input) => {
        const config = UpdateGameConfigSchema.parse({
          ...get().config,
          ...input,
        })

        set({ config: GameConfigSchema.parse(config) })
      },

      applyConfigPreset: (config) => {
        set({ config: GameConfigSchema.parse(config) })
      },

      addPlayer: (name) => {
        const parsed = AddPlayerSchema.parse({ name })
        ensureUniquePlayerName(get().players, parsed.name)

        if (getActivePlayerCount(get().players) >= MAX_PLAYERS) {
          throw new Error(`Maximum ${MAX_PLAYERS} players allowed`)
        }

        const player: TPlayer = {
          id: crypto.randomUUID(),
          name: parsed.name,
          removedAt: null,
        }

        set((state) => {
          const players = [...state.players, player]
          const playerOrder = [...state.playerOrder, player.id]
          const game = state.game
            ? withAchievements(
                {
                  ...state.game,
                  scores: syncScoresWithPlayers(state.game.scores, [
                    ...getAllPlayerIds(players),
                  ]),
                },
                state.config
              )
            : null

          return { players, playerOrder, game }
        })

        return player
      },

      updatePlayer: (id, name) => {
        const parsed = UpdatePlayerSchema.parse({ id, name })
        ensureUniquePlayerName(get().players, parsed.name, parsed.id)

        set((state) => ({
          players: state.players.map((player) =>
            player.id === parsed.id ? { ...player, name: parsed.name } : player
          ),
        }))
      },

      removePlayer: (id) => {
        const parsed = RemovePlayerSchema.parse({ id })

        set((state) => {
          const removedAt = new Date().toISOString()
          const players = state.players.map((player) =>
            player.id === parsed.id ? { ...player, removedAt } : player
          )
          const playerOrder = state.playerOrder.filter(
            (playerId) => playerId !== parsed.id
          )

          if (!state.game) {
            return { players, playerOrder }
          }

          return {
            players,
            playerOrder,
            game: withAchievements(
              {
                ...state.game,
                scores: syncScoresWithPlayers(
                  state.game.scores,
                  getAllPlayerIds(players)
                ),
              },
              state.config
            ),
          }
        })
      },

      reorderPlayers: (fromIndex, toIndex) => {
        const { players, playerOrder } = get()
        const activeIds = getActivePlayerIds(players, playerOrder)

        set({
          playerOrder: reorderPlayerIds(activeIds, fromIndex, toIndex),
        })
      },

      enterGame: () => {
        const { game, players, playerOrder } = get()

        if (game) return

        const activePlayerIds = getActivePlayerIds(players, playerOrder)

        if (activePlayerIds.length < MIN_PLAYERS) {
          throw new Error(`Add at least ${MIN_PLAYERS} player before starting`)
        }

        set({
          game: createInitialGameState(activePlayerIds),
        })
      },

      resetGame: () => {
        set({ game: null })
      },

      finishGame: () => {
        const { game, config } = get()
        assertGame(game)

        set({
          game: withAchievements(
            {
              ...game,
              status: "finished",
              finishedAt: new Date().toISOString(),
            },
            config
          ),
        })
      },

      markWrong: (playerId) => {
        const { game, players, playerOrder, config } = get()
        assertGame(game)

        const activePlayers = getActivePlayers(players)

        if (!activePlayers.some((player) => player.id === playerId)) {
          throw new Error("Player not found")
        }

        const current = getQuestionRecordOrDefault(game)

        if (current.correctPlayerId === playerId) {
          throw new Error("Correct player cannot be marked wrong")
        }

        const wasAddingWrong = !current.wrongPlayerIds.includes(playerId)

        const record: TQuestionRecord = {
          ...current,
          skipped: false,
          wrongPlayerIds: wasAddingWrong
            ? [...current.wrongPlayerIds, playerId]
            : current.wrongPlayerIds.filter((id) => id !== playerId),
        }

        const questions = upsertQuestionRecord(game.questions, record)
        const activePlayerIds = getActivePlayerIds(players, playerOrder)

        let nextGame: TGameState = {
          ...game,
          questions,
        }

        if (
          wasAddingWrong &&
          isAtLeadingEdge(game) &&
          areAllPlayersWrong(record, activePlayerIds)
        ) {
          nextGame = {
            ...nextGame,
            ...getAdvanceAfterQuestion(game, config),
          }
        }

        set({ game: withAchievements(nextGame, config) })
      },

      markCorrect: (playerId) => {
        const { game, players, config } = get()
        assertGame(game)

        const activePlayers = getActivePlayers(players)

        if (!activePlayers.some((player) => player.id === playerId)) {
          throw new Error("Player not found")
        }

        const atLeadingEdge = isAtLeadingEdge(game)
        const current = getQuestionRecordOrDefault(game)

        if (isPlayerDisabledForQuestion(current, playerId)) {
          throw new Error("Player is disabled for this question")
        }

        const record: TQuestionRecord = {
          ...current,
          skipped: false,
          correctPlayerId: playerId,
          wrongPlayerIds: current.wrongPlayerIds,
        }

        const questions = upsertQuestionRecord(game.questions, record)
        const allPlayerIds = getAllPlayerIds(players)
        const scores = recalculateScores(questions, allPlayerIds)

        let nextGame: TGameState = {
          ...game,
          questions,
          scores,
        }

        if (atLeadingEdge) {
          nextGame = {
            ...nextGame,
            ...getAdvanceAfterQuestion(game, config),
          }
        }

        set({ game: withAchievements(nextGame, config) })
      },

      prevQuestion: () => {
        const { game, config } = get()
        assertGame(game)

        const previous = resolvePreviousPosition(
          {
            round: game.currentRound,
            question: game.currentQuestion,
          },
          config,
          game.questions
        )

        if (!previous) return

        set({
          game: {
            ...game,
            currentRound: previous.round,
            currentQuestion: previous.question,
          },
        })
      },

      nextQuestion: () => {
        const { game, config } = get()
        assertGame(game)

        if (
          !canManualNext(
            {
              round: game.currentRound,
              question: game.currentQuestion,
            },
            config
          )
        ) {
          return
        }

        const nextPosition = getNextPosition(
          {
            round: game.currentRound,
            question: game.currentQuestion,
          },
          config
        )

        if (!nextPosition) return

        const currentRecord = findQuestionRecord(game.questions, {
          round: game.currentRound,
          question: game.currentQuestion,
        })

        const questions = questionHasAnswers(currentRecord)
          ? game.questions
          : upsertQuestionRecord(
              game.questions,
              createSkippedQuestionRecord({
                round: game.currentRound,
                question: game.currentQuestion,
              })
            )

        const furthest = advanceFurthest(
          { ...game, questions },
          nextPosition.round,
          nextPosition.question
        )

        set({
          game: withAchievements(
            {
              ...game,
              questions,
              currentRound: nextPosition.round,
              currentQuestion: nextPosition.question,
              ...furthest,
            },
            config
          ),
        })
      },

      undoQuestion: () => {
        const { game, players, config } = get()
        assertGame(game)

        const record = findQuestionRecord(game.questions, {
          round: game.currentRound,
          question: game.currentQuestion,
        })

        if (!questionHasAnswers(record)) {
          throw new Error("No answers on this question")
        }

        const questions = removeQuestionRecord(game.questions, {
          round: game.currentRound,
          question: game.currentQuestion,
        })
        const allPlayerIds = getAllPlayerIds(players)

        set({
          game: withAchievements(
            {
              ...game,
              questions,
              scores: recalculateScores(questions, allPlayerIds),
            },
            config
          ),
        })
      },

      undoCorrect: (playerId) => {
        const { game, players, config } = get()
        assertGame(game)

        const current = getQuestionRecordOrDefault(game)

        if (current.correctPlayerId !== playerId) {
          throw new Error("Player is not marked correct on this question")
        }

        const record: TQuestionRecord = {
          ...current,
          correctPlayerId: null,
          skipped: false,
        }

        const questions = upsertQuestionRecord(game.questions, record)
        const allPlayerIds = getAllPlayerIds(players)

        set({
          game: withAchievements(
            {
              ...game,
              questions,
              scores: recalculateScores(questions, allPlayerIds),
            },
            config
          ),
        })
      },
    }),
    { name: "khamcalc" }
  )
)

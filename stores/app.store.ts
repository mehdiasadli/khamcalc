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
import {
  advanceFurthest,
  areAllPlayersWrong,
  canManualNext,
  createInitialGameState,
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
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/players"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TAppState {
  config: TGameConfig
  players: TPlayer[]
  game: TGameState | null
}

export interface TAppActions {
  setConfig: (input: Partial<TGameConfig>) => void
  applyConfigPreset: (config: TGameConfig) => void

  addPlayer: (name: string) => TPlayer
  updatePlayer: (id: string, name: string) => void
  removePlayer: (id: string) => void

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
    }
  )
}

function ensureUniquePlayerName(
  players: TPlayer[],
  name: string,
  excludeId?: string
): void {
  const duplicate = players.some(
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

        if (get().players.length >= MAX_PLAYERS) {
          throw new Error(`Maximum ${MAX_PLAYERS} players allowed`)
        }

        const player: TPlayer = {
          id: crypto.randomUUID(),
          name: parsed.name,
        }

        set((state) => {
          const players = [...state.players, player]
          const game = state.game
            ? {
                ...state.game,
                scores: syncScoresWithPlayers(state.game.scores, [
                  ...players.map((item) => item.id),
                ]),
              }
            : null

          return { players, game }
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
          const players = state.players.filter(
            (player) => player.id !== parsed.id
          )

          if (!state.game) {
            return { players }
          }

          const scores = { ...state.game.scores }
          delete scores[parsed.id]

          return {
            players,
            game: {
              ...state.game,
              scores: syncScoresWithPlayers(
                scores,
                players.map((player) => player.id)
              ),
            },
          }
        })
      },

      enterGame: () => {
        const { game, players } = get()

        if (game) return

        if (players.length < MIN_PLAYERS) {
          throw new Error(`Add at least ${MIN_PLAYERS} player before starting`)
        }

        set({
          game: createInitialGameState(players.map((player) => player.id)),
        })
      },

      resetGame: () => {
        set({ game: null })
      },

      finishGame: () => {
        const { game } = get()
        assertGame(game)

        set({
          game: {
            ...game,
            status: "finished",
            finishedAt: new Date().toISOString(),
          },
        })
      },

      markWrong: (playerId) => {
        const { game, players, config } = get()
        assertGame(game)

        if (!players.some((player) => player.id === playerId)) {
          throw new Error("Player not found")
        }

        const current = getQuestionRecordOrDefault(game)

        if (current.correctPlayerId === playerId) {
          throw new Error("Correct player cannot be marked wrong")
        }

        const wasAddingWrong = !current.wrongPlayerIds.includes(playerId)

        const wrongPlayerIds = wasAddingWrong
          ? [...current.wrongPlayerIds, playerId]
          : current.wrongPlayerIds.filter((id) => id !== playerId)

        const record: TQuestionRecord = {
          ...current,
          wrongPlayerIds,
        }

        const questions = upsertQuestionRecord(game.questions, record)
        const playerIds = players.map((player) => player.id)

        let nextGame: TGameState = {
          ...game,
          questions,
        }

        if (
          wasAddingWrong &&
          isAtLeadingEdge(game) &&
          areAllPlayersWrong(record, playerIds)
        ) {
          nextGame = {
            ...nextGame,
            ...getAdvanceAfterQuestion(game, config),
          }
        }

        set({ game: nextGame })
      },

      markCorrect: (playerId) => {
        const { game, players, config } = get()
        assertGame(game)

        if (!players.some((player) => player.id === playerId)) {
          throw new Error("Player not found")
        }

        const atLeadingEdge = isAtLeadingEdge(game)
        const current = getQuestionRecordOrDefault(game)

        if (isPlayerDisabledForQuestion(current, playerId)) {
          throw new Error("Player is disabled for this question")
        }

        const record: TQuestionRecord = {
          ...current,
          correctPlayerId: playerId,
          wrongPlayerIds: current.wrongPlayerIds,
        }

        const questions = upsertQuestionRecord(game.questions, record)
        const playerIds = players.map((player) => player.id)
        const scores = recalculateScores(questions, playerIds)

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

        set({ game: nextGame })
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

        const furthest = advanceFurthest(
          game,
          nextPosition.round,
          nextPosition.question
        )

        set({
          game: {
            ...game,
            currentRound: nextPosition.round,
            currentQuestion: nextPosition.question,
            ...furthest,
          },
        })
      },

      undoQuestion: () => {
        const { game, players } = get()
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
        const playerIds = players.map((player) => player.id)

        set({
          game: {
            ...game,
            questions,
            scores: recalculateScores(questions, playerIds),
          },
        })
      },

      undoCorrect: (playerId) => {
        const { game, players } = get()
        assertGame(game)

        const current = getQuestionRecordOrDefault(game)

        if (current.correctPlayerId !== playerId) {
          throw new Error("Player is not marked correct on this question")
        }

        const record: TQuestionRecord = {
          ...current,
          correctPlayerId: null,
        }

        const questions = upsertQuestionRecord(game.questions, record)
        const playerIds = players.map((player) => player.id)

        set({
          game: {
            ...game,
            questions,
            scores: recalculateScores(questions, playerIds),
          },
        })
      },
    }),
    { name: "khamcalc" }
  )
)

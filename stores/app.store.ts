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
  canManualNext,
  createInitialGameState,
  findQuestionRecord,
  getCurrentQuestionRecord,
  getNextPosition,
  getRoundDisabledPlayerIds,
  isPlayerDisabledForQuestion,
  recalculateScores,
  removeQuestionsForRound,
  resolvePreviousPosition,
  shouldShowFinish,
  upsertQuestionRecord,
} from "@/lib/game"
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
  undoRound: () => void
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

function isAtLeadingEdge(game: TGameState): boolean {
  return (
    game.currentRound === game.furthestRound &&
    game.currentQuestion === game.furthestQuestion
  )
}

function advanceFurthest(
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

        if (players.length === 0) {
          throw new Error("Add at least one player before starting")
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
        const { game, players } = get()
        assertGame(game)

        if (!players.some((player) => player.id === playerId)) {
          throw new Error("Player not found")
        }

        const current = getQuestionRecordOrDefault(game)

        if (current.correctPlayerId === playerId) {
          throw new Error("Correct player cannot be marked wrong")
        }

        if (
          isPlayerDisabledForQuestion(
            game.questions,
            game.currentRound,
            game.currentQuestion,
            playerId
          )
        ) {
          throw new Error("Player is disabled for this round")
        }

        const wrongPlayerIds = current.wrongPlayerIds.includes(playerId)
          ? current.wrongPlayerIds.filter((id) => id !== playerId)
          : [...current.wrongPlayerIds, playerId]

        const record: TQuestionRecord = {
          ...current,
          wrongPlayerIds,
        }

        set({
          game: {
            ...game,
            questions: upsertQuestionRecord(game.questions, record),
          },
        })
      },

      markCorrect: (playerId) => {
        const { game, players, config } = get()
        assertGame(game)

        if (!players.some((player) => player.id === playerId)) {
          throw new Error("Player not found")
        }

        if (
          isPlayerDisabledForQuestion(
            game.questions,
            game.currentRound,
            game.currentQuestion,
            playerId
          )
        ) {
          throw new Error("Player is disabled for this round")
        }

        const atLeadingEdge = isAtLeadingEdge(game)
        const current = getQuestionRecordOrDefault(game)

        const record: TQuestionRecord = {
          ...current,
          correctPlayerId: playerId,
          wrongPlayerIds: current.wrongPlayerIds.filter(
            (id) => id !== playerId
          ),
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
          const nextPosition = getNextPosition(
            {
              round: game.currentRound,
              question: game.currentQuestion,
            },
            config
          )

          if (nextPosition) {
            const furthest = advanceFurthest(
              game,
              nextPosition.round,
              nextPosition.question
            )

            nextGame = {
              ...nextGame,
              currentRound: nextPosition.round,
              currentQuestion: nextPosition.question,
              ...furthest,
            }
          } else {
            nextGame = {
              ...nextGame,
              ...advanceFurthest(game, game.currentRound, game.currentQuestion),
            }
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

      undoRound: () => {
        const { game, players } = get()
        assertGame(game)

        const questions = removeQuestionsForRound(
          game.questions,
          game.currentRound
        )
        const playerIds = players.map((player) => player.id)

        set({
          game: {
            ...game,
            currentQuestion: 1,
            furthestRound: game.currentRound,
            furthestQuestion: 1,
            questions,
            scores: recalculateScores(questions, playerIds),
          },
        })
      },
    }),
    { name: "khamcalc" }
  )
)

export function useCurrentQuestionRecord() {
  return useAppStore((state) =>
    state.game ? getCurrentQuestionRecord(state.game) : undefined
  )
}

export function useShouldShowFinish() {
  return useAppStore((state) => {
    if (!state.game) return false

    return shouldShowFinish(
      {
        round: state.game.currentRound,
        question: state.game.currentQuestion,
      },
      state.config
    )
  })
}

export function useRoundDisabledPlayerIds() {
  return useAppStore((state) => {
    if (!state.game) return []

    return getRoundDisabledPlayerIds(
      state.game.questions,
      state.game.currentRound,
      state.game.currentQuestion
    )
  })
}

export function usePlayerScores() {
  return useAppStore((state) => {
    if (!state.game) {
      return state.players.map((player) => ({
        ...player,
        score: 0,
      }))
    }

    return state.players.map((player) => ({
      ...player,
      score: state.game?.scores[player.id] ?? 0,
    }))
  })
}

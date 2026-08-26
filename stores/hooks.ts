"use client"

import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import {
  getCurrentQuestionRecord,
  shouldShowFinish,
} from "@/lib/game"
import { useAppStore } from "@/stores/app.store"

const EMPTY_IDS: string[] = []

export function useCurrentQuestionRecord() {
  const game = useAppStore((state) => state.game)

  return useMemo(() => {
    if (!game) return undefined
    return getCurrentQuestionRecord(game)
  }, [game])
}

export function useShouldShowFinish() {
  const game = useAppStore((state) => state.game)
  const config = useAppStore((state) => state.config)

  return useMemo(() => {
    if (!game) return false

    return shouldShowFinish(
      {
        round: game.currentRound,
        question: game.currentQuestion,
      },
      config
    )
  }, [game, config])
}

export function useQuestionDisabledPlayerIds() {
  return useAppStore(
    useShallow((state) => {
      if (!state.game) return EMPTY_IDS

      const record = getCurrentQuestionRecord(state.game)
      return record?.wrongPlayerIds ?? EMPTY_IDS
    })
  )
}

export function usePlayerScores() {
  const players = useAppStore((state) => state.players)
  const scores = useAppStore((state) => state.game?.scores)

  return useMemo(
    () =>
      players.map((player) => ({
        ...player,
        score: scores?.[player.id] ?? 0,
      })),
    [players, scores]
  )
}

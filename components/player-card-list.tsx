"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  PlayerCard,
  type PlayerCardStatus,
} from "@/components/player-card"
import { PlayerRenameDialog } from "@/components/player-rename-dialog"
import { SortablePlayerCard } from "@/components/game/sortable-player-card"
import { getPlayerAchievements } from "@/lib/achievements"
import { sortAchievements } from "@/lib/achievement-display"
import { useTranslation } from "@/lib/i18n/context"
import { getActivePlayers } from "@/lib/players"
import {
  getQuestionCorrectPoints,
  getWrongDeductionPoints,
} from "@/lib/scoring"
import { formatScore } from "@/lib/scoring-format"
import { getPlayerAnswerStats } from "@/lib/player-answer-stats"
import { getPlayerRoundSticks } from "@/lib/round-sticks"
import { getCurrentCorrectStreak } from "@/lib/streaks"
import {
  useAppStore,
  useCurrentQuestionRecord,
  useHostFeedback,
  usePlayerScores,
  useQuestionDisabledPlayerIds,
} from "@/stores"

type ConfirmDialog =
  | { type: "undo-correct"; playerId: string }
  | { type: "undo-incorrect"; playerId: string }
  | { type: "remove"; playerId: string }
  | null

interface PlayerCardListProps {
  disabled?: boolean
}

function useRankedGamePlayers() {
  const players = usePlayerScores()
  const currentRecord = useCurrentQuestionRecord()
  const disabledIds = useQuestionDisabledPlayerIds()
  const achievements = useAppStore((state) => state.game?.achievements ?? [])
  const questions = useAppStore((state) => state.game?.questions ?? [])
  const game = useAppStore((state) => state.game)
  const config = useAppStore((state) => state.config)

  return useMemo(() => {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const topScore = sorted[0]?.score ?? 0
    const allZero = sorted.every((player) => player.score === 0)

    return players.map((player) => {
      const rank = sorted.findIndex((item) => item.id === player.id) + 1

      let status: PlayerCardStatus = "idle"
      if (currentRecord?.correctPlayerId === player.id) {
        status = "correct"
      } else if (disabledIds.includes(player.id)) {
        status = "wrong"
      }

      return {
        ...player,
        rank,
        isLeader: !allZero && player.score === topScore,
        status,
        achievements: sortAchievements(
          getPlayerAchievements(achievements, player.id)
        ),
        correctStreak: getCurrentCorrectStreak(player.id, questions),
        answerStats: getPlayerAnswerStats(player.id, questions),
        roundSticks: game
          ? getPlayerRoundSticks(
              player.id,
              game.currentRound,
              game.currentQuestion,
              questions,
              config.questionsPerRound
            )
          : null,
      }
    })
  }, [players, currentRecord, disabledIds, achievements, questions, game, config])
}

export function PlayerCardList({ disabled = false }: PlayerCardListProps) {
  const { t } = useTranslation()
  const game = useAppStore((state) => state.game)
  const allPlayers = useAppStore((state) => state.players)
  const activePlayers = getActivePlayers(allPlayers)
  const rankedPlayers = useRankedGamePlayers()
  const markCorrect = useAppStore((state) => state.markCorrect)
  const markWrong = useAppStore((state) => state.markWrong)
  const undoCorrect = useAppStore((state) => state.undoCorrect)
  const updatePlayer = useAppStore((state) => state.updatePlayer)
  const removePlayer = useAppStore((state) => state.removePlayer)
  const reorderPlayers = useAppStore((state) => state.reorderPlayers)
  const playFeedback = useHostFeedback()

  const playerIds = useMemo(
    () => rankedPlayers.map((player) => player.id),
    [rankedPlayers]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [renamePlayerId, setRenamePlayerId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null)

  const renamePlayer = activePlayers.find((player) => player.id === renamePlayerId)
  const confirmTarget = rankedPlayers.find(
    (player) => player.id === confirmDialog?.playerId
  )

  const questionPoints = game
    ? getQuestionCorrectPoints(
        game.scoringConfig,
        game.currentRound,
        game.currentQuestion
      )
    : 0
  const wrongPoints = game
    ? getWrongDeductionPoints(
        game.scoringConfig,
        game.currentRound,
        game.currentQuestion
      )
    : 0

  function handleStoreAction(action: () => void) {
    try {
      action()
    } catch (error) {
      console.error(error)
    }
  }

  function handleCorrectClick(playerId: string, status: PlayerCardStatus) {
    if (status === "correct") {
      setConfirmDialog({ type: "undo-correct", playerId })
      return
    }

    handleStoreAction(() => markCorrect(playerId))
    playFeedback("correct")
  }

  function handleIncorrectClick(playerId: string, status: PlayerCardStatus) {
    if (status === "wrong") {
      setConfirmDialog({ type: "undo-incorrect", playerId })
      return
    }

    handleStoreAction(() => markWrong(playerId))
    playFeedback("incorrect")
  }

  function handleConfirmDialog() {
    if (!confirmDialog) return

    if (confirmDialog.type === "undo-correct") {
      handleStoreAction(() => undoCorrect(confirmDialog.playerId))
      playFeedback("undo")
    }

    if (confirmDialog.type === "undo-incorrect") {
      handleStoreAction(() => markWrong(confirmDialog.playerId))
      playFeedback("undo")
    }

    if (confirmDialog.type === "remove") {
      handleStoreAction(() => removePlayer(confirmDialog.playerId))
    }

    setConfirmDialog(null)
  }

  function handleRename(playerId: string, name: string) {
    handleStoreAction(() => updatePlayer(playerId, name))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const fromIndex = playerIds.indexOf(String(active.id))
    const toIndex = playerIds.indexOf(String(over.id))

    if (fromIndex === -1 || toIndex === -1) {
      return
    }

    reorderPlayers(fromIndex, toIndex)
  }

  function getPlayerCardProps(player: (typeof rankedPlayers)[number]) {
    return {
      name: player.name,
      score: player.score,
      rank: player.rank,
      status: player.status,
      isLeader: player.isLeader,
      achievements: player.achievements,
      correctStreak: player.correctStreak,
      answerStats: player.answerStats,
      roundSticks: player.roundSticks,
      onCorrect: disabled
        ? undefined
        : () => handleCorrectClick(player.id, player.status),
      onIncorrect: disabled
        ? undefined
        : () => handleIncorrectClick(player.id, player.status),
      onRename: disabled ? undefined : () => setRenamePlayerId(player.id),
      onRemove: disabled
        ? undefined
        : () => setConfirmDialog({ type: "remove", playerId: player.id }),
    }
  }

  const playerList = (
    <ul className="flex flex-col gap-2">
      {rankedPlayers.map((player) =>
        disabled ? (
          <li key={player.id}>
            <PlayerCard {...getPlayerCardProps(player)} />
          </li>
        ) : (
          <SortablePlayerCard
            key={player.id}
            id={player.id}
            {...getPlayerCardProps(player)}
          />
        )
      )}
    </ul>
  )

  return (
    <>
      {disabled ? (
        playerList
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={playerIds}
            strategy={verticalListSortingStrategy}
          >
            {playerList}
          </SortableContext>
        </DndContext>
      )}

      <PlayerRenameDialog
        open={renamePlayerId !== null}
        onOpenChange={(open) => {
          if (!open) setRenamePlayerId(null)
        }}
        playerId={renamePlayerId}
        playerName={renamePlayer?.name ?? ""}
        existingNames={activePlayers}
        onConfirm={handleRename}
      />

      <AlertDialog
        open={confirmDialog !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === "undo-correct"
                ? t("game.undoCorrectTitle")
                : confirmDialog?.type === "undo-incorrect"
                  ? t("game.undoIncorrectTitle")
                  : t("players.removeConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === "undo-correct" ? (
                t("game.undoCorrectBody", {
                  points: formatScore(questionPoints),
                  name: confirmTarget?.name ?? "",
                })
              ) : null}
              {confirmDialog?.type === "undo-incorrect" ? (
                <>
                  {t("game.undoIncorrectBody", {
                    name: confirmTarget?.name ?? "",
                    restore:
                      wrongPoints > 0
                        ? t("game.undoIncorrectRestore", {
                            points: formatScore(wrongPoints),
                          })
                        : "",
                  })}
                </>
              ) : null}
              {confirmDialog?.type === "remove" ? (
                t("players.removeConfirmBody", {
                  name: confirmTarget?.name ?? "",
                })
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmDialog?.type === "remove" ? "destructive" : "default"
              }
              onClick={handleConfirmDialog}
            >
              {confirmDialog?.type === "remove"
                ? t("common.remove")
                : t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

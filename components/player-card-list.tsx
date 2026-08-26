"use client"

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
import {
  useAppStore,
  useCurrentQuestionRecord,
  usePlayerScores,
  useQuestionDisabledPlayerIds,
} from "@/stores"

type ConfirmDialog =
  | { type: "undo-correct"; playerId: string }
  | { type: "undo-incorrect"; playerId: string }
  | null

function useRankedGamePlayers() {
  const players = usePlayerScores()
  const currentRecord = useCurrentQuestionRecord()
  const disabledIds = useQuestionDisabledPlayerIds()

  return useMemo(() => {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const topScore = sorted[0]?.score ?? 0

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
        isLeader: player.score === topScore && topScore > 0,
        status,
      }
    })
  }, [players, currentRecord, disabledIds])
}

export function PlayerCardList() {
  const rankedPlayers = useRankedGamePlayers()
  const markCorrect = useAppStore((state) => state.markCorrect)
  const markWrong = useAppStore((state) => state.markWrong)
  const undoCorrect = useAppStore((state) => state.undoCorrect)

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null)

  const confirmTarget = rankedPlayers.find(
    (player) => player.id === confirmDialog?.playerId
  )

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
  }

  function handleIncorrectClick(playerId: string, status: PlayerCardStatus) {
    if (status === "wrong") {
      setConfirmDialog({ type: "undo-incorrect", playerId })
      return
    }

    handleStoreAction(() => markWrong(playerId))
  }

  function handleConfirmDialog() {
    if (!confirmDialog) return

    if (confirmDialog.type === "undo-correct") {
      handleStoreAction(() => undoCorrect(confirmDialog.playerId))
    }

    if (confirmDialog.type === "undo-incorrect") {
      handleStoreAction(() => markWrong(confirmDialog.playerId))
    }

    setConfirmDialog(null)
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {rankedPlayers.map((player) => (
          <li key={player.id}>
            <PlayerCard
              name={player.name}
              score={player.score}
              rank={player.rank}
              status={player.status}
              isLeader={player.isLeader}
              onCorrect={() => handleCorrectClick(player.id, player.status)}
              onIncorrect={() => handleIncorrectClick(player.id, player.status)}
            />
          </li>
        ))}
      </ul>

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
                ? "Undo correct answer?"
                : "Undo incorrect answer?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === "undo-correct" ? (
                <>
                  This removes 100 points from{" "}
                  <span className="text-foreground">{confirmTarget?.name}</span>.
                </>
              ) : (
                <>
                  <span className="text-foreground">{confirmTarget?.name}</span>{" "}
                  will be eligible again for this question.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDialog}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

"use client"

import { useState } from "react"

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
  type PlayerCardProps,
} from "@/components/player-card"
import { PlayerRenameDialog } from "@/components/player-rename-dialog"

type MockPlayer = PlayerCardProps & { id: string }

type ConfirmDialog =
  | { type: "undo-correct"; playerId: string }
  | { type: "undo-incorrect"; playerId: string }
  | { type: "remove"; playerId: string }
  | null

const initialPlayers: MockPlayer[] = [
  {
    id: "1",
    name: "Arif",
    score: 1200,
    rank: 1,
    isLeader: true,
    status: "idle",
  },
  {
    id: "2",
    name: "Leyla",
    score: 900,
    rank: 2,
    status: "correct",
  },
  {
    id: "3",
    name: "Murad",
    score: 700,
    rank: 3,
    status: "wrong",
  },
  {
    id: "4",
    name: "Nigar",
    score: 500,
    rank: 4,
    status: "disabled",
  },
  {
    id: "5",
    name: "Kamran",
    score: 300,
    rank: 5,
    status: "idle",
  },
]

function withRanks(players: MockPlayer[]) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return players.map((player) => {
    const rank = sorted.findIndex((item) => item.id === player.id) + 1
    const topScore = sorted[0]?.score ?? 0

    return {
      ...player,
      rank,
      isLeader: player.score === topScore && topScore > 0,
    }
  })
}

export function PlayerCardList() {
  const [players, setPlayers] = useState(() => withRanks(initialPlayers))
  const [renamePlayerId, setRenamePlayerId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null)

  const renamePlayer = players.find((player) => player.id === renamePlayerId)
  const confirmTarget = players.find(
    (player) => player.id === confirmDialog?.playerId
  )

  function applyCorrect(id: string) {
    setPlayers((current) =>
      withRanks(
        current.map((player) => {
          if (player.id === id) {
            return {
              ...player,
              status: "correct" as const,
              score: player.score + 100,
            }
          }

          const wasCorrect = player.status === "correct"

          return {
            ...player,
            status: wasCorrect ? ("idle" as const) : player.status,
            score: wasCorrect ? player.score - 100 : player.score,
          }
        })
      )
    )
  }

  function undoCorrect(id: string) {
    setPlayers((current) =>
      withRanks(
        current.map((player) =>
          player.id === id
            ? {
                ...player,
                status: "idle" as const,
                score: player.score - 100,
              }
            : player
        )
      )
    )
  }

  function applyIncorrect(id: string) {
    setPlayers((current) =>
      withRanks(
        current.map((player) =>
          player.id === id ? { ...player, status: "wrong" as const } : player
        )
      )
    )
  }

  function undoIncorrect(id: string) {
    setPlayers((current) =>
      withRanks(
        current.map((player) =>
          player.id === id ? { ...player, status: "idle" as const } : player
        )
      )
    )
  }

  function handleCorrectClick(id: string) {
    const player = players.find((item) => item.id === id)
    if (!player) return

    if (player.status === "correct") {
      setConfirmDialog({ type: "undo-correct", playerId: id })
      return
    }

    applyCorrect(id)
  }

  function handleIncorrectClick(id: string) {
    const player = players.find((item) => item.id === id)
    if (!player) return

    const isWrong = player.status === "wrong" || player.status === "disabled"

    if (isWrong) {
      setConfirmDialog({ type: "undo-incorrect", playerId: id })
      return
    }

    applyIncorrect(id)
  }

  function handleConfirmDialog() {
    if (!confirmDialog) return

    if (confirmDialog.type === "undo-correct") {
      undoCorrect(confirmDialog.playerId)
    }

    if (confirmDialog.type === "undo-incorrect") {
      undoIncorrect(confirmDialog.playerId)
    }

    if (confirmDialog.type === "remove") {
      setPlayers((current) =>
        withRanks(current.filter((player) => player.id !== confirmDialog.playerId))
      )
    }

    setConfirmDialog(null)
  }

  function handleRename(playerId: string, name: string) {
    setPlayers((current) =>
      withRanks(
        current.map((player) =>
          player.id === playerId ? { ...player, name } : player
        )
      )
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {players.map((player) => (
          <li key={player.id}>
            <PlayerCard
              {...player}
              onCorrect={() => handleCorrectClick(player.id)}
              onIncorrect={() => handleIncorrectClick(player.id)}
              onRename={() => setRenamePlayerId(player.id)}
              onRemove={() =>
                setConfirmDialog({ type: "remove", playerId: player.id })
              }
            />
          </li>
        ))}
      </ul>

      <PlayerRenameDialog
        open={renamePlayerId !== null}
        onOpenChange={(open) => {
          if (!open) setRenamePlayerId(null)
        }}
        playerId={renamePlayerId}
        playerName={renamePlayer?.name ?? ""}
        existingNames={players}
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
                ? "Undo correct answer?"
                : confirmDialog?.type === "undo-incorrect"
                  ? "Undo incorrect answer?"
                  : "Remove player?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === "undo-correct" ? (
                <>
                  This removes 100 points from{" "}
                  <span className="text-foreground">{confirmTarget?.name}</span>.
                </>
              ) : null}
              {confirmDialog?.type === "undo-incorrect" ? (
                <>
                  <span className="text-foreground">{confirmTarget?.name}</span>{" "}
                  will be eligible again for this question.
                </>
              ) : null}
              {confirmDialog?.type === "remove" ? (
                <>
                  <span className="text-foreground">{confirmTarget?.name}</span>{" "}
                  will be removed from the player list.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmDialog?.type === "remove" ? "destructive" : "default"
              }
              onClick={handleConfirmDialog}
            >
              {confirmDialog?.type === "remove" ? "Remove" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

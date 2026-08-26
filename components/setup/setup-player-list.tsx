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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PlayerRenameDialog } from "@/components/player-rename-dialog"
import { SetupPlayerItem } from "@/components/setup/setup-player-item"
import { getActivePlayers } from "@/lib/players"
import { useAppStore } from "@/stores"
import { UsersIcon } from "lucide-react"

export function SetupPlayerList() {
  const allPlayers = useAppStore((state) => state.players)
  const players = getActivePlayers(allPlayers)
  const updatePlayer = useAppStore((state) => state.updatePlayer)
  const removePlayer = useAppStore((state) => state.removePlayer)

  const [renamePlayerId, setRenamePlayerId] = useState<string | null>(null)
  const [removePlayerId, setRemovePlayerId] = useState<string | null>(null)

  const renamePlayer = players.find((player) => player.id === renamePlayerId)
  const removePlayerTarget = players.find((player) => player.id === removePlayerId)

  function handleRename(playerId: string, name: string) {
    try {
      updatePlayer(playerId, name)
    } catch (error) {
      console.error(error)
    }
  }

  function handleRemove() {
    if (!removePlayerId) return

    removePlayer(removePlayerId)
    setRemovePlayerId(null)
  }

  if (players.length === 0) {
    return (
      <Empty className="border border-dashed border-border bg-muted/20 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No players yet</EmptyTitle>
          <EmptyDescription>
            Add at least one player to start the game.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {players.map((player) => (
          <li key={player.id}>
            <SetupPlayerItem
              name={player.name}
              onRename={() => setRenamePlayerId(player.id)}
              onRemove={() => setRemovePlayerId(player.id)}
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
        open={removePlayerId !== null}
        onOpenChange={(open) => {
          if (!open) setRemovePlayerId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove player?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-foreground">{removePlayerTarget?.name}</span>{" "}
              will be removed from the player list. You can reuse the name for a
              new player.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

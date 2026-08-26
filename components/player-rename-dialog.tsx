"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { isDuplicatePlayerName } from "@/lib/players"
import { PlayerNameSchema } from "@/schemas/player.schema"

interface PlayerRenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playerId: string | null
  playerName: string
  existingNames: Array<{ id: string; name: string }>
  onConfirm: (playerId: string, name: string) => void
}

interface PlayerRenameFormProps {
  playerId: string
  playerName: string
  existingNames: Array<{ id: string; name: string }>
  onCancel: () => void
  onConfirm: (playerId: string, name: string) => void
}

function PlayerRenameForm({
  playerId,
  playerName,
  existingNames,
  onCancel,
  onConfirm,
}: PlayerRenameFormProps) {
  const [name, setName] = useState(playerName)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = PlayerNameSchema.safeParse(name)

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid name")
      return
    }

    if (parsed.data === playerName) {
      onCancel()
      return
    }

    if (isDuplicatePlayerName(existingNames, parsed.data, playerId)) {
      setError("A player with this name already exists")
      return
    }

    onConfirm(playerId, parsed.data)
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="player-rename">Name</FieldLabel>
          <Input
            id="player-rename"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError(null)
            }}
            aria-invalid={!!error}
            autoFocus
          />
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

export function PlayerRenameDialog({
  open,
  onOpenChange,
  playerId,
  playerName,
  existingNames,
  onConfirm,
}: PlayerRenameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Rename player</DialogTitle>
          <DialogDescription>
            Update how this player appears on the scoreboard.
          </DialogDescription>
        </DialogHeader>

        {open && playerId ? (
          <PlayerRenameForm
            key={playerId}
            playerId={playerId}
            playerName={playerName}
            existingNames={existingNames}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

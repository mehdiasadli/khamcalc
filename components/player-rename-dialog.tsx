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
import { useTranslation } from "@/lib/i18n/context"
import { validatePlayerName } from "@/lib/i18n/validation"
import { isDuplicatePlayerName } from "@/lib/players"

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
  const { t } = useTranslation()
  const [name, setName] = useState(playerName)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = validatePlayerName(name, t)

    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    if (parsed.value === playerName) {
      onCancel()
      return
    }

    if (isDuplicatePlayerName(existingNames, parsed.value, playerId)) {
      setError(t("validation.nameDuplicate"))
      return
    }

    onConfirm(playerId, parsed.value)
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="player-rename">{t("players.nameLabel")}</FieldLabel>
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
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
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
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("players.renameTitle")}</DialogTitle>
          <DialogDescription>{t("players.renameScoreboardHint")}</DialogDescription>
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

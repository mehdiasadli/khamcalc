"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { translateStoreError } from "@/lib/i18n/errors"
import { useTranslation } from "@/lib/i18n/context"
import { validatePlayerName } from "@/lib/i18n/validation"
import { getActivePlayerCount, MAX_PLAYERS } from "@/lib/players"
import { useAppStore } from "@/stores"
import { PlusIcon } from "lucide-react"

interface AddPlayerFormProps {
  disabled?: boolean
}

export function AddPlayerForm({ disabled = false }: AddPlayerFormProps) {
  const { t } = useTranslation()
  const addPlayer = useAppStore((state) => state.addPlayer)
  const players = useAppStore((state) => state.players)
  const playerCount = getActivePlayerCount(players)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const atMax = playerCount >= MAX_PLAYERS

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (atMax) {
      setError(t("errors.maxPlayers", { count: MAX_PLAYERS }))
      return
    }

    const parsed = validatePlayerName(name, t)

    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    try {
      addPlayer(parsed.value)
      setName("")
      setError(null)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? translateStoreError(nextError.message, t)
          : t("players.couldNotAdd")
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="add-player">{t("players.add")}</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="add-player"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              placeholder={t("players.placeholder")}
              aria-invalid={!!error}
              disabled={disabled || atMax}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={disabled || atMax || name.trim().length === 0}
              aria-label={t("players.add")}
            >
              <PlusIcon data-icon="inline-start" />
            </Button>
          </div>
          <FieldDescription>
            {t("players.count", { count: playerCount, max: MAX_PLAYERS })}
          </FieldDescription>
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
    </form>
  )
}

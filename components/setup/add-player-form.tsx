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
import { MAX_PLAYERS } from "@/lib/players"
import { PlayerNameSchema } from "@/schemas/player.schema"
import { useAppStore } from "@/stores"
import { PlusIcon } from "lucide-react"

interface AddPlayerFormProps {
  disabled?: boolean
}

export function AddPlayerForm({ disabled = false }: AddPlayerFormProps) {
  const addPlayer = useAppStore((state) => state.addPlayer)
  const playerCount = useAppStore((state) => state.players.length)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const atMax = playerCount >= MAX_PLAYERS

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (atMax) {
      setError(`Maximum ${MAX_PLAYERS} players allowed`)
      return
    }

    const parsed = PlayerNameSchema.safeParse(name)

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid name")
      return
    }

    try {
      addPlayer(parsed.data)
      setName("")
      setError(null)
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not add player"
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="add-player">Add player</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="add-player"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              placeholder="Player name"
              aria-invalid={!!error}
              disabled={disabled || atMax}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={disabled || atMax || name.trim().length === 0}
              aria-label="Add player"
            >
              <PlusIcon data-icon="inline-start" />
            </Button>
          </div>
          <FieldDescription>
            {playerCount} / {MAX_PLAYERS} players
          </FieldDescription>
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
    </form>
  )
}

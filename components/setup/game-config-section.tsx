"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { configMatches } from "@/lib/config"
import { configPresets } from "@/lib/config-presets"
import type { TGameConfig } from "@/schemas/config.schema"
import { useAppStore } from "@/stores"

interface ConfigNumberFieldProps {
  id: string
  label: string
  description: string
  value: number | null
  onChange: (value: number | null) => void
}

function ConfigNumberField({
  id,
  label,
  description,
  value,
  onChange,
}: ConfigNumberFieldProps) {
  const unlimited = value === null

  return (
    <Field>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <FieldDescription>{description}</FieldDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <FieldLabel htmlFor={`${id}-unlimited`} className="text-xs">
            No limit
          </FieldLabel>
          <Switch
            id={`${id}-unlimited`}
            checked={unlimited}
            onCheckedChange={(checked) => {
              onChange(checked ? null : 1)
            }}
          />
        </div>
      </div>
      {!unlimited ? (
        <Input
          id={id}
          type="number"
          min={1}
          inputMode="numeric"
          value={value ?? ""}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10)
            onChange(Number.isNaN(next) ? 1 : next)
          }}
        />
      ) : null}
    </Field>
  )
}

export function GameConfigSection() {
  const config = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const applyConfigPreset = useAppStore((state) => state.applyConfigPreset)

  function updateConfig(partial: Partial<TGameConfig>) {
    try {
      setConfig(partial)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Game config</CardTitle>
        <CardDescription>
          Set round limits or pick a preset for common formats.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {Object.entries(configPresets).map(([key, preset]) => {
            const active = configMatches(config, preset.config)

            return (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => applyConfigPreset(preset.config)}
              >
                {preset.name}
              </Button>
            )
          })}
        </div>

        <FieldGroup>
          <ConfigNumberField
            id="questions-per-round"
            label="Questions per round"
            description="How many questions before moving to the next round."
            value={config.questionsPerRound}
            onChange={(questionsPerRound) =>
              updateConfig({ questionsPerRound })
            }
          />
          <ConfigNumberField
            id="max-rounds"
            label="Max rounds"
            description="Stop after this many rounds, or leave unlimited."
            value={config.maxRounds}
            onChange={(maxRounds) => updateConfig({ maxRounds })}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

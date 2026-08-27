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
import type { TConfigPresetName } from "@/lib/config-presets"
import { detectPresetKey } from "@/lib/i18n/helpers"
import { useTranslation } from "@/lib/i18n/context"
import { getPresetDescription, getPresetLabel } from "@/lib/i18n/presets"
import type { TGameConfig } from "@/schemas/config.schema"
import { useAppStore } from "@/stores"

interface ConfigNumberFieldProps {
  id: string
  label: string
  description: string
  noLimitLabel: string
  value: number | null
  disabled?: boolean
  onChange: (value: number | null) => void
}

function ConfigNumberField({
  id,
  label,
  description,
  noLimitLabel,
  value,
  disabled = false,
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
            {noLimitLabel}
          </FieldLabel>
          <Switch
            id={`${id}-unlimited`}
            checked={unlimited}
            disabled={disabled}
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
          disabled={disabled}
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
  const { t } = useTranslation()
  const config = useAppStore((state) => state.config)
  const game = useAppStore((state) => state.game)
  const setConfig = useAppStore((state) => state.setConfig)
  const applyConfigPreset = useAppStore((state) => state.applyConfigPreset)

  const configLocked = game?.status === "playing"
  const activePresetKey = detectPresetKey(config)

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
        <CardTitle>{t("gameConfig.title")}</CardTitle>
        <CardDescription>{t("gameConfig.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {configLocked ? (
          <p className="text-sm text-muted-foreground">{t("gameConfig.locked")}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {Object.entries(configPresets).map(([key, preset]) => {
            const active = configMatches(config, preset.config)
            const presetKey = key as TConfigPresetName

            return (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                disabled={configLocked}
                onClick={() => applyConfigPreset(preset.config)}
              >
                {getPresetLabel(t, presetKey)}
              </Button>
            )
          })}
        </div>

        {activePresetKey ? (
          <p className="text-xs text-muted-foreground">
            {getPresetDescription(t, activePresetKey)}
          </p>
        ) : null}

        <FieldGroup>
          <ConfigNumberField
            id="questions-per-round"
            label={t("gameConfig.questionsPerRound")}
            description={t("gameConfig.questionsPerRoundHint")}
            noLimitLabel={t("common.noLimit")}
            value={config.questionsPerRound}
            disabled={configLocked}
            onChange={(questionsPerRound) =>
              updateConfig({ questionsPerRound })
            }
          />
          <ConfigNumberField
            id="max-rounds"
            label={t("gameConfig.maxRounds")}
            description={t("gameConfig.maxRoundsHint")}
            noLimitLabel={t("common.noLimit")}
            value={config.maxRounds}
            disabled={configLocked}
            onChange={(maxRounds) => updateConfig({ maxRounds })}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

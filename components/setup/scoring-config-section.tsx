"use client"

import { useMemo, useState } from "react"

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
import { useTranslation } from "@/lib/i18n/context"
import { getQuestionCorrectPoints } from "@/lib/scoring"
import type {
  TScoringConfig,
  TScoringMode,
  TWrongDeductionMode,
} from "@/schemas/scoring.schema"
import { useAppStore } from "@/stores"
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"

interface ScoringNumberFieldProps {
  id: string
  label: string
  description?: string
  value: number
  min?: number
  disabled?: boolean
  onChange: (value: number) => void
}

function ScoringNumberField({
  id,
  label,
  description,
  value,
  min = 0,
  disabled = false,
  onChange,
}: ScoringNumberFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <Input
        id={id}
        type="number"
        min={min}
        inputMode="numeric"
        disabled={disabled}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10)
          onChange(Number.isNaN(next) ? min : next)
        }}
      />
    </Field>
  )
}

function ModeButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export function ScoringConfigSection() {
  const { t } = useTranslation()
  const config = useAppStore((state) => state.config)
  const game = useAppStore((state) => state.game)
  const setConfig = useAppStore((state) => state.setConfig)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const configLocked = game?.status === "playing"
  const scoring = config.scoring

  const wrongDeductionDescriptions: Record<TWrongDeductionMode, string> = {
    none: t("scoring.wrongDescNone"),
    question_value: t("scoring.wrongDescQuestionValue"),
    fixed: t("scoring.wrongDescFixed"),
  }

  function updateScoring(partial: Partial<TScoringConfig>) {
    setConfig({
      scoring: {
        ...scoring,
        ...partial,
      },
    })
  }

  const previewValues = useMemo(() => {
    const draft = scoring
    return [1, 2, 3, 4, 5].map((question) =>
      getQuestionCorrectPoints(draft, 1, question)
    )
  }, [scoring])

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("scoring.title")}</CardTitle>
        <CardDescription>{t("scoring.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {configLocked ? (
          <p className="text-sm text-muted-foreground">{t("scoring.locked")}</p>
        ) : null}

        <Field>
          <FieldLabel>{t("scoring.pointLadder")}</FieldLabel>
          <FieldDescription>{t("scoring.pointLadderHint")}</FieldDescription>
          <div className="flex flex-wrap gap-2 pt-1">
            <ModeButton
              active={scoring.mode === "flat"}
              disabled={configLocked}
              label={t("scoring.flat")}
              onClick={() => updateScoring({ mode: "flat" as TScoringMode })}
            />
            <ModeButton
              active={scoring.mode === "linear"}
              disabled={configLocked}
              label={t("scoring.linear")}
              onClick={() => updateScoring({ mode: "linear" as TScoringMode })}
            />
          </div>
        </Field>

        <FieldGroup>
          <ScoringNumberField
            id="scoring-base"
            label={t("scoring.basePoints")}
            description={t("scoring.basePointsHint")}
            value={scoring.basePoints}
            min={1}
            disabled={configLocked}
            onChange={(basePoints) => updateScoring({ basePoints })}
          />

          {scoring.mode === "linear" ? (
            <ScoringNumberField
              id="scoring-increment-question"
              label={t("scoring.incrementQuestion")}
              description={t("scoring.incrementQuestionHint")}
              value={scoring.incrementPerQuestion}
              min={0}
              disabled={configLocked}
              onChange={(incrementPerQuestion) =>
                updateScoring({ incrementPerQuestion })
              }
            />
          ) : null}

          <Field>
            <FieldLabel>{t("scoring.whenWrong")}</FieldLabel>
            <FieldDescription>
              {wrongDeductionDescriptions[scoring.wrongDeduction]}
            </FieldDescription>
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  ["none", t("scoring.wrongNone")],
                  ["question_value", t("scoring.wrongQuestionValue")],
                  ["fixed", t("scoring.wrongFixed")],
                ] as const
              ).map(([mode, label]) => (
                <ModeButton
                  key={mode}
                  active={scoring.wrongDeduction === mode}
                  disabled={configLocked}
                  label={label}
                  onClick={() =>
                    updateScoring({
                      wrongDeduction: mode as TWrongDeductionMode,
                    })
                  }
                />
              ))}
            </div>
          </Field>

          {scoring.wrongDeduction === "fixed" ? (
            <ScoringNumberField
              id="scoring-wrong-fixed"
              label={t("scoring.fixedPenalty")}
              description={t("scoring.fixedPenaltyHint")}
              value={scoring.wrongFixedAmount}
              min={1}
              disabled={configLocked}
              onChange={(wrongFixedAmount) =>
                updateScoring({ wrongFixedAmount })
              }
            />
          ) : null}

          <Field>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="scoring-negative">
                  {t("scoring.allowNegative")}
                </FieldLabel>
                <FieldDescription>{t("scoring.allowNegativeHint")}</FieldDescription>
              </div>
              <Switch
                id="scoring-negative"
                checked={scoring.allowNegativeScores}
                disabled={configLocked}
                onCheckedChange={(allowNegativeScores) =>
                  updateScoring({ allowNegativeScores })
                }
              />
            </div>
          </Field>

          <Field>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="scoring-show-value">
                  {t("scoring.showQuestionValue")}
                </FieldLabel>
                <FieldDescription>
                  {t("scoring.showQuestionValueHint")}
                </FieldDescription>
              </div>
              <Switch
                id="scoring-show-value"
                checked={scoring.showQuestionValue}
                disabled={configLocked}
                onCheckedChange={(showQuestionValue) =>
                  updateScoring({ showQuestionValue })
                }
              />
            </div>
          </Field>
        </FieldGroup>

        <div className="rounded-2xl border border-border/70 bg-muted/20 px-3 py-2">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {t("scoring.previewTitle")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("scoring.previewHint")}
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {previewValues.map((value, index) => `Q${index + 1}=${value}`).join(" · ")}
          </p>
        </div>

        <div className="border-t border-border/60 pt-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-medium"
            disabled={configLocked}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            {t("scoring.advanced")}
            <ChevronDownIcon
              className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>

          {advancedOpen ? (
            <FieldGroup className="pt-2">
              <ScoringNumberField
                id="scoring-increment-round"
                label={t("scoring.incrementRound")}
                description={t("scoring.incrementRoundHint")}
                value={scoring.incrementPerRound}
                min={0}
                disabled={configLocked}
                onChange={(incrementPerRound) =>
                  updateScoring({ incrementPerRound })
                }
              />
              <Field>
                <FieldLabel htmlFor="scoring-round-multiplier">
                  {t("scoring.roundMultiplier")}
                </FieldLabel>
                <FieldDescription>{t("scoring.roundMultiplierHint")}</FieldDescription>
                <Input
                  id="scoring-round-multiplier"
                  type="number"
                  min={1}
                  step={0.1}
                  disabled={configLocked}
                  value={scoring.roundMultiplier}
                  onChange={(event) => {
                    const next = Number.parseFloat(event.target.value)
                    updateScoring({
                      roundMultiplier: Number.isNaN(next) ? 1 : Math.max(1, next),
                    })
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="scoring-min-score">
                  {t("scoring.scoreFloor")}
                </FieldLabel>
                <FieldDescription>{t("scoring.scoreFloorHint")}</FieldDescription>
                <Input
                  id="scoring-min-score"
                  type="number"
                  disabled={configLocked || !scoring.allowNegativeScores}
                  value={scoring.minScore ?? ""}
                  placeholder={t("scoring.noFloor")}
                  onChange={(event) => {
                    const raw = event.target.value.trim()
                    updateScoring({
                      minScore:
                        raw.length === 0 ? null : Number.parseInt(raw, 10) || null,
                    })
                  }}
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel>{t("scoring.overrides")}</FieldLabel>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    disabled={configLocked}
                    onClick={() =>
                      updateScoring({
                        overrides: [
                          ...scoring.overrides,
                          {
                            round: 1,
                            question: 1,
                            correctPoints: scoring.basePoints,
                          },
                        ],
                      })
                    }
                  >
                    <PlusIcon data-icon="inline-start" />
                    {t("scoring.addOverride")}
                  </Button>
                </div>
                <FieldDescription>{t("scoring.overridesHint")}</FieldDescription>
                {scoring.overrides.length > 0 ? (
                  <p className="pt-1 text-xs text-muted-foreground">
                    {t("scoring.overridesColumns")}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 pt-2">
                  {scoring.overrides.map((override, index) => (
                    <div
                      key={`${override.round}-${override.question}-${index}`}
                      className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 p-2 sm:grid-cols-5"
                    >
                      <Input
                        type="number"
                        min={1}
                        disabled={configLocked}
                        value={override.round}
                        aria-label={t("scoring.overrideRound")}
                        onChange={(event) => {
                          const next = [...scoring.overrides]
                          next[index] = {
                            ...override,
                            round: Number.parseInt(event.target.value, 10) || 1,
                          }
                          updateScoring({ overrides: next })
                        }}
                      />
                      <Input
                        type="number"
                        min={1}
                        disabled={configLocked}
                        value={override.question}
                        aria-label={t("scoring.overrideQuestion")}
                        onChange={(event) => {
                          const next = [...scoring.overrides]
                          next[index] = {
                            ...override,
                            question: Number.parseInt(event.target.value, 10) || 1,
                          }
                          updateScoring({ overrides: next })
                        }}
                      />
                      <Input
                        type="number"
                        disabled={configLocked}
                        value={override.correctPoints}
                        aria-label={t("scoring.correctPoints")}
                        onChange={(event) => {
                          const next = [...scoring.overrides]
                          next[index] = {
                            ...override,
                            correctPoints:
                              Number.parseInt(event.target.value, 10) || 0,
                          }
                          updateScoring({ overrides: next })
                        }}
                      />
                      <Input
                        type="number"
                        disabled={configLocked}
                        value={override.wrongPoints ?? ""}
                        placeholder={t("common.auto")}
                        aria-label={t("scoring.wrongPoints")}
                        onChange={(event) => {
                          const raw = event.target.value.trim()
                          const next = [...scoring.overrides]
                          next[index] = {
                            ...override,
                            wrongPoints:
                              raw.length === 0
                                ? undefined
                                : Number.parseInt(raw, 10) || 0,
                          }
                          updateScoring({ overrides: next })
                        }}
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={configLocked}
                        aria-label={t("scoring.removeOverride")}
                        onClick={() =>
                          updateScoring({
                            overrides: scoring.overrides.filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          })
                        }
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

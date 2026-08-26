"use client"

import { useMemo } from "react"

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
import { getQuestionCorrectPoints } from "@/lib/scoring"
import type {
  TScoringConfig,
  TScoringMode,
  TWrongDeductionMode,
} from "@/schemas/scoring.schema"
import { useAppStore } from "@/stores"
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

const WRONG_DEDUCTION_DESCRIPTIONS: Record<TWrongDeductionMode, string> = {
  none: "Marking someone wrong does not change their score.",
  question_value:
    "They lose exactly what the current question was worth — same as a correct answer, but subtracted.",
  fixed: "Every wrong mark costs the same amount, no matter what the question is worth.",
}

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
  const config = useAppStore((state) => state.config)
  const game = useAppStore((state) => state.game)
  const setConfig = useAppStore((state) => state.setConfig)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const configLocked = game?.status === "playing"
  const scoring = config.scoring

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
        <CardTitle>Scoring</CardTitle>
        <CardDescription>
          Set how many points players gain for correct answers and lose for wrong
          ones. These rules lock when you start a game.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {configLocked ? (
          <p className="text-sm text-muted-foreground">
            Scoring is locked while a game is in progress.
          </p>
        ) : null}

        <Field>
          <FieldLabel>Point ladder</FieldLabel>
          <FieldDescription>
            Flat keeps every question in a round worth the same. Linear increases
            the value for Q2, Q3, and so on, then resets at the next round.
          </FieldDescription>
          <div className="flex flex-wrap gap-2 pt-1">
            <ModeButton
              active={scoring.mode === "flat"}
              disabled={configLocked}
              label="Flat"
              onClick={() => updateScoring({ mode: "flat" as TScoringMode })}
            />
            <ModeButton
              active={scoring.mode === "linear"}
              disabled={configLocked}
              label="Linear ladder"
              onClick={() => updateScoring({ mode: "linear" as TScoringMode })}
            />
          </div>
        </Field>

        <FieldGroup>
          <ScoringNumberField
            id="scoring-base"
            label="Starting value (Q1)"
            description="Points for the first question of Round 1. Later questions and rounds build on this."
            value={scoring.basePoints}
            min={1}
            disabled={configLocked}
            onChange={(basePoints) => updateScoring({ basePoints })}
          />

          {scoring.mode === "linear" ? (
            <ScoringNumberField
              id="scoring-increment-question"
              label="Step up each question"
              description="Added for every next question in the same round. Example: start 100, step 100 → Q1=100, Q2=200, Q3=300. Resets each round."
              value={scoring.incrementPerQuestion}
              min={0}
              disabled={configLocked}
              onChange={(incrementPerQuestion) =>
                updateScoring({ incrementPerQuestion })
              }
            />
          ) : null}

          <Field>
            <FieldLabel>When someone is wrong</FieldLabel>
            <FieldDescription>
              {WRONG_DEDUCTION_DESCRIPTIONS[scoring.wrongDeduction]}
            </FieldDescription>
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  ["none", "No penalty"],
                  ["question_value", "Lose question value"],
                  ["fixed", "Fixed penalty"],
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
              label="Fixed penalty amount"
              description="Points subtracted every time you mark a player incorrect."
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
                  Scores can go below zero
                </FieldLabel>
                <FieldDescription>
                  When off, a player&apos;s total never drops below 0 even if
                  wrong answers would cost more than they have.
                </FieldDescription>
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
                  Show points in the game header
                </FieldLabel>
                <FieldDescription>
                  Displays what the current question is worth (and the wrong
                  penalty, if any) under the round counter.
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
            Round 1 preview
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Correct-answer values for questions 1–5 with your current settings.
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
            Advanced scoring
            <ChevronDownIcon
              className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>

          {advancedOpen ? (
            <FieldGroup className="pt-2">
              <ScoringNumberField
                id="scoring-increment-round"
                label="Bonus added each round"
                description="Extra points added to the base before anything else, once per round. Round 2 gets +1× this, Round 3 gets +2× this, etc."
                value={scoring.incrementPerRound}
                min={0}
                disabled={configLocked}
                onChange={(incrementPerRound) =>
                  updateScoring({ incrementPerRound })
                }
              />
              <Field>
                <FieldLabel htmlFor="scoring-round-multiplier">
                  Round multiplier
                </FieldLabel>
                <FieldDescription>
                  Makes later rounds worth more. Round 1 uses ×1, Round 2 uses
                  ×multiplier, Round 3 uses ×multiplier², and so on. Keep at 1
                  if every round should feel the same.
                </FieldDescription>
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
                <FieldLabel htmlFor="scoring-min-score">Score floor</FieldLabel>
                <FieldDescription>
                  The lowest total a player can reach. Only applies when
                  negative scores are allowed. Leave empty for no limit.
                </FieldDescription>
                <Input
                  id="scoring-min-score"
                  type="number"
                  disabled={configLocked || !scoring.allowNegativeScores}
                  value={scoring.minScore ?? ""}
                  placeholder="No floor"
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
                  <FieldLabel>Question overrides</FieldLabel>
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
                    Add override
                  </Button>
                </div>
                <FieldDescription>
                  Pin exact point values to a specific round and question —
                  useful for finales or special rounds. Overrides replace the
                  formula for that slot.
                </FieldDescription>
                {scoring.overrides.length > 0 ? (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Columns: round · question · correct pts · wrong pts (leave
                    wrong blank to use your penalty rule).
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
                        aria-label="Override round"
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
                        aria-label="Override question"
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
                        aria-label="Correct points"
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
                        placeholder="Auto"
                        aria-label="Wrong points"
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
                        aria-label="Remove override"
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

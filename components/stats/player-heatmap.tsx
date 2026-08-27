"use client"

import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import {
  exportPlayerHeatmapPng,
  getPlayerHeatmap,
  type THeatmapCellState,
  type TPlayerHeatmap,
} from "@/lib/player-heatmap"
import { trackExportUsed } from "@/lib/telemetry/track"
import type { TGameConfig } from "@/schemas/config.schema"
import type { TGameState } from "@/schemas/game.schema"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "lucide-react"

const cellStyles: Record<THeatmapCellState, string> = {
  correct: "bg-primary/80",
  wrong: "bg-destructive/65",
  skipped: "bg-muted-foreground/32",
  not_reached: "bg-foreground/[0.06]",
  idle: "bg-foreground/12",
}

interface PlayerHeatmapProps {
  game: TGameState
  config: TGameConfig
  playerId: string
  playerName: string
  className?: string
  showExport?: boolean
}

function HeatmapLegend() {
  const { t } = useTranslation()

  const items: { state: THeatmapCellState; label: string }[] = [
    { state: "correct", label: t("heatmap.legendCorrect") },
    { state: "wrong", label: t("heatmap.legendWrong") },
    { state: "skipped", label: t("heatmap.legendSkipped") },
  ]

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
      {items.map(({ state, label }) => (
        <div key={state} className="flex items-center gap-1.5">
          <span
            className={cn("size-2.5 shrink-0 rounded-sm", cellStyles[state])}
            aria-hidden
          />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

function HeatmapGrid({
  heatmap,
  ariaLabel,
}: {
  heatmap: TPlayerHeatmap
  ariaLabel: string
}) {
  const { t } = useTranslation()
  const { rounds, questions, cells } = heatmap

  if (rounds.length === 0 || questions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">{t("heatmap.empty")}</p>
    )
  }

  return (
    <div
      className="inline-flex min-w-0 flex-col gap-1"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex gap-px pl-5">
        {rounds.map((round) => (
          <span
            key={round}
            className="flex h-4 w-3 shrink-0 items-center justify-center text-[9px] text-muted-foreground tabular-nums"
            aria-hidden
          >
            {round}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-px">
        {cells.map((row, questionIndex) => (
          <div key={questions[questionIndex]} className="flex items-center gap-px">
            <span
              className="w-4 shrink-0 text-right text-[9px] text-muted-foreground tabular-nums"
              aria-hidden
            >
              {questions[questionIndex]}
            </span>
            {row.map((state, roundIndex) => (
              <span
                key={`${questions[questionIndex]}-${rounds[roundIndex]}`}
                className={cn(
                  "size-3 shrink-0 rounded-xs",
                  cellStyles[state]
                )}
                title={t("heatmap.cellTitle", {
                  round: rounds[roundIndex],
                  question: questions[questionIndex],
                  state: t(`heatmap.state.${state}`),
                })}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PlayerHeatmap({
  game,
  config,
  playerId,
  playerName,
  className,
  showExport = true,
}: PlayerHeatmapProps) {
  const { t } = useTranslation()

  const heatmap = useMemo(
    () => getPlayerHeatmap({ game, config, playerId }),
    [game, config, playerId]
  )

  const ariaLabel = t("heatmap.ariaLabel", { name: playerName })

  function handleExport() {
    exportPlayerHeatmapPng({
      playerName,
      heatmap,
      roundLabel: (round) => t("common.roundShort", { round }),
      questionLabel: (question) => String(question),
    })
    trackExportUsed("heatmap_png")
  }

  const isLarge =
    heatmap.rounds.length * heatmap.questions.length > 80 ||
    heatmap.rounds.length > 12 ||
    heatmap.questions.length > 12

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <HeatmapLegend />
        {showExport && heatmap.cells.length > 0 ? (
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="shrink-0 self-center"
            onClick={handleExport}
          >
            <DownloadIcon data-icon="inline-start" />
            {t("heatmap.exportPng")}
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "rounded-md border border-border/60 bg-muted/20 p-2",
          isLarge && "max-h-48 overflow-auto"
        )}
      >
        <HeatmapGrid heatmap={heatmap} ariaLabel={ariaLabel} />
      </div>

      <p className="text-[10px] text-muted-foreground">
        {t("heatmap.axisHint")}
      </p>
    </div>
  )
}

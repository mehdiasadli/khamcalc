"use client"

import Link from "next/link"
import { useMemo } from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useFormat, useTranslation } from "@/lib/i18n/context"
import { getActivePlayers } from "@/lib/players"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"
import { BarChart3Icon } from "lucide-react"

export function SetupFinishedSummary() {
  const { t } = useTranslation()
  const { formatDuration } = useFormat()
  const game = useAppStore((state) => state.game)
  const players = useAppStore((state) => state.players)

  const rankedPlayers = useMemo(() => {
    if (!game) return []

    return getActivePlayers(players)
      .map((player) => ({
        ...player,
        score: game.scores[player.id] ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
  }, [game, players])

  if (!game || game.status !== "finished") {
    return null
  }

  const elapsedMs =
    game.startedAt && game.finishedAt
      ? new Date(game.finishedAt).getTime() -
        new Date(game.startedAt).getTime()
      : null

  return (
    <Card size="sm" className="ring-primary/20">
      <CardHeader>
        <CardTitle>{t("setup.lastGame")}</CardTitle>
        <CardDescription>
          {t("setup.lastGameDuration", { duration: formatDuration(elapsedMs) })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {rankedPlayers.map((player, index) => (
            <li
              key={player.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="truncate">
                {index + 1}. {player.name}
              </span>
              <span className="font-mono tabular-nums">
                {player.score} {t("common.pts")}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/stats"
          className={cn(buttonVariants({ variant: "outline", className: "w-full" }))}
        >
          <BarChart3Icon data-icon="inline-start" />
          {t("setup.viewFullStats")}
        </Link>
      </CardContent>
    </Card>
  )
}

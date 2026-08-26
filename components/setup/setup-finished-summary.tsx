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
import { formatDuration } from "@/lib/stats-format"
import { getActivePlayers } from "@/lib/players"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"
import { BarChart3Icon } from "lucide-react"

export function SetupFinishedSummary() {
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
        <CardTitle>Last game</CardTitle>
        <CardDescription>
          Finished · {formatDuration(elapsedMs)}
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
              <span className="font-mono tabular-nums">{player.score} pts</span>
            </li>
          ))}
        </ul>

        <Link
          href="/stats"
          className={cn(buttonVariants({ variant: "outline", className: "w-full" }))}
        >
          <BarChart3Icon data-icon="inline-start" />
          View full stats
        </Link>
      </CardContent>
    </Card>
  )
}

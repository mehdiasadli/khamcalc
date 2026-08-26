"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { AddPlayerForm } from "@/components/setup/add-player-form"
import { GameConfigSection } from "@/components/setup/game-config-section"
import { SetupPlayerList } from "@/components/setup/setup-player-list"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MIN_PLAYERS, getActivePlayerCount } from "@/lib/players"
import { useAppStore } from "@/stores"
import { ArrowRightIcon } from "lucide-react"

export function SetupPage() {
  const router = useRouter()
  const players = useAppStore((state) => state.players)
  const game = useAppStore((state) => state.game)
  const enterGame = useAppStore((state) => state.enterGame)
  const [error, setError] = useState<string | null>(null)

  const canStart = getActivePlayerCount(players) >= MIN_PLAYERS
  const hasActiveGame = game !== null && game.status !== "finished"

  function handleStart() {
    setError(null)

    try {
      enterGame()
      router.push("/game")
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not start game"
      )
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4 pb-28 sm:p-6 sm:pb-32">
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Setup
        </p>
        <h1 className="font-heading text-xl font-medium">KhamCalc</h1>
        <p className="text-sm text-muted-foreground">
          Configure the game and add players before you start scoring.
        </p>
      </header>

      <GameConfigSection />

      <Card size="sm">
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>
            Names are saved locally between sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AddPlayerForm />
          <SetupPlayerList />
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 p-4 backdrop-blur-sm sm:p-6">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
          {error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : null}
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!canStart}
            onClick={handleStart}
          >
            {hasActiveGame ? "Continue game" : "Enter game"}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          {!canStart ? (
            <p className="text-center text-xs text-muted-foreground">
              Add at least {MIN_PLAYERS} player to start.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { GameFinishedBar } from "@/components/game/game-finished-bar"
import { EndGameButton } from "@/components/game/end-game-dialog"
import { GameModerationBar } from "@/components/game/game-moderation-bar"
import { HostFeedbackMenu } from "@/components/game/host-feedback-menu"
import { PlayerCardList } from "@/components/player-card-list"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"
import { SettingsIcon, BarChart3Icon, FlagIcon } from "lucide-react"

export function GamePageContent() {
  const router = useRouter()
  const game = useAppStore((state) => state.game)

  useEffect(() => {
    if (!game) {
      router.replace("/")
    }
  }, [game, router])

  if (!game) {
    return null
  }

  const isFinished = game.status === "finished"

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex min-w-0 items-center gap-2">
            <p className="font-mono text-sm tracking-wide tabular-nums">
              Round {game.currentRound} · Question {game.currentQuestion}
            </p>
            {isFinished ? <Badge variant="secondary">Finished</Badge> : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!isFinished ? (
              <EndGameButton
                variant="ghost"
                size="icon-sm"
                aria-label="End game"
              >
                <FlagIcon />
              </EndGameButton>
            ) : null}
            <HostFeedbackMenu />
            <Link
              href="/stats"
              aria-label="Stats"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <BarChart3Icon />
            </Link>
            <Link
              href="/"
              aria-label="Setup"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <SettingsIcon />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4 pb-24 sm:p-6 sm:pb-28">
        <PlayerCardList disabled={isFinished} />
      </main>

      {isFinished ? <GameFinishedBar /> : <GameModerationBar />}
    </div>
  )
}

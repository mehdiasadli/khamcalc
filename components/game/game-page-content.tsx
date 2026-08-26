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
import { getQuestionCorrectPoints, getWrongDeductionPoints } from "@/lib/scoring"
import { formatScore } from "@/lib/scoring-format"
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
  const questionPoints = getQuestionCorrectPoints(
    game.scoringConfig,
    game.currentRound,
    game.currentQuestion
  )
  const wrongPoints = getWrongDeductionPoints(
    game.scoringConfig,
    game.currentRound,
    game.currentQuestion
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-mono text-sm tracking-wide tabular-nums">
                Round {game.currentRound} · Question {game.currentQuestion}
              </p>
              {game.scoringConfig.showQuestionValue ? (
                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {wrongPoints > 0
                    ? `${formatScore(questionPoints)} // ${formatScore(-wrongPoints)} pts`
                    : `${formatScore(questionPoints)} pts`}
                </p>
              ) : null}
            </div>
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

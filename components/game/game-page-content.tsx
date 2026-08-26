"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { PlayerCardList } from "@/components/player-card-list"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"

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

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Round {game.currentRound} · Question {game.currentQuestion}
          </p>
          <h1 className="font-heading text-xl font-medium">Game</h1>
        </div>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Setup
        </Link>
      </header>

      <PlayerCardList />
    </main>
  )
}

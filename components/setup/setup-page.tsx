"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { NewGameButton } from "@/components/game/new-game-dialog"
import { AddPlayerForm } from "@/components/setup/add-player-form"
import { GameConfigSection } from "@/components/setup/game-config-section"
import { HostFeedbackSection } from "@/components/setup/host-feedback-section"
import { LanguagePicker } from "@/components/setup/language-picker"
import { ScoringConfigSection } from "@/components/setup/scoring-config-section"
import { SetupFinishedSummary } from "@/components/setup/setup-finished-summary"
import { SetupPlayerList } from "@/components/setup/setup-player-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { translateStoreError } from "@/lib/i18n/errors"
import { useTranslation } from "@/lib/i18n/context"
import { MIN_PLAYERS, getActivePlayerCount } from "@/lib/players"
import { PWA_APP_NAME } from "@/lib/pwa/constants"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores"
import { ArrowRightIcon, BarChart3Icon } from "lucide-react"

export function SetupPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const players = useAppStore((state) => state.players)
  const game = useAppStore((state) => state.game)
  const enterGame = useAppStore((state) => state.enterGame)
  const [error, setError] = useState<string | null>(null)

  const canStart = getActivePlayerCount(players) >= MIN_PLAYERS
  const hasActiveGame = game !== null && game.status === "playing"
  const hasFinishedGame = game !== null && game.status === "finished"

  function handleStart() {
    setError(null)

    try {
      enterGame()
      router.push("/game")
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? translateStoreError(nextError.message, t)
          : t("setup.couldNotStart")
      )
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4 pb-28 sm:p-6 sm:pb-32">
      <header className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {t("setup.eyebrow")}
          </p>
          <h1 className="font-heading text-xl font-medium">{PWA_APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">{t("setup.tagline")}</p>
        </div>
        <ThemeToggle className="shrink-0" />
      </header>

      <SetupFinishedSummary />

      <LanguagePicker />

      <GameConfigSection />

      <ScoringConfigSection />

      <HostFeedbackSection />

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("setup.players")}</CardTitle>
          <CardDescription>{t("setup.playersHint")}</CardDescription>
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

          {hasFinishedGame ? (
            <>
              <Link
                href="/stats"
                className={cn(buttonVariants({ size: "lg", className: "w-full" }))}
              >
                <BarChart3Icon data-icon="inline-start" />
                {t("setup.viewStats")}
              </Link>
              <NewGameButton variant="outline" size="lg" className="w-full" />
            </>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={!canStart}
              onClick={handleStart}
            >
              {hasActiveGame ? t("setup.continueGame") : t("setup.enterGame")}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}

          {!canStart && !hasFinishedGame ? (
            <p className="text-center text-xs text-muted-foreground">
              {t("setup.minPlayers", { count: MIN_PLAYERS })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

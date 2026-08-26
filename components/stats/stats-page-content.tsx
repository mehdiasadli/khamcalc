"use client"

import Link from "next/link"
import { useMemo } from "react"
import { parseAsStringLiteral, useQueryState } from "nuqs"

import { StatsOverviewTab } from "@/components/stats/stats-overview-tab"
import { StatsPlayersTab } from "@/components/stats/stats-players-tab"
import { StatsShareActions } from "@/components/stats/stats-share-actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { formatGameSummary } from "@/lib/analytics"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useAppStore, useGameAnalytics } from "@/stores"
import {
  ArrowLeftIcon,
  BarChart3Icon,
  SettingsIcon,
} from "lucide-react"

const statsTabParser = parseAsStringLiteral(["overview", "players"]).withDefault(
  "overview"
)

export function StatsPageContent() {
  const game = useAppStore((state) => state.game)
  const config = useAppStore((state) => state.config)
  const players = useAppStore((state) => state.players)
  const analytics = useGameAnalytics()
  const [tab, setTab] = useQueryState("tab", statsTabParser)

  const summary = useMemo(() => {
    if (!game) return ""

    return formatGameSummary({ game, config, players })
  }, [game, config, players])

  if (!game || !analytics) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col p-4 sm:p-6">
        <Empty className="flex-1 border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BarChart3Icon />
            </EmptyMedia>
            <EmptyTitle>No game to analyze</EmptyTitle>
            <EmptyDescription>
              Start or continue a game to see live stats and player breakdowns.
            </EmptyDescription>
          </EmptyHeader>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Go to setup
          </Link>
        </Empty>
      </div>
    )
  }

  const isFinished = game.status === "finished"
  const presetLabel = analytics.overview.presetName ?? "Custom"

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (value === "overview" || value === "players") {
          void setTab(value)
        }
      }}
      className="flex min-h-svh flex-col"
    >
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-medium">{presetLabel} stats</p>
              <Badge variant="secondary">{isFinished ? "Finished" : "Live"}</Badge>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <StatsShareActions summary={summary} />
              <ThemeToggle />
              <Link
                href="/game"
                aria-label="Back to game"
                className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              >
                <ArrowLeftIcon />
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

          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="players" className="flex-1">
              Players
            </TabsTrigger>
          </TabsList>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col p-4 sm:p-6">
        <TabsContent value="overview">
          <StatsOverviewTab analytics={analytics} players={players} />
        </TabsContent>
        <TabsContent value="players">
          <StatsPlayersTab analytics={analytics} />
        </TabsContent>
      </main>
    </Tabs>
  )
}

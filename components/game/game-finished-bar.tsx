"use client"

import Link from "next/link"

import { NewGameButton } from "@/components/game/new-game-dialog"
import { buttonVariants } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { BarChart3Icon } from "lucide-react"

export function GameFinishedBar() {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md gap-2 p-4 sm:p-6">
        <Link
          href="/stats"
          className={cn(buttonVariants({ className: "flex-1" }))}
        >
          <BarChart3Icon data-icon="inline-start" />
          {t("game.viewStats")}
        </Link>
        <NewGameButton variant="outline" className="flex-1" />
      </div>
    </div>
  )
}

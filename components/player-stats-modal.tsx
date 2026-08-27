"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlayerStatsContent } from "@/components/player-stats-content"
import { useGameAnalytics } from "@/stores/hooks"
import { useAppStore } from "@/stores/app.store"
import { useTranslation } from "@/lib/i18n/context"

interface PlayerStatsModalProps {
  playerId: string | null
  onOpenChange: (open: boolean) => void
}

export function PlayerStatsModal({
  playerId,
  onOpenChange,
}: PlayerStatsModalProps) {
  const { t } = useTranslation()
  const analytics = useGameAnalytics()
  const game = useAppStore((state) => state.game)
  const config = useAppStore((state) => state.config)

  const player =
    playerId && analytics
      ? analytics.players.find((entry) => entry.playerId === playerId)
      : undefined

  const open = playerId !== null && Boolean(player && game)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false)
      }}
    >
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("players.seeStats")}</DialogTitle>
        </DialogHeader>
        {player && game ? (
          <PlayerStatsContent
            player={player}
            game={game}
            config={config}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

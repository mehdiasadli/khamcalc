"use client"

import type { TGameAchievement } from "@/schemas/achievement.schema"

import { Badge } from "@/components/ui/badge"
import { getAchievementDisplay } from "@/lib/achievement-display"
import { getAchievementLabel } from "@/lib/i18n/helpers"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface PlayerAchievementBadgesProps {
  achievements: TGameAchievement[]
  className?: string
  compact?: boolean
}

export function PlayerAchievementBadges({
  achievements,
  className,
  compact = false,
}: PlayerAchievementBadgesProps) {
  const { t } = useTranslation()

  if (achievements.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {achievements.map((achievement) => {
        const display = getAchievementDisplay(achievement.type)

        return (
          <Badge
            key={`${achievement.type}-${achievement.playerId}`}
            variant="outline"
            className={cn(
              "font-medium",
              compact && "h-5 px-1.5 text-[10px]",
              display.className
            )}
          >
            {getAchievementLabel(
              t,
              achievement.type,
              achievement.count,
              display.emoji
            )}
          </Badge>
        )
      })}
    </div>
  )
}

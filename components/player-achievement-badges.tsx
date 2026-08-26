import type { TGameAchievement } from "@/schemas/achievement.schema"

import { Badge } from "@/components/ui/badge"
import {
  formatAchievementLabel,
  getAchievementDisplay,
} from "@/lib/achievement-display"
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
            {formatAchievementLabel(achievement.type, achievement.count)}
          </Badge>
        )
      })}
    </div>
  )
}

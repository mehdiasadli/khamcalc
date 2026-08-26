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
}

export function PlayerAchievementBadges({
  achievements,
  className,
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
            className={cn("font-medium", display.className)}
          >
            {formatAchievementLabel(achievement.type, achievement.count)}
          </Badge>
        )
      })}
    </div>
  )
}

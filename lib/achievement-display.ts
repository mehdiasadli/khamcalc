import type {
  TAchievementType,
  TGameAchievement,
} from "@/schemas/achievement.schema"

export interface TAchievementDisplay {
  emoji: string
  label: string
  className: string
}

export const ACHIEVEMENT_DISPLAY: Record<TAchievementType, TAchievementDisplay> =
  {
    ace: {
      emoji: "🎯",
      label: "Ace",
      className:
        "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-200",
    },
  }

export function formatAchievementLabel(
  type: TAchievementType,
  count: number
): string {
  const { emoji, label } = ACHIEVEMENT_DISPLAY[type]

  if (count > 1) {
    return `${emoji} ${label} ×${count}`
  }

  return `${emoji} ${label}`
}

export function getAchievementDisplay(type: TAchievementType): TAchievementDisplay {
  return ACHIEVEMENT_DISPLAY[type]
}

export function groupAchievementsByPlayer(
  achievements: TGameAchievement[]
): Map<string, TGameAchievement[]> {
  const grouped = new Map<string, TGameAchievement[]>()

  for (const achievement of achievements) {
    const existing = grouped.get(achievement.playerId) ?? []
    grouped.set(achievement.playerId, [...existing, achievement])
  }

  return grouped
}

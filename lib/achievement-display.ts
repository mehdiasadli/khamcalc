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
    abyss: {
      emoji: "🕳️",
      label: "Abyss",
      className:
        "border-violet-500/30 bg-violet-500/12 text-violet-900 dark:text-violet-200",
    },
    ghost: {
      emoji: "👻",
      label: "Ghost",
      className:
        "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-200",
    },
    masterclass: {
      emoji: "🎓",
      label: "Masterclass",
      className:
        "border-sky-500/30 bg-sky-500/12 text-sky-900 dark:text-sky-100",
    },
    catastrophe: {
      emoji: "💥",
      label: "Catastrophe",
      className:
        "border-rose-500/30 bg-rose-500/12 text-rose-900 dark:text-rose-100",
    },
  }

export const ACHIEVEMENT_DISPLAY_ORDER: TAchievementType[] = [
  "ace",
  "abyss",
  "ghost",
  "masterclass",
  "catastrophe",
]

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

export function sortAchievements(
  achievements: TGameAchievement[]
): TGameAchievement[] {
  return [...achievements].sort((a, b) => {
    const orderDelta =
      ACHIEVEMENT_DISPLAY_ORDER.indexOf(a.type) -
      ACHIEVEMENT_DISPLAY_ORDER.indexOf(b.type)

    if (orderDelta !== 0) {
      return orderDelta
    }

    return a.earnedAtRound - b.earnedAtRound
  })
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

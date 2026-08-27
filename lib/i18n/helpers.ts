import type { TConfigPresetName } from "@/lib/config-presets"
import type { TGameConfig } from "@/schemas/config.schema"
import { configMatches, detectPresetKey } from "@/lib/config"
import type { Translator } from "@/lib/i18n/translate"
import { getPresetLabel } from "@/lib/i18n/presets"

export { detectPresetKey }

export function getLocalizedPresetName(
  config: TGameConfig,
  t: Translator
): string {
  return getPresetLabel(t, detectPresetKey(config))
}

export function formatConfigValue(
  value: number | null,
  t: Translator
): string {
  return value === null ? t("common.noLimit") : String(value)
}

export function getShareTargets(t: Translator) {
  return [
    {
      id: "whatsapp" as const,
      label: t("share.whatsapp"),
      description: t("share.whatsappDesc"),
    },
    {
      id: "telegram" as const,
      label: t("share.telegram"),
      description: t("share.telegramDesc"),
    },
    {
      id: "twitter" as const,
      label: t("share.twitter"),
      description: t("share.twitterDesc"),
    },
    {
      id: "copy" as const,
      label: t("share.copySummary"),
      description: t("share.copySummaryDesc"),
      copiesOnly: true as const,
    },
  ]
}

export type TLocalizedShareTarget = ReturnType<typeof getShareTargets>[number]

export function getAchievementLabel(
  t: Translator,
  type: keyof typeof import("@/lib/i18n/messages/en").en.achievements,
  count: number,
  emoji: string
): string {
  const label = t(`achievements.${type}`)

  if (count > 1) {
    return `${emoji} ${label} ×${count}`
  }

  return `${emoji} ${label}`
}

export type { TConfigPresetName }

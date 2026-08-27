import type { TConfigPresetName } from "@/lib/config-presets"
import type { Translator } from "@/lib/i18n/translate"

export function getPresetLabel(
  t: Translator,
  presetKey: TConfigPresetName | null
): string {
  if (!presetKey) {
    return t("common.custom")
  }

  return t(`presets.${presetKey}.name`)
}

export function getPresetDescription(
  t: Translator,
  presetKey: TConfigPresetName | null
): string | null {
  if (!presetKey) {
    return null
  }

  return t(`presets.${presetKey}.description`)
}

import {
  formatDuration as formatDateFnsDuration,
  intervalToDuration,
} from "date-fns"
import { az, enUS, ru } from "date-fns/locale"

import type { TLocale } from "@/schemas/locale.schema"

const DATE_FNS_LOCALES = {
  en: enUS,
  az,
  ru,
} as const

export function formatElapsedDuration(
  ms: number | null,
  locale: TLocale
): string {
  if (ms === null || ms < 0) return "—"

  if (ms < 60_000) {
    return locale === "ru" ? "<1 мин" : locale === "az" ? "<1 dəq" : "<1m"
  }

  const duration = intervalToDuration({ start: 0, end: ms })
  const formatted = formatDateFnsDuration(duration, {
    locale: DATE_FNS_LOCALES[locale],
    format: duration.hours ? ["hours", "minutes"] : ["minutes"],
  })

  return formatted.length > 0 ? formatted : "—"
}

export function formatPercent(value: number | null, locale: TLocale): string {
  if (value === null) return "—"

  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDecimal(
  value: number,
  locale: TLocale,
  digits = 1
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

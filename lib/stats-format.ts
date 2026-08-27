import {
  formatDecimal as formatDecimalValue,
  formatElapsedDuration,
  formatPercent as formatPercentValue,
} from "@/lib/i18n/format"
import type { TLocale } from "@/schemas/locale.schema"

const DEFAULT_LOCALE: TLocale = "en"

export function formatDuration(ms: number | null): string {
  return formatElapsedDuration(ms, DEFAULT_LOCALE)
}

export function formatPercent(value: number | null): string {
  return formatPercentValue(value, DEFAULT_LOCALE)
}

export function formatDecimal(value: number, digits = 1): string {
  return formatDecimalValue(value, DEFAULT_LOCALE, digits)
}

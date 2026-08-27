"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"

import {
  formatDecimal as formatDecimalValue,
  formatElapsedDuration,
  formatPercent as formatPercentValue,
} from "@/lib/i18n/format"
import { createTranslator, type Translator } from "@/lib/i18n/translate"
import type { TLocale } from "@/schemas/locale.schema"
import { useAppStore } from "@/stores"

interface I18nContextValue {
  locale: TLocale
  t: Translator
  formatDuration: (ms: number | null) => string
  formatPercent: (value: number | null) => string
  formatDecimal: (value: number, digits?: number) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useAppStore((state) => state.hostPreferences.locale)
  const t = useMemo(() => createTranslator(locale), [locale])

  const formatDuration = useCallback(
    (ms: number | null) => formatElapsedDuration(ms, locale),
    [locale]
  )

  const formatPercent = useCallback(
    (value: number | null) => formatPercentValue(value, locale),
    [locale]
  )

  const formatDecimal = useCallback(
    (value: number, digits = 1) => formatDecimalValue(value, locale, digits),
    [locale]
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      t,
      formatDuration,
      formatPercent,
      formatDecimal,
    }),
    [locale, t, formatDuration, formatPercent, formatDecimal]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }

  return context
}

export function useTranslation() {
  const { t, locale } = useI18n()
  return { t, locale }
}

export function useFormat() {
  const { formatDuration, formatPercent, formatDecimal, locale } = useI18n()
  return { formatDuration, formatPercent, formatDecimal, locale }
}

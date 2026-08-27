import z from "zod"

export const LOCALES = ["en", "az", "ru"] as const

export const LocaleSchema = z.enum(LOCALES)

export type TLocale = z.infer<typeof LocaleSchema>

export const defaultLocale: TLocale = "en"

export const LOCALE_LABELS: Record<TLocale, string> = {
  en: "English",
  az: "Azərbaycan",
  ru: "Русский",
}

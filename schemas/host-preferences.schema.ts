import z from "zod"

import { LocaleSchema, defaultLocale } from "@/schemas/locale.schema"

export const HostPreferencesSchema = z.object({
  soundsEnabled: z.boolean(),
  hapticsEnabled: z.boolean(),
  locale: LocaleSchema,
})

export type THostPreferences = z.infer<typeof HostPreferencesSchema>

export const UpdateHostPreferencesSchema = HostPreferencesSchema.partial()

export type TUpdateHostPreferences = z.infer<typeof UpdateHostPreferencesSchema>

export const defaultHostPreferences: THostPreferences = {
  soundsEnabled: false,
  hapticsEnabled: false,
  locale: defaultLocale,
}

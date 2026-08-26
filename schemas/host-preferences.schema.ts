import z from "zod"

export const HostPreferencesSchema = z.object({
  soundsEnabled: z.boolean(),
  hapticsEnabled: z.boolean(),
})

export type THostPreferences = z.infer<typeof HostPreferencesSchema>

export const UpdateHostPreferencesSchema = HostPreferencesSchema.partial()

export type TUpdateHostPreferences = z.infer<typeof UpdateHostPreferencesSchema>

export const defaultHostPreferences: THostPreferences = {
  soundsEnabled: false,
  hapticsEnabled: false,
}

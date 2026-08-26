import z from "zod"

export const PlayerNameSchema = z
  .string("Name is required")
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(20, "Name must be less than 20 characters")
  .transform((name) => name[0].toUpperCase() + name.slice(1))

export const PlayerSchema = z.object({
  id: z.uuid("Invalid player id"),
  name: PlayerNameSchema,
  removedAt: z.iso.datetime().nullable().default(null),
})

export const AddPlayerSchema = z.object({
  name: PlayerNameSchema,
})

export const UpdatePlayerSchema = z.object({
  id: z.uuid("Invalid player id"),
  name: PlayerNameSchema,
})

export const RemovePlayerSchema = z.object({
  id: z.uuid("Invalid player id"),
})

export type TPlayer = z.infer<typeof PlayerSchema>
export type TAddPlayer = z.infer<typeof AddPlayerSchema>
export type TUpdatePlayer = z.infer<typeof UpdatePlayerSchema>
export type TRemovePlayer = z.infer<typeof RemovePlayerSchema>

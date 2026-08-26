export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 15

export function isDuplicatePlayerName(
  players: Array<{ id: string; name: string }>,
  name: string,
  excludeId?: string
): boolean {
  const normalized = name.trim().toLowerCase()

  return players.some(
    (player) =>
      player.id !== excludeId && player.name.toLowerCase() === normalized
  )
}

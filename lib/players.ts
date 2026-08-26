import type { TPlayer } from "@/schemas/player.schema"

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

export function getActivePlayers(players: TPlayer[]): TPlayer[] {
  return players.filter((player) => !player.removedAt)
}

export function getActivePlayerCount(players: TPlayer[]): number {
  return getActivePlayers(players).length
}

export function getOrderedActivePlayers(
  players: TPlayer[],
  playerOrder: string[]
): TPlayer[] {
  const active = getActivePlayers(players)

  if (playerOrder.length === 0) {
    return active
  }

  const byId = new Map(active.map((player) => [player.id, player]))
  const ordered: TPlayer[] = []
  const seen = new Set<string>()

  for (const id of playerOrder) {
    const player = byId.get(id)

    if (player) {
      ordered.push(player)
      seen.add(id)
    }
  }

  for (const player of active) {
    if (!seen.has(player.id)) {
      ordered.push(player)
    }
  }

  return ordered
}

export function getActivePlayerIds(
  players: TPlayer[],
  playerOrder: string[]
): string[] {
  return getOrderedActivePlayers(players, playerOrder).map((player) => player.id)
}

export function reorderPlayerIds(
  playerIds: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= playerIds.length ||
    toIndex >= playerIds.length ||
    fromIndex === toIndex
  ) {
    return playerIds
  }

  const next = [...playerIds]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)

  return next
}

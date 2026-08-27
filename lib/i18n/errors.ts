import type { Translator } from "@/lib/i18n/translate"

const STORE_ERROR_KEYS: Record<string, string> = {
  "A player with this name already exists": "errors.duplicatePlayer",
  "No active game session": "errors.noActiveGame",
  "Game is finished": "errors.gameFinished",
  "Player not found": "errors.playerNotFound",
  "Correct player cannot be marked wrong": "errors.correctCannotWrong",
  "Player is disabled for this question": "errors.playerDisabled",
  "No answers on this question": "errors.noAnswers",
  "Player is not marked correct on this question": "errors.notMarkedCorrect",
}

export function translateStoreError(message: string, t: Translator): string {
  if (STORE_ERROR_KEYS[message]) {
    return t(STORE_ERROR_KEYS[message])
  }

  const maxPlayersMatch = message.match(/^Maximum (\d+) players allowed$/)
  if (maxPlayersMatch) {
    return t("errors.maxPlayers", { count: maxPlayersMatch[1] })
  }

  const minPlayersMatch = message.match(/^Add at least (\d+) player before starting$/)
  if (minPlayersMatch) {
    return t("errors.minPlayersStart", { count: minPlayersMatch[1] })
  }

  return message
}

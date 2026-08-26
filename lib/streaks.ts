import type { TQuestionRecord } from "@/schemas/game.schema"

function sortQuestions(questions: TQuestionRecord[]): TQuestionRecord[] {
  return [...questions].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round
    return a.question - b.question
  })
}

export function getCurrentCorrectStreak(
  playerId: string,
  questions: TQuestionRecord[]
): number {
  const sorted = sortQuestions(questions)
  let streak = 0

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const record = sorted[index]

    if (record.correctPlayerId === playerId) {
      streak += 1
      continue
    }

    if (
      record.wrongPlayerIds.includes(playerId) ||
      record.correctPlayerId !== null
    ) {
      break
    }
  }

  return streak
}

export function getLongestCorrectStreak(
  playerId: string,
  questions: TQuestionRecord[]
): number {
  let current = 0
  let longest = 0

  for (const record of sortQuestions(questions)) {
    if (record.correctPlayerId === playerId) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }

  return longest
}

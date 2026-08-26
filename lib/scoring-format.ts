export function formatScore(score: number): string {
  return new Intl.NumberFormat("en-US", {
    signDisplay: score < 0 ? "exceptZero" : "auto",
  }).format(score)
}

export function formatPointDelta(points: number): string {
  const absolute = Math.abs(points)

  if (points > 0) {
    return `+${formatScore(points)}`
  }

  if (points < 0) {
    return `−${formatScore(absolute)}`
  }

  return formatScore(0)
}

export function formatWrongDeductionLabel(
  mode: "none" | "question_value" | "fixed",
  fixedAmount: number
): string {
  switch (mode) {
    case "none":
      return "No deduction"
    case "question_value":
      return "Same as question value"
    case "fixed":
      return `${fixedAmount} pts per wrong`
  }
}

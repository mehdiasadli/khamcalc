import { prefersReducedMotion, supportsVibration } from "@/lib/feedback/environment"

export type HostFeedbackEvent = "correct" | "incorrect" | "undo"

const patterns: Record<HostFeedbackEvent, number | number[]> = {
  correct: 12,
  incorrect: [10, 35, 10],
  undo: 8,
}

export function playHaptic(event: HostFeedbackEvent) {
  if (!supportsVibration() || prefersReducedMotion()) {
    return
  }

  navigator.vibrate(patterns[event])
}

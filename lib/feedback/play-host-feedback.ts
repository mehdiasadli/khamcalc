import type { HostFeedbackEvent } from "@/lib/feedback/haptics"
import { playHaptic } from "@/lib/feedback/haptics"
import { playSound } from "@/lib/feedback/sounds"
import { prefersReducedMotion } from "@/lib/feedback/environment"
import type { THostPreferences } from "@/schemas/host-preferences.schema"

export function getEffectiveHostPreferences(
  preferences: THostPreferences
): THostPreferences {
  if (prefersReducedMotion()) {
    return {
      ...preferences,
      soundsEnabled: false,
      hapticsEnabled: false,
    }
  }

  return preferences
}

export function playHostFeedback(
  event: HostFeedbackEvent,
  preferences: THostPreferences
) {
  const effective = getEffectiveHostPreferences(preferences)

  if (effective.hapticsEnabled) {
    playHaptic(event)
  }

  if (effective.soundsEnabled) {
    playSound(event)
  }
}

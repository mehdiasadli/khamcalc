export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function supportsVibration() {
  return typeof navigator !== "undefined" && "vibrate" in navigator
}

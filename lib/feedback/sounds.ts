import { prefersReducedMotion } from "@/lib/feedback/environment"
import type { HostFeedbackEvent } from "@/lib/feedback/haptics"

let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === "undefined") {
    return null
  }

  if (!audioContext) {
    audioContext = new AudioContext()
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume()
  }

  return audioContext
}

function playTone({
  frequency,
  duration,
  type,
  volume,
}: {
  frequency: number
  duration: number
  type: OscillatorType
  volume: number
}) {
  const context = getAudioContext()

  if (!context) {
    return
  }

  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = volume
  oscillator.connect(gain)
  gain.connect(context.destination)

  const endTime = context.currentTime + duration

  oscillator.start()
  gain.gain.exponentialRampToValueAtTime(0.001, endTime)
  oscillator.stop(endTime)
}

export function playSound(event: HostFeedbackEvent) {
  if (prefersReducedMotion()) {
    return
  }

  switch (event) {
    case "correct":
      playTone({
        frequency: 880,
        duration: 0.08,
        type: "sine",
        volume: 0.07,
      })
      break
    case "incorrect":
      playTone({
        frequency: 220,
        duration: 0.12,
        type: "triangle",
        volume: 0.05,
      })
      break
    case "undo":
      playTone({
        frequency: 440,
        duration: 0.06,
        type: "sine",
        volume: 0.045,
      })
      break
  }
}

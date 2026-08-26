"use client"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { prefersReducedMotion } from "@/lib/feedback/environment"
import { useAppStore } from "@/stores"
import { SmartphoneIcon, Volume2Icon } from "lucide-react"
import { useSyncExternalStore } from "react"

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => undefined
      }

      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      mediaQuery.addEventListener("change", onStoreChange)

      return () => mediaQuery.removeEventListener("change", onStoreChange)
    },
    () => prefersReducedMotion(),
    () => false
  )
}

export function HostFeedbackSettings() {
  const preferences = useAppStore((state) => state.hostPreferences)
  const setHostPreferences = useAppStore((state) => state.setHostPreferences)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <FieldGroup>
      <Field>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <FieldLabel htmlFor="host-sounds" className="inline-flex items-center gap-2">
              <Volume2Icon className="size-4 text-muted-foreground" />
              Sounds
            </FieldLabel>
            <FieldDescription>
              Short cues when you mark answers correct, incorrect, or undo them.
            </FieldDescription>
          </div>
          <Switch
            id="host-sounds"
            checked={preferences.soundsEnabled}
            disabled={reducedMotion}
            onCheckedChange={(soundsEnabled) =>
              setHostPreferences({ soundsEnabled })
            }
          />
        </div>
      </Field>

      <Field>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <FieldLabel
              htmlFor="host-haptics"
              className="inline-flex items-center gap-2"
            >
              <SmartphoneIcon className="size-4 text-muted-foreground" />
              Vibrations
            </FieldLabel>
            <FieldDescription>
              Quick haptic taps on supported phones while you host.
            </FieldDescription>
          </div>
          <Switch
            id="host-haptics"
            checked={preferences.hapticsEnabled}
            disabled={reducedMotion}
            onCheckedChange={(hapticsEnabled) =>
              setHostPreferences({ hapticsEnabled })
            }
          />
        </div>
      </Field>

      {reducedMotion ? (
        <p className="text-xs text-muted-foreground">
          Reduced motion is enabled on this device, so sounds and vibrations stay
          off.
        </p>
      ) : null}
    </FieldGroup>
  )
}

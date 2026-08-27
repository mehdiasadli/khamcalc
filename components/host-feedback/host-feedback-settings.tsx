"use client"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { prefersReducedMotion } from "@/lib/feedback/environment"
import { useTranslation } from "@/lib/i18n/context"
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
  const { t } = useTranslation()
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
              {t("hostFeedback.sounds")}
            </FieldLabel>
            <FieldDescription>{t("hostFeedback.soundsHintLong")}</FieldDescription>
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
              {t("hostFeedback.haptics")}
            </FieldLabel>
            <FieldDescription>{t("hostFeedback.hapticsHintLong")}</FieldDescription>
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
          {t("hostFeedback.reducedMotionOff")}
        </p>
      ) : null}
    </FieldGroup>
  )
}

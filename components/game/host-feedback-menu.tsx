"use client"

import { HostFeedbackSettings } from "@/components/host-feedback/host-feedback-settings"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/i18n/context"
import { useAppStore } from "@/stores"
import { Volume2Icon } from "lucide-react"

export function HostFeedbackMenu() {
  const { t } = useTranslation()
  const preferences = useAppStore((state) => state.hostPreferences)
  const active = preferences.soundsEnabled || preferences.hapticsEnabled

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={t("hostFeedback.menu")}
          />
        }
      >
        <Volume2Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-0 pb-2">
            {t("hostFeedback.title")}
          </DropdownMenuLabel>
          <HostFeedbackSettings />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

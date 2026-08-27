"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HostFeedbackSettings } from "@/components/host-feedback/host-feedback-settings"
import { useTranslation } from "@/lib/i18n/context"

export function HostFeedbackSection() {
  const { t } = useTranslation()

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("hostFeedback.title")}</CardTitle>
        <CardDescription>{t("setup.hostFeedbackHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <HostFeedbackSettings />
      </CardContent>
    </Card>
  )
}

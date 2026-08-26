"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HostFeedbackSettings } from "@/components/host-feedback/host-feedback-settings"

export function HostFeedbackSection() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Host feedback</CardTitle>
        <CardDescription>
          Optional sounds and vibrations while you score. Both stay off until you
          turn them on.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HostFeedbackSettings />
      </CardContent>
    </Card>
  )
}

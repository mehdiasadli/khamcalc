"use client"

import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"
import { PWA_APP_NAME } from "@/lib/pwa/constants"
import { cn } from "@/lib/utils"

export default function OfflinePage() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg items-center px-4 py-8">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="text-4xl" aria-hidden>
            📡
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">{t("offline.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("offline.body", { appName: PWA_APP_NAME })}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => window.location.reload()}>
              {t("common.retry")}
            </Button>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              {t("common.openSetup")}
            </Link>
            <Link
              href="/game"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {t("common.openGame")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

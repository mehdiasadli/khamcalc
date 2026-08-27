"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LOCALE_LABELS, LOCALES, type TLocale } from "@/schemas/locale.schema"
import { useTranslation } from "@/lib/i18n/context"
import { useAppStore } from "@/stores"
import { cn } from "@/lib/utils"

export function LanguagePicker() {
  const { t } = useTranslation()
  const locale = useAppStore((state) => state.hostPreferences.locale)
  const setHostPreferences = useAppStore((state) => state.setHostPreferences)

  function handleSelect(nextLocale: TLocale) {
    setHostPreferences({ locale: nextLocale })
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("setup.language")}</CardTitle>
        <CardDescription>{t("setup.languageHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <Button
              key={code}
              type="button"
              size="sm"
              variant={locale === code ? "default" : "outline"}
              onClick={() => handleSelect(code)}
              className={cn(locale === code && "pointer-events-none")}
            >
              {LOCALE_LABELS[code]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

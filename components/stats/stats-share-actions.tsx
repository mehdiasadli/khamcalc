"use client"

import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  copyShareText,
  getShareHref,
  buildTelegramShareUrl,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  type TShareTarget,
} from "@/lib/share"
import { getShareTargets } from "@/lib/i18n/helpers"
import { useTranslation } from "@/lib/i18n/context"
import { Share2Icon } from "lucide-react"

interface StatsShareActionsProps {
  summary: string
}

function toShareTarget(
  target: ReturnType<typeof getShareTargets>[number]
): TShareTarget {
  const hrefById = {
    whatsapp: buildWhatsAppShareUrl,
    telegram: buildTelegramShareUrl,
    twitter: buildTwitterShareUrl,
  } as const

  return {
    id: target.id,
    label: target.label,
    description: target.description,
    href: target.id in hrefById ? hrefById[target.id as keyof typeof hrefById] : undefined,
    copiesOnly: target.copiesOnly,
  }
}

export function StatsShareActions({ summary }: StatsShareActionsProps) {
  const { t } = useTranslation()
  const shareTargets = useMemo(() => getShareTargets(t).map(toShareTarget), [t])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [copyLabel, setCopyLabel] = useState(t("common.copy"))

  const handleCopy = useCallback(async () => {
    const copied = await copyShareText(summary)
    setCopyLabel(copied ? t("common.copied") : t("common.copyFailed"))

    window.setTimeout(() => {
      setCopyLabel(t("common.copy"))
    }, 2000)
  }, [summary, t])

  async function handleTargetClick(target: TShareTarget) {
    if (target.copiesOnly) {
      await handleCopy()
      if (target.id === "copy") {
        setSheetOpen(false)
      }
      return
    }

    const href = getShareHref(target, summary)
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer")
      setSheetOpen(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("stats.shareSummary")}
        onClick={() => setSheetOpen(true)}
      >
        <Share2Icon />
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("stats.shareSheetTitle")}</SheetTitle>
            <SheetDescription>{t("stats.shareSheetDescription")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 px-6 pb-6">
            {shareTargets.map((target) => (
              <Button
                key={target.id}
                type="button"
                variant={target.id === "copy" ? "default" : "outline"}
                className="h-auto flex-col items-start gap-1 py-3"
                onClick={() => void handleTargetClick(target)}
              >
                <span>{target.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {target.id === "copy" && copyLabel !== t("common.copy")
                    ? copyLabel
                    : target.description}
                </span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

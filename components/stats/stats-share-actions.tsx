"use client"

import { useCallback, useState } from "react"

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
  SHARE_TARGETS,
  type TShareTarget,
} from "@/lib/share"
import {
  ClipboardCopyIcon,
  Share2Icon,
} from "lucide-react"

interface StatsShareActionsProps {
  summary: string
}

export function StatsShareActions({ summary }: StatsShareActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [copyLabel, setCopyLabel] = useState("Copy")

  const handleCopy = useCallback(async () => {
    const copied = await copyShareText(summary)
    setCopyLabel(copied ? "Copied!" : "Copy failed")

    window.setTimeout(() => {
      setCopyLabel("Copy")
    }, 2000)
  }, [summary])

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
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copyLabel === "Copy" ? "Copy summary" : copyLabel}
          onClick={() => void handleCopy()}
        >
          <ClipboardCopyIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Share summary"
          onClick={() => setSheetOpen(true)}
        >
          <Share2Icon />
        </Button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Share game summary</SheetTitle>
            <SheetDescription>
              Send scores and stats to your group chat.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 px-6 pb-6">
            {SHARE_TARGETS.map((target) => (
              <Button
                key={target.id}
                type="button"
                variant={target.id === "copy" ? "default" : "outline"}
                className="h-auto flex-col items-start gap-1 py-3"
                onClick={() => void handleTargetClick(target)}
              >
                <span>{target.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {target.id === "copy" && copyLabel !== "Copy"
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

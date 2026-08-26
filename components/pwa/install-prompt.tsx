"use client"

import { DownloadIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { PWA_APP_NAME } from "@/lib/pwa/constants"

const DISMISS_KEY = "khamcalc-pwa-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandaloneDisplayMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  )
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandaloneDisplayMode()) {
      return
    }

    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      return
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
      setVisible(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) {
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setVisible(false)
    }

    setDeferredPrompt(null)
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible || !deferredPrompt) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Install {PWA_APP_NAME}</p>
          <p className="text-xs text-muted-foreground">
            Add to your home screen for quick access while hosting.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" size="sm" onClick={handleInstall}>
            <DownloadIcon data-icon="inline-start" />
            Install
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Dismiss install prompt"
            onClick={handleDismiss}
          >
            <XIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

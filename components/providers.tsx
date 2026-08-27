"use client"

import { PwaInstallPrompt } from "@/components/pwa/install-prompt"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/lib/i18n/context"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <I18nProvider>
        <ThemeProvider>
          {children}
          <PwaInstallPrompt />
        </ThemeProvider>
      </I18nProvider>
    </NuqsAdapter>
  )
}

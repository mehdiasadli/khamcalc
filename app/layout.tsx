import { Geist_Mono, Montserrat } from "next/font/google"
import type { Metadata, Viewport } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { PwaInstallPrompt } from "@/components/pwa/install-prompt"
import {
  PWA_APP_DESCRIPTION,
  PWA_APP_NAME,
  PWA_ICONS,
  PWA_THEME_COLOR,
} from "@/lib/pwa/constants"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  applicationName: PWA_APP_NAME,
  title: PWA_APP_NAME,
  description: PWA_APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PWA_APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: PWA_ICONS.favicon, sizes: "32x32" },
      { url: PWA_ICONS.icon192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICONS.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: PWA_ICONS.appleTouch, sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        montserrat.variable
      )}
    >
      <body>
        <Providers>{children}</Providers>
        <PwaInstallPrompt />
      </body>
    </html>
  )
}

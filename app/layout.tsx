import { Geist_Mono, Montserrat } from "next/font/google"
import type { Viewport } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { PwaInstallPrompt } from "@/components/pwa/install-prompt"
import { createRootMetadata, rootViewport } from "@/lib/seo/metadata"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = createRootMetadata()

export const viewport: Viewport = rootViewport

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

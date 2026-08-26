import { Geist_Mono, Montserrat } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import { Metadata } from "next"
import { Providers } from "@/components/providers"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "KhamCalc",
  description:
    "Point calculator for trivia games such as Khamsa, Brain Ring, and more.",
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
      </body>
    </html>
  )
}

"use client"

import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PWA_APP_NAME } from "@/lib/pwa/constants"
import { cn } from "@/lib/utils"

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg items-center px-4 py-8">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="text-4xl" aria-hidden>
            📡
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">You&apos;re offline</h1>
            <p className="text-sm text-muted-foreground">
              {PWA_APP_NAME} can keep scoring after the first load. Reconnect to
              refresh the app shell, or continue with your saved game.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Open setup
            </Link>
            <Link
              href="/game"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Open game
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

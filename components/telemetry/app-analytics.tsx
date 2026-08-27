"use client"

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

import { getGaMeasurementId } from "@/lib/telemetry/constants"

function AnalyticsPageViewInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const gaId = getGaMeasurementId()

  useEffect(() => {
    if (!gaId) return

    const query = searchParams.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    sendGAEvent("config", gaId, { page_path: pagePath })
  }, [gaId, pathname, searchParams])

  return null
}

function AnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageViewInner />
    </Suspense>
  )
}

export function AppAnalytics() {
  const gaId = getGaMeasurementId()

  if (!gaId) {
    return null
  }

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      <AnalyticsPageView />
    </>
  )
}

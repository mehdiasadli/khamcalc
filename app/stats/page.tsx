import type { Metadata } from "next"
import { Suspense } from "react"

import { StatsPageContent } from "@/components/stats/stats-page-content"
import { createPageMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = createPageMetadata("stats")

export default function StatsPage() {
  return (
    <Suspense fallback={null}>
      <StatsPageContent />
    </Suspense>
  )
}

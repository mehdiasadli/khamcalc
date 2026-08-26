import { Suspense } from "react"

import { StatsPageContent } from "@/components/stats/stats-page-content"

export default function StatsPage() {
  return (
    <Suspense fallback={null}>
      <StatsPageContent />
    </Suspense>
  )
}

import { SetupPage } from "@/components/setup/setup-page"
import { createPageMetadata } from "@/lib/seo/metadata"

export const metadata = createPageMetadata("setup")

export default function Page() {
  return <SetupPage />
}

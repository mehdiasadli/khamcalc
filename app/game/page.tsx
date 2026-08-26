import { GamePageContent } from "@/components/game/game-page-content"
import { createPageMetadata } from "@/lib/seo/metadata"

export const metadata = createPageMetadata("game")

export default function GamePage() {
  return <GamePageContent />
}

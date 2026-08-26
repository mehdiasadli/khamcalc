import { PlayerCardList } from "@/components/player-card-list"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Round 2 · Question 4
        </p>
        <h1 className="font-heading text-xl font-medium">Players</h1>
      </header>

      <PlayerCardList />
    </main>
  )
}

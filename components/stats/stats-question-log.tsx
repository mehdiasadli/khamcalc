"use client"

import type { TGameAnalytics } from "@/lib/analytics"
import type { TPlayer } from "@/schemas/player.schema"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/context"

interface StatsQuestionLogProps {
  analytics: TGameAnalytics
  players: TPlayer[]
}

export function StatsQuestionLog({
  analytics,
  players,
}: StatsQuestionLogProps) {
  const { t } = useTranslation()
  const { questionLog } = analytics

  function getPlayerName(playerId: string | null) {
    if (!playerId) return "—"
    return (
      players.find((player) => player.id === playerId)?.name ?? t("common.unknown")
    )
  }

  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>{t("stats.questionLog")}</CardTitle>
        <CardDescription>
          {questionLog.length} {t("stats.questions").toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {questionLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("stats.questionLogEmpty")}
          </p>
        ) : (
          questionLog.map((entry) => (
            <details
              key={`${entry.round}:${entry.question}`}
              className="group rounded-2xl border border-border/60 px-3 py-2"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm marker:content-none">
                <span className="font-mono text-xs text-muted-foreground">
                  {t("common.roundShort", { round: entry.round })} ·{" "}
                  {t("common.questionShort", { question: entry.question })}
                </span>
                <span
                  className={cn(
                    "truncate text-right",
                    entry.skipped && "text-muted-foreground"
                  )}
                >
                  {entry.skipped
                    ? t("common.skipped")
                    : entry.correctPlayerId
                      ? getPlayerName(entry.correctPlayerId)
                      : t("common.unanswered")}
                </span>
              </summary>
              <div className="mt-2 flex flex-col gap-1 border-t border-border/60 pt-2 text-sm">
                {entry.skipped ? (
                  <p className="text-muted-foreground">{t("stats.hostSkipped")}</p>
                ) : (
                  <>
                    <p>
                      {t("stats.correctLabel")}{" "}
                      {entry.correctPlayerId
                        ? getPlayerName(entry.correctPlayerId)
                        : "—"}
                    </p>
                    <p className="text-muted-foreground">
                      {t("stats.incorrectLabel")}{" "}
                      {entry.wrongPlayerIds.length > 0
                        ? entry.wrongPlayerIds
                            .map((id) => getPlayerName(id))
                            .join(", ")
                        : "—"}
                    </p>
                  </>
                )}
              </div>
            </details>
          ))
        )}
      </CardContent>
    </Card>
  )
}

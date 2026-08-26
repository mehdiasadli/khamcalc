"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatScore } from "@/lib/scoring-format"
import type { TGameAchievement } from "@/schemas/achievement.schema"
import type { TPlayerAnswerStats } from "@/lib/player-answer-stats"
import { PlayerAchievementBadges } from "@/components/player-achievement-badges"
import { PlayerAnswerStats } from "@/components/player-answer-stats"
import { PlayerRoundSticks } from "@/components/player-round-sticks"
import type { TRoundStickState } from "@/lib/round-sticks"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

export type PlayerCardStatus = "idle" | "correct" | "wrong" | "disabled"

export interface PlayerCardProps {
  name: string
  score: number
  rank?: number
  status?: PlayerCardStatus
  isLeader?: boolean
  achievements?: TGameAchievement[]
  correctStreak?: number
  answerStats?: TPlayerAnswerStats
  roundSticks?: TRoundStickState[] | null
  dragHandle?: React.ReactNode
  isDragging?: boolean
  onCorrect?: () => void
  onIncorrect?: () => void
  onRename?: () => void
  onRemove?: () => void
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const statusStyles: Record<PlayerCardStatus, string> = {
  idle: "ring-foreground/5",
  correct: "ring-primary/40 bg-primary/5",
  wrong: "ring-destructive/30 bg-destructive/5",
  disabled: "opacity-55 ring-foreground/5",
}

function PlayerNameLine({
  name,
  correctStreak,
  isWrong,
}: {
  name: string
  correctStreak: number
  isWrong: boolean
}) {
  return (
    <p
      className={cn(
        "min-w-0 truncate text-sm leading-none font-medium",
        isWrong && "text-muted-foreground line-through"
      )}
    >
      <span>{name}</span>
      {correctStreak > 0 ? (
        <>
          <span className="font-normal text-muted-foreground/55"> • </span>
          <span className="font-mono text-[11px] font-normal tracking-wide text-muted-foreground uppercase tabular-nums">
            {correctStreak} streak
          </span>
        </>
      ) : null}
    </p>
  )
}

export function PlayerCard({
  name,
  score,
  rank,
  status = "idle",
  isLeader = false,
  achievements = [],
  correctStreak = 0,
  answerStats,
  roundSticks = null,
  dragHandle,
  isDragging = false,
  onCorrect,
  onIncorrect,
  onRename,
  onRemove,
}: PlayerCardProps) {
  const isWrong = status === "wrong" || status === "disabled"
  const isCorrect = status === "correct"
  const hasActions = onCorrect || onIncorrect || onRename || onRemove
  const showSticks = Boolean(roundSticks && roundSticks.length > 0)

  return (
    <Card
      size="sm"
      className={cn(
        "overflow-hidden py-0 transition-[background-color,box-shadow,opacity]",
        statusStyles[status],
        isLeader && status === "idle" && "ring-primary/25",
        isDragging && "opacity-60 shadow-md"
      )}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-3 py-4",
          showSticks ? "pt-3.5" : undefined
        )}
      >
        {showSticks ? (
          <PlayerRoundSticks sticks={roundSticks!} className="mb-0.5" />
        ) : null}

        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {dragHandle ? (
              <div className="flex shrink-0 items-center">{dragHandle}</div>
            ) : null}

            {rank !== undefined ? (
              <span
                className={cn(
                  "w-4 shrink-0 text-center font-mono text-xs leading-none tabular-nums",
                  isLeader
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
                aria-hidden
                translate="no"
              >
                {rank}
              </span>
            ) : null}

            <Avatar size="sm" className="shrink-0">
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <PlayerNameLine
                name={name}
                correctStreak={correctStreak}
                isWrong={isWrong}
              />

              {achievements.length > 0 ? (
                <PlayerAchievementBadges achievements={achievements} compact />
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1 pl-1">
            <span
              className={cn(
                "font-mono text-xl leading-none tabular-nums",
                isLeader ? "text-primary" : "text-foreground"
              )}
              translate="no"
            >
              {formatScore(score)}
            </span>
            {answerStats ? (
              <PlayerAnswerStats stats={answerStats} className="text-right" />
            ) : null}
          </div>
        </div>

        {hasActions ? (
          <div className="flex items-center gap-1.5 border-t border-border/50 pt-3">
            {onCorrect ? (
              <Button
                type="button"
                size="xs"
                variant={isCorrect ? "default" : "outline"}
                className="flex-1"
                disabled={isWrong}
                onClick={onCorrect}
              >
                Correct
              </Button>
            ) : null}

            {onIncorrect ? (
              <Button
                type="button"
                size="xs"
                variant={isWrong ? "destructive" : "outline"}
                className="flex-1"
                disabled={isCorrect}
                onClick={onIncorrect}
              >
                Incorrect
              </Button>
            ) : null}

            {onRename || onRemove ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Actions for ${name}`}
                    />
                  }
                >
                  <MoreHorizontalIcon data-icon="inline-start" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuGroup>
                    {onRename ? (
                      <DropdownMenuItem onClick={onRename}>
                        <PencilIcon />
                        Rename
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuGroup>
                  {onRename && onRemove ? <DropdownMenuSeparator /> : null}
                  {onRemove ? (
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={onRemove}
                      >
                        <Trash2Icon />
                        Remove player
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

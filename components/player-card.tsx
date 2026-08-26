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
import type { TGameAchievement } from "@/schemas/achievement.schema"
import { PlayerAchievementBadges } from "@/components/player-achievement-badges"
import { PlayerStreakIndicator } from "@/components/player-streak-indicator"
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

function formatScore(score: number) {
  return new Intl.NumberFormat("en-US").format(score)
}

const statusStyles: Record<PlayerCardStatus, string> = {
  idle: "ring-foreground/5",
  correct: "ring-primary/40 bg-primary/5",
  wrong: "ring-destructive/30 bg-destructive/5",
  disabled: "opacity-55 ring-foreground/5",
}

export function PlayerCard({
  name,
  score,
  rank,
  status = "idle",
  isLeader = false,
  achievements = [],
  correctStreak = 0,
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

  return (
    <Card
      size="sm"
      className={cn(
        "transition-colors",
        statusStyles[status],
        isLeader && status === "idle" && "ring-primary/25",
        isDragging && "opacity-60 shadow-md"
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {dragHandle}

          {rank !== undefined ? (
            <span
              className={cn(
                "w-5 shrink-0 text-center font-mono text-xs tabular-nums",
                isLeader ? "text-primary" : "text-muted-foreground"
              )}
            >
              {rank}
            </span>
          ) : null}

          <Avatar size="sm">
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span
              className={cn(
                "truncate font-medium",
                isWrong && "text-muted-foreground line-through"
              )}
            >
              {name}
            </span>
            <PlayerAchievementBadges achievements={achievements} />
            <PlayerStreakIndicator
              streak={correctStreak}
              isHot={correctStreak >= 3 || (isCorrect && correctStreak >= 2)}
            />
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span
              className={cn(
                "font-mono text-lg leading-none tabular-nums",
                isLeader ? "text-primary" : "text-foreground"
              )}
            >
              {formatScore(score)}
            </span>
            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
              pts
            </span>
          </div>
        </div>

        {hasActions ? (
          <div className="flex items-center gap-1.5 border-t border-border/60 pt-3">
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

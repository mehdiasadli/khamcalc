"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

interface SetupPlayerItemProps {
  name: string
  onRename: () => void
  onRemove: () => void
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function SetupPlayerItem({
  name,
  onRename,
  onRemove,
}: SetupPlayerItemProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 ring-1 ring-foreground/5"
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>

      <span className="min-w-0 flex-1 truncate font-medium">{name}</span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={t("players.playerMenu")}
            />
          }
        >
          <MoreHorizontalIcon data-icon="inline-start" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onRename}>
              <PencilIcon />
              {t("players.rename")}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <Trash2Icon />
              {t("players.removePlayer")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

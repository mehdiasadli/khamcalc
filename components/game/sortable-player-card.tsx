"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { PlayerCard, type PlayerCardProps } from "@/components/player-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SortablePlayerCardProps extends PlayerCardProps {
  id: string
}

export function SortablePlayerCard({
  id,
  ...playerCardProps
}: SortablePlayerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "relative z-10")}
    >
      <PlayerCard
        {...playerCardProps}
        dragHandle={
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            aria-label={`Reorder ${playerCardProps.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon />
          </Button>
        }
        isDragging={isDragging}
      />
    </li>
  )
}

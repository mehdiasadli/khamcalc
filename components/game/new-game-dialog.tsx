"use client"

import { useState, type ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppStore } from "@/stores"

interface NewGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmed?: () => void
}

export function NewGameDialog({
  open,
  onOpenChange,
  onConfirmed,
}: NewGameDialogProps) {
  const resetGame = useAppStore((state) => state.resetGame)

  function handleConfirm() {
    resetGame()
    onConfirmed?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new game?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears the current game and scores. Player names and order are
            kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            New game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface NewGameButtonProps extends ComponentProps<typeof Button> {
  onConfirmed?: () => void
}

export function NewGameButton({
  onConfirmed,
  children = "New game",
  ...props
}: NewGameButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" {...props} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <NewGameDialog
        open={open}
        onOpenChange={setOpen}
        onConfirmed={onConfirmed}
      />
    </>
  )
}

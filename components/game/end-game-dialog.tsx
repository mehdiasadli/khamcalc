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

interface EndGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmed?: () => void
}

export function EndGameDialog({
  open,
  onOpenChange,
  onConfirmed,
}: EndGameDialogProps) {
  const finishGame = useAppStore((state) => state.finishGame)

  function handleConfirm() {
    try {
      finishGame()
      onConfirmed?.()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End game now?</AlertDialogTitle>
          <AlertDialogDescription>
            Scoring stops here. You can still review stats and share results from
            this session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep playing</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>End game</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface EndGameButtonProps extends ComponentProps<typeof Button> {
  onConfirmed?: () => void
}

export function EndGameButton({
  onConfirmed,
  children = "End game",
  ...props
}: EndGameButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" {...props} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <EndGameDialog
        open={open}
        onOpenChange={setOpen}
        onConfirmed={onConfirmed}
      />
    </>
  )
}

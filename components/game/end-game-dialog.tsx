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
import { useTranslation } from "@/lib/i18n/context"
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
  const { t } = useTranslation()
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
          <AlertDialogTitle>{t("game.endGameNowTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("game.endGameNowBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("game.keepPlaying")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {t("game.endGameAction")}
          </AlertDialogAction>
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
  children,
  ...props
}: EndGameButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" {...props} onClick={() => setOpen(true)}>
        {children ?? t("game.endGame")}
      </Button>
      <EndGameDialog
        open={open}
        onOpenChange={setOpen}
        onConfirmed={onConfirmed}
      />
    </>
  )
}

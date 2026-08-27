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
  const { t } = useTranslation()
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
          <AlertDialogTitle>{t("game.newGameTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("game.newGameBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            {t("game.newGame")}
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
  children,
  ...props
}: NewGameButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" {...props} onClick={() => setOpen(true)}>
        {children ?? t("game.newGame")}
      </Button>
      <NewGameDialog
        open={open}
        onOpenChange={setOpen}
        onConfirmed={onConfirmed}
      />
    </>
  )
}

"use client"

import { useState } from "react"

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
import {
  useAppStore,
  useCanGoPrevious,
  useCanUndoQuestion,
  useHostFeedback,
  useShouldShowFinish,
} from "@/stores"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcwIcon,
} from "lucide-react"

interface GameModerationBarProps {
  disabled?: boolean
}

export function GameModerationBar({ disabled = false }: GameModerationBarProps) {
  const { t } = useTranslation()
  const game = useAppStore((state) => state.game)
  const prevQuestion = useAppStore((state) => state.prevQuestion)
  const nextQuestion = useAppStore((state) => state.nextQuestion)
  const undoQuestion = useAppStore((state) => state.undoQuestion)
  const finishGame = useAppStore((state) => state.finishGame)
  const playFeedback = useHostFeedback()

  const canGoPrevious = useCanGoPrevious()
  const canUndoQuestion = useCanUndoQuestion()
  const shouldShowFinish = useShouldShowFinish()

  const [undoQuestionOpen, setUndoQuestionOpen] = useState(false)

  function handleStoreAction(action: () => void) {
    try {
      action()
    } catch (error) {
      console.error(error)
    }
  }

  if (!game) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md gap-2 p-4 sm:p-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={disabled || !canGoPrevious}
            onClick={() => handleStoreAction(prevQuestion)}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            {t("game.prev")}
          </Button>

          {shouldShowFinish ? (
            <Button
              type="button"
              className="flex-1"
              disabled={disabled}
              onClick={() => handleStoreAction(finishGame)}
            >
              {t("game.finish")}
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={disabled}
              onClick={() => handleStoreAction(nextQuestion)}
            >
              {t("game.next")}
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || !canUndoQuestion}
            aria-label={t("game.undoQuestion")}
            onClick={() => setUndoQuestionOpen(true)}
          >
            <RotateCcwIcon />
          </Button>
        </div>
      </div>

      <AlertDialog open={undoQuestionOpen} onOpenChange={setUndoQuestionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("game.undoQuestionTitle", {
                round: game.currentRound,
                question: game.currentQuestion,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("game.undoQuestionBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                handleStoreAction(undoQuestion)
                playFeedback("undo")
                setUndoQuestionOpen(false)
              }}
            >
              {t("game.undoQuestionAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

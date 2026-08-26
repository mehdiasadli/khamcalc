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
import {
  useAppStore,
  useCanGoPrevious,
  useCanUndoQuestion,
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
  const game = useAppStore((state) => state.game)
  const prevQuestion = useAppStore((state) => state.prevQuestion)
  const nextQuestion = useAppStore((state) => state.nextQuestion)
  const undoQuestion = useAppStore((state) => state.undoQuestion)
  const finishGame = useAppStore((state) => state.finishGame)

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
            Prev
          </Button>

          {shouldShowFinish ? (
            <Button
              type="button"
              className="flex-1"
              disabled={disabled}
              onClick={() => handleStoreAction(finishGame)}
            >
              Finish
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
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || !canUndoQuestion}
            aria-label="Undo current question"
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
              Undo round {game.currentRound}, question {game.currentQuestion}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All answers and score changes for this question will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                handleStoreAction(undoQuestion)
                setUndoQuestionOpen(false)
              }}
            >
              Undo question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

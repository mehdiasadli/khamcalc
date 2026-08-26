import type { TGameConfig } from "@/schemas/config.schema"
import {
  brainRingScoringConfig,
  doubleDownScoringConfig,
  jeopardyScoringConfig,
  khamsaScoringConfig,
  millionaireScoringConfig,
  pubQuizScoringConfig,
  universityChallengeScoringConfig,
} from "@/schemas/scoring.schema"

export interface TConfigPreset {
  name: string
  description: string
  config: TGameConfig
}

export const configPresets = {
  khamsa: {
    name: "Khamsa",
    description:
      "5 questions per round, rising values (100→500), wrong costs the question.",
    config: {
      questionsPerRound: 5,
      maxRounds: null,
      scoring: khamsaScoringConfig,
    },
  },
  brainRing: {
    name: "Brain Ring",
    description:
      "Single round, 1 point per correct, wrong costs 1 point.",
    config: {
      questionsPerRound: null,
      maxRounds: 1,
      scoring: brainRingScoringConfig,
    },
  },
  jeopardy: {
    name: "Jeopardy!",
    description:
      "5 clues per round at 200→1000; wrong answers deduct the clue value.",
    config: {
      questionsPerRound: 5,
      maxRounds: null,
      scoring: jeopardyScoringConfig,
    },
  },
  millionaire: {
    name: "Millionaire",
    description:
      "15-question ladder (100→1500); wrong answers do not deduct points.",
    config: {
      questionsPerRound: 15,
      maxRounds: 1,
      scoring: millionaireScoringConfig,
    },
  },
  pubQuiz: {
    name: "Pub Quiz",
    description:
      "10 questions per round, 1 point each, no penalty for wrong answers.",
    config: {
      questionsPerRound: 10,
      maxRounds: null,
      scoring: pubQuizScoringConfig,
    },
  },
  universityChallenge: {
    name: "Univ. Challenge",
    description:
      "Unlimited buzzer rounds, 10 points per starter, no wrong penalty.",
    config: {
      questionsPerRound: null,
      maxRounds: null,
      scoring: universityChallengeScoringConfig,
    },
  },
  doubleDown: {
    name: "Double Down",
    description:
      "Question values double every round; wrong costs the question, floor at 0.",
    config: {
      questionsPerRound: 5,
      maxRounds: null,
      scoring: doubleDownScoringConfig,
    },
  },
} as const satisfies Record<string, TConfigPreset>

export type TConfigPresetName = keyof typeof configPresets

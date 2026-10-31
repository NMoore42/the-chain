import type { Dictionary } from '../../engine/dictionary'

export interface ModeOutcome {
  solved: boolean
  stars: 0 | 1 | 2 | 3
  hintsUsed: number
  /** Setlist: guesses; Songwriter: score; Chain: steps. */
  value: number
  /** Extra details for achievements and messages. */
  detail?: Record<string, string | number | boolean>
}

export interface ModeProps<P> {
  puzzle: P
  dict: Dictionary
  /** Seed for any randomness; changes on retry. */
  seed: string
  /** Previously saved in-progress state for this puzzle key, if any. */
  initialState?: unknown
  onStateChange: (state: unknown | null) => void
  onFinish: (outcome: ModeOutcome) => void
  /** Hide hints/stars framing for Daily and Free Play. */
  compact?: boolean
}

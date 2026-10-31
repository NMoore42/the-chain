/** The Setlist — Wordle-style scoring with correct duplicate-letter handling. */

export type LetterState = 'correct' | 'present' | 'absent'

export const MAX_GUESSES = 6

export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toLowerCase()
  const a = answer.toLowerCase()
  if (g.length !== a.length) throw new Error('guess and answer must be the same length')
  const result: LetterState[] = new Array(g.length).fill('absent')
  const remaining = new Map<string, number>()

  // First pass: exact matches consume their letters.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct'
    } else {
      remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1)
    }
  }
  // Second pass: misplaced letters, limited by how many are still unaccounted for.
  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue
    const left = remaining.get(g[i]) ?? 0
    if (left > 0) {
      result[i] = 'present'
      remaining.set(g[i], left - 1)
    }
  }
  return result
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }

/** Best-known state for each letter across all guesses, for the on-screen keyboard. */
export function keyboardStates(guesses: readonly string[], answer: string): Record<string, LetterState> {
  const out: Record<string, LetterState> = {}
  for (const guess of guesses) {
    const states = scoreGuess(guess, answer)
    for (let i = 0; i < guess.length; i++) {
      const ch = guess[i].toLowerCase()
      const prev = out[ch]
      if (!prev || RANK[states[i]] > RANK[prev]) out[ch] = states[i]
    }
  }
  return out
}

export function isSolved(guesses: readonly string[], answer: string): boolean {
  return guesses.some((g) => g.toLowerCase() === answer.toLowerCase())
}

/** Stars: 3 for solving in 4 or fewer, 2 for 5, 1 for 6, 0 if unsolved. */
export function setlistStars(guessCount: number, solved: boolean): 0 | 1 | 2 | 3 {
  if (!solved) return 0
  if (guessCount <= 4) return 3
  if (guessCount === 5) return 2
  return 1
}

/** Pick a hint letter: first unrevealed position, deterministic. */
export function hintPosition(guesses: readonly string[], answer: string): number | null {
  const revealed = new Set<number>()
  for (const g of guesses) {
    scoreGuess(g, answer).forEach((s, i) => s === 'correct' && revealed.add(i))
  }
  for (let i = 0; i < answer.length; i++) if (!revealed.has(i)) return i
  return null
}

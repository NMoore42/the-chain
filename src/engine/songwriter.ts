/** The Songwriter — rack-and-bag word building with Scrabble letter values. */

import type { Rng } from './rng'
import { rngFromString } from './rng'

export const LETTER_VALUES: Record<string, number> = {
  a: 1, e: 1, i: 1, o: 1, u: 1, l: 1, n: 1, s: 1, t: 1, r: 1,
  d: 2, g: 2,
  b: 3, c: 3, m: 3, p: 3,
  f: 4, h: 4, v: 4, w: 4, y: 4,
  k: 5,
  j: 8, x: 8,
  q: 10, z: 10,
}

/** Standard English Scrabble distribution (blanks omitted — simpler for a solo game). */
export const LETTER_DISTRIBUTION: Record<string, number> = {
  a: 9, b: 2, c: 2, d: 4, e: 12, f: 2, g: 3, h: 2, i: 9, j: 1, k: 1, l: 4, m: 2,
  n: 6, o: 8, p: 2, q: 1, r: 6, s: 4, t: 6, u: 4, v: 2, w: 2, x: 1, y: 2, z: 1,
}

export const RACK_SIZE = 7
export const BINGO_BONUS = 50

export interface Tile {
  id: string
  letter: string
  value: number
}

export interface LengthBonus {
  minLength: number
  bonus: number
  label: string
}

/** Longer words earn a flat bonus; a full seven-tile word earns the classic bingo. */
export const LENGTH_BONUSES: LengthBonus[] = [
  { minLength: 7, bonus: BINGO_BONUS, label: 'Chorus!' },
  { minLength: 6, bonus: 12, label: 'Bridge' },
  { minLength: 5, bonus: 6, label: 'Verse' },
]

export function letterValue(letter: string): number {
  return LETTER_VALUES[letter.toLowerCase()] ?? 0
}

export function baseWordScore(word: string): number {
  let total = 0
  for (const ch of word.toLowerCase()) total += letterValue(ch)
  return total
}

export interface WordScore {
  base: number
  bonus: number
  bonusLabel: string | null
  goldenBonus: number
  total: number
}

/**
 * Score a played word. `goldenLetter` (optional) doubles the word when used —
 * the "golden letter" mechanic introduced in later eras.
 */
export function scoreWord(word: string, goldenLetter?: string | null): WordScore {
  const base = baseWordScore(word)
  const lb = LENGTH_BONUSES.find((b) => word.length >= b.minLength)
  const bonus = lb?.bonus ?? 0
  const usesGolden = !!goldenLetter && word.toLowerCase().includes(goldenLetter.toLowerCase())
  const goldenBonus = usesGolden ? base : 0
  return { base, bonus, bonusLabel: lb?.label ?? null, goldenBonus, total: base + bonus + goldenBonus }
}

/** Can `word` be formed from the rack? Returns the tile ids used (in order) or null. */
export function tilesForWord(word: string, rack: readonly Tile[]): Tile[] | null {
  const available = rack.slice()
  const used: Tile[] = []
  for (const ch of word.toLowerCase()) {
    const idx = available.findIndex((t) => t.letter === ch)
    if (idx === -1) return null
    used.push(available[idx])
    available.splice(idx, 1)
  }
  return used
}

let tileCounter = 0
export function makeTile(letter: string, id?: string): Tile {
  return { id: id ?? `t${++tileCounter}`, letter: letter.toLowerCase(), value: letterValue(letter) }
}

/**
 * Seeded, endless tile stream weighted by the Scrabble distribution, with a
 * vowel-balance rule so a rack is never hopeless: the rack always holds 2–4
 * vowels. A golden letter, when set, is drawn three times as often.
 */
export class TileStream {
  private rng: Rng
  private counter = 0
  private rolls = 0
  private readonly weights: [string, number][]
  readonly seed: string

  constructor(seed: string, golden?: string | null) {
    this.seed = seed
    this.rng = rngFromString(seed)
    this.weights = Object.entries(LETTER_DISTRIBUTION).map(([l, w]) => [l, l === golden ? w * 3 : w])
  }

  /** Serializable position, so a session can be resumed after a refresh. */
  get position(): { rolls: number; counter: number } {
    return { rolls: this.rolls, counter: this.counter }
  }

  static restore(seed: string, golden: string | null | undefined, pos: { rolls: number; counter: number }): TileStream {
    const s = new TileStream(seed, golden)
    for (let i = 0; i < pos.rolls; i++) s.rng()
    s.rolls = pos.rolls
    s.counter = pos.counter
    return s
  }

  private next(): number {
    this.rolls++
    return this.rng()
  }

  private draw(filter?: (letter: string) => boolean): Tile {
    const pool = filter ? this.weights.filter(([l]) => filter(l)) : this.weights
    const total = pool.reduce((s, [, w]) => s + w, 0)
    let r = this.next() * total
    for (const [l, w] of pool) {
      r -= w
      if (r <= 0) return makeTile(l, `s${this.counter++}`)
    }
    return makeTile(pool[pool.length - 1][0], `s${this.counter++}`)
  }

  /** Fill the rack to RACK_SIZE while keeping between 2 and 4 vowels. */
  fill(rack: readonly Tile[]): Tile[] {
    const out = rack.slice()
    while (out.length < RACK_SIZE) {
      const vowels = out.filter((t) => isVowel(t.letter)).length
      const slotsLeft = RACK_SIZE - out.length
      // Never more than two of the same letter on a rack (three for E).
      const count = (l: string) => out.filter((t) => t.letter === l).length
      const notDup = (l: string) => count(l) < (l === 'e' ? 3 : 2)
      let t: Tile
      if (vowels + slotsLeft <= 2) t = this.draw((l) => isVowel(l) && notDup(l))
      else if (vowels >= 4) t = this.draw((l) => !isVowel(l) && notDup(l))
      else t = this.draw(notDup)
      out.push(t)
    }
    return out
  }
}

/**
 * Opening rack with a quality check: if the rack offers fewer than `minWords`
 * playable words, redraw (up to 6 times). Deterministic for a given seed.
 */
export function openingRack(stream: TileStream, countWords: (rack: readonly Tile[]) => number, minWords = 8): Tile[] {
  let rack = stream.fill([])
  for (let i = 0; i < 6 && countWords(rack) < minWords; i++) rack = stream.fill([])
  return rack
}

/** Swap selected tiles: remove them and refill from the stream. */
export function swapTiles(rack: readonly Tile[], ids: readonly string[], stream: TileStream): Tile[] {
  return stream.fill(rack.filter((t) => !ids.includes(t.id)))
}

/** Ensure a rack has at least `min` vowels when possible (keeps the game forgiving). */
export function isVowel(ch: string): boolean {
  return 'aeiou'.includes(ch.toLowerCase())
}

/** Songwriter stars: based on how far past the target the player got. */
export const STAR_MULTIPLIERS = { two: 1.2, three: 1.5 }

export function songwriterStars(score: number, target: number): 0 | 1 | 2 | 3 {
  if (score < target) return 0
  if (score >= target * STAR_MULTIPLIERS.three) return 3
  if (score >= target * STAR_MULTIPLIERS.two) return 2
  return 1
}

/**
 * Find all dictionary words formable from a rack (for hints and validation).
 * Limited to 3+ letters. Uses letter-count comparison; fine for an 80k list.
 */
export function findPlayableWords(rack: readonly Tile[], words: readonly string[], minLength = 3): string[] {
  const counts = new Map<string, number>()
  for (const t of rack) counts.set(t.letter, (counts.get(t.letter) ?? 0) + 1)
  const out: string[] = []
  outer: for (const w of words) {
    if (w.length < minLength || w.length > rack.length) continue
    const need = new Map<string, number>()
    for (const ch of w) {
      const n = (need.get(ch) ?? 0) + 1
      if (n > (counts.get(ch) ?? 0)) continue outer
      need.set(ch, n)
    }
    out.push(w)
  }
  return out
}

export function bestWord(rack: readonly Tile[], words: readonly string[], goldenLetter?: string | null): string | null {
  let best: string | null = null
  let bestScore = -1
  for (const w of findPlayableWords(rack, words)) {
    const s = scoreWord(w, goldenLetter).total
    if (s > bestScore) {
      best = w
      bestScore = s
    }
  }
  return best
}

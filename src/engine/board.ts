/**
 * Jam Session: a crossword-board word game against a computer bandmate,
 * in the spirit of Words With Friends. Pure logic, no React.
 */
import type { Dictionary } from './dictionary'
import type { Rng } from './rng'
import { shuffle } from './rng'
import { isMacWord } from '../data/macWords'

export const SIZE = 15
export const CENTER = 7
export const RACK = 7
export const BINGO = 35

export type Bonus = 'TW' | 'DW' | 'TL' | 'DL' | null

const TW = [[0, 3], [0, 11], [3, 0], [3, 14], [11, 0], [11, 14], [14, 3], [14, 11]]
const DW = [[1, 5], [1, 9], [3, 7], [5, 1], [5, 13], [7, 3], [7, 11], [9, 1], [9, 13], [11, 7], [13, 5], [13, 9]]
const TL = [[0, 6], [0, 8], [3, 3], [3, 11], [5, 5], [5, 9], [6, 0], [6, 14], [8, 0], [8, 14], [9, 5], [9, 9], [11, 3], [11, 11], [14, 6], [14, 8]]
const DL = [[1, 2], [1, 12], [2, 1], [2, 4], [2, 10], [2, 13], [4, 2], [4, 6], [4, 8], [4, 12], [6, 4], [6, 10], [8, 4], [8, 10], [10, 2], [10, 6], [10, 8], [10, 12], [12, 1], [12, 4], [12, 10], [12, 13], [13, 2], [13, 12]]

export const BONUS: Bonus[][] = Array.from({ length: SIZE }, () => Array<Bonus>(SIZE).fill(null))
for (const [r, c] of TW) BONUS[r][c] = 'TW'
for (const [r, c] of DW) BONUS[r][c] = 'DW'
for (const [r, c] of TL) BONUS[r][c] = 'TL'
for (const [r, c] of DL) BONUS[r][c] = 'DL'

export const VALUES: Record<string, number> = {
  a: 1, b: 4, c: 4, d: 2, e: 1, f: 4, g: 3, h: 3, i: 1, j: 10, k: 5, l: 2, m: 4, n: 2, o: 1, p: 4, q: 10, r: 1, s: 1, t: 1, u: 2, v: 5, w: 4, x: 8, y: 3, z: 10, '?': 0,
}
export const DISTRIBUTION: Record<string, number> = {
  a: 9, b: 2, c: 2, d: 5, e: 13, f: 2, g: 3, h: 4, i: 8, j: 1, k: 1, l: 4, m: 2, n: 5, o: 8, p: 2, q: 1, r: 6, s: 5, t: 7, u: 4, v: 2, w: 2, x: 1, y: 2, z: 1, '?': 2,
}

export interface BoardTile {
  id: string
  /** '?' for a blank. */
  letter: string
  /** The letter a blank is standing in for. */
  as?: string
}

export interface Cell {
  tile: BoardTile | null
}

export type Board = (BoardTile | null)[][]

export interface Placement {
  row: number
  col: number
  tile: BoardTile
}

export interface WordResult {
  word: string
  score: number
  mac: boolean
  cells: [number, number][]
}

export interface MoveResult {
  valid: boolean
  reason?: string
  words: WordResult[]
  score: number
  bingo: boolean
}

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array<BoardTile | null>(SIZE).fill(null))
}

export function makeBag(rng: Rng): BoardTile[] {
  const tiles: BoardTile[] = []
  let i = 0
  for (const [letter, n] of Object.entries(DISTRIBUTION)) for (let k = 0; k < n; k++) tiles.push({ id: `j${i++}`, letter })
  return shuffle(tiles, rng)
}

export function draw(bag: BoardTile[], n: number): { drawn: BoardTile[]; bag: BoardTile[] } {
  return { drawn: bag.slice(0, n), bag: bag.slice(n) }
}

export const letterOf = (t: BoardTile): string => (t.letter === '?' ? (t.as ?? '?') : t.letter)

function isValidWord(word: string, dict: Dictionary): boolean {
  return dict.has(word) || isMacWord(word)
}

/** Validate a set of placements against the board and compute the score. */
export function evaluateMove(board: Board, placements: Placement[], dict: Dictionary): MoveResult {
  const fail = (reason: string): MoveResult => ({ valid: false, reason, words: [], score: 0, bingo: false })
  if (placements.length === 0) return fail('Place at least one tile')
  for (const p of placements) {
    if (board[p.row][p.col]) return fail('That square is taken')
    if (p.tile.letter === '?' && !p.tile.as) return fail('Choose a letter for the blank')
  }
  const rows = new Set(placements.map((p) => p.row))
  const cols = new Set(placements.map((p) => p.col))
  if (rows.size > 1 && cols.size > 1) return fail('Tiles must be in a single row or column')
  const horizontal = rows.size === 1 && (cols.size > 1 || placements.length === 1)
  const temp: Board = board.map((r) => r.slice())
  for (const p of placements) temp[p.row][p.col] = p.tile

  // Contiguity along the line (including existing tiles).
  const line = horizontal ? [...placements].sort((a, b) => a.col - b.col) : [...placements].sort((a, b) => a.row - b.row)
  const first = line[0]
  const last = line[line.length - 1]
  if (horizontal) {
    for (let c = first.col; c <= last.col; c++) if (!temp[first.row][c]) return fail('Leave no gaps in the word')
  } else {
    for (let r = first.row; r <= last.row; r++) if (!temp[r][first.col]) return fail('Leave no gaps in the word')
  }

  const boardEmpty = board.every((r) => r.every((t) => !t))
  if (boardEmpty) {
    if (!placements.some((p) => p.row === CENTER && p.col === CENTER)) return fail('The first word must cover the centre star')
  } else {
    const touches = placements.some((p) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => board[p.row + dr]?.[p.col + dc]))
    if (!touches) return fail('New words must connect to tiles already on the board')
  }

  const placedSet = new Set(placements.map((p) => `${p.row},${p.col}`))
  const isNew = (r: number, c: number) => placedSet.has(`${r},${c}`)

  const scoreWordAt = (r0: number, c0: number, dr: number, dc: number): WordResult | null => {
    // Walk back to the start of the word.
    let r = r0
    let c = c0
    while (temp[r - dr]?.[c - dc]) { r -= dr; c -= dc }
    let word = ''
    let sum = 0
    let mult = 1
    const cells: [number, number][] = []
    while (temp[r]?.[c]) {
      const t = temp[r][c]!
      const v = VALUES[t.letter] ?? 0
      let lv = v
      if (isNew(r, c)) {
        const b = BONUS[r][c]
        if (b === 'DL') lv = v * 2
        else if (b === 'TL') lv = v * 3
        else if (b === 'DW') mult *= 2
        else if (b === 'TW') mult *= 3
      }
      sum += lv
      word += letterOf(t)
      cells.push([r, c])
      r += dr
      c += dc
    }
    if (word.length < 2) return null
    const mac = isMacWord(word)
    const score = sum * mult * (mac ? 2 : 1)
    return { word, score, mac, cells }
  }

  const words: WordResult[] = []
  const main = horizontal ? scoreWordAt(first.row, first.col, 0, 1) : scoreWordAt(first.row, first.col, 1, 0)
  if (main) words.push(main)
  else if (placements.length === 1) {
    // A single tile: the "main" word could be in either direction.
    const alt = scoreWordAt(first.row, first.col, horizontal ? 1 : 0, horizontal ? 0 : 1)
    if (alt) words.push(alt)
    else return fail('Words need at least two letters')
  }
  for (const p of placements) {
    const cross = horizontal ? scoreWordAt(p.row, p.col, 1, 0) : scoreWordAt(p.row, p.col, 0, 1)
    if (cross && !(main && cross.word === main.word && cross.cells[0][0] === main.cells[0][0] && cross.cells[0][1] === main.cells[0][1])) {
      if (placements.length === 1 && words.length && words[0].cells.some(([r, c]) => r === cross.cells[0][0] && c === cross.cells[0][1]) && words[0].cells.length === cross.cells.length && words[0].word === cross.word) continue
      words.push(cross)
    }
  }
  for (const w of words) if (!isValidWord(w.word, dict)) return fail(`${w.word.toUpperCase()} is not in the word list`)
  const bingo = placements.length === RACK
  const score = words.reduce((s, w) => s + w.score, 0) + (bingo ? BINGO : 0)
  return { valid: true, words, score, bingo }
}

export function applyMove(board: Board, placements: Placement[]): Board {
  const next = board.map((r) => r.slice())
  for (const p of placements) next[p.row][p.col] = p.tile
  return next
}

// ---------------- Computer opponent ----------------

export interface Candidate {
  placements: Placement[]
  result: MoveResult
}

interface Slot {
  row: number
  col: number
  dr: number
  dc: number
  length: number
  pattern: (string | null)[]
  empties: number
}

function slots(board: Board): Slot[] {
  const out: Slot[] = []
  const boardEmpty = board.every((r) => r.every((t) => !t))
  const hasNeighbor = (r: number, c: number) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => board[r + dr]?.[c + dc])
  for (const [dr, dc] of [[0, 1], [1, 0]] as const) {
    for (let line = 0; line < SIZE; line++) {
      for (let start = 0; start < SIZE; start++) {
        const r0 = dr ? start : line
        const c0 = dc ? start : line
        if (board[r0 - dr]?.[c0 - dc]) continue // would extend a word backwards; covered by an earlier start
        for (let len = 2; start + len <= SIZE; len++) {
          const rEnd = r0 + dr * (len - 1)
          const cEnd = c0 + dc * (len - 1)
          if (board[rEnd + dr]?.[cEnd + dc]) continue // must not run into a tile after the end
          const pattern: (string | null)[] = []
          let empties = 0
          let anchored = false
          let coversCenter = false
          for (let i = 0; i < len; i++) {
            const r = r0 + dr * i
            const c = c0 + dc * i
            const t = board[r][c]
            pattern.push(t ? letterOf(t) : null)
            if (!t) {
              empties++
              if (hasNeighbor(r, c)) anchored = true
            } else anchored = true
            if (r === CENTER && c === CENTER) coversCenter = true
          }
          if (empties === 0 || empties > RACK) continue
          if (boardEmpty ? !coversCenter : !anchored) continue
          out.push({ row: r0, col: c0, dr, dc, length: len, pattern, empties })
        }
      }
    }
  }
  return out
}

function canForm(word: string, pattern: (string | null)[], rack: Map<string, number>): BoardTile['letter'][] | null {
  // Returns the rack letters used (with '?' for blanks), or null.
  const counts = new Map(rack)
  const used: string[] = []
  for (let i = 0; i < word.length; i++) {
    const fixed = pattern[i]
    if (fixed) {
      if (fixed !== word[i]) return null
      continue
    }
    const ch = word[i]
    const have = counts.get(ch) ?? 0
    if (have > 0) {
      counts.set(ch, have - 1)
      used.push(ch)
    } else {
      const blanks = counts.get('?') ?? 0
      if (blanks <= 0) return null
      counts.set('?', blanks - 1)
      used.push('?')
    }
  }
  return used
}

/** Enumerate legal moves for the given rack. Sorted by score, best first. */
export function generateMoves(board: Board, rack: BoardTile[], dict: Dictionary, wordsByLength: (n: number) => readonly string[], limitPerSlot = 60): Candidate[] {
  const rackCounts = new Map<string, number>()
  for (const t of rack) rackCounts.set(t.letter, (rackCounts.get(t.letter) ?? 0) + 1)
  const out: Candidate[] = []
  const seen = new Set<string>()
  for (const slot of slots(board)) {
    const words = wordsByLength(slot.length)
    let tried = 0
    for (const w of words) {
      const used = canForm(w, slot.pattern, rackCounts)
      if (!used) continue
      // Build placements from rack tiles.
      const pool = rack.slice()
      const placements: Placement[] = []
      let ui = 0
      for (let i = 0; i < slot.length; i++) {
        if (slot.pattern[i]) continue
        const want = used[ui++]
        const idx = pool.findIndex((t) => t.letter === want)
        if (idx === -1) { placements.length = 0; break }
        const t = pool.splice(idx, 1)[0]
        placements.push({ row: slot.row + slot.dr * i, col: slot.col + slot.dc * i, tile: want === '?' ? { ...t, as: w[i] } : t })
      }
      if (!placements.length) continue
      const key = placements.map((p) => `${p.row},${p.col},${letterOf(p.tile)}`).join('|')
      if (seen.has(key)) continue
      seen.add(key)
      const result = evaluateMove(board, placements, dict)
      if (result.valid) out.push({ placements, result })
      if (++tried >= limitPerSlot) break
    }
  }
  out.sort((a, b) => b.result.score - a.result.score)
  return out
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export function chooseMove(candidates: Candidate[], difficulty: Difficulty, rng: Rng): Candidate | null {
  if (!candidates.length) return null
  if (difficulty === 'hard') return candidates[0]
  const n = candidates.length
  if (difficulty === 'medium') {
    const top = candidates.slice(0, Math.max(1, Math.floor(n * 0.25)))
    return top[Math.floor(rng() * top.length)]
  }
  // Easy: a modest move from the middle of the pack, never the very best.
  const lo = Math.floor(n * 0.4)
  const hi = Math.max(lo + 1, Math.floor(n * 0.8))
  return candidates[Math.min(n - 1, lo + Math.floor(rng() * (hi - lo)))]
}

/** Score a word's raw letter values (for a "best word" summary). */
export function rackValue(rack: BoardTile[]): number {
  return rack.reduce((s, t) => s + (VALUES[t.letter] ?? 0), 0)
}

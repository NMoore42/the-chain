import { describe, expect, it } from 'vitest'
import { loadTestDictionary } from './testDictionary'
import { rngFromString } from './rng'
import { applyMove, BONUS, CENTER, chooseMove, emptyBoard, evaluateMove, generateMoves, makeBag, type Placement } from './board'
import { MAC_WORDS } from '../data/macWords'

const dict = loadTestDictionary()
const byLen = (n: number) => dict.wordsOfLength(n)
let id = 0
const t = (letter: string, as?: string) => ({ id: `t${id++}`, letter, ...(as ? { as } : {}) })
const place = (word: string, row: number, col: number, horizontal = true): Placement[] =>
  Array.from(word).map((ch, i) => ({ row: row + (horizontal ? 0 : i), col: col + (horizontal ? i : 0), tile: t(ch) }))

describe('board layout', () => {
  it('has the expected bonus squares', () => {
    expect(BONUS[0][3]).toBe('TW')
    expect(BONUS[7][7]).toBeNull()
    expect(BONUS[1][5]).toBe('DW')
    expect(BONUS[5][5]).toBe('TL')
    expect(BONUS[1][2]).toBe('DL')
  })
  it('builds a 104-tile bag', () => {
    expect(makeBag(rngFromString('x'))).toHaveLength(104)
  })
})

describe('evaluateMove', () => {
  it('requires the first word on the centre', () => {
    const r = evaluateMove(emptyBoard(), place('dream', 0, 0), dict)
    expect(r.valid).toBe(false)
    const ok = evaluateMove(emptyBoard(), place('dream', CENTER, 5), dict)
    expect(ok.valid).toBe(true)
    expect(ok.words[0].word).toBe('dream')
    expect(ok.words[0].mac).toBe(true)
  })
  it('scores letters, bonus squares, and the Mac double', () => {
    // "cat" at row 7, cols 5..7: c(4) a(1) t(1) = 6, no bonuses on 7,5 7,6 7,7? (7,3) is DW, not covered.
    const r = evaluateMove(emptyBoard(), place('cat', CENTER, 5), dict)
    expect(r.valid).toBe(true)
    expect(r.score).toBe(6)
    // "dream" across (7,3)..(7,7): d on DW => (2+1+1+1+4)=9 *2 =18, Mac word => 36
    const m = evaluateMove(emptyBoard(), place('dream', CENTER, 3), dict)
    expect(m.score).toBe(36)
  })
  it('rejects gaps, disconnected plays, and invalid cross words', () => {
    let board = applyMove(emptyBoard(), place('cat', CENTER, 5))
    expect(evaluateMove(board, place('s', CENTER, 9), dict).valid).toBe(false) // gap
    expect(evaluateMove(board, place('dog', 0, 0), dict).valid).toBe(false) // disconnected
    // "cats": s at (7,8)
    const s = evaluateMove(board, place('s', CENTER, 8), dict)
    expect(s.valid).toBe(true)
    expect(s.words[0].word).toBe('cats')
    board = applyMove(board, place('s', CENTER, 8))
    // vertical "at" using the a at (7,6): place t at (8,6) => cross word "at"
    const v = evaluateMove(board, [{ row: 8, col: 6, tile: t('t') }], dict)
    expect(v.valid).toBe(true)
    expect(v.words.map((w) => w.word)).toContain('at')
    // invalid: x under c => "cx"
    expect(evaluateMove(board, [{ row: 8, col: 5, tile: t('x') }], dict).valid).toBe(false)
  })
  it('accepts Mac names not in the dictionary and handles blanks', () => {
    expect(dict.has('stevie')).toBe(false)
    const r = evaluateMove(emptyBoard(), place('stevie', CENTER, 4), dict)
    expect(r.valid).toBe(true)
    expect(r.words[0].mac).toBe(true)
    const blank: Placement[] = [{ row: CENTER, col: 6, tile: t('?', 'c') }, { row: CENTER, col: 7, tile: t('a') }, { row: CENTER, col: 8, tile: t('t') }]
    const b = evaluateMove(emptyBoard(), blank, dict)
    expect(b.valid).toBe(true)
    expect(b.score).toBe(2) // blank worth 0
    expect(evaluateMove(emptyBoard(), [{ row: CENTER, col: 7, tile: t('?') }, { row: CENTER, col: 8, tile: t('a') }], dict).valid).toBe(false)
  })
  it('awards the bingo bonus for seven tiles', () => {
    const r = evaluateMove(emptyBoard(), place('dreamer', CENTER, 4), dict)
    expect(r.valid).toBe(true)
    expect(r.bingo).toBe(true)
    expect(r.score).toBeGreaterThan(35)
  })
})

describe('computer opponent', () => {
  it('finds legal moves on an empty board and after', () => {
    const rack = Array.from('dreamst').map((ch) => t(ch))
    const moves = generateMoves(emptyBoard(), rack, dict, byLen)
    expect(moves.length).toBeGreaterThan(10)
    expect(moves[0].result.score).toBeGreaterThanOrEqual(moves[moves.length - 1].result.score)
    for (const m of moves.slice(0, 20)) expect(evaluateMove(emptyBoard(), m.placements, dict).valid).toBe(true)
    const board = applyMove(emptyBoard(), moves[0].placements)
    const rack2 = Array.from('ainoset').map((ch) => t(ch))
    const moves2 = generateMoves(board, rack2, dict, byLen)
    expect(moves2.length).toBeGreaterThan(10)
    for (const m of moves2.slice(0, 20)) expect(evaluateMove(board, m.placements, dict).valid).toBe(true)
  })
  it('uses blanks', () => {
    const rack = Array.from('?zzqqxx').map((ch) => t(ch))
    const moves = generateMoves(emptyBoard(), rack, dict, byLen)
    expect(moves.length).toBeGreaterThan(0)
  })
  it('chooses by difficulty', () => {
    const rack = Array.from('dreamst').map((ch) => t(ch))
    const moves = generateMoves(emptyBoard(), rack, dict, byLen)
    expect(chooseMove(moves, 'hard', rngFromString('a'))).toBe(moves[0])
    const easy = chooseMove(moves, 'easy', rngFromString('a'))!
    expect(easy.result.score).toBeLessThanOrEqual(moves[0].result.score)
    expect(chooseMove([], 'hard', rngFromString('a'))).toBeNull()
  })
  it('generates moves quickly enough', () => {
    const rack = Array.from('aeinrst').map((ch) => t(ch))
    let board = applyMove(emptyBoard(), place('dreams', CENTER, 4))
    board = applyMove(board, place('lace', 8, 6, false))
    const start = Date.now()
    const moves = generateMoves(board, rack, dict, byLen)
    expect(Date.now() - start).toBeLessThan(2500)
    expect(moves.length).toBeGreaterThan(50)
  })
})

describe('Mac words', () => {
  it('are lowercase and have notes', () => {
    for (const [w, note] of Object.entries(MAC_WORDS)) {
      expect(w).toMatch(/^[a-z]+$/)
      expect(note.length).toBeGreaterThan(5)
    }
    expect(Object.keys(MAC_WORDS).length).toBeGreaterThan(100)
  })
})

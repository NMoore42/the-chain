/**
 * Content validation: every curated puzzle must be solvable and every campaign
 * reference must resolve. Run with `npm run validate` or as part of `npm test`.
 */
import { describe, expect, it } from 'vitest'
import { loadTestDictionary } from '../src/engine/testDictionary'
import { isValidChain, shortestLadder } from '../src/engine/chain'
import { TileStream, findPlayableWords, openingRack, scoreWord, tilesForWord, RACK_SIZE } from '../src/engine/songwriter'
import { ERAS, ALL_CONCERTS } from '../src/data/campaign'
import { SETLISTS } from '../src/data/puzzles/setlists'
import { SONGWRITERS } from '../src/data/puzzles/songwriters'
import { CHAINS } from '../src/data/puzzles/chains'
import { COLLECTIBLES } from '../src/data/collectibles'
import { STORIES, MEMBERS, ALBUMS } from '../src/data/history'
import { DAILY_WORDS } from '../src/data/dailyWords'

const dict = loadTestDictionary()
const allWords = [3, 4, 5, 6, 7].flatMap((n) => [...dict.wordsOfLength(n)])

type Picker = (words: string[]) => string | null
const strongest = (g?: string): Picker => (words) => words.reduce<string | null>((b, w) => (!b || scoreWord(w, g).total > scoreWord(b, g).total ? w : b), null)
/** A modest player only ever finds words of four letters or fewer. */
const modest = (g?: string): Picker => (words) => { const short = words.filter((w) => w.length <= 4); return strongest(g)(short.length ? short : words) }

function simulate(seed: string, takes: number, golden: string | undefined, pick: Picker): number {
  const stream = new TileStream(seed, golden)
  let rack = openingRack(stream, (r) => findPlayableWords(r, allWords).length)
  let score = 0
  for (let t = 0; t < takes; t++) {
    const w = pick(findPlayableWords(rack, allWords))
    if (!w) break
    score += scoreWord(w, golden).total
    const used = tilesForWord(w, rack)!
    rack = stream.fill(rack.filter((x) => !used.includes(x)))
  }
  return score
}
const median = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)]

describe('Setlist puzzles', () => {
  for (const p of Object.values(SETLISTS)) {
    it(`${p.id} (${p.answer}) is a valid answer`, () => {
      expect(p.answer).toMatch(/^[a-z]{5,6}$/)
      expect(dict.has(p.answer)).toBe(true)
      expect(p.clue.length).toBeGreaterThan(10)
    })
  }
})

describe('Chain puzzles', () => {
  for (const p of Object.values(CHAINS)) {
    it(`${p.id} (${p.start} → ${p.end}) has a valid, near-optimal model solution`, () => {
      expect(p.solution[0]).toBe(p.start)
      expect(p.solution[p.solution.length - 1]).toBe(p.end)
      expect(isValidChain(p.solution, dict)).toBe(true)
      expect(new Set(p.solution).size).toBe(p.solution.length)
      const shortest = shortestLadder(p.start, p.end, dict)
      expect(shortest).not.toBeNull()
      const par = p.solution.length - 1
      expect(par).toBeGreaterThanOrEqual(shortest!.length - 1)
      expect(par).toBeLessThanOrEqual(shortest!.length - 1 + 1)
    })
  }
})

describe('Songwriter sessions', () => {
  for (const p of Object.values(SONGWRITERS)) {
    it(`${p.id}: ${p.takes} takes, target ${p.target} is fair`, () => {
      expect(p.takes).toBeGreaterThanOrEqual(5)
      const seeds = Array.from({ length: 10 }, (_, i) => `${p.id}:${i}`)
      const strong = seeds.map((s) => simulate(s, p.takes, p.golden, strongest(p.golden)))
      const mod = seeds.map((s) => simulate(s, p.takes, p.golden, modest(p.golden)))
      // Three stars must be attainable by a strong player on a typical seed.
      expect(median(strong), `${p.id} strong ${strong.join('/')}`).toBeGreaterThanOrEqual(p.target * 1.5)
      // A modest player (four-letter words only) should get most of the way; hints close the gap.
      expect(median(mod), `${p.id} modest ${mod.join('/')}`).toBeGreaterThanOrEqual(p.target * 0.5)
      // Every opening rack offers choices.
      for (const s of seeds) {
        const rack = openingRack(new TileStream(s, p.golden), (r) => findPlayableWords(r, allWords).length)
        expect(rack).toHaveLength(RACK_SIZE)
        expect(findPlayableWords(rack, allWords).length, `${p.id} seed ${s}`).toBeGreaterThanOrEqual(8)
      }
    })
  }
})

describe('Campaign references', () => {
  it('has unique concert and puzzle ids', () => {
    const ids = ALL_CONCERTS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    const puzzleIds = [...Object.keys(SETLISTS), ...Object.keys(SONGWRITERS), ...Object.keys(CHAINS)]
    expect(new Set(puzzleIds).size).toBe(puzzleIds.length)
  })
  it('uses every puzzle exactly once', () => {
    const used = ALL_CONCERTS.flatMap((c) => c.puzzles.map((p) => p.id))
    expect(new Set(used).size).toBe(used.length)
    const all = [...Object.keys(SETLISTS), ...Object.keys(SONGWRITERS), ...Object.keys(CHAINS)]
    expect(used.sort()).toEqual(all.sort())
  })
  it('resolves every story and collectible', () => {
    for (const era of ERAS) expect(STORIES[era.introStoryId], era.introStoryId).toBeDefined()
    for (const c of ALL_CONCERTS) {
      expect(STORIES[c.storyId], c.storyId).toBeDefined()
      expect(COLLECTIBLES[c.collectibleId], c.collectibleId).toBeDefined()
      expect(c.puzzles.length).toBeGreaterThanOrEqual(1)
    }
    const collectibleIds = Object.keys(COLLECTIBLES)
    const usedCollectibles = ALL_CONCERTS.map((c) => c.collectibleId)
    expect(new Set(usedCollectibles).size).toBe(collectibleIds.length)
    for (const m of MEMBERS) expect(ALL_CONCERTS.some((c) => c.id === m.unlockedByConcert), m.id).toBe(true)
    for (const a of ALBUMS) expect(ALL_CONCERTS.some((c) => c.id === a.unlockedByConcert), a.id).toBe(true)
  })
  it('every story has sources and no empty paragraphs', () => {
    for (const s of Object.values(STORIES)) {
      expect(s.sources.length, s.id).toBeGreaterThan(0)
      expect(s.paragraphs.length, s.id).toBeGreaterThan(0)
      for (const p of s.paragraphs) expect(p.trim().length).toBeGreaterThan(20)
    }
  })
})

describe('Daily Encore', () => {
  it('uses valid, unique five-letter words', () => {
    expect(new Set(DAILY_WORDS).size).toBe(DAILY_WORDS.length)
    for (const w of DAILY_WORDS) {
      expect(w).toMatch(/^[a-z]{5}$/)
      expect(dict.has(w), w).toBe(true)
    }
    expect(DAILY_WORDS.length).toBeGreaterThanOrEqual(200)
  })
})

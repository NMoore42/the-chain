import { describe, expect, it } from 'vitest'
import { loadTestDictionary } from './testDictionary'
import {
  TileStream, bestWord, findPlayableWords, isVowel, makeTile, scoreWord, songwriterStars, swapTiles, tilesForWord,
} from './songwriter'

const rack = (s: string) => Array.from(s).map((ch, i) => makeTile(ch, `r${i}`))

describe('scoreWord', () => {
  it('sums Scrabble letter values', () => {
    expect(scoreWord('cat').base).toBe(5)
    expect(scoreWord('quiz').base).toBe(22)
  })
  it('adds length bonuses and the bingo', () => {
    expect(scoreWord('dream').bonus).toBe(6)
    expect(scoreWord('gypsy').bonusLabel).toBe('Verse')
    expect(scoreWord('sailor').bonus).toBe(12)
    expect(scoreWord('dreamer').bonus).toBe(50)
    expect(scoreWord('dreamer').bonusLabel).toBe('Chorus!')
  })
  it('doubles base when golden letter is used', () => {
    const s = scoreWord('moon', 'm')
    expect(s.goldenBonus).toBe(s.base)
    expect(scoreWord('moon', 'z').goldenBonus).toBe(0)
  })
})

describe('tilesForWord', () => {
  it('finds tiles, respecting duplicates', () => {
    const r = rack('aabcdef')
    expect(tilesForWord('cab', r)?.map((t) => t.letter)).toEqual(['c', 'a', 'b'])
    expect(tilesForWord('aaa', r)).toBeNull()
    expect(tilesForWord('xyz', r)).toBeNull()
  })
})

describe('tile stream', () => {
  it('fills deterministically and keeps 2-4 vowels', () => {
    const a = new TileStream('seed').fill([])
    const b = new TileStream('seed').fill([])
    expect(a.map((t) => t.letter)).toEqual(b.map((t) => t.letter))
    for (let i = 0; i < 200; i++) {
      const rack = new TileStream(`s${i}`).fill([])
      expect(rack).toHaveLength(7)
      const v = rack.filter((t) => isVowel(t.letter)).length
      expect(v).toBeGreaterThanOrEqual(2)
      expect(v).toBeLessThanOrEqual(4)
    }
  })
  it('swaps tiles and refills', () => {
    const stream = new TileStream('x')
    const rack = stream.fill([])
    const swapped = swapTiles(rack, [rack[0].id, rack[1].id], stream)
    expect(swapped).toHaveLength(7)
    expect(swapped.find((t) => t.id === rack[0].id)).toBeUndefined()
    expect(swapped.find((t) => t.id === rack[2].id)).toBeDefined()
  })
  it('restores a stream position', () => {
    const a = new TileStream('r', 'k')
    a.fill([])
    const pos = a.position
    const b = TileStream.restore('r', 'k', pos)
    expect(b.fill([]).map((t) => t.letter)).toEqual(a.fill([]).map((t) => t.letter))
  })
  it('favours the golden letter', () => {
    let count = 0
    for (let i = 0; i < 100; i++) count += new TileStream(`g${i}`, 'k').fill([]).filter((t) => t.letter === 'k').length
    expect(count).toBeGreaterThan(5)
  })
})

describe('playable words', () => {
  const dict = loadTestDictionary()
  it('finds words from a rack', () => {
    const words = findPlayableWords(rack('dreamsx'), dict.wordsOfLength(5))
    expect(words).toContain('dream')
    expect(words).not.toContain('storm')
  })
  it('finds a best word', () => {
    const all = [...dict.wordsOfLength(3), ...dict.wordsOfLength(4), ...dict.wordsOfLength(5), ...dict.wordsOfLength(6), ...dict.wordsOfLength(7)]
    const best = bestWord(rack('dreamer'), all)
    expect(best).toBeTruthy()
    expect(scoreWord(best!).total).toBeGreaterThanOrEqual(scoreWord('dreamer').total)
  })
})

describe('songwriterStars', () => {
  it('scales with target', () => {
    expect(songwriterStars(59, 60)).toBe(0)
    expect(songwriterStars(60, 60)).toBe(1)
    expect(songwriterStars(72, 60)).toBe(2)
    expect(songwriterStars(90, 60)).toBe(3)
  })
})

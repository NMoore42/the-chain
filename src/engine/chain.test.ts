import { describe, expect, it } from 'vitest'
import { chainStars, differsByOne, isValidChain, nextStep, shortestLadder, validateLink } from './chain'
import { loadTestDictionary } from './testDictionary'

const dict = loadTestDictionary()

describe('differsByOne', () => {
  it('detects single-letter changes', () => {
    expect(differsByOne('cold', 'cord')).toBe(true)
    expect(differsByOne('cold', 'cold')).toBe(false)
    expect(differsByOne('cold', 'card')).toBe(false)
    expect(differsByOne('cold', 'colds')).toBe(false)
  })
})

describe('validateLink', () => {
  it('reports problems', () => {
    expect(validateLink('cold', 'cord', dict, ['cold'])).toBeNull()
    expect(validateLink('cold', 'cold', dict, ['cold'])).toBe('same')
    expect(validateLink('cold', 'card', dict, ['cold'])).toBe('notOneLetter')
    expect(validateLink('cold', 'colq', dict, ['cold'])).toBe('notAWord')
    expect(validateLink('cord', 'cold', dict, ['cold', 'cord'])).toBe('repeat')
  })
})

describe('shortestLadder', () => {
  it('solves the classic cold->warm', () => {
    const path = shortestLadder('cold', 'warm', dict)
    expect(path).not.toBeNull()
    expect(path![0]).toBe('cold')
    expect(path![path!.length - 1]).toBe('warm')
    expect(isValidChain(path!, dict)).toBe(true)
    expect(path!.length - 1).toBe(4)
  })
  it('returns null for unreachable words', () => {
    expect(shortestLadder('abcd', 'wxyz', dict)).toBeNull()
  })
  it('prefers everyday words in hints', () => {
    expect(dict.commonSize).toBeGreaterThan(5000)
    const n = nextStep('cold', 'warm', dict)
    expect(n && dict.isCommon(n)).toBe(true)
  })
  it('gives a next-step hint', () => {
    const n = nextStep('cold', 'warm', dict)
    expect(n).toBeTruthy()
    expect(differsByOne('cold', n!)).toBe(true)
  })
})

describe('chainStars', () => {
  it('rewards par', () => {
    expect(chainStars(4, 4, true)).toBe(3)
    expect(chainStars(6, 4, true)).toBe(2)
    expect(chainStars(8, 4, true)).toBe(1)
    expect(chainStars(8, 4, false)).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import { dateKey, dayIndex, hashString, rngFromString, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = rngFromString('2026-10-31')
    const b = rngFromString('2026-10-31')
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
    expect(rngFromString('x')()).not.toBe(rngFromString('y')())
  })
  it('hashes stably', () => {
    expect(hashString('the chain')).toBe(hashString('the chain'))
  })
  it('shuffles without losing items', () => {
    const out = shuffle([1, 2, 3, 4, 5], rngFromString('s'))
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5])
  })
  it('formats date keys and day indexes', () => {
    expect(dateKey(new Date(2026, 9, 31))).toBe('2026-10-31')
    expect(dayIndex(new Date(2026, 0, 1))).toBe(0)
    expect(dayIndex(new Date(2026, 0, 2))).toBe(1)
    expect(dayIndex(new Date(2026, 9, 31))).toBe(303)
  })
})

import { describe, expect, it } from 'vitest'
import { exportSave, freshSave, importSave, loadSave, persistSave, sanitizeSave, SAVE_KEY, type Storage } from './save'

class MemStorage implements Storage {
  map = new Map<string, string>()
  getItem(k: string) { return this.map.get(k) ?? null }
  setItem(k: string, v: string) { this.map.set(k, v) }
  removeItem(k: string) { this.map.delete(k) }
}

describe('save system', () => {
  it('round-trips through storage', () => {
    const st = new MemStorage()
    const s = freshSave()
    s.concerts.c01 = { completed: true, plays: 1, puzzles: { '0': { stars: 3, hintsUsed: 0, value: 3, completedAt: 'x' } } }
    s.unlockedStories.push('st-windsor')
    persistSave(st, s)
    const loaded = loadSave(st)
    expect(loaded.concerts.c01.completed).toBe(true)
    expect(loaded.concerts.c01.puzzles['0'].stars).toBe(3)
    expect(loaded.unlockedStories).toEqual(['st-windsor'])
  })

  it('returns a fresh save for missing or corrupt data and preserves the corrupt copy', () => {
    const st = new MemStorage()
    expect(loadSave(st).concerts).toEqual({})
    st.setItem(SAVE_KEY, '{not json')
    expect(loadSave(st).version).toBe(1)
    st.setItem(SAVE_KEY, JSON.stringify({ version: 99 }))
    expect(loadSave(st).concerts).toEqual({})
    expect([...st.map.keys()].some((k) => k.includes('corrupt'))).toBe(true)
  })

  it('drops invalid entries and fills defaults', () => {
    const clean = sanitizeSave({
      version: 1,
      concerts: { c01: { completed: 'yes', puzzles: { '0': { stars: 7 }, '1': { stars: 2, hintsUsed: 1, value: 5 } } }, bad: 42 },
      unlockedStories: ['a', 'a', 3],
      settings: { sound: true, largeText: 'big' },
      daily: { '2026-10-31': { solved: true, guesses: 4 }, nope: { solved: true } },
    })
    expect(clean).not.toBeNull()
    expect(clean!.concerts.c01.completed).toBe(false)
    expect(Object.keys(clean!.concerts.c01.puzzles)).toEqual(['1'])
    expect(clean!.concerts.bad).toBeUndefined()
    expect(clean!.unlockedStories).toEqual([])
    expect(clean!.settings.sound).toBe(true)
    expect(clean!.settings.largeText).toBe(false)
    expect(Object.keys(clean!.daily)).toEqual(['2026-10-31'])
  })

  it('exports and imports', () => {
    const s = freshSave()
    s.achievements.push('first-show')
    const text = exportSave(s)
    const back = importSave(text)
    expect(back?.achievements).toEqual(['first-show'])
    expect(importSave('garbage')).toBeNull()
  })
})

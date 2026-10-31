import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { ALL_CONCERTS, ERAS, concertById, eraOfConcert } from '../data/campaign'
import { ACHIEVEMENTS } from '../data/achievements'
import { COLLECTIBLES } from '../data/collectibles'
import { loadSave, persistSave, type PuzzleResult, type SaveData, type Settings } from './save'

type Action =
  | { type: 'puzzleComplete'; concertId: string; index: number; result: PuzzleResult }
  | { type: 'concertComplete'; concertId: string }
  | { type: 'unlockStory'; storyId: string }
  | { type: 'unlockCollectible'; collectibleId: string }
  | { type: 'achievement'; id: string }
  | { type: 'daily'; date: string; solved: boolean; guesses: number }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'stats'; patch: Partial<SaveData['stats']> }
  | { type: 'progress'; key: string; state: unknown | null }
  | { type: 'tutorialSeen'; mode: string }
  | { type: 'replace'; data: SaveData }
  | { type: 'reset' }

function reducer(state: SaveData, action: Action): SaveData {
  switch (action.type) {
    case 'puzzleComplete': {
      const c = state.concerts[action.concertId] ?? { completed: false, puzzles: {}, plays: 0 }
      const prev = c.puzzles[String(action.index)]
      // Keep the best result (stars first, then fewer hints).
      const better = !prev || action.result.stars > prev.stars || (action.result.stars === prev.stars && action.result.hintsUsed < prev.hintsUsed)
      const puzzles = better ? { ...c.puzzles, [String(action.index)]: action.result } : c.puzzles
      return { ...state, concerts: { ...state.concerts, [action.concertId]: { ...c, puzzles } } }
    }
    case 'concertComplete': {
      const c = state.concerts[action.concertId] ?? { completed: false, puzzles: {}, plays: 0 }
      const first = !c.completed
      return {
        ...state,
        concerts: { ...state.concerts, [action.concertId]: { ...c, completed: true, plays: c.plays + 1 } },
        stats: { ...state.stats, concertsCompleted: state.stats.concertsCompleted + (first ? 1 : 0) },
      }
    }
    case 'unlockStory':
      return state.unlockedStories.includes(action.storyId) ? state : { ...state, unlockedStories: [...state.unlockedStories, action.storyId] }
    case 'unlockCollectible':
      return state.unlockedCollectibles.includes(action.collectibleId) ? state : { ...state, unlockedCollectibles: [...state.unlockedCollectibles, action.collectibleId] }
    case 'achievement':
      return state.achievements.includes(action.id) ? state : { ...state, achievements: [...state.achievements, action.id] }
    case 'daily':
      return { ...state, daily: { ...state.daily, [action.date]: { date: action.date, solved: action.solved, guesses: action.guesses } } }
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'stats':
      return { ...state, stats: { ...state.stats, ...action.patch } }
    case 'progress': {
      const inProgress = { ...state.inProgress }
      if (action.state === null) delete inProgress[action.key]
      else inProgress[action.key] = action.state
      return { ...state, inProgress }
    }
    case 'tutorialSeen':
      return state.seenTutorials.includes(action.mode) ? state : { ...state, seenTutorials: [...state.seenTutorials, action.mode] }
    case 'replace':
      return action.data
    case 'reset':
      return loadSave(null)
  }
}

export interface Toast {
  id: number
  title: string
  body?: string
  icon?: string
}

interface GameContextValue {
  save: SaveData
  dispatch: (a: Action) => void
  isConcertUnlocked: (concertId: string) => boolean
  isEraUnlocked: (eraId: string) => boolean
  concertStars: (concertId: string) => number
  concertMaxStars: (concertId: string) => number
  totalStars: number
  maxStars: number
  award: (id: string) => void
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
}

const GameContext = createContext<GameContextValue | null>(null)

const storage = (() => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
})()

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, dispatch] = useReducer(reducer, null, () => loadSave(storage))
  const [toasts, toastDispatch] = useReducer(
    (list: Toast[], a: { add?: Omit<Toast, 'id'>; remove?: number }) => {
      if (a.add) return [...list, { ...a.add, id: Date.now() + Math.random() }]
      if (a.remove !== undefined) return list.filter((t) => t.id !== a.remove)
      return list
    },
    [],
  )
  const timer = useRef<number | null>(null)

  // Debounced persistence.
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => persistSave(storage, save), 150)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [save])

  // Flush on page hide so an iPad swipe-away keeps progress.
  useEffect(() => {
    const flush = () => persistSave(storage, save)
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [save])

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => toastDispatch({ add: t }), [])
  const dismissToast = useCallback((id: number) => toastDispatch({ remove: id }), [])

  const award = useCallback(
    (id: string) => {
      if (save.achievements.includes(id)) return
      const a = ACHIEVEMENTS.find((x) => x.id === id)
      if (!a) return
      dispatch({ type: 'achievement', id })
      pushToast({ title: `Achievement: ${a.name}`, body: a.description, icon: a.icon })
    },
    [save.achievements, pushToast],
  )

  const value = useMemo<GameContextValue>(() => {
    const isConcertUnlocked = (concertId: string) => {
      const i = ALL_CONCERTS.findIndex((c) => c.id === concertId)
      if (i <= 0) return i === 0
      return !!save.concerts[ALL_CONCERTS[i - 1].id]?.completed
    }
    const isEraUnlocked = (eraId: string) => {
      const era = ERAS.find((e) => e.id === eraId)
      return !!era && isConcertUnlocked(era.concerts[0].id)
    }
    const concertStars = (concertId: string) => Object.values(save.concerts[concertId]?.puzzles ?? {}).reduce((s, p) => s + p.stars, 0)
    const concertMaxStars = (concertId: string) => (concertById(concertId)?.puzzles.length ?? 0) * 3
    const totalStars = ALL_CONCERTS.reduce((s, c) => s + concertStars(c.id), 0)
    const maxStars = ALL_CONCERTS.reduce((s, c) => s + concertMaxStars(c.id), 0)
    return { save, dispatch, isConcertUnlocked, isEraUnlocked, concertStars, concertMaxStars, totalStars, maxStars, award, toasts, pushToast, dismissToast }
  }, [save, award, toasts, pushToast, dismissToast])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}

/** Helpers shared by screens. */
export function eraForConcert(concertId: string) {
  return eraOfConcert(concertId)
}

export function collectibleName(id: string) {
  return COLLECTIBLES[id]?.name ?? id
}

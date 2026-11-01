/** Versioned, validated save data persisted to localStorage. */

export const SAVE_KEY = 'the-chain:save'
export const SAVE_VERSION = 1

export interface PuzzleResult {
  stars: 0 | 1 | 2 | 3
  hintsUsed: number
  /** Setlist: guesses used; Songwriter: score; Chain: steps. */
  value: number
  completedAt: string
}

export interface ConcertProgress {
  completed: boolean
  /** Best result per puzzle index. */
  puzzles: Record<string, PuzzleResult>
  /** Number of times the concert has been finished. */
  plays: number
}

export interface DailyResult {
  solved: boolean
  guesses: number
  date: string
}

export interface Settings {
  sound: boolean
  music: boolean
  highContrast: boolean
  largeText: boolean
  reduceMotion: boolean
  tutorialSeen: boolean
}

export interface Stats {
  bestWord: string
  bestWordScore: number
  wordsPlayed: number
  setlistSolved: number
  chainsSolved: number
  concertsCompleted: number
  jamGames: number
  jamWins: number
  jamBestScore: number
  jamBestWord: string
  jamBestWordScore: number
}

export interface SaveData {
  version: typeof SAVE_VERSION
  createdAt: string
  updatedAt: string
  concerts: Record<string, ConcertProgress>
  unlockedStories: string[]
  unlockedCollectibles: string[]
  achievements: string[]
  daily: Record<string, DailyResult>
  settings: Settings
  stats: Stats
  /** Mode tutorials the player has dismissed. */
  seenTutorials: string[]
  /** Live puzzle state keyed by puzzle key, so a refresh resumes mid-puzzle. */
  inProgress: Record<string, unknown>
}

export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  music: false,
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  tutorialSeen: false,
}

export function freshSave(now = new Date()): SaveData {
  const iso = now.toISOString()
  return {
    version: SAVE_VERSION,
    createdAt: iso,
    updatedAt: iso,
    concerts: {},
    unlockedStories: [],
    unlockedCollectibles: [],
    achievements: [],
    daily: {},
    settings: { ...DEFAULT_SETTINGS },
    stats: { bestWord: '', bestWordScore: 0, wordsPlayed: 0, setlistSolved: 0, chainsSolved: 0, concertsCompleted: 0, jamGames: 0, jamWins: 0, jamBestScore: 0, jamBestWord: '', jamBestWordScore: 0 },
    seenTutorials: [],
    inProgress: {},
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback)
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

function sanitizePuzzleResult(v: unknown): PuzzleResult | null {
  if (!isObj(v)) return null
  const stars = num(v.stars)
  if (![0, 1, 2, 3].includes(stars)) return null
  return {
    stars: stars as 0 | 1 | 2 | 3,
    hintsUsed: Math.max(0, Math.floor(num(v.hintsUsed))),
    value: num(v.value),
    completedAt: str(v.completedAt, new Date(0).toISOString()),
  }
}

function sanitizeConcert(v: unknown): ConcertProgress | null {
  if (!isObj(v)) return null
  const puzzles: Record<string, PuzzleResult> = {}
  if (isObj(v.puzzles)) {
    for (const [k, r] of Object.entries(v.puzzles)) {
      const pr = sanitizePuzzleResult(r)
      if (pr) puzzles[k] = pr
    }
  }
  return { completed: bool(v.completed, false), puzzles, plays: Math.max(0, Math.floor(num(v.plays))) }
}

/**
 * Validate and repair unknown data into a SaveData. Returns null when the input
 * is not recognisably a save at all. Unknown fields are dropped; missing fields
 * get defaults, which is how future versions migrate forward.
 */
export function sanitizeSave(input: unknown): SaveData | null {
  if (!isObj(input)) return null
  const version = num(input.version, -1)
  if (version < 1 || version > SAVE_VERSION) return null
  const base = freshSave()

  const concerts: Record<string, ConcertProgress> = {}
  if (isObj(input.concerts)) {
    for (const [id, c] of Object.entries(input.concerts)) {
      const cp = sanitizeConcert(c)
      if (cp) concerts[id] = cp
    }
  }

  const daily: Record<string, DailyResult> = {}
  if (isObj(input.daily)) {
    for (const [k, d] of Object.entries(input.daily)) {
      if (isObj(d) && /^\d{4}-\d{2}-\d{2}$/.test(k)) {
        daily[k] = { solved: bool(d.solved, false), guesses: num(d.guesses), date: k }
      }
    }
  }

  const s = isObj(input.settings) ? input.settings : {}
  const st = isObj(input.stats) ? input.stats : {}

  return {
    version: SAVE_VERSION,
    createdAt: str(input.createdAt, base.createdAt),
    updatedAt: str(input.updatedAt, base.updatedAt),
    concerts,
    unlockedStories: isStrArr(input.unlockedStories) ? [...new Set(input.unlockedStories)] : [],
    unlockedCollectibles: isStrArr(input.unlockedCollectibles) ? [...new Set(input.unlockedCollectibles)] : [],
    achievements: isStrArr(input.achievements) ? [...new Set(input.achievements)] : [],
    daily,
    settings: {
      sound: bool(s.sound, DEFAULT_SETTINGS.sound),
      music: bool(s.music, DEFAULT_SETTINGS.music),
      highContrast: bool(s.highContrast, DEFAULT_SETTINGS.highContrast),
      largeText: bool(s.largeText, DEFAULT_SETTINGS.largeText),
      reduceMotion: bool(s.reduceMotion, DEFAULT_SETTINGS.reduceMotion),
      tutorialSeen: bool(s.tutorialSeen, DEFAULT_SETTINGS.tutorialSeen),
    },
    stats: {
      bestWord: str(st.bestWord),
      bestWordScore: num(st.bestWordScore),
      wordsPlayed: num(st.wordsPlayed),
      setlistSolved: num(st.setlistSolved),
      chainsSolved: num(st.chainsSolved),
      concertsCompleted: num(st.concertsCompleted),
      jamGames: num(st.jamGames),
      jamWins: num(st.jamWins),
      jamBestScore: num(st.jamBestScore),
      jamBestWord: str(st.jamBestWord),
      jamBestWordScore: num(st.jamBestWordScore),
    },
    seenTutorials: isStrArr(input.seenTutorials) ? [...new Set(input.seenTutorials)] : [],
    inProgress: isObj(input.inProgress) ? { ...input.inProgress } : {},
  }
}

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function loadSave(storage: Storage | null): SaveData {
  if (!storage) return freshSave()
  try {
    const raw = storage.getItem(SAVE_KEY)
    if (!raw) return freshSave()
    const parsed = JSON.parse(raw) as unknown
    const clean = sanitizeSave(parsed)
    if (clean) return clean
    // Keep a copy of anything unreadable rather than silently destroying it.
    storage.setItem(`${SAVE_KEY}:corrupt:${Date.now()}`, raw)
    return freshSave()
  } catch {
    return freshSave()
  }
}

export function persistSave(storage: Storage | null, data: SaveData): void {
  if (!storage) return
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }))
  } catch {
    // Quota or privacy mode; the game continues without persistence.
  }
}

/** Export as a pasteable, versioned string. */
export function exportSave(data: SaveData): string {
  return JSON.stringify({ app: 'the-chain', ...data }, null, 2)
}

export function importSave(text: string): SaveData | null {
  try {
    const parsed = JSON.parse(text) as unknown
    return sanitizeSave(parsed)
  } catch {
    return null
  }
}

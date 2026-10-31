/** Shared content types for the campaign, puzzles, and scrapbook. */

export type EraId = 'blues' | 'transition' | 'stevie' | 'rumours' | 'storm' | 'tusk' | 'solo' | 'legacy'

export interface SetlistPuzzle {
  kind: 'setlist'
  id: string
  answer: string
  /** Era-flavored clue shown when the player asks for the first hint. */
  clue: string
  /** One line of backstage framing (game fiction, not history). */
  intro: string
}

export interface SongwriterPuzzle {
  kind: 'songwriter'
  id: string
  /** Number of words the player may play in this session. */
  takes: number
  target: number
  /** Optional golden letter: words using it score double base points. */
  golden?: string
  intro: string
}

export interface ChainPuzzle {
  kind: 'chain'
  id: string
  start: string
  end: string
  /** A model solution using common words; par = solution.length - 1. */
  solution: string[]
  intro: string
}

export type Puzzle = SetlistPuzzle | SongwriterPuzzle | ChainPuzzle
export type PuzzleKind = Puzzle['kind']

export interface Concert {
  id: string
  era: EraId
  /** Display title, e.g. "Windsor Jazz & Blues Festival". */
  title: string
  location: string
  date: string
  /** documented = the band verifiably performed here on/around this date; representative = a stage for the game only. */
  venueKind: 'documented' | 'representative' | 'studio'
  capacityLabel: string
  /** 1–5, drives the venue illustration scale. */
  scale: 1 | 2 | 3 | 4 | 5
  blurb: string
  puzzles: Puzzle[]
  storyId: string
  collectibleId: string
}

export interface Era {
  id: EraId
  number: number
  title: string
  years: string
  tagline: string
  introStoryId: string
  concerts: Concert[]
}

export interface StoryCard {
  id: string
  title: string
  year: string
  /** 'band' | 'stevie' | 'album' | 'moment' — drives the card badge. */
  tag: 'band' | 'stevie' | 'album' | 'moment'
  paragraphs: string[]
  sources: string[]
  /** Optional official listening link (e.g. the band's official YouTube channel). */
  listen?: { label: string; url: string }
}

export interface Collectible {
  id: string
  name: string
  description: string
  /** Icon key rendered by the Memorabilia SVG component. */
  icon: string
}

export interface MemberProfile {
  id: string
  name: string
  role: string
  years: string
  summary: string
  unlockedByConcert: string
  sources: string[]
}

export interface AlbumEntry {
  id: string
  title: string
  released: string
  note: string
  unlockedByConcert: string
  sources: string[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}

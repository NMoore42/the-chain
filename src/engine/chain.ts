/** The Chain — word ladders. One letter changes per link; every link must be a real word. */

import type { Dictionary } from './dictionary'

export function differsByOne(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i] && ++diff > 1) return false
  }
  return diff === 1
}

export type LinkProblem = 'same' | 'length' | 'notOneLetter' | 'notAWord' | 'repeat'

export function validateLink(prev: string, next: string, dict: Dictionary, chain: readonly string[]): LinkProblem | null {
  const a = prev.toLowerCase()
  const b = next.toLowerCase()
  if (a === b) return 'same'
  if (a.length !== b.length) return 'length'
  if (!differsByOne(a, b)) return 'notOneLetter'
  if (!dict.has(b)) return 'notAWord'
  if (chain.some((w) => w.toLowerCase() === b)) return 'repeat'
  return null
}

export function isValidChain(chain: readonly string[], dict: Dictionary): boolean {
  if (chain.length < 2) return false
  for (let i = 1; i < chain.length; i++) {
    if (!differsByOne(chain[i - 1], chain[i])) return false
    if (!dict.has(chain[i])) return false
  }
  return dict.has(chain[0])
}

export function neighbors(word: string, dict: Dictionary, allowed?: (w: string) => boolean): string[] {
  const out: string[] = []
  const w = word.toLowerCase()
  for (let i = 0; i < w.length; i++) {
    for (let c = 97; c <= 122; c++) {
      const ch = String.fromCharCode(c)
      if (ch === w[i]) continue
      const cand = w.slice(0, i) + ch + w.slice(i + 1)
      if (dict.has(cand) && (!allowed || allowed(cand))) out.push(cand)
    }
  }
  return out
}

/**
 * Breadth-first shortest ladder from start to end, or null if none exists.
 * `allowed` optionally restricts intermediate words (e.g. to everyday words).
 */
export function shortestLadder(start: string, end: string, dict: Dictionary, maxDepth = 12, allowed?: (w: string) => boolean): string[] | null {
  const s = start.toLowerCase()
  const e = end.toLowerCase()
  if (s.length !== e.length) return null
  if (s === e) return [s]
  const parent = new Map<string, string | null>([[s, null]])
  let frontier = [s]
  for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
    const next: string[] = []
    for (const w of frontier) {
      for (const n of neighbors(w, dict, (x) => x === e || !allowed || allowed(x))) {
        if (parent.has(n)) continue
        parent.set(n, w)
        if (n === e) {
          const path = [e]
          let cur: string | null = w
          while (cur) {
            path.push(cur)
            cur = parent.get(cur) ?? null
          }
          return path.reverse()
        }
        next.push(n)
      }
    }
    frontier = next
  }
  return null
}

/** Stars: par = the puzzle's shortest known step count. */
export function chainStars(steps: number, par: number, solved: boolean): 0 | 1 | 2 | 3 {
  if (!solved) return 0
  if (steps <= par) return 3
  if (steps <= par + 2) return 2
  return 1
}

/**
 * A hint: the next word on a shortest path from the current word to the end,
 * preferring a path through everyday words when one exists.
 */
export function nextStep(current: string, end: string, dict: Dictionary): string | null {
  const friendly = dict.commonSize > 0 ? shortestLadder(current, end, dict, 12, (w) => dict.isCommon(w)) : null
  const path = friendly ?? shortestLadder(current, end, dict)
  return path && path.length > 1 ? path[1] : null
}

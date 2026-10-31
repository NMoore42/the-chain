/** Word validation backed by the public-domain ENABLE list (3–8 letters, filtered). */

export class Dictionary {
  private readonly words: Set<string>
  private readonly byLength = new Map<number, string[]>()
  /** Everyday words (frequency-ranked subset) used to keep hints friendly. */
  private readonly common: Set<string>

  constructor(words: Iterable<string>, common: Iterable<string> = []) {
    this.words = new Set()
    for (const raw of words) {
      const w = raw.trim().toLowerCase()
      if (!w) continue
      this.words.add(w)
      const list = this.byLength.get(w.length)
      if (list) list.push(w)
      else this.byLength.set(w.length, [w])
    }
    this.common = new Set()
    for (const raw of common) {
      const w = raw.trim().toLowerCase()
      if (w && this.words.has(w)) this.common.add(w)
    }
  }

  has(word: string): boolean {
    return this.words.has(word.toLowerCase())
  }

  isCommon(word: string): boolean {
    return this.common.has(word.toLowerCase())
  }

  get commonSize(): number {
    return this.common.size
  }

  get size(): number {
    return this.words.size
  }

  wordsOfLength(n: number): readonly string[] {
    return this.byLength.get(n) ?? []
  }

  static fromText(text: string, commonText = ''): Dictionary {
    return new Dictionary(text.split(/\r?\n/), commonText.split(/\r?\n/))
  }
}

let cached: Promise<Dictionary> | null = null

/** Browser loader; resolves once and caches. `base` is import.meta.env.BASE_URL. */
export function loadDictionary(base: string): Promise<Dictionary> {
  if (!cached) {
    const root = base.replace(/\/$/, '')
    const get = (file: string) =>
      fetch(`${root}/words/${file}`).then((r) => {
        if (!r.ok) throw new Error(`Dictionary failed to load (${r.status})`)
        return r.text()
      })
    cached = Promise.all([get('enable-3-8.txt'), get('common.txt').catch(() => '')])
      .then(([all, common]) => Dictionary.fromText(all, common))
      .catch((err) => {
        cached = null
        throw err
      })
  }
  return cached
}

/** Node-only helper for tests and the puzzle validator: loads the shipped word list. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Dictionary } from './dictionary'

let cached: Dictionary | null = null

export function loadTestDictionary(): Dictionary {
  if (!cached) {
    const text = readFileSync(resolve(process.cwd(), 'public/words/enable-3-8.txt'), 'utf8')
    const common = readFileSync(resolve(process.cwd(), 'public/words/common.txt'), 'utf8')
    cached = Dictionary.fromText(text, common)
  }
  return cached
}

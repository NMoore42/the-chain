import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SetlistPuzzle } from '../../data/types'
import { hintPosition, keyboardStates, MAX_GUESSES, scoreGuess, setlistStars, type LetterState } from '../../engine/setlist'
import { Keyboard } from '../components/Keyboard'
import { UiIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'
import type { ModeProps } from './types'

interface SetlistState {
  guesses: string[]
  current: string
  hintsUsed: number
  clueShown: boolean
  revealed: Record<number, string>
  extraRows: number
  status: 'playing' | 'outOfGuesses' | 'won' | 'revealed'
}

const EXTRA = 2
const SHAPES: Record<LetterState, string> = { correct: '●', present: '◆', absent: '' }

function isState(v: unknown): v is SetlistState {
  return !!v && typeof v === 'object' && Array.isArray((v as SetlistState).guesses) && typeof (v as SetlistState).current === 'string'
}

export function SetlistMode({ puzzle, dict, initialState, onStateChange, onFinish, compact = false }: ModeProps<SetlistPuzzle>) {
  const answer = puzzle.answer.toLowerCase()
  const len = answer.length
  const [state, setState] = useState<SetlistState>(() =>
    isState(initialState) ? initialState : { guesses: [], current: '', hintsUsed: 0, clueShown: false, revealed: {}, extraRows: 0, status: 'playing' },
  )
  const [revealingRow, setRevealingRow] = useState<number | null>(null)
  const [shake, setShake] = useState(false)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const finished = useRef(false)
  const maxRows = MAX_GUESSES + state.extraRows

  useEffect(() => {
    onStateChange(state.status === 'won' || state.status === 'revealed' ? null : state)
  }, [state, onStateChange])

  const keyStates = useMemo(() => keyboardStates(state.guesses, answer), [state.guesses, answer])

  const finish = useCallback(
    (s: SetlistState) => {
      if (finished.current) return
      finished.current = true
      const solved = s.status === 'won'
      const count = s.guesses.length
      const stars = s.status === 'revealed' ? 1 : count > MAX_GUESSES ? 1 : setlistStars(count, solved)
      onFinish({ solved: true, stars, hintsUsed: s.hintsUsed, value: count, detail: { revealed: s.status === 'revealed', guesses: count } })
    },
    [onFinish],
  )

  const say = (text: string, error = false) => setMessage({ text, error })

  const submit = useCallback(() => {
    if (state.status !== 'playing' || revealingRow !== null) return
    const g = state.current.toLowerCase()
    if (g.length < len) {
      say('Not enough letters', true); setShake(true); sfx.invalid(); return
    }
    if (!dict.has(g) && g !== answer) {
      say('Not in the word list', true); setShake(true); sfx.invalid(); return
    }
    if (state.guesses.includes(g)) {
      say('Already tried that one', true); setShake(true); sfx.invalid(); return
    }
    setMessage(null)
    const row = state.guesses.length
    setRevealingRow(row)
    const result = scoreGuess(g, answer)
    result.forEach((r, i) => window.setTimeout(() => (r === 'correct' ? sfx.flipCorrect() : r === 'present' ? sfx.flipPresent() : sfx.flipAbsent()), i * 260))
    const guesses = [...state.guesses, g]
    window.setTimeout(() => {
      setRevealingRow(null)
      const won = g === answer
      const out = guesses.length >= maxRows
      const next: SetlistState = { ...state, guesses, current: '', status: won ? 'won' : out ? 'outOfGuesses' : 'playing' }
      setState(next)
      if (won) {
        sfx.win()
        say(['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!', 'Encore!', 'Encore!'][guesses.length - 1] ?? 'Encore!')
        window.setTimeout(() => finish(next), 900)
      } else if (out) {
        sfx.lose()
      }
    }, len * 260 + 200)
  }, [state, revealingRow, len, dict, answer, maxRows, finish])

  const onKey = useCallback(
    (ch: string) => {
      if (state.status !== 'playing' || revealingRow !== null) return
      if (state.current.length >= len) return
      sfx.tap()
      setMessage(null)
      setState((s) => ({ ...s, current: s.current + ch }))
    },
    [state.status, state.current.length, len, revealingRow],
  )
  const onBackspace = useCallback(() => {
    if (state.status !== 'playing') return
    setState((s) => ({ ...s, current: s.current.slice(0, -1) }))
  }, [state.status])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === 'Enter') { e.preventDefault(); submit() }
      else if (e.key === 'Backspace') { e.preventDefault(); onBackspace() }
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toLowerCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [submit, onBackspace, onKey])

  useEffect(() => {
    if (!shake) return
    const t = window.setTimeout(() => setShake(false), 450)
    return () => window.clearTimeout(t)
  }, [shake])

  const showClue = () => {
    sfx.hint()
    setState((s) => ({ ...s, clueShown: true, hintsUsed: s.hintsUsed + 1 }))
  }
  const revealLetter = () => {
    const pos = hintPosition(state.guesses, answer)
    if (pos === null) return
    sfx.hint()
    setState((s) => ({ ...s, revealed: { ...s.revealed, [pos]: answer[pos] }, hintsUsed: s.hintsUsed + 1 }))
    say(`Letter ${pos + 1} is ${answer[pos].toUpperCase()}`)
  }
  const encore = () => {
    sfx.tap()
    setState((s) => ({ ...s, extraRows: EXTRA, status: 'playing' }))
    say('Two more guesses. You can do it.')
  }
  const reveal = () => {
    const next: SetlistState = { ...state, status: 'revealed' }
    setState(next)
    say(`The word was ${answer.toUpperCase()}`)
    window.setTimeout(() => finish(next), 1200)
  }

  const rows = Array.from({ length: maxRows }, (_, r) => r)
  const canHint = state.status === 'playing' && !compact
  const hintPos = hintPosition(state.guesses, answer)
  const highContrast = document.documentElement.getAttribute('data-contrast') === 'high'

  return (
    <div className="stack">
      {state.clueShown && <p className="puzzle-intro" aria-live="polite">Clue: {puzzle.clue}</p>}
      <div className={`message${message?.error ? ' is-error' : ''}`} aria-live="assertive">{message?.text ?? ''}</div>
      <div className="board" role="grid" aria-label="Guess grid" style={{ gridTemplateColumns: '1fr' }}>
        {rows.map((r) => {
          const guess = state.guesses[r]
          const isCurrent = r === state.guesses.length && state.status === 'playing'
          const isRevealing = revealingRow === r
          const states = guess ? scoreGuess(guess, answer) : null
          const won = guess === answer && !isRevealing
          return (
            <div key={r} className={`board-row${isCurrent && shake ? ' is-shake' : ''}${won ? ' is-win' : ''}`} role="row">
              {Array.from({ length: len }, (_, i) => {
                let ch = ''
                let cls = 'tile'
                let st: LetterState | null = null
                if (guess) {
                  ch = guess[i]
                  st = states![i]
                  if (isRevealing) cls += ' is-flip'
                  cls += ` is-${st}`
                } else if (isCurrent) {
                  ch = state.current[i] ?? ''
                  if (ch) cls += ' is-filled'
                  else if (state.revealed[i]) { ch = state.revealed[i]; cls += ' is-hint' }
                }
                const style = isRevealing ? { animationDelay: `${i * 260}ms` } : undefined
                const label = guess ? `${ch.toUpperCase()}, ${st}` : ch ? ch.toUpperCase() : 'empty'
                return (
                  <div key={i} className={cls} style={style} role="gridcell" aria-label={label}>
                    {ch}
                    {highContrast && st && SHAPES[st] && <span className="shape" aria-hidden="true">{SHAPES[st]}</span>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {state.status === 'outOfGuesses' && (
        <div className="card center stack">
          <p>Out of guesses, but the crowd wants more.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            {state.extraRows === 0 && <button className="btn btn-primary" onClick={encore}>Encore attempt (+2 guesses)</button>}
            <button className="btn btn-ghost" onClick={reveal}>Reveal the word</button>
          </div>
        </div>
      )}

      {state.status === 'playing' && (
        <>
          <div className="puzzle-tools">
            {canHint && !state.clueShown && puzzle.clue && (
              <button className="btn btn-ghost btn-sm" onClick={showClue}><UiIcon name="hint" size={18} /> Clue</button>
            )}
            {hintPos !== null && state.status === 'playing' && (
              <button className="btn btn-ghost btn-sm" onClick={revealLetter}><UiIcon name="hint" size={18} /> Reveal a letter</button>
            )}
          </div>
          <Keyboard states={keyStates} onKey={onKey} onEnter={submit} onBackspace={onBackspace} disabled={revealingRow !== null} />
        </>
      )}
    </div>
  )
}

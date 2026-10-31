import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChainPuzzle } from '../../data/types'
import { chainStars, nextStep, validateLink, type LinkProblem } from '../../engine/chain'
import { Keyboard } from '../components/Keyboard'
import { UiIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'
import type { ModeProps } from './types'

interface ChainState {
  chain: string[]
  input: string
  cursor: number
  hintsUsed: number
  status: 'playing' | 'done'
}

const PROBLEMS: Record<LinkProblem, string> = {
  same: 'Change one letter to make a new word',
  length: 'Keep the same number of letters',
  notOneLetter: 'Only one letter may change',
  notAWord: 'Not in the word list',
  repeat: 'That word is already in the chain',
}

function isState(v: unknown): v is ChainState {
  return !!v && typeof v === 'object' && Array.isArray((v as ChainState).chain) && typeof (v as ChainState).input === 'string'
}

export function ChainMode({ puzzle, dict, initialState, onStateChange, onFinish, compact = false }: ModeProps<ChainPuzzle>) {
  const start = puzzle.start.toLowerCase()
  const end = puzzle.end.toLowerCase()
  const par = puzzle.solution.length - 1
  const [state, setState] = useState<ChainState>(() =>
    isState(initialState) ? initialState : { chain: [start], input: start, cursor: 0, hintsUsed: 0, status: 'playing' },
  )
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [shake, setShake] = useState(false)
  const finished = useRef(false)

  useEffect(() => {
    onStateChange(state.status === 'done' ? null : state)
  }, [state, onStateChange])

  const current = state.chain[state.chain.length - 1]
  const steps = state.chain.length - 1

  const finish = useCallback(
    (s: ChainState) => {
      if (finished.current) return
      finished.current = true
      const n = s.chain.length - 1
      onFinish({ solved: true, stars: chainStars(n, par, true), hintsUsed: s.hintsUsed, value: n, detail: { par, steps: n } })
    },
    [onFinish, par],
  )

  const submit = useCallback(() => {
    if (state.status !== 'playing') return
    const problem = validateLink(current, state.input, dict, state.chain)
    if (problem) {
      setMessage({ text: PROBLEMS[problem], error: true })
      setShake(true)
      sfx.invalid()
      return
    }
    const chain = [...state.chain, state.input]
    const done = state.input === end
    const next: ChainState = { ...state, chain, input: state.input, cursor: 0, status: done ? 'done' : 'playing' }
    setState(next)
    setMessage(done ? { text: 'The chain is complete!' } : null)
    if (done) {
      sfx.win()
      window.setTimeout(() => finish(next), 900)
    } else sfx.link()
  }, [state, current, dict, end, finish])

  const setLetter = useCallback(
    (ch: string) => {
      if (state.status !== 'playing') return
      sfx.tap()
      setMessage(null)
      setState((s) => {
        const arr = Array.from(s.input)
        arr[s.cursor] = ch
        return { ...s, input: arr.join(''), cursor: Math.min(s.cursor + 1, s.input.length - 1) }
      })
    },
    [state.status],
  )
  const resetInput = useCallback(() => {
    setState((s) => ({ ...s, input: s.chain[s.chain.length - 1], cursor: 0 }))
  }, [])
  const undo = () => {
    if (state.chain.length <= 1 || state.status !== 'playing') return
    sfx.undo()
    const chain = state.chain.slice(0, -1)
    setState((s) => ({ ...s, chain, input: chain[chain.length - 1], cursor: 0 }))
    setMessage(null)
  }
  const hint = () => {
    if (state.status !== 'playing') return
    // Prefer the curated common-word solution when the player is on it.
    const i = puzzle.solution.indexOf(current)
    let next: string | null = null
    if (i >= 0 && i < puzzle.solution.length - 1 && !state.chain.includes(puzzle.solution[i + 1])) next = puzzle.solution[i + 1]
    else next = nextStep(current, end, dict)
    if (!next) { setMessage({ text: 'No path from here. Try undoing a link.', error: true }); return }
    sfx.hint()
    const pos = Array.from(next).findIndex((c, k) => c !== current[k])
    setState((s) => ({ ...s, input: next!, cursor: Math.max(0, pos), hintsUsed: s.hintsUsed + 1 }))
    setMessage({ text: `Try ${next.toUpperCase()}. Press Enter to add the link.` })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === 'Enter') { e.preventDefault(); submit() }
      else if (e.key === 'Backspace' || e.key === 'Escape') { e.preventDefault(); resetInput() }
      else if (e.key === 'ArrowLeft') setState((s) => ({ ...s, cursor: Math.max(0, s.cursor - 1) }))
      else if (e.key === 'ArrowRight') setState((s) => ({ ...s, cursor: Math.min(s.input.length - 1, s.cursor + 1) }))
      else if (/^[a-zA-Z]$/.test(e.key)) setLetter(e.key.toLowerCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [submit, resetInput, setLetter])

  useEffect(() => {
    if (!shake) return
    const t = window.setTimeout(() => setShake(false), 450)
    return () => window.clearTimeout(t)
  }, [shake])

  const changedIdx = useMemo(() => Array.from(state.input).findIndex((c, k) => c !== current[k]), [state.input, current])

  return (
    <div className="stack">
      <div className="row-between">
        <span className="chain-target">Reach <span className="badge">{end.toUpperCase()}</span></span>
        {!compact && <span className="small muted">Par {par} link{par === 1 ? '' : 's'} · {steps} so far</span>}
        {compact && <span className="small muted">{steps} link{steps === 1 ? '' : 's'}</span>}
      </div>
      <div className={`message${message?.error ? ' is-error' : ''}`} aria-live="assertive">{message?.text ?? ''}</div>

      <div className="chain" aria-label="Word chain">
        {state.chain.map((w, i) => {
          const prev = state.chain[i - 1]
          const isEnd = w === end
          return (
            <div key={`${w}-${i}`} style={{ display: 'contents' }}>
              {i > 0 && <div className="chain-connector" aria-hidden="true" />}
              <div className={`chain-link${i === 0 ? ' is-start' : isEnd ? ' is-end' : ' is-done is-changed'}`} aria-label={w.toUpperCase()}>
                {Array.from(w).map((c, k) => (
                  <div key={k} className={`tile${prev && prev[k] !== c ? ' is-diff' : ''}`}>{c}</div>
                ))}
              </div>
            </div>
          )
        })}
        {state.status === 'playing' && (
          <>
            <div className="chain-connector" aria-hidden="true" />
            <div className={`chain-link is-input${shake ? ' is-shake' : ''}`} role="group" aria-label="Next word; tap a letter to change it">
              {Array.from(state.input).map((c, k) => (
                <button
                  key={k}
                  className={`tile${k === state.cursor ? ' is-cursor' : ''}${k === changedIdx ? ' is-filled' : ''}`}
                  onClick={() => { sfx.tap(); setState((s) => ({ ...s, cursor: k })) }}
                  aria-label={`Position ${k + 1}, ${c.toUpperCase()}${k === state.cursor ? ', selected' : ''}`}
                  style={k === changedIdx ? { color: 'var(--gold-2)', borderColor: 'var(--gold)' } : undefined}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="chain-connector" aria-hidden="true" style={{ opacity: 0.4 }} />
            <div className="chain-link is-end" aria-hidden="true" style={{ opacity: 0.55 }}>
              {Array.from(end).map((c, k) => <div key={k} className="tile">{c}</div>)}
            </div>
          </>
        )}
      </div>

      {state.status === 'playing' && (
        <>
          <div className="puzzle-tools">
            <button className="btn btn-primary" onClick={submit}><UiIcon name="check" size={18} /> Add link</button>
            <button className="btn btn-ghost btn-sm" onClick={undo} disabled={state.chain.length <= 1}><UiIcon name="undo" size={18} /> Undo</button>
            {!compact && <button className="btn btn-ghost btn-sm" onClick={hint}><UiIcon name="hint" size={18} /> Hint</button>}
          </div>
          <Keyboard states={{}} onKey={setLetter} onEnter={submit} onBackspace={resetInput} />
        </>
      )}
    </div>
  )
}

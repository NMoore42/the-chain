import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SongwriterPuzzle } from '../../data/types'
import {
  TileStream, bestWord, findPlayableWords, openingRack, scoreWord, songwriterStars, swapTiles, tilesForWord, STAR_MULTIPLIERS, type Tile,
} from '../../engine/songwriter'
import { rngFromString, shuffle } from '../../engine/rng'
import { UiIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'
import type { ModeProps } from './types'

interface PlayedWord { word: string; points: number; label: string | null }
interface SwState {
  pos: { rolls: number; counter: number }
  rack: Tile[]
  word: string[] // tile ids in order
  played: PlayedWord[]
  score: number
  takesUsed: number
  swapsUsed: number
  hintsUsed: number
  status: 'playing' | 'done'
}

const MAX_SWAPS = 2
const MAX_HINTS = 2

function isState(v: unknown): v is SwState {
  return !!v && typeof v === 'object' && Array.isArray((v as SwState).rack) && typeof (v as SwState).score === 'number' && !!(v as SwState).pos
}

export function SongwriterMode({ puzzle, dict, seed, initialState, onStateChange, onFinish, compact = false }: ModeProps<SongwriterPuzzle>) {
  const golden = puzzle.golden ?? null
  const allWords = useMemo(() => [3, 4, 5, 6, 7].flatMap((n) => [...dict.wordsOfLength(n)]), [dict])
  const countWords = useCallback((rack: readonly Tile[]) => findPlayableWords(rack, allWords).length, [allWords])

  const streamRef = useRef<TileStream | null>(null)
  const [state, setState] = useState<SwState>(() => {
    if (isState(initialState)) {
      streamRef.current = TileStream.restore(seed, golden, initialState.pos)
      return initialState
    }
    const stream = new TileStream(seed, golden)
    streamRef.current = stream
    const rack = openingRack(stream, countWords)
    return { pos: stream.position, rack, word: [], played: [], score: 0, takesUsed: 0, swapsUsed: 0, hintsUsed: 0, status: 'playing' }
  })
  const [swapping, setSwapping] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [floats, setFloats] = useState<{ id: number; text: string }[]>([])
  const finished = useRef(false)

  useEffect(() => {
    onStateChange(state.status === 'done' ? null : state)
  }, [state, onStateChange])

  const wordTiles = state.word.map((id) => state.rack.find((t) => t.id === id)!).filter(Boolean)
  const wordStr = wordTiles.map((t) => t.letter).join('')
  const rackFree = state.rack.filter((t) => !state.word.includes(t.id))
  const alreadyPlayed = state.played.some((p) => p.word === wordStr)
  const valid = wordStr.length >= 3 && dict.has(wordStr) && !alreadyPlayed
  const preview = wordStr.length >= 3 ? scoreWord(wordStr, golden) : null
  const takesLeft = puzzle.takes - state.takesUsed
  const reached = state.score >= puzzle.target

  const finish = useCallback(
    (s: SwState) => {
      if (finished.current) return
      finished.current = true
      const stars = songwriterStars(s.score, puzzle.target)
      const best = s.played.reduce<PlayedWord | null>((b, p) => (!b || p.points > b.points ? p : b), null)
      onFinish({
        solved: s.score >= puzzle.target,
        stars,
        hintsUsed: s.hintsUsed,
        value: s.score,
        detail: { bestWord: best?.word ?? '', bestWordScore: best?.points ?? 0, wordsPlayed: s.played.length, longest: Math.max(0, ...s.played.map((p) => p.word.length)) },
      })
    },
    [onFinish, puzzle.target],
  )

  const addFloat = (text: string) => {
    const id = Date.now() + Math.random()
    setFloats((f) => [...f, { id, text }])
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1000)
  }

  const tapRackTile = (t: Tile) => {
    if (state.status !== 'playing') return
    if (swapping) {
      setSelected((s) => (s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id]))
      sfx.tap()
      return
    }
    sfx.place()
    setMessage(null)
    setState((s) => ({ ...s, word: [...s.word, t.id] }))
  }
  const tapWordTile = (t: Tile) => {
    sfx.remove()
    setState((s) => ({ ...s, word: s.word.filter((id) => id !== t.id) }))
  }
  const clear = () => setState((s) => ({ ...s, word: [] }))

  const play = () => {
    if (!valid || !preview) {
      if (wordStr.length < 3) setMessage({ text: 'Words need at least three letters', error: true })
      else if (alreadyPlayed) setMessage({ text: 'Already played that one', error: true })
      else setMessage({ text: 'Not in the word list', error: true })
      sfx.invalid()
      return
    }
    const stream = streamRef.current!
    const rest = state.rack.filter((t) => !state.word.includes(t.id))
    const rack = stream.fill(rest)
    const played = [...state.played, { word: wordStr, points: preview.total, label: preview.bonusLabel }]
    const score = state.score + preview.total
    const takesUsed = state.takesUsed + 1
    const done = takesUsed >= puzzle.takes
    const next: SwState = { ...state, pos: stream.position, rack, word: [], played, score, takesUsed, status: done ? 'done' : 'playing' }
    setState(next)
    sfx.word(preview.total)
    addFloat(`+${preview.total}${preview.bonusLabel ? ` ${preview.bonusLabel}` : ''}${preview.goldenBonus ? ' ✦ golden' : ''}`)
    setMessage(preview.bonusLabel ? { text: `${preview.bonusLabel} ${preview.bonusLabel === 'Chorus!' ? '— all seven tiles!' : ''}` } : null)
    if (done) window.setTimeout(() => finish(next), 1100)
    else if (score >= puzzle.target && state.score < puzzle.target) {
      sfx.unlock()
      window.setTimeout(() => setMessage({ text: 'Target reached! Keep writing for more stars, or finish the song.' }), 900)
    }
  }

  const startSwap = () => {
    if (state.swapsUsed >= MAX_SWAPS) return
    sfx.tap()
    setSwapping(true)
    setSelected([])
    setState((s) => ({ ...s, word: [] }))
    setMessage({ text: 'Tap the tiles to swap, then confirm.' })
  }
  const confirmSwap = () => {
    if (!selected.length) { setSwapping(false); setMessage(null); return }
    const stream = streamRef.current!
    const rack = swapTiles(state.rack, selected, stream)
    setState((s) => ({ ...s, rack, pos: stream.position, swapsUsed: s.swapsUsed + 1, word: [] }))
    setSwapping(false)
    setSelected([])
    setMessage(null)
    sfx.place()
  }
  const cancelSwap = () => { setSwapping(false); setSelected([]); setMessage(null) }

  const shuffleRack = () => {
    sfx.tap()
    setState((s) => ({ ...s, rack: shuffle(s.rack, rngFromString(String(Date.now()))), word: [] }))
  }

  const hint = () => {
    if (state.hintsUsed >= MAX_HINTS) return
    const playable = findPlayableWords(state.rack, allWords).filter((w) => !state.played.some((p) => p.word === w))
    const friendly = playable.filter((w) => dict.isCommon(w))
    const best = bestWord(state.rack, friendly.length ? friendly : playable, golden)
    if (!best) { setMessage({ text: 'No words here. Try a swap.', error: true }); return }
    const tiles = tilesForWord(best, state.rack)!
    sfx.hint()
    setState((s) => ({ ...s, word: tiles.map((t) => t.id), hintsUsed: s.hintsUsed + 1 }))
    setMessage({ text: 'A word for you. Press Play when ready.' })
  }

  const finishEarly = () => {
    const next: SwState = { ...state, status: 'done', word: [] }
    setState(next)
    finish(next)
  }

  const starAt = (m: number) => Math.ceil(puzzle.target * m)
  const pct = Math.min(100, Math.round((state.score / puzzle.target) * 100))

  return (
    <div className="stack" style={{ position: 'relative' }}>
      {floats.map((f) => <span key={f.id} className="float-score">{f.text}</span>)}
      <div className="score-strip" aria-live="polite">
        <div className="stat"><div className="val">{state.score}</div><div className="lbl">Score</div></div>
        <div className="stat"><div className="val">{puzzle.target}</div><div className="lbl">Target</div></div>
        <div className="stat"><div className="val">{takesLeft}</div><div className="lbl">{takesLeft === 1 ? 'Take left' : 'Takes left'}</div></div>
      </div>
      <div className="progress-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
      {!compact && (
        <p className="small muted center">
          ★ {puzzle.target} · ★★ {starAt(STAR_MULTIPLIERS.two)} · ★★★ {starAt(STAR_MULTIPLIERS.three)}
          {golden && <> · golden letter <b style={{ color: 'var(--gold-2)' }}>{golden.toUpperCase()}</b> doubles</>}
        </p>
      )}
      <div className={`message${message?.error ? ' is-error' : ''}`} aria-live="polite">{message?.text ?? ''}</div>

      <div className={`word-line${wordStr.length >= 3 ? (valid ? ' is-valid' : ' is-invalid') : ''}`} aria-label="Your word">
        {wordTiles.map((t) => (
          <button key={t.id} className={`letter-tile is-sm${t.letter === golden ? ' is-golden' : ''}`} onClick={() => tapWordTile(t)} aria-label={`Remove ${t.letter.toUpperCase()}`}>
            {t.letter}<span className="pts">{t.value}</span>
          </button>
        ))}
        {preview && valid && <span className="badge" aria-live="polite">{preview.total} pts{preview.bonusLabel ? ` · ${preview.bonusLabel}` : ''}</span>}
      </div>

      <div className="rack" role="group" aria-label="Your tiles">
        {state.rack.map((t) => {
          const inWord = state.word.includes(t.id)
          return (
            <button
              key={t.id}
              className={`letter-tile${t.letter === golden ? ' is-golden' : ''}${inWord ? ' is-ghost' : ''}${selected.includes(t.id) ? ' is-selected' : ''}`}
              onClick={() => tapRackTile(t)}
              disabled={inWord || state.status !== 'playing'}
              aria-label={`${t.letter.toUpperCase()}, ${t.value} point${t.value === 1 ? '' : 's'}${t.letter === golden ? ', golden' : ''}`}
              aria-pressed={swapping ? selected.includes(t.id) : undefined}
            >
              {t.letter}<span className="pts">{t.value}</span>
            </button>
          )
        })}
      </div>

      {state.status === 'playing' && !swapping && (
        <div className="puzzle-tools">
          <button className="btn btn-primary" onClick={play} disabled={wordStr.length === 0}><UiIcon name="play" size={18} /> Play word</button>
          <button className="btn btn-ghost btn-sm" onClick={clear} disabled={wordStr.length === 0}>Clear</button>
          <button className="btn btn-ghost btn-sm" onClick={shuffleRack} aria-label="Shuffle tiles"><UiIcon name="shuffle" size={18} /> Shuffle</button>
          <button className="btn btn-ghost btn-sm" onClick={startSwap} disabled={state.swapsUsed >= MAX_SWAPS}><UiIcon name="swap" size={18} /> Swap ({MAX_SWAPS - state.swapsUsed})</button>
          {!compact && <button className="btn btn-ghost btn-sm" onClick={hint} disabled={state.hintsUsed >= MAX_HINTS}><UiIcon name="hint" size={18} /> Hint ({MAX_HINTS - state.hintsUsed})</button>}
          {reached && <button className="btn btn-ghost btn-sm" onClick={finishEarly}><UiIcon name="check" size={18} /> Finish song</button>}
        </div>
      )}
      {swapping && (
        <div className="puzzle-tools">
          <button className="btn btn-primary" onClick={confirmSwap}>Swap {selected.length ? `${selected.length} tile${selected.length === 1 ? '' : 's'}` : ''}</button>
          <button className="btn btn-ghost" onClick={cancelSwap}>Cancel</button>
        </div>
      )}
      {!swapping && rackFree.length > 0 && state.status === 'playing' && countWords(state.rack) === 0 && (
        <p className="center small muted">No words left in this rack. Use a swap.</p>
      )}

      {state.played.length > 0 && (
        <div className="played-list" aria-label="Words played">
          {state.played.map((p, i) => (
            <span key={i} className="played-word">{p.word}<b>{p.points}</b></span>
          ))}
        </div>
      )}
    </div>
  )
}

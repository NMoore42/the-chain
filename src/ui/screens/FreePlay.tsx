import { useCallback, useMemo, useState } from 'react'
import { DAILY_WORDS } from '../../data/dailyWords'
import { CHAINS } from '../../data/puzzles/chains'
import { pick, rngFromString } from '../../engine/rng'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useDictionary, useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Modal } from '../components/Modal'
import { Stars } from '../components/Stars'
import { SetlistMode } from '../modes/Setlist'
import { SongwriterMode } from '../modes/Songwriter'
import { ChainMode } from '../modes/Chain'
import type { ModeOutcome } from '../modes/types'
import type { ChainPuzzle, SetlistPuzzle, SongwriterPuzzle } from '../../data/types'
import { KIND_LABEL } from './Concert'
import { sfx } from '../../audio/audio'

type Mode = 'setlist' | 'songwriter' | 'chain'
const MODES: { id: Mode; title: string; desc: string }[] = [
  { id: 'setlist', title: 'The Setlist', desc: 'A random five-letter word, six guesses.' },
  { id: 'songwriter', title: 'The Songwriter', desc: 'Eight takes, fresh tiles, a target of 80.' },
  { id: 'chain', title: 'The Chain', desc: 'A random word ladder from the tour.' },
]

export function FreePlayScreen({ mode }: { mode?: string }) {
  const { dispatch, save } = useGame()
  const { dict, error, retry } = useDictionary()
  useEraTheme('storm')
  const [round, setRound] = useState(0)
  const [outcome, setOutcome] = useState<ModeOutcome | null>(null)
  const seed = useMemo(() => `free:${mode}:${Date.now()}:${round}`, [mode, round])
  const onStateChange = useCallback(() => {}, [])

  const puzzle = useMemo<SetlistPuzzle | SongwriterPuzzle | ChainPuzzle | null>(() => {
    const rng = rngFromString(seed)
    if (mode === 'setlist') return { kind: 'setlist', id: seed, answer: pick(DAILY_WORDS, rng), clue: '', intro: '' }
    if (mode === 'songwriter') return { kind: 'songwriter', id: seed, takes: 8, target: 80, intro: '' }
    if (mode === 'chain') return pick(Object.values(CHAINS), rng)
    return null
  }, [mode, seed])

  const finish = (o: ModeOutcome) => {
    setOutcome(o)
    if (puzzle?.kind === 'songwriter' && o.detail && Number(o.detail.bestWordScore) > save.stats.bestWordScore) {
      dispatch({ type: 'stats', patch: { bestWord: String(o.detail.bestWord), bestWordScore: Number(o.detail.bestWordScore) } })
    }
  }
  const again = () => { sfx.tap(); setOutcome(null); setRound((r) => r + 1) }

  if (!mode || !puzzle) {
    return (
      <main className="screen">
        <TopBar title="Free Play" back={{ name: 'title' }} />
        <div className="content fade-in">
          <p className="muted center">Practice any mode, as often as you like. Nothing here affects the tour.</p>
          <div className="puzzle-list">
            {MODES.map((m) => (
              <button key={m.id} className="puzzle-row" onClick={() => { sfx.tap(); navigate({ name: 'free', mode: m.id }) }}>
                <span><div className="kind">{m.title}</div><div className="desc">{m.desc}</div></span>
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <TopBar title={KIND_LABEL[puzzle.kind]} back={{ name: 'free' }} />
      <div className="content">
        {error && <div className="card center stack"><p>The word list could not be loaded.</p><button className="btn btn-primary" onClick={retry}>Retry</button></div>}
        {!error && !dict && <p className="center muted">Tuning up…</p>}
        {dict && (
          <div key={seed}>
            {puzzle.kind === 'setlist' && <SetlistMode puzzle={puzzle} dict={dict} seed={seed} onStateChange={onStateChange} onFinish={finish} compact />}
            {puzzle.kind === 'songwriter' && <SongwriterMode puzzle={puzzle} dict={dict} seed={seed} onStateChange={onStateChange} onFinish={finish} />}
            {puzzle.kind === 'chain' && <ChainMode puzzle={puzzle} dict={dict} seed={seed} onStateChange={onStateChange} onFinish={finish} />}
          </div>
        )}
      </div>
      {outcome && (
        <Modal title="Result">
          <h2>{outcome.solved ? 'Nicely done' : 'Next time'}</h2>
          <Stars value={outcome.stars} large />
          {puzzle.kind === 'setlist' && <p className="result-word">{puzzle.answer}</p>}
          {puzzle.kind === 'songwriter' && <p className="muted">{outcome.value} points</p>}
          {puzzle.kind === 'chain' && <p className="muted">{outcome.value} links · par {puzzle.solution.length - 1}</p>}
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={again}>Play another</button>
            <button className="btn btn-ghost" onClick={() => navigate({ name: 'free' })}>Choose a mode</button>
          </div>
        </Modal>
      )}
    </main>
  )
}

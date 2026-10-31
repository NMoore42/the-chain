import { useCallback, useMemo, useState } from 'react'
import { DAILY_WORDS } from '../../data/dailyWords'
import { dateKey, dayIndex, rngFromString, shuffle } from '../../engine/rng'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useDictionary, useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Modal } from '../components/Modal'
import { Stars } from '../components/Stars'
import { SetlistMode } from '../modes/Setlist'
import type { ModeOutcome } from '../modes/types'
import type { SetlistPuzzle } from '../../data/types'
import { sfx } from '../../audio/audio'

/** Deterministic daily word: a fixed shuffle of the list, indexed by day. */
export function dailyWordFor(date: Date): string {
  const order = shuffle(DAILY_WORDS, rngFromString('daily-encore-v1'))
  const i = ((dayIndex(date) % order.length) + order.length) % order.length
  return order[i]
}

export function DailyScreen() {
  const { save, dispatch, award } = useGame()
  const { dict, error, retry } = useDictionary()
  useEraTheme('stevie')
  const today = useMemo(() => new Date(), [])
  const key = dateKey(today)
  const word = useMemo(() => dailyWordFor(today), [today])
  const done = save.daily[key]
  const played = Object.keys(save.daily).length
  const [outcome, setOutcome] = useState<ModeOutcome | null>(null)
  const progressKey = `daily:${key}`
  const initialState = useMemo(() => save.inProgress[progressKey], [progressKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const onStateChange = useCallback((s: unknown | null) => dispatch({ type: 'progress', key: progressKey, state: s }), [dispatch, progressKey])

  const puzzle: SetlistPuzzle = { kind: 'setlist', id: `daily-${key}`, answer: word, clue: '', intro: '' }

  const finish = (o: ModeOutcome) => {
    setOutcome(o)
    dispatch({ type: 'daily', date: key, solved: !o.detail?.revealed, guesses: o.value })
    dispatch({ type: 'progress', key: progressKey, state: null })
    if (played + 1 >= 10) award('encore-ten')
  }

  return (
    <main className="screen">
      <TopBar title="Daily Encore" back={{ name: 'title' }} />
      <div className="content fade-in">
        <p className="muted center">One word a day, the same for everyone. {played > 0 && `Encores played: ${played}.`}</p>
        {error && <div className="card center stack"><p>The word list could not be loaded.</p><button className="btn btn-primary" onClick={retry}>Retry</button></div>}
        {!error && !dict && <p className="center muted">Tuning up…</p>}
        {dict && done && !outcome && (
          <div className="card center stack">
            <p className="eyebrow">{key}</p>
            <h2>Today’s encore is done</h2>
            <p className="result-word">{word}</p>
            <p className="muted">{done.solved ? `Solved in ${done.guesses} ${done.guesses === 1 ? 'guess' : 'guesses'}.` : 'Revealed with help.'} Come back tomorrow for a new word.</p>
            <button className="btn btn-primary" onClick={() => navigate({ name: 'title' })}>Back</button>
          </div>
        )}
        {dict && !done && (
          <SetlistMode key={key} puzzle={puzzle} dict={dict} seed={key} initialState={initialState} onStateChange={onStateChange} onFinish={finish} compact />
        )}
      </div>
      {outcome && (
        <Modal title="Daily Encore result">
          <p className="eyebrow">{key}</p>
          <h2>{outcome.detail?.revealed ? 'Tomorrow is another day' : 'Encore!'}</h2>
          <Stars value={outcome.stars} large />
          <p className="result-word">{word}</p>
          <button className="btn btn-primary" onClick={() => { sfx.tap(); navigate({ name: 'title' }) }}>Back to the menu</button>
        </Modal>
      )}
    </main>
  )
}

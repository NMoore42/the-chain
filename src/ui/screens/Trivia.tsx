import { useEffect, useMemo, useState } from 'react'
import { TRIVIA, TRIVIA_CATEGORIES, type TriviaCategory, type TriviaQuestion } from '../../data/trivia'
import { rngFromString, shuffle } from '../../engine/rng'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Stars } from '../components/Stars'
import { Modal } from '../components/Modal'
import { Confetti } from '../components/Confetti'
import { sfx } from '../../audio/audio'

const ROUND = 10

interface Round {
  category: TriviaCategory | 'all'
  ids: string[]
  index: number
  correct: number
  /** Chosen option index for the current question, or null before answering. */
  picked: number | null
  /** Shuffled option order per question: positions → original option index. */
  orders: number[][]
}

/** Song titles that get an official listen link when they come up. */
const SONGS = ['Rhiannon', 'Landslide', 'Dreams', 'Gypsy', 'Sara', 'Edge of Seventeen', 'Stand Back', 'Leather and Lace', 'Stop Draggin’ My Heart Around', 'Silver Springs', 'Gold Dust Woman', 'Songbird', 'The Chain', 'Go Your Own Way', 'Don’t Stop', 'Little Lies', 'Hold Me', 'Tusk', 'Albatross', 'Oh Well', 'Everywhere', 'Seven Wonders', 'Big Love', 'Talk to Me', 'Rooms on Fire', 'Storms', 'Sisters of the Moon', 'Angel', 'Crystal', 'Beautiful Child']
const STEVIE_SOLO = new Set(['Edge of Seventeen', 'Stand Back', 'Leather and Lace', 'Stop Draggin’ My Heart Around', 'Talk to Me', 'Rooms on Fire'])

function listenLink(qn: TriviaQuestion): { label: string; url: string } | null {
  const text = `${qn.question} ${qn.note}`
  const hit = SONGS.find((s) => text.includes(s))
  if (!hit) return null
  const artist = STEVIE_SOLO.has(hit) ? 'Stevie Nicks' : 'Fleetwood Mac'
  return { label: `Listen to “${hit}” on YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${hit} official`)}` }
}

function isRound(v: unknown): v is Round {
  const r = v as Round
  return !!r && typeof r === 'object' && Array.isArray(r.ids) && typeof r.index === 'number' && Array.isArray(r.orders)
}

function buildRound(category: TriviaCategory | 'all', seen: string[]): Round {
  const pool = TRIVIA.filter((q) => category === 'all' || q.category === category)
  const rng = rngFromString(`trivia:${Date.now()}`)
  const unseen = shuffle(pool.filter((q) => !seen.includes(q.id)), rng)
  const rest = shuffle(pool.filter((q) => seen.includes(q.id)), rng)
  const chosen = [...unseen, ...rest].slice(0, Math.min(ROUND, pool.length))
  return { category, ids: chosen.map((q) => q.id), index: 0, correct: 0, picked: null, orders: chosen.map(() => shuffle([0, 1, 2, 3], rng)) }
}

export function TriviaScreen() {
  const { save, dispatch, award } = useGame()
  useEraTheme('solo')
  const [round, setRound] = useState<Round | null>(() => (isRound(save.inProgress.trivia) ? (save.inProgress.trivia as Round) : null))
  const [done, setDone] = useState(false)
  const seen = useMemo(() => (Array.isArray(save.inProgress.triviaSeen) ? (save.inProgress.triviaSeen as string[]) : []), [save.inProgress.triviaSeen])

  useEffect(() => {
    dispatch({ type: 'progress', key: 'trivia', state: round && !done ? round : null })
  }, [round, done, dispatch])

  const start = (category: TriviaCategory | 'all') => {
    sfx.tap()
    setDone(false)
    setRound(buildRound(category, seen))
  }

  const current = round ? TRIVIA.find((q) => q.id === round.ids[round.index]) ?? null : null
  const order = round ? round.orders[round.index] : [0, 1, 2, 3]

  const pick = (position: number) => {
    if (!round || !current || round.picked !== null) return
    const original = order[position]
    const right = original === current.answer
    if (right) sfx.flipCorrect()
    else sfx.invalid()
    setRound({ ...round, picked: position, correct: round.correct + (right ? 1 : 0) })
    dispatch({ type: 'stats', patch: { triviaAnswered: save.stats.triviaAnswered + 1, triviaCorrect: save.stats.triviaCorrect + (right ? 1 : 0) } })
    if (save.stats.triviaCorrect + (right ? 1 : 0) >= 50) award('trivia-fifty')
  }

  const next = () => {
    if (!round) return
    sfx.tap()
    if (round.index + 1 >= round.ids.length) {
      finish(round)
      return
    }
    setRound({ ...round, index: round.index + 1, picked: null })
  }

  const finish = (r: Round) => {
    setDone(true)
    const total = r.ids.length
    const newSeen = [...new Set([...seen, ...r.ids])].slice(-TRIVIA.length + 10)
    dispatch({ type: 'progress', key: 'triviaSeen', state: newSeen })
    dispatch({ type: 'stats', patch: { triviaRounds: save.stats.triviaRounds + 1, triviaBest: Math.max(save.stats.triviaBest, r.correct) } })
    award('trivia-first')
    if (r.correct === total) { award('trivia-perfect'); window.setTimeout(() => sfx.fanfare(), 200) }
    else if (r.correct >= total * 0.7) sfx.win()
  }

  const stars = (r: Round): 0 | 1 | 2 | 3 => {
    const pct = r.correct / r.ids.length
    return pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0
  }

  if (!round || !current) {
    const st = save.stats
    return (
      <main className="screen">
        <TopBar title="Backstage Trivia" back={{ name: 'title' }} />
        <div className="content fade-in">
          <div className="card card-paper story">
            <p className="eyebrow">Ten questions, no clock</p>
            <h1 style={{ fontSize: '1.6rem' }}>Backstage Trivia</h1>
            <p>Fifty years of Fleetwood Mac in ten questions at a time. Every answer comes with the story behind it and a link to where it comes from.</p>
            <p className="small muted">Questions you have already seen come back less often. Get every one right for three stars.</p>
          </div>
          <h2 style={{ fontSize: '1.2rem' }}>Pick a set</h2>
          <div className="puzzle-list">
            {TRIVIA_CATEGORIES.map((c) => {
              const n = TRIVIA.filter((q) => c.id === 'all' || q.category === c.id).length
              return (
                <button key={c.id} className="puzzle-row" onClick={() => start(c.id)}>
                  <span><div className="kind">{c.name}</div><div className="desc">{c.desc} {n} questions.</div></span>
                  <span className="right"><span className="badge">Play</span></span>
                </button>
              )
            })}
          </div>
          {st.triviaRounds > 0 && (
            <p className="small muted center">Rounds played: {st.triviaRounds} · Best round: {st.triviaBest} of {ROUND} · Correct overall: {st.triviaCorrect} of {st.triviaAnswered}</p>
          )}
        </div>
      </main>
    )
  }

  const answered = round.picked !== null
  const link = listenLink(current)
  const catName = TRIVIA_CATEGORIES.find((c) => c.id === round.category)?.name

  return (
    <main className="screen">
      <TopBar title="Backstage Trivia" back={{ name: 'title' }} right={<button className="btn btn-ghost btn-sm" onClick={() => { setRound(null); setDone(false) }}>Quit</button>} />
      <div className="content">
        <div className="row-between">
          <span className="eyebrow">{catName} · Question {round.index + 1} of {round.ids.length}</span>
          <span className="badge">{round.correct} correct</span>
        </div>
        <div className="progress-bar" aria-hidden="true"><span style={{ width: `${(round.index / round.ids.length) * 100}%` }} /></div>
        <div className="card trivia-card rise-in" key={current.id}>
          <h2 className="trivia-q">{current.question}</h2>
          <div className="trivia-options" role="group" aria-label="Answers">
            {order.map((orig, pos) => {
              const isPicked = round.picked === pos
              const isRight = orig === current.answer
              const cls = ['trivia-option', answered && isRight ? 'is-correct' : '', answered && isPicked && !isRight ? 'is-wrong' : '', answered && !isRight && !isPicked ? 'is-dim' : ''].filter(Boolean).join(' ')
              return (
                <button key={pos} className={cls} onClick={() => pick(pos)} disabled={answered} aria-pressed={isPicked}>
                  <span className="letter">{'ABCD'[pos]}</span>
                  <span>{current.options[orig]}</span>
                </button>
              )
            })}
          </div>
          {answered && (
            <div className="card card-paper story trivia-note fade-in">
              <p className="eyebrow">{order[round.picked!] === current.answer ? 'Right!' : `The answer is ${current.options[current.answer]}`}</p>
              <p>{current.note}</p>
              {link && <p><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label} ↗</a></p>}
              <p className="sources"><a href={current.source} target="_blank" rel="noopener noreferrer">Source: {current.source.replace(/^https?:\/\//, '').slice(0, 60)}</a></p>
              <button className="btn btn-primary" onClick={next}>{round.index + 1 >= round.ids.length ? 'See the result' : 'Next question'}</button>
            </div>
          )}
        </div>
      </div>
      {done && (
        <>
          <Confetti active={stars(round) >= 2} />
          <Modal title="Round result">
            <p className="eyebrow">{catName}</p>
            <h2>{round.correct === round.ids.length ? 'Perfect round!' : round.correct >= 7 ? 'Encore!' : round.correct >= 4 ? 'Not bad at all' : 'Every page is a lesson'}</h2>
            <Stars value={stars(round)} large />
            <p className="result-word" style={{ letterSpacing: '0.05em' }}>{round.correct} / {round.ids.length}</p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => start(round.category)}>Play again</button>
              <button className="btn btn-ghost" onClick={() => { setRound(null); setDone(false) }}>Pick a set</button>
              <button className="btn btn-ghost" onClick={() => navigate({ name: 'title' })}>Menu</button>
            </div>
          </Modal>
        </>
      )}
    </main>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { concertById, eraOfConcert, ALL_CONCERTS, puzzleKey } from '../../data/campaign'
import { ERAS } from '../../data/campaign'
import { COLLECTIBLES } from '../../data/collectibles'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useDictionary, useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Stars } from '../components/Stars'
import { Modal } from '../components/Modal'
import { Confetti } from '../components/Confetti'
import { HowToPlay } from '../components/HowToPlay'
import { UiIcon, MemorabiliaIcon } from '../components/Icons'
import { SetlistMode } from '../modes/Setlist'
import { SongwriterMode } from '../modes/Songwriter'
import { ChainMode } from '../modes/Chain'
import type { ModeOutcome } from '../modes/types'
import { KIND_LABEL, puzzleDescription } from './Concert'
import { sfx } from '../../audio/audio'

const STAR_WORDS: Record<number, string> = { 0: 'The show goes on.', 1: 'Polite applause.', 2: 'A warm ovation.', 3: 'A standing ovation!' }

export function PlayScreen({ concertId, index }: { concertId: string; index: number }) {
  const concert = concertById(concertId)
  const era = eraOfConcert(concertId)
  const puzzle = concert?.puzzles[index]
  const { save, dispatch, award, pushToast, isConcertUnlocked } = useGame()
  const { dict, error, retry } = useDictionary()
  useEraTheme(era?.id ?? null)

  const key = puzzleKey(concertId, index)
  const [attempt, setAttempt] = useState(0)
  const [showIntro, setShowIntro] = useState(() => save.inProgress[key] === undefined)
  const [howTo, setHowTo] = useState(false)
  const [outcome, setOutcome] = useState<ModeOutcome | null>(null)
  const [concertDone, setConcertDone] = useState(false)
  const [firstCompletion, setFirstCompletion] = useState(false)
  const initialState = useMemo(() => save.inProgress[key], [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const onStateChange = useCallback((state: unknown | null) => dispatch({ type: 'progress', key, state }), [dispatch, key])

  useEffect(() => {
    if (puzzle && !save.seenTutorials.includes(puzzle.kind)) setHowTo(true)
  }, [puzzle, save.seenTutorials])

  if (!concert || !era || !puzzle) return <main className="screen"><TopBar back={{ name: 'map' }} /><p>Puzzle not found.</p></main>
  const progress = save.concerts[concertId]
  const puzzleUnlocked = index === 0 || !!progress?.completed || !!progress?.puzzles[String(index - 1)]
  if (!isConcertUnlocked(concertId) || !puzzleUnlocked) {
    navigate({ name: 'concert', concertId })
    return null
  }

  const isLast = index === concert.puzzles.length - 1
  const wasCompleted = !!save.concerts[concertId]?.completed

  const handleFinish = (o: ModeOutcome) => {
    setOutcome(o)
    const result = { stars: o.stars, hintsUsed: o.hintsUsed, value: o.value, completedAt: new Date().toISOString() }
    dispatch({ type: 'puzzleComplete', concertId, index, result })
    dispatch({ type: 'progress', key, state: null })

    // Stats and achievements
    if (puzzle.kind === 'setlist') {
      dispatch({ type: 'stats', patch: { setlistSolved: save.stats.setlistSolved + 1 } })
      if (o.value <= 2 && !o.detail?.revealed) award('setlist-two')
    }
    if (puzzle.kind === 'chain') {
      dispatch({ type: 'stats', patch: { chainsSolved: save.stats.chainsSolved + 1 } })
      if (o.stars === 3) award('par-chain')
    }
    if (puzzle.kind === 'songwriter' && o.detail) {
      const bestScore = Number(o.detail.bestWordScore)
      const patch: Partial<typeof save.stats> = { wordsPlayed: save.stats.wordsPlayed + Number(o.detail.wordsPlayed) }
      if (bestScore > save.stats.bestWordScore) { patch.bestWordScore = bestScore; patch.bestWord = String(o.detail.bestWord) }
      dispatch({ type: 'stats', patch })
      if (Number(o.detail.longest) >= 7) award('chorus')
      if (bestScore >= 40) award('big-word')
    }

    const prior = save.concerts[concertId]?.puzzles ?? {}
    const all = concert.puzzles.map((_, i) => (i === index ? result : prior[String(i)]))
    if (all.every(Boolean)) {
      // Every puzzle in this concert now has a result: the concert is complete.
      const noHints = all.every((r) => r && r.hintsUsed === 0)
      const allThree = all.every((r) => r && r.stars === 3)
      setConcertDone(true)
      setFirstCompletion(!wasCompleted)
      if (!wasCompleted) {
        dispatch({ type: 'concertComplete', concertId })
        dispatch({ type: 'unlockStory', storyId: concert.storyId })
        dispatch({ type: 'unlockCollectible', collectibleId: concert.collectibleId })
        award('first-show')
        const eraDone = era.concerts.every((c) => c.id === concertId || save.concerts[c.id]?.completed)
        if (eraDone) award(`era-${era.id}`)
        if (ALL_CONCERTS.every((c) => c.id === concertId || save.concerts[c.id]?.completed)) award('era-legacy')
        const unlockedCount = new Set([...save.unlockedCollectibles, concert.collectibleId]).size
        if (unlockedCount >= ALL_CONCERTS.length) award('scrapbook-full')
        window.setTimeout(() => sfx.fanfare(), 300)
      }
      if (noHints) award('no-hints')
      if (allThree && concert.puzzles.length >= 2) award('all-stars')
    }
  }

  const continueOn = () => {
    sfx.tap()
    if (!isLast) navigate({ name: 'play', concertId, index: index + 1 })
    else if (firstCompletion) navigate({ name: 'story', storyId: concert.storyId, next: 'map' })
    else navigate({ name: 'concert', concertId })
  }
  const retryPuzzle = () => {
    sfx.tap()
    setOutcome(null)
    setConcertDone(false)
    setFirstCompletion(false)
    setAttempt((a) => a + 1)
    setShowIntro(false)
  }

  const seed = `${concert.id}:${puzzle.id}:${save.concerts[concertId]?.plays ?? 0}:${attempt}`
  const modeProps = { dict: dict!, seed, initialState: attempt === 0 ? initialState : undefined, onStateChange, onFinish: handleFinish }
  const collectible = COLLECTIBLES[concert.collectibleId]
  const eraIndex = ERAS.findIndex((e) => e.id === era.id)

  return (
    <main className="screen">
      <TopBar
        title={KIND_LABEL[puzzle.kind]}
        back={{ name: 'concert', concertId }}
        right={<button className="btn btn-ghost btn-icon" aria-label="How to play" onClick={() => setHowTo(true)}><UiIcon name="help" /></button>}
      />
      <div className="content">
        <div className="puzzle-head">
          <p className="eyebrow">{concert.title} · Puzzle {index + 1} of {concert.puzzles.length}</p>
          <p className="small muted">{puzzleDescription(puzzle)}</p>
        </div>

        {error && (
          <div className="card center stack"><p>The word list could not be loaded. Check your connection and try again.</p><button className="btn btn-primary" onClick={retry}>Retry</button></div>
        )}
        {!error && !dict && <p className="center muted">Tuning up…</p>}

        {dict && showIntro && !outcome && (
          <div className="card card-paper story rise-in">
            <p className="eyebrow">Backstage</p>
            <p style={{ fontStyle: 'italic' }}>{puzzle.intro}</p>
            <button className="btn btn-primary" onClick={() => { sfx.tap(); setShowIntro(false) }}>Let’s go</button>
          </div>
        )}

        {dict && !showIntro && (
          <div key={`${key}:${attempt}`}>
            {puzzle.kind === 'setlist' && <SetlistMode puzzle={puzzle} {...modeProps} />}
            {puzzle.kind === 'songwriter' && <SongwriterMode puzzle={puzzle} {...modeProps} />}
            {puzzle.kind === 'chain' && <ChainMode puzzle={puzzle} {...modeProps} />}
          </div>
        )}
      </div>

      {howTo && <HowToPlay mode={puzzle.kind} onClose={() => { setHowTo(false); dispatch({ type: 'tutorialSeen', mode: puzzle.kind }) }} />}

      {outcome && (
        <>
          <Confetti active={outcome.stars >= 2 || concertDone} />
          <Modal title="Result">
            <p className="eyebrow">{concertDone ? 'Concert complete' : `${KIND_LABEL[puzzle.kind]} complete`}</p>
            <h2>{concertDone ? concert.title : STAR_WORDS[outcome.stars]}</h2>
            <Stars value={outcome.stars} large />
            {puzzle.kind === 'setlist' && <p className="result-word">{puzzle.answer}</p>}
            {puzzle.kind === 'setlist' && <p className="muted">{outcome.detail?.revealed ? 'Revealed with help.' : `Solved in ${outcome.value} ${outcome.value === 1 ? 'guess' : 'guesses'}.`}</p>}
            {puzzle.kind === 'songwriter' && <p className="muted">{outcome.value} points{outcome.solved ? '' : ` (target ${puzzle.target})`}{outcome.detail?.bestWord ? ` · best word ${String(outcome.detail.bestWord).toUpperCase()} for ${outcome.detail.bestWordScore}` : ''}</p>}
            {puzzle.kind === 'chain' && <p className="muted">{outcome.value} links · par {puzzle.solution.length - 1}</p>}
            {outcome.hintsUsed > 0 && <p className="small muted">{outcome.hintsUsed} hint{outcome.hintsUsed === 1 ? '' : 's'} used</p>}
            {concertDone && firstCompletion && collectible && (
              <div className="card stack" style={{ alignItems: 'center' }}>
                <MemorabiliaIcon icon={collectible.icon} />
                <p><b>New memorabilia:</b> {collectible.name}</p>
                <p className="small muted">{collectible.description}</p>
                {eraIndex < ERAS.length - 1 && isLast && era.concerts[era.concerts.length - 1].id === concertId && <p className="small">Era {era.number} complete! A new era awaits.</p>}
              </div>
            )}
            <div className="row" style={{ justifyContent: 'center' }}>
              {!outcome.solved && <button className="btn btn-primary" onClick={retryPuzzle}>Try again</button>}
              {outcome.solved && outcome.stars < 3 && <button className="btn btn-ghost" onClick={retryPuzzle}>Try for more stars</button>}
              {(outcome.solved || puzzle.kind !== 'songwriter') && <button className="btn btn-primary" onClick={continueOn}>{isLast ? (firstCompletion ? 'Read the story' : 'Back to the concert') : 'Next puzzle'}</button>}
              {!outcome.solved && <button className="btn btn-ghost" onClick={() => { pushToast({ title: 'No pressure', body: 'Come back any time; your progress is saved.' }); navigate({ name: 'concert', concertId }) }}>Later</button>}
            </div>
          </Modal>
        </>
      )}
    </main>
  )
}

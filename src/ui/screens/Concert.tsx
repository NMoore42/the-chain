import { concertById, eraOfConcert } from '../../data/campaign'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Stars } from '../components/Stars'
import { VenueArt } from '../components/VenueArt'
import { sfx } from '../../audio/audio'
import type { Puzzle } from '../../data/types'

export const KIND_LABEL: Record<Puzzle['kind'], string> = { setlist: 'The Setlist', songwriter: 'The Songwriter', chain: 'The Chain' }

export function puzzleDescription(p: Puzzle): string {
  switch (p.kind) {
    case 'setlist': return `Guess the ${p.answer.length}-letter word in six tries`
    case 'songwriter': return `Score ${p.target} points in ${p.takes} takes${p.golden ? ` · golden ${p.golden.toUpperCase()}` : ''}`
    case 'chain': return `${p.start.toUpperCase()} to ${p.end.toUpperCase()} · par ${p.solution.length - 1}`
  }
}

export function ConcertScreen({ concertId }: { concertId: string }) {
  const concert = concertById(concertId)
  const era = eraOfConcert(concertId)
  const { save, isConcertUnlocked } = useGame()
  useEraTheme(era?.id ?? null)
  if (!concert || !era) return <main className="screen"><TopBar back={{ name: 'map' }} /><p>Concert not found.</p></main>
  if (!isConcertUnlocked(concertId)) {
    return (
      <main className="screen"><TopBar back={{ name: 'map' }} /><div className="card center stack"><p>This concert is still locked. Finish the one before it first.</p><button className="btn btn-primary" onClick={() => navigate({ name: 'map' })}>Back to the tour</button></div></main>
    )
  }
  const progress = save.concerts[concertId]
  const firstOpen = concert.puzzles.findIndex((_, i) => !progress?.puzzles[String(i)])
  const allDone = firstOpen === -1
  const kindLabel = concert.venueKind === 'documented' ? 'Documented performance' : concert.venueKind === 'studio' ? 'Recording session' : 'Game stage'

  return (
    <main className="screen">
      <TopBar title={`Era ${era.number}`} back={{ name: 'map' }} />
      <div className="content fade-in">
        <div className="laminate">
          <p className="eyebrow">Backstage pass · {concert.date}</p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>{concert.title}</h1>
          <p className="muted">{concert.location} · {concert.capacityLabel}</p>
          <VenueArt scale={concert.scale} />
          <p>{concert.blurb}</p>
          <p className="small muted"><span className="badge badge-soft">{kindLabel}</span></p>
        </div>

        <div className="puzzle-list" role="list">
          {concert.puzzles.map((p, i) => {
            const r = progress?.puzzles[String(i)]
            const unlocked = i === 0 || !!progress?.puzzles[String(i - 1)] || !!progress?.completed
            return (
              <button key={p.id} className="puzzle-row" role="listitem" disabled={!unlocked} onClick={() => { sfx.tap(); navigate({ name: 'play', concertId, index: i }) }} aria-label={`${KIND_LABEL[p.kind]}: ${puzzleDescription(p)}${r ? `, ${r.stars} stars` : ''}`}>
                <span className="num">{i + 1}</span>
                <span>
                  <div className="kind">{KIND_LABEL[p.kind]}</div>
                  <div className="desc">{puzzleDescription(p)}</div>
                </span>
                <span className="right">{r ? <Stars value={r.stars} /> : <span className="badge badge-soft">{unlocked ? 'Play' : 'Locked'}</span>}</span>
              </button>
            )
          })}
        </div>

        <div className="row" style={{ justifyContent: 'center' }}>
          {!allDone && <button className="btn btn-primary" onClick={() => { sfx.tap(); navigate({ name: 'play', concertId, index: Math.max(0, firstOpen) }) }}>{progress ? 'Continue the show' : 'Start the show'}</button>}
          {allDone && <button className="btn btn-primary" onClick={() => { sfx.tap(); navigate({ name: 'play', concertId, index: 0 }) }}>Encore performance (replay)</button>}
          {progress?.completed && <button className="btn btn-ghost" onClick={() => navigate({ name: 'story', storyId: concert.storyId })}>Read the story</button>}
        </div>
      </div>
    </main>
  )
}

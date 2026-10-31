import { ERAS, ALL_CONCERTS } from '../../data/campaign'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Stars } from '../components/Stars'
import { VenueArt } from '../components/VenueArt'
import { UiIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'

export function MapScreen() {
  const { save, isConcertUnlocked, concertStars, concertMaxStars, totalStars, maxStars, dispatch } = useGame()
  const nextId = ALL_CONCERTS.find((c) => !save.concerts[c.id]?.completed)?.id
  const currentEra = ERAS.find((e) => e.concerts.some((c) => c.id === nextId)) ?? ERAS[ERAS.length - 1]
  useEraTheme(currentEra.id)

  const open = (concertId: string, eraIntro: string) => {
    sfx.tap()
    if (!save.unlockedStories.includes(eraIntro)) {
      dispatch({ type: 'unlockStory', storyId: eraIntro })
      navigate({ name: 'story', storyId: eraIntro, next: `concert/${concertId}` })
    } else navigate({ name: 'concert', concertId })
  }

  return (
    <main className="screen screen-wide">
      <TopBar
        title="The Tour"
        back={{ name: 'title' }}
        right={
          <>
            <span className="badge" aria-label={`${totalStars} of ${maxStars} stars`}><UiIcon name="star" size={14} /> {totalStars} / {maxStars}</span>
            <button className="btn btn-ghost btn-icon" aria-label="Scrapbook" onClick={() => navigate({ name: 'scrapbook' })}><UiIcon name="book" /></button>
          </>
        }
      />
      <div className="map fade-in">
        {ERAS.map((era) => {
          const unlocked = isConcertUnlocked(era.concerts[0].id)
          return (
            <section key={era.id} className={`era-block${unlocked ? '' : ' era-locked'}`} aria-label={`Era ${era.number}: ${era.title}`}>
              <div className="era-head">
                <span className="eyebrow">Era {era.number}</span>
                <h2>{era.title}</h2>
                <span className="years">{era.years}</span>
              </div>
              <p className="muted">{era.tagline}</p>
              <div className="concert-list">
                {era.concerts.map((c) => {
                  const ok = isConcertUnlocked(c.id)
                  const done = !!save.concerts[c.id]?.completed
                  return (
                    <button
                      key={c.id}
                      className={`concert-node${done ? ' is-done' : ''}${c.id === nextId ? ' is-next' : ''}`}
                      disabled={!ok}
                      onClick={() => open(c.id, era.introStoryId)}
                      aria-label={`${c.title}, ${c.location}, ${c.date}${done ? ', completed' : ok ? '' : ', locked'}`}
                    >
                      <VenueArt scale={c.scale} />
                      <span className="venue">{c.title}</span>
                      <span className="meta">{c.location} · {c.date}</span>
                      <span className="status">
                        {done ? <Stars value={concertStars(c.id)} max={concertMaxStars(c.id)} /> : ok ? <span className="badge">{c.id === nextId ? 'Up next' : 'Open'}</span> : <span className="badge badge-soft">Locked</span>}
                        <span className="badge badge-soft">{c.puzzles.length} {c.puzzles.length === 1 ? 'puzzle' : 'puzzles'}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

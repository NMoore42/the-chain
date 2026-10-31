import { STORIES } from '../../data/history'
import { eraById } from '../../data/campaign'
import { navigate, parseHash } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { sfx } from '../../audio/audio'

const TAG_LABEL = { band: 'The band', stevie: 'Stevie', album: 'Album', moment: 'Moment' }

export function StoryScreen({ storyId, next }: { storyId: string; next?: string }) {
  const story = STORIES[storyId]
  const { dispatch } = useGame()
  const eraId = storyId.startsWith('era-') ? storyId.slice(4) : null
  const era = eraId ? eraById(eraId) : null
  useEraTheme(era?.id ?? null)
  if (!story) return <main className="screen"><TopBar back={{ name: 'scrapbook' }} /><p>Story not found.</p></main>

  const go = () => {
    sfx.tap()
    dispatch({ type: 'unlockStory', storyId })
    if (next) navigate(parseHash(`#/${next}`))
    else navigate({ name: 'scrapbook', tab: 'stories' })
  }

  return (
    <main className="screen">
      <TopBar back={next ? undefined : { name: 'scrapbook', tab: 'stories' }} title={era ? `Era ${era.number}` : 'Scrapbook'} />
      <div className="content">
        <article className="card card-paper story rise-in">
          <p className="eyebrow">{TAG_LABEL[story.tag]} · {story.year}</p>
          <h1>{story.title}</h1>
          {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {story.listen && (
            <p><a href={story.listen.url} target="_blank" rel="noopener noreferrer">{story.listen.label} ↗</a></p>
          )}
          <details className="sources">
            <summary>Sources</summary>
            <ul>
              {story.sources.map((s) => <li key={s}><a href={s} target="_blank" rel="noopener noreferrer">{s.replace(/^https?:\/\//, '')}</a></li>)}
            </ul>
          </details>
          <button className="btn btn-primary" onClick={go}>{next ? 'Continue' : 'Back to the scrapbook'}</button>
        </article>
      </div>
    </main>
  )
}

import { STORIES, MEMBERS, ALBUMS } from '../../data/history'
import { COLLECTIBLES } from '../../data/collectibles'
import { ACHIEVEMENTS } from '../../data/achievements'
import { ALL_CONCERTS, ERAS } from '../../data/campaign'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { MemorabiliaIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'

const TABS = [
  { id: 'stories', label: 'Stories' },
  { id: 'memorabilia', label: 'Memorabilia' },
  { id: 'band', label: 'The Band' },
  { id: 'albums', label: 'Albums' },
  { id: 'achievements', label: 'Achievements' },
] as const

export function ScrapbookScreen({ tab = 'stories' }: { tab?: string }) {
  const { save } = useGame()
  useEraTheme(null)
  const unlockedConcerts = new Set(Object.entries(save.concerts).filter(([, c]) => c.completed).map(([id]) => id))
  const storyOrder = ERAS.flatMap((e) => [e.introStoryId, ...e.concerts.map((c) => c.storyId)])
  const unlockedStories = save.unlockedStories
  const memCount = save.unlockedCollectibles.length

  return (
    <main className="screen screen-wide">
      <TopBar title="Scrapbook" back={{ name: 'title' }} />
      <div className="content fade-in">
        <div className="tabs" role="tablist" aria-label="Scrapbook sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" className="tab" aria-selected={tab === t.id} onClick={() => { sfx.tap(); navigate({ name: 'scrapbook', tab: t.id }) }}>{t.label}</button>
          ))}
        </div>

        {tab === 'stories' && (
          <div className="list-cards" role="tabpanel">
            <p className="muted small">{unlockedStories.length} of {storyOrder.length} pages found. Play concerts to turn more pages.</p>
            {storyOrder.map((id) => {
              const s = STORIES[id]
              const open = unlockedStories.includes(id)
              return (
                <button key={id} className={`list-card${open ? '' : ' is-locked'}`} disabled={!open} onClick={() => { sfx.tap(); navigate({ name: 'story', storyId: id }) }}>
                  <MemorabiliaIcon icon={s.tag === 'stevie' ? 'moon' : s.tag === 'album' ? 'record' : s.tag === 'band' ? 'penguin' : 'ticket'} locked={!open} />
                  <span>
                    <div className="t">{open ? s.title : 'A page not yet turned'}</div>
                    <div className="s">{open ? `${s.year}` : 'Complete the next concert to unlock'}</div>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'memorabilia' && (
          <div role="tabpanel" className="stack">
            <p className="muted small">{memCount} of {ALL_CONCERTS.length} items collected.</p>
            <div className="grid-items">
              {ALL_CONCERTS.map((c) => {
                const item = COLLECTIBLES[c.collectibleId]
                const open = save.unlockedCollectibles.includes(item.id)
                return (
                  <div key={item.id} className={`item${open ? '' : ' is-locked'}`}>
                    <MemorabiliaIcon icon={item.icon} locked={!open} />
                    <div className="name">{open ? item.name : '???'}</div>
                    <div className="desc">{open ? item.description : `${c.title}, ${c.date}`}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'band' && (
          <div role="tabpanel" className="list-cards">
            {MEMBERS.map((m) => {
              const open = unlockedConcerts.has(m.unlockedByConcert) || ALL_CONCERTS.findIndex((c) => c.id === m.unlockedByConcert) <= ALL_CONCERTS.findIndex((c) => !save.concerts[c.id]?.completed)
              return (
                <div key={m.id} className={`card${open ? '' : ' era-locked'}`}>
                  <p className="eyebrow">{m.role} · {m.years}</p>
                  <h3>{open ? m.name : 'A member you have not met yet'}</h3>
                  {open && <p className="muted" style={{ marginTop: 6 }}>{m.summary}</p>}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'albums' && (
          <div role="tabpanel" className="list-cards">
            {ALBUMS.map((a) => {
              const open = unlockedConcerts.has(a.unlockedByConcert)
              return (
                <div key={a.id} className={`list-card${open ? '' : ' is-locked'}`} style={{ cursor: 'default' }}>
                  <MemorabiliaIcon icon="record" locked={!open} />
                  <span>
                    <div className="t">{open ? a.title : 'Not released yet'}</div>
                    <div className="s">{open ? `${a.released} · ${a.note}` : 'Keep touring to unlock'}</div>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'achievements' && (
          <div role="tabpanel" className="grid-items">
            {ACHIEVEMENTS.map((a) => {
              const open = save.achievements.includes(a.id)
              return (
                <div key={a.id} className={`item${open ? '' : ' is-locked'}`}>
                  <MemorabiliaIcon icon={a.icon} locked={!open} />
                  <div className="name">{a.name}</div>
                  <div className="desc">{a.description}</div>
                </div>
              )
            })}
          </div>
        )}

        <div className="card small muted">
          Best word: {save.stats.bestWord ? `${save.stats.bestWord.toUpperCase()} (${save.stats.bestWordScore})` : 'none yet'} · Words played: {save.stats.wordsPlayed} · Setlists solved: {save.stats.setlistSolved} · Chains solved: {save.stats.chainsSolved}
        </div>
      </div>
    </main>
  )
}

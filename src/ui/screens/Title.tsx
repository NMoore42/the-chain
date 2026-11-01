import { ALL_CONCERTS } from '../../data/campaign'
import { DEDICATION } from '../../data/dedication'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { UiIcon } from '../components/Icons'
import { playEasterEgg, sfx, stopEasterEgg } from '../../audio/audio'
import { useEffect, useState } from 'react'
import { StevieEgg } from '../components/StevieEgg'
import { Modal } from '../components/Modal'

function Logo() {
  return (
    <svg className="title-logo" viewBox="0 0 200 120" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--gold-2)" /><stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path d="M150 20a40 40 0 1 0 0 80 31 31 0 1 1 0-80z" fill="url(#g)" />
      {[[30, 30], [60, 18], [45, 60], [25, 85], [80, 95], [70, 50]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 5}l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z`} fill="var(--ink)" opacity={0.6 + (i % 3) * 0.15} />
      ))}
      <g fill="none" stroke="var(--gold-2)" strokeWidth="3" strokeLinecap="round">
        <ellipse cx="60" cy="78" rx="10" ry="6" />
        <ellipse cx="80" cy="84" rx="10" ry="6" />
        <ellipse cx="100" cy="90" rx="10" ry="6" />
      </g>
    </svg>
  )
}

export function TitleScreen() {
  const { save, totalStars, maxStars } = useGame()
  useEraTheme(null)
  const done = Object.values(save.concerts).filter((c) => c.completed).length
  const started = done > 0 || Object.keys(save.inProgress).length > 0
  const [egg, setEgg] = useState<null | { singing: boolean; silent: boolean }>(null)
  const closeEgg = () => { stopEasterEgg(); setEgg(null) }
  useEffect(() => () => stopEasterEgg(), [])
  const openEgg = () => {
    const audible = save.settings.sound || save.settings.music
    const dur = audible ? playEasterEgg() : 0
    setEgg({ singing: true, silent: !audible })
    if (dur > 0) window.setTimeout(() => setEgg((e) => (e ? { ...e, singing: false } : e)), dur * 1000)
  }
  return (
    <main className="screen">
      <div className="title-hero fade-in">
        <button className="logo-button" onClick={openEgg} aria-label="The chain"><Logo /></button>
        <p className="eyebrow">A Fleetwood Mac word adventure</p>
        <h1>The Chain</h1>
        <p className="subtitle">Three word games. Fifty years of music.</p>
        {DEDICATION.enabled && (
          <p className="muted" style={{ fontStyle: 'italic' }}>Made with love for {DEDICATION.to}</p>
        )}
        <nav className="title-menu" aria-label="Main menu">
          <button className="btn btn-primary" onClick={() => { sfx.tap(); navigate({ name: 'map' }) }}>
            <UiIcon name="play" size={20} /> {started ? 'Continue the tour' : 'Begin the tour'}
          </button>
          <button className="btn" onClick={() => { sfx.tap(); navigate({ name: 'daily' }) }}><UiIcon name="calendar" size={20} /> Daily Encore</button>
          <button className="btn" onClick={() => { sfx.tap(); navigate({ name: 'jam' }) }}><UiIcon name="music" size={20} /> Jam Session</button>
          <button className="btn" onClick={() => { sfx.tap(); navigate({ name: 'trivia' }) }}><UiIcon name="help" size={20} /> Backstage Trivia</button>
          <button className="btn" onClick={() => { sfx.tap(); navigate({ name: 'venue' }) }}><UiIcon name="moon" size={20} /> The Penguin Club</button>
          <button className="btn" onClick={() => { sfx.tap(); navigate({ name: 'free' }) }}><UiIcon name="play" size={20} /> Free Play</button>
          <button className="btn" onClick={() => { sfx.tap(); navigate({ name: 'scrapbook' }) }}><UiIcon name="book" size={20} /> Scrapbook</button>
          <button className="btn btn-ghost" onClick={() => { sfx.tap(); navigate({ name: 'settings' }) }}><UiIcon name="settings" size={20} /> Settings</button>
        </nav>
        {started && (
          <p className="small muted">{done} of {ALL_CONCERTS.length} concerts · {totalStars} of {maxStars} stars</p>
        )}
        <p className="title-foot">
          A free, unofficial fan project. Not affiliated with or endorsed by Fleetwood Mac or Stevie Nicks. <a href="#/about">About this game</a>
        </p>
      </div>
      {egg && (
        <Modal title="A secret encore" onClose={closeEgg} className="egg-modal">
          <p className="eyebrow">A secret encore</p>
          <StevieEgg singing={egg.singing} />
          <p className="small muted">{egg.silent ? 'Turn on sound or music in Settings to hear her play.' : 'An original tune, written for the game.'}</p>
          <button className="btn btn-primary btn-sm" onClick={closeEgg}>Thank you, goodnight</button>
        </Modal>
      )}
    </main>
  )
}

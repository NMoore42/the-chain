import { DEDICATION } from '../../data/dedication'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'

export function AboutScreen() {
  useEraTheme(null)
  return (
    <main className="screen">
      <TopBar title="About" back={{ name: 'title' }} />
      <div className="content fade-in">
        {DEDICATION.enabled && (
          <div className="card card-paper story">
            <p className="eyebrow">For {DEDICATION.to}</p>
            <p style={{ fontStyle: 'italic' }}>{DEDICATION.message}</p>
            <p className="muted">With love, {DEDICATION.from}</p>
          </div>
        )}
        <div className="card stack">
          <h2 style={{ fontSize: '1.2rem' }}>A fan project</h2>
          <p className="small">The Chain is a free, unofficial, non-commercial fan-made game. It is not affiliated with, sponsored by, or endorsed by Fleetwood Mac, Stevie Nicks, their management, or their record labels. Band, album, and song names are used only to tell the story of the music.</p>
          <p className="small">No recordings, lyrics, photographs, or album artwork are included. All illustrations are original line drawings, and all sound is synthesized in the browser. The era music is original and written in a mellow lo-fi style; it does not reproduce any Fleetwood Mac melody.</p>
          <h2 style={{ fontSize: '1.2rem' }}>Where the history comes from</h2>
          <p className="small">Every scrapbook page lists its sources. The role of the player as a member of the road crew is a game device, not a historical claim. Venues marked as game stages are not documented performances. The Penguin Club and the characters’ chatter there are written for the game; the facts they mention are sourced.</p>
          <h2 style={{ fontSize: '1.2rem' }}>Words</h2>
          <p className="small">Word validation uses the public-domain ENABLE word list, trimmed to two-to-eight-letter words. Letter values follow the classic Scrabble scheme in the Songwriter and a Words With Friends-style scheme in the Jam Session; neither is protected by copyright. Scrabble, Words With Friends, and Wordle are trademarks of their respective owners; this game is not associated with any of them.</p>
          <h2 style={{ fontSize: '1.2rem' }}>Privacy</h2>
          <p className="small">No accounts, no tracking, no servers. Progress lives only in this browser, and you can export it from Settings.</p>
        </div>
      </div>
    </main>
  )
}

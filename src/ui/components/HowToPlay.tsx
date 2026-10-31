import { Modal } from './Modal'

export function HowToPlay({ mode, onClose }: { mode: 'setlist' | 'songwriter' | 'chain'; onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose} className="howto">
      {mode === 'setlist' && (
        <>
          <p className="eyebrow">The Setlist</p>
          <h2>Guess the hidden word</h2>
          <p>Type a word and press Enter. You have six guesses. After each guess the tiles tell you how close you are.</p>
          <div className="legend">
            <span><span className="tile is-correct">A</span> right letter, right spot</span>
            <span><span className="tile is-present">B</span> right letter, wrong spot</span>
            <span><span className="tile is-absent">C</span> not in the word</span>
          </div>
          <p className="muted small">Stuck? Hints can show a clue or reveal a letter. If you run out of guesses, you get two encore attempts.</p>
        </>
      )}
      {mode === 'songwriter' && (
        <>
          <p className="eyebrow">The Songwriter</p>
          <h2>Build words from your tiles</h2>
          <p>Tap tiles to spell a word, then press Play. Each letter is worth points, and longer words earn a bonus: five letters is a Verse, six a Bridge, and all seven a Chorus worth fifty extra.</p>
          <p>You have a set number of takes. Reach the target score to finish the song. Swap tiles you don’t like, and ask for a hint if you’re stuck.</p>
          <p className="muted small">A golden tile, when one appears, doubles the letter points of any word that uses it.</p>
        </>
      )}
      {mode === 'chain' && (
        <>
          <p className="eyebrow">The Chain</p>
          <h2>Change one letter at a time</h2>
          <p>Turn the first word into the last word by changing a single letter each step. Every step must be a real word.</p>
          <p>For example: COLD, CORD, CARD, WARD, WARM. Fewer steps earn more stars, and you can undo any link.</p>
          <p className="muted small">A hint shows you the next link on a shortest path.</p>
        </>
      )}
      <button className="btn btn-primary" onClick={onClose}>Got it</button>
    </Modal>
  )
}

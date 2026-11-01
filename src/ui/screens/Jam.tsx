import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MAC_WORDS } from '../../data/macWords'
import {
  applyMove, BINGO, BONUS, CENTER, chooseMove, draw, emptyBoard, evaluateMove, generateMoves, letterOf, makeBag, RACK, SIZE, VALUES,
  type Board, type BoardTile, type Difficulty, type MoveResult, type Placement,
} from '../../engine/board'
import { rngFromString, shuffle } from '../../engine/rng'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useDictionary, useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Modal } from '../components/Modal'
import { Confetti } from '../components/Confetti'
import { UiIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'

type Who = 'player' | 'cpu'
interface Turn { who: Who; kind: 'play' | 'swap' | 'pass'; words: string[]; score: number }
interface JamGame {
  seed: string
  difficulty: Difficulty
  board: Board
  bag: BoardTile[]
  racks: Record<Who, BoardTile[]>
  scores: Record<Who, number>
  turn: Who
  history: Turn[]
  scoreless: number
  status: 'playing' | 'over'
  hintsLeft: number
  lastCpu: [number, number][]
  bestWord: { word: string; score: number }
  macWords: number
  moves: number
}

const DIFFICULTY: { id: Difficulty; name: string; desc: string }[] = [
  { id: 'easy', name: 'Open mic', desc: 'A relaxed bandmate who plays modest words.' },
  { id: 'medium', name: 'Club night', desc: 'A solid player who finds good words most turns.' },
  { id: 'hard', name: 'Stadium', desc: 'Plays the best move it can find, every time.' },
]

function isGame(v: unknown): v is JamGame {
  const g = v as JamGame
  return !!g && typeof g === 'object' && Array.isArray(g.board) && g.board.length === SIZE && !!g.racks && !!g.scores && typeof g.turn === 'string'
}

function newGame(difficulty: Difficulty): JamGame {
  const seed = `jam:${Date.now()}`
  const rng = rngFromString(seed)
  let bag = makeBag(rng)
  const p = draw(bag, RACK); bag = p.bag
  const c = draw(bag, RACK); bag = c.bag
  return {
    seed, difficulty, board: emptyBoard(), bag, racks: { player: p.drawn, cpu: c.drawn }, scores: { player: 0, cpu: 0 }, turn: 'player',
    history: [], scoreless: 0, status: 'playing', hintsLeft: 3, lastCpu: [], bestWord: { word: '', score: 0 }, macWords: 0, moves: 0,
  }
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

export function JamScreen() {
  const { save, dispatch, award, pushToast } = useGame()
  const { dict, error, retry } = useDictionary()
  useEraTheme('rumours')
  const wordsByLength = useCallback((n: number) => dict?.wordsOfLength(n) ?? [], [dict])

  const [game, setGame] = useState<JamGame | null>(() => (isGame(save.inProgress.jam) ? (save.inProgress.jam as JamGame) : null))
  const [pending, setPending] = useState<Placement[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [cursor, setCursor] = useState<{ row: number; col: number; dir: 'h' | 'v' } | null>(null)
  const [blankFor, setBlankFor] = useState<{ row: number; col: number; tile: BoardTile } | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [swapSel, setSwapSel] = useState<string[]>([])
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const finishedRef = useRef(false)

  useEffect(() => {
    dispatch({ type: 'progress', key: 'jam', state: game && game.status === 'playing' ? game : null })
  }, [game, dispatch])

  const preview: MoveResult | null = useMemo(() => (game && dict && pending.length ? evaluateMove(game.board, pending, dict) : null), [game, dict, pending])

  // ---------- Game end ----------
  const endGame = useCallback((g: JamGame, reason: string) => {
    const left = (who: Who) => g.racks[who].reduce((s, t) => s + (VALUES[t.letter] ?? 0), 0)
    const scores = { ...g.scores }
    const pl = left('player')
    const cl = left('cpu')
    if (g.racks.player.length === 0) { scores.player += cl; scores.cpu -= cl }
    else if (g.racks.cpu.length === 0) { scores.cpu += pl; scores.player -= pl }
    else { scores.player -= pl; scores.cpu -= cl }
    const over: JamGame = { ...g, scores, status: 'over' }
    setGame(over)
    setShowEnd(true)
    setMessage({ text: reason })
    if (!finishedRef.current) {
      finishedRef.current = true
      const won = scores.player > scores.cpu
      const st = save.stats
      dispatch({
        type: 'stats',
        patch: {
          jamGames: st.jamGames + 1,
          jamWins: st.jamWins + (won ? 1 : 0),
          jamBestScore: Math.max(st.jamBestScore, scores.player),
          ...(over.bestWord.score > st.jamBestWordScore ? { jamBestWord: over.bestWord.word, jamBestWordScore: over.bestWord.score } : {}),
        },
      })
      award('jam-first')
      if (won) award('jam-win')
      if (won) window.setTimeout(() => sfx.fanfare(), 200)
      else sfx.lose()
    }
  }, [dispatch, award, save.stats])

  // ---------- Bandmate turn ----------
  const cpuTurn = useCallback((g: JamGame) => {
    if (!dict) return
    setThinking(true)
    window.setTimeout(() => {
      const rng = rngFromString(`${g.seed}:${g.moves}`)
      const candidates = generateMoves(g.board, g.racks.cpu, dict, wordsByLength, 50)
      const move = chooseMove(candidates, g.difficulty, rng)
      let next: JamGame
      if (move) {
        const board = applyMove(g.board, move.placements)
        const used = new Set(move.placements.map((p) => p.tile.id))
        const rest = g.racks.cpu.filter((t) => !used.has(t.id))
        const d = draw(g.bag, RACK - rest.length)
        next = {
          ...g, board, bag: d.bag, racks: { ...g.racks, cpu: [...rest, ...d.drawn] }, scores: { ...g.scores, cpu: g.scores.cpu + move.result.score },
          turn: 'player', history: [...g.history, { who: 'cpu', kind: 'play', words: move.result.words.map((w) => w.word), score: move.result.score }],
          scoreless: 0, lastCpu: move.placements.map((p) => [p.row, p.col]), moves: g.moves + 1,
        }
        const mac = move.result.words.find((w) => w.mac)
        setMessage({ text: `Your bandmate played ${move.result.words[0].word.toUpperCase()} for ${move.result.score}${mac ? ` (a Fleetwood word!)` : ''}.` })
      } else if (g.bag.length >= RACK) {
        const back = g.racks.cpu
        const bag = shuffle([...g.bag, ...back], rng)
        const d = draw(bag, RACK)
        next = { ...g, bag: d.bag, racks: { ...g.racks, cpu: d.drawn }, turn: 'player', history: [...g.history, { who: 'cpu', kind: 'swap', words: [], score: 0 }], scoreless: g.scoreless + 1, lastCpu: [], moves: g.moves + 1 }
        setMessage({ text: 'Your bandmate swapped tiles.' })
      } else {
        next = { ...g, turn: 'player', history: [...g.history, { who: 'cpu', kind: 'pass', words: [], score: 0 }], scoreless: g.scoreless + 1, lastCpu: [], moves: g.moves + 1 }
        setMessage({ text: 'Your bandmate passed.' })
      }
      setThinking(false)
      sfx.place()
      if (next.racks.cpu.length === 0 && next.bag.length === 0) endGame(next, 'Your bandmate used every tile.')
      else if (next.scoreless >= 4) endGame(next, 'Four scoreless turns in a row. The session ends.')
      else setGame(next)
    }, 450)
  }, [dict, wordsByLength, endGame])

  // ---------- Player actions ----------
  const start = (difficulty: Difficulty) => {
    sfx.tap()
    finishedRef.current = false
    setGame(newGame(difficulty))
    setPending([]); setSelected(null); setCursor(null); setShowEnd(false); setMessage({ text: 'You play first. Cover the centre star.' })
  }

  const placeAt = (row: number, col: number, tile: BoardTile) => {
    if (tile.letter === '?') { setBlankFor({ row, col, tile }); return }
    sfx.place()
    setPending((p) => [...p, { row, col, tile }])
    setSelected(null)
    setMessage(null)
  }

  const nextCursor = (row: number, col: number, dir: 'h' | 'v', occupied: (r: number, c: number) => boolean) => {
    let r = row
    let c = col
    do { if (dir === 'h') c++; else r++ } while (r < SIZE && c < SIZE && occupied(r, c))
    return r < SIZE && c < SIZE ? { row: r, col: c, dir } : null
  }

  const tapCell = (row: number, col: number) => {
    if (!game || game.status !== 'playing' || game.turn !== 'player' || thinking) return
    const pend = pending.find((p) => p.row === row && p.col === col)
    if (pend) { sfx.remove(); setPending((p) => p.filter((x) => x !== pend)); return }
    if (game.board[row][col]) return
    if (selected) {
      const tile = game.racks.player.find((t) => t.id === selected)
      if (tile) placeAt(row, col, tile)
      return
    }
    // Set or rotate the cursor.
    if (cursor && cursor.row === row && cursor.col === col) setCursor({ row, col, dir: cursor.dir === 'h' ? 'v' : 'h' })
    else setCursor({ row, col, dir: 'h' })
    sfx.tap()
  }

  const tapRackTile = (t: BoardTile) => {
    if (!game || game.status !== 'playing' || game.turn !== 'player' || thinking) return
    if (swapping) { setSwapSel((s) => (s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id])); sfx.tap(); return }
    if (cursor) {
      const occupied = (r: number, c: number) => !!game.board[r][c] || pending.some((p) => p.row === r && p.col === c)
      if (!occupied(cursor.row, cursor.col)) {
        placeAt(cursor.row, cursor.col, t)
        const nxt = nextCursor(cursor.row, cursor.col, cursor.dir, (r, c) => occupied(r, c) || (r === cursor.row && c === cursor.col))
        setCursor(nxt)
        return
      }
    }
    sfx.tap()
    setSelected((s) => (s === t.id ? null : t.id))
  }

  const assignBlank = (letter: string) => {
    if (!blankFor) return
    sfx.place()
    setPending((p) => [...p, { row: blankFor.row, col: blankFor.col, tile: { ...blankFor.tile, as: letter } }])
    const b = blankFor
    setBlankFor(null)
    setSelected(null)
    if (cursor && game) {
      const occupied = (r: number, c: number) => !!game.board[r][c] || pending.some((p) => p.row === r && p.col === c) || (r === b.row && c === b.col)
      setCursor(nextCursor(b.row, b.col, cursor.dir, occupied))
    }
  }

  const recall = () => { sfx.undo(); setPending([]); setSelected(null); setCursor(null); setMessage(null) }
  const shuffleRack = () => { if (!game) return; sfx.tap(); setGame({ ...game, racks: { ...game.racks, player: shuffle(game.racks.player, rngFromString(String(Date.now()))) } }) }

  const play = () => {
    if (!game || !dict) return
    const result = evaluateMove(game.board, pending, dict)
    if (!result.valid) { setMessage({ text: result.reason ?? 'That move is not allowed', error: true }); sfx.invalid(); return }
    const board = applyMove(game.board, pending)
    const used = new Set(pending.map((p) => p.tile.id))
    const rest = game.racks.player.filter((t) => !used.has(t.id))
    const d = draw(game.bag, RACK - rest.length)
    const best = result.words.reduce((b, w) => (w.score > b.score ? { word: w.word, score: w.score } : b), game.bestWord)
    const macs = result.words.filter((w) => w.mac)
    const next: JamGame = {
      ...game, board, bag: d.bag, racks: { ...game.racks, player: [...rest, ...d.drawn] }, scores: { ...game.scores, player: game.scores.player + result.score },
      turn: 'cpu', history: [...game.history, { who: 'player', kind: 'play', words: result.words.map((w) => w.word), score: result.score }],
      scoreless: 0, bestWord: best, macWords: game.macWords + macs.length, lastCpu: [], moves: game.moves + 1,
    }
    setPending([]); setSelected(null); setCursor(null)
    sfx.word(result.score)
    setMessage({ text: `${result.words.map((w) => w.word.toUpperCase()).join(', ')} for ${result.score}${result.bingo ? ` including a ${BINGO}-point bingo` : ''}.` })
    for (const m of macs) pushToast({ title: `${m.word.toUpperCase()} scores double`, body: MAC_WORDS[m.word], icon: 'moon' })
    if (macs.length) award('jam-mac')
    if (result.score >= 50) award('jam-fifty')
    if (next.racks.player.length === 0 && next.bag.length === 0) { endGame(next, 'You used every tile!'); return }
    setGame(next)
    cpuTurn(next)
  }

  const pass = () => {
    if (!game) return
    sfx.tap()
    const next: JamGame = { ...game, turn: 'cpu', history: [...game.history, { who: 'player', kind: 'pass', words: [], score: 0 }], scoreless: game.scoreless + 1, lastCpu: [], moves: game.moves + 1 }
    setPending([]); setSelected(null); setCursor(null)
    if (next.scoreless >= 4) { endGame(next, 'Four scoreless turns in a row. The session ends.'); return }
    setGame(next)
    cpuTurn(next)
  }

  const startSwap = () => { setSwapping(true); setSwapSel([]); setPending([]); setSelected(null); setCursor(null); setMessage({ text: 'Tap the tiles to swap, then confirm. Swapping uses your turn.' }) }
  const confirmSwap = () => {
    if (!game) return
    if (!swapSel.length) { setSwapping(false); setMessage(null); return }
    const rng = rngFromString(`${game.seed}:swap:${game.moves}`)
    const keep = game.racks.player.filter((t) => !swapSel.includes(t.id))
    const back = game.racks.player.filter((t) => swapSel.includes(t.id))
    const d = draw(game.bag, back.length)
    const bag = shuffle([...d.bag, ...back], rng)
    const next: JamGame = { ...game, bag, racks: { ...game.racks, player: [...keep, ...d.drawn] }, turn: 'cpu', history: [...game.history, { who: 'player', kind: 'swap', words: [], score: 0 }], scoreless: game.scoreless + 1, lastCpu: [], moves: game.moves + 1 }
    setSwapping(false); setSwapSel([])
    sfx.place()
    setMessage(null)
    setGame(next)
    cpuTurn(next)
  }

  const hint = () => {
    if (!game || !dict || game.hintsLeft <= 0) return
    const moves = generateMoves(game.board, game.racks.player, dict, wordsByLength, 40)
    if (!moves.length) { setMessage({ text: 'No plays from here. Try a swap.', error: true }); return }
    const best = moves[0]
    sfx.hint()
    setPending(best.placements)
    setSelected(null); setCursor(null)
    setGame({ ...game, hintsLeft: game.hintsLeft - 1 })
    setMessage({ text: `Try ${best.result.words[0].word.toUpperCase()} for ${best.result.score}. Press Play if you like it.` })
  }

  const quit = () => { setConfirmQuit(false); setGame(null); setPending([]); setShowEnd(false); setMessage(null); dispatch({ type: 'progress', key: 'jam', state: null }) }

  // ---------- Render ----------
  if (error) return <main className="screen"><TopBar title="Jam Session" back={{ name: 'title' }} /><div className="card center stack"><p>The word list could not be loaded.</p><button className="btn btn-primary" onClick={retry}>Retry</button></div></main>
  if (!dict) return <main className="screen"><TopBar title="Jam Session" back={{ name: 'title' }} /><p className="center muted">Tuning up…</p></main>

  if (!game) {
    return (
      <main className="screen">
        <TopBar title="Jam Session" back={{ name: 'title' }} />
        <div className="content fade-in">
          <div className="card card-paper story">
            <p className="eyebrow">A board game with a bandmate</p>
            <h1 style={{ fontSize: '1.6rem' }}>Jam Session</h1>
            <p>Build crossing words on the board, Words With Friends style. Letters score points, coloured squares multiply them, and every tile you play must connect to the words already there.</p>
            <p><b>The twist:</b> any word tied to Fleetwood Mac scores double. Song words, album words, the band’s names, the places where the music was made. Names count even when they are not in the dictionary, so STEVIE and RHIANNON are fair play.</p>
            <p className="small muted">Pick a square, then tap tiles to fill it in. Or tap a tile first and then a square. You can recall tiles, swap, pass, and ask for up to three hints a game.</p>
          </div>
          <h2 style={{ fontSize: '1.2rem' }}>Choose your bandmate</h2>
          <div className="puzzle-list">
            {DIFFICULTY.map((d) => (
              <button key={d.id} className="puzzle-row" onClick={() => start(d.id)}>
                <span><div className="kind">{d.name}</div><div className="desc">{d.desc}</div></span>
                <span className="right"><span className="badge">Play</span></span>
              </button>
            ))}
          </div>
          {save.stats.jamGames > 0 && (
            <p className="small muted center">Games: {save.stats.jamGames} · Wins: {save.stats.jamWins} · Best game: {save.stats.jamBestScore}{save.stats.jamBestWord ? ` · Best word: ${save.stats.jamBestWord.toUpperCase()} (${save.stats.jamBestWordScore})` : ''}</p>
          )}
        </div>
      </main>
    )
  }

  const pendingAt = (r: number, c: number) => pending.find((p) => p.row === r && p.col === c)
  const isLastCpu = (r: number, c: number) => game.lastCpu.some(([a, b]) => a === r && b === c)
  const myTurn = game.status === 'playing' && game.turn === 'player' && !thinking
  const winner = game.scores.player === game.scores.cpu ? 'tie' : game.scores.player > game.scores.cpu ? 'player' : 'cpu'

  return (
    <main className="screen screen-wide jam">
      <TopBar title="Jam Session" back={{ name: 'title' }} right={<button className="btn btn-ghost btn-sm" onClick={() => setConfirmQuit(true)}>New game</button>} />
      <div className="jam-layout">
        <div className="jam-scores" aria-live="polite">
          <div className={`jam-score${game.turn === 'player' ? ' is-turn' : ''}`}><span className="lbl">You</span><span className="val">{game.scores.player}</span></div>
          <div className="jam-bag"><span className="lbl">Bag</span><span className="val">{game.bag.length}</span></div>
          <div className={`jam-score${game.turn === 'cpu' ? ' is-turn' : ''}`}><span className="lbl">Bandmate</span><span className="val">{game.scores.cpu}</span></div>
        </div>
        <div className={`message jam-msg${message?.error ? ' is-error' : ''}`} aria-live="polite">{thinking ? 'Your bandmate is thinking…' : message?.text ?? ''}</div>
        <div className="jam-board">
          <div className="board15" role="grid" aria-label="Game board">
            {game.board.map((row, r) =>
              row.map((cell, c) => {
                const pend = pendingAt(r, c)
                const tile = cell ?? pend?.tile ?? null
                const bonus = BONUS[r][c]
                const isCursor = cursor && cursor.row === r && cursor.col === c && !tile
                const cls = ['cell', bonus ? `b-${bonus}` : '', tile ? 'has-tile' : '', pend ? 'is-pending' : '', isLastCpu(r, c) ? 'is-cpu' : '', isCursor ? `is-cursor dir-${cursor!.dir}` : ''].filter(Boolean).join(' ')
                const label = tile ? `${letterOf(tile).toUpperCase()}${pend ? ', pending' : ''}` : bonus ? bonus : r === CENTER && c === CENTER ? 'centre star' : 'empty'
                return (
                  <button key={`${r}-${c}`} className={cls} role="gridcell" aria-label={label} onClick={() => tapCell(r, c)} disabled={!myTurn && !pend}>
                    {tile ? (
                      <span className={`bt${tile.letter === '?' ? ' is-blank' : ''}`}>{letterOf(tile)}<i>{VALUES[tile.letter]}</i></span>
                    ) : (
                      <span className="bl">{r === CENTER && c === CENTER ? '★' : bonus ?? ''}</span>
                    )}
                  </button>
                )
              }),
            )}
          </div>
        </div>
        <p className="center small jam-preview">
          {preview && pending.length > 0 && preview.valid && <>{preview.words.map((w) => `${w.word.toUpperCase()}${w.mac ? ' ✦' : ''}`).join(' + ')} = <b style={{ color: 'var(--gold-2)' }}>{preview.score}</b>{preview.bingo ? ' (bingo!)' : ''}</>}
          {preview && pending.length > 1 && !preview.valid && <span className="muted">{preview.reason}</span>}
        </p>
        <div className="rack jam-rack" role="group" aria-label="Your tiles">
          {game.racks.player.map((t) => {
            const inPlay = pending.some((p) => p.tile.id === t.id)
            return (
              <button key={t.id} className={`letter-tile${inPlay ? ' is-ghost' : ''}${selected === t.id || swapSel.includes(t.id) ? ' is-selected' : ''}${t.letter === '?' ? ' is-golden' : ''}`} onClick={() => tapRackTile(t)} disabled={inPlay || !myTurn} aria-label={t.letter === '?' ? 'blank tile' : `${t.letter.toUpperCase()}, ${VALUES[t.letter]} points`} aria-pressed={selected === t.id}>
                {t.letter === '?' ? '' : t.letter}<span className="pts">{VALUES[t.letter]}</span>
              </button>
            )
          })}
        </div>
        <div className="jam-tools">
          {game.status === 'playing' && !swapping && (
            <div className="puzzle-tools">
              <button className="btn btn-primary" onClick={play} disabled={!myTurn || pending.length === 0}><UiIcon name="play" size={18} /> Play</button>
              <button className="btn btn-ghost btn-sm" onClick={recall} disabled={!pending.length}>Recall</button>
              <button className="btn btn-ghost btn-sm" onClick={shuffleRack} disabled={!myTurn}><UiIcon name="shuffle" size={18} /> Shuffle</button>
              <button className="btn btn-ghost btn-sm" onClick={startSwap} disabled={!myTurn || game.bag.length < 1}><UiIcon name="swap" size={18} /> Swap</button>
              <button className="btn btn-ghost btn-sm" onClick={pass} disabled={!myTurn}>Pass</button>
              <button className="btn btn-ghost btn-sm" onClick={hint} disabled={!myTurn || game.hintsLeft <= 0}><UiIcon name="hint" size={18} /> Hint ({game.hintsLeft})</button>
            </div>
          )}
          {swapping && (
            <div className="puzzle-tools">
              <button className="btn btn-primary" onClick={confirmSwap}>Swap {swapSel.length || ''}</button>
              <button className="btn btn-ghost" onClick={() => { setSwapping(false); setSwapSel([]); setMessage(null) }}>Cancel</button>
            </div>
          )}
          {game.status === 'over' && !showEnd && (
            <div className="puzzle-tools"><button className="btn btn-primary" onClick={() => setShowEnd(true)}>See the result</button></div>
          )}
        </div>
        <aside className="jam-side card">
          <p className="eyebrow">Session log</p>
          <ul className="jam-log">
            {game.history.slice().reverse().slice(0, 12).map((h, i) => (
              <li key={i}><b>{h.who === 'player' ? 'You' : 'Bandmate'}</b> {h.kind === 'play' ? `${h.words.map((w) => w.toUpperCase()).join(', ')} · ${h.score}` : h.kind === 'swap' ? 'swapped tiles' : 'passed'}</li>
            ))}
            {!game.history.length && <li className="muted">No moves yet.</li>}
          </ul>
          <p className="small muted">Fleetwood words so far: {game.macWords}. Best word: {game.bestWord.word ? `${game.bestWord.word.toUpperCase()} (${game.bestWord.score})` : 'none yet'}.</p>
          <p className="small muted">Bandmate: {DIFFICULTY.find((d) => d.id === game.difficulty)?.name}.</p>
        </aside>
      </div>

      {blankFor && (
        <Modal title="Choose a letter for the blank" onClose={() => { setBlankFor(null) }}>
          <h2 style={{ fontSize: '1.3rem' }}>Blank tile: which letter?</h2>
          <div className="blank-grid">
            {Array.from(LETTERS).map((l) => <button key={l} className="key" onClick={() => assignBlank(l)}>{l}</button>)}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setBlankFor(null)}>Cancel</button>
        </Modal>
      )}

      {confirmQuit && (
        <Modal title="Start a new game?" onClose={() => setConfirmQuit(false)}>
          <h2>Start a new session?</h2>
          <p>The current game will be abandoned.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setConfirmQuit(false)}>Keep playing</button>
            <button className="btn btn-primary" onClick={quit}>New game</button>
          </div>
        </Modal>
      )}

      {showEnd && game.status === 'over' && (
        <>
          <Confetti active={winner === 'player'} />
          <Modal title="Game over">
            <p className="eyebrow">Session over</p>
            <h2>{winner === 'player' ? 'You win!' : winner === 'cpu' ? 'Your bandmate takes it' : 'A tie!'}</h2>
            <p className="result-word" style={{ letterSpacing: '0.05em' }}>{String(game.scores.player).replace('-', '\u2212')} · {String(game.scores.cpu).replace('-', '\u2212')}</p>
            <p className="muted">{message?.text}</p>
            <p className="small muted">Best word: {game.bestWord.word ? `${game.bestWord.word.toUpperCase()} for ${game.bestWord.score}` : 'none'} · Fleetwood words: {game.macWords}</p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => { setShowEnd(false); setGame(null); dispatch({ type: 'progress', key: 'jam', state: null }) }}>Play again</button>
              <button className="btn btn-ghost" onClick={() => { setShowEnd(false) }}>Look at the board</button>
              <button className="btn btn-ghost" onClick={() => navigate({ name: 'title' })}>Menu</button>
            </div>
          </Modal>
        </>
      )}
    </main>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROPS, SPEAKERS, VENUE_DISCLAIMER } from '../../data/venue'
import { drawGrid, person, PROP_DRAW, TILE, TILE_DRAW, PAL, type Facing } from '../venue/pixel'
import { FANS, MAPS, PLAYER_LOOK, entityAt, facingTile, facingToward, findPath, isWalkable, type Entity, type MapId, type WorldMap } from '../venue/world'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { UiIcon } from '../components/Icons'
import { sfx } from '../../audio/audio'

interface Dialogue { title: string; subtitle?: string; pages: string[]; index: number; sources: string[] }
const BAND = ['stevie', 'lindsey', 'christine', 'john', 'mick']
const STEP_MS = 140

function penguinGrid(frame: number): string[][] {
  const rows = [
    '............', '............', '............', '............', '............', '............',
    '....kkkk....', '...kkkkkk...', '...kWkkWk...', '...kkookk...', '..kkWWWWkk..', '..kWWWWWWk..',
    '.kkWWWWWWkk.', '.kkWWWWWWkk.', '..kWWWWWWk..', '..kkWWWWkk..', '...kkkkkk...',
    frame ? '...oo..oo...' : '..oo....oo..', '............', '............',
  ]
  return rows.map((r) => r.split(''))
}

export function VenueScreen() {
  const { save, dispatch, award, pushToast } = useGame()
  useEraTheme('stevie')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapId, setMapId] = useState<MapId>('club')
  const [dialogue, setDialogue] = useState<Dialogue | null>(null)
  const [intro, setIntro] = useState(true)
  const [canTalk, setCanTalk] = useState<string | null>(null)
  const met = useMemo(() => (Array.isArray(save.inProgress.venueMet) ? (save.inProgress.venueMet as string[]) : []), [save.inProgress.venueMet])

  // Mutable world state lives in refs so the render loop never re-renders React.
  const st = useRef({
    x: 18, y: 10, facing: 'up' as Facing, moving: null as null | { fx: number; fy: number; tx: number; ty: number; start: number },
    path: [] as [number, number][], pathTarget: null as Entity | null, held: new Set<string>(), lastStep: 0, frame: 0,
  })
  const map: WorldMap = MAPS[mapId]
  const mapRef = useRef(map)
  mapRef.current = map
  const dialogueRef = useRef(dialogue)
  dialogueRef.current = dialogue
  const introRef = useRef(intro)
  introRef.current = intro
  const spriteCache = useRef(new Map<string, string[][]>())

  const sprite = (id: string, look: NonNullable<Entity['look']>, facing: Facing, frame: 0 | 1) => {
    const key = `${id}:${facing}:${frame}`
    let g = spriteCache.current.get(key)
    if (!g) { g = person(look, facing, frame); spriteCache.current.set(key, g) }
    return g
  }

  const openEntity = useCallback((e: Entity) => {
    if (e.speakerId) {
      const sp = SPEAKERS[e.speakerId] ?? (FANS[e.speakerId] ? { ...FANS[e.speakerId], sources: [] } : null)
      if (!sp) return
      sfx.tap()
      setDialogue({ title: sp.name, subtitle: sp.role, pages: sp.lines, index: 0, sources: sp.sources })
      if (!met.includes(e.speakerId)) {
        const next = [...met, e.speakerId]
        dispatch({ type: 'progress', key: 'venueMet', state: next })
        if (BAND.every((b) => next.includes(b))) award('club-band')
      }
    } else if (e.propId) {
      const pr = PROPS[e.propId]
      if (!pr) return
      sfx.tap()
      setDialogue({ title: pr.name, pages: [pr.text], index: 0, sources: pr.sources })
    }
  }, [met, dispatch, award])

  const interact = useCallback(() => {
    const s = st.current
    if (dialogueRef.current || introRef.current || s.moving) return
    const [fx, fy] = facingTile(s.x, s.y, s.facing)
    const e = entityAt(mapRef.current, fx, fy)
    if (e && (e.speakerId || e.propId)) openEntity(e)
  }, [openEntity])

  const changeMap = useCallback((to: MapId, tx: number, ty: number, facing: Facing) => {
    const s = st.current
    s.x = tx; s.y = ty; s.facing = facing; s.moving = null; s.path = []; s.pathTarget = null
    setMapId(to)
    sfx.unlock()
    if (to === 'backstage') award('club-backstage')
  }, [award])

  const tryStep = useCallback((facing: Facing, now: number) => {
    const s = st.current
    s.facing = facing
    const [nx, ny] = facingTile(s.x, s.y, facing)
    const m = mapRef.current
    const door = m.doors.find((d) => d.x === nx && d.y === ny)
    if (door) { changeMap(door.to, door.tx, door.ty, door.facing); return }
    if (!isWalkable(m, nx, ny)) return
    s.moving = { fx: s.x, fy: s.y, tx: nx, ty: ny, start: now }
    s.lastStep = now
  }, [changeMap])

  // Keyboard
  useEffect(() => {
    const keyToDir: Record<string, Facing> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' }
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return
      if (keyToDir[e.key]) { e.preventDefault(); st.current.held.add(keyToDir[e.key]); st.current.path = []; st.current.pathTarget = null }
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (dialogueRef.current) advance()
        else if (introRef.current) setIntro(false)
        else interact()
      } else if (e.key === 'Escape') setDialogue(null)
    }
    const up = (e: KeyboardEvent) => { if (keyToDir[e.key]) st.current.held.delete(keyToDir[e.key]) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  })

  const advance = () => {
    setDialogue((d) => (d && d.index + 1 < d.pages.length ? { ...d, index: d.index + 1 } : null))
    sfx.tap()
  }

  // Tap to move
  const onCanvasClick = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    if (dialogueRef.current || introRef.current) return
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    const tx = Math.floor(((ev.clientX - r.left) / r.width) * c.width / TILE)
    const ty = Math.floor(((ev.clientY - r.top) / r.height) * c.height / TILE)
    const s = st.current
    const m = mapRef.current
    const e = entityAt(m, tx, ty)
    const door = m.doors.find((d) => d.x === tx && d.y === ty)
    let goal: [number, number] | null = null
    let target: Entity | null = null
    if (e && (e.speakerId || e.propId)) {
      // Walk to the nearest reachable tile next to the entity, then talk.
      const around: [number, number][] = []
      for (let yy = e.y - 1; yy <= e.y + (e.h ?? 1); yy++) for (let xx = e.x - 1; xx <= e.x + (e.w ?? 1); xx++) {
        const inside = xx >= e.x && xx < e.x + (e.w ?? 1) && yy >= e.y && yy < e.y + (e.h ?? 1)
        if (!inside && (xx === e.x - 1 || xx === e.x + (e.w ?? 1) || yy === e.y - 1 || yy === e.y + (e.h ?? 1)) && !(xx !== e.x - 1 && xx !== e.x + (e.w ?? 1) && yy !== e.y - 1 && yy !== e.y + (e.h ?? 1)) && (xx === s.x && yy === s.y || isWalkable(m, xx, yy))) around.push([xx, yy])
      }
      // Only orthogonal neighbours count.
      const ortho = around.filter(([xx, yy]) => (xx >= e.x && xx < e.x + (e.w ?? 1)) || (yy >= e.y && yy < e.y + (e.h ?? 1)))
      let best: { p: [number, number][]; g: [number, number] } | null = null
      for (const g of ortho) {
        const p = g[0] === s.x && g[1] === s.y ? [] : findPath(m, [s.x, s.y], g)
        if (p && (!best || p.length < best.p.length)) best = { p, g }
      }
      if (!best) return
      s.path = best.p
      s.pathTarget = e
      if (!best.p.length) { s.facing = facingToward(s.x, s.y, e.x, e.y); openEntity(e); s.pathTarget = null }
      return
    }
    if (door) goal = [tx, ty]
    else if (isWalkable(m, tx, ty)) goal = [tx, ty]
    if (!goal) return
    if (door) {
      // Path to the tile adjacent to the door, then step through.
      const adj: [number, number][] = [[tx - 1, ty], [tx + 1, ty], [tx, ty - 1], [tx, ty + 1]].filter(([ax, ay]) => isWalkable(m, ax, ay)) as [number, number][]
      let best: [number, number][] | null = null
      for (const a of adj) { const p = findPath(m, [s.x, s.y], a); if (p && (!best || p.length < best.length)) best = p }
      if (!best) return
      s.path = [...best, [tx, ty]]
      target = null
    } else {
      const p = findPath(m, [s.x, s.y], goal)
      if (!p) return
      s.path = p
    }
    s.pathTarget = target
    sfx.tap()
  }

  // Render loop
  useEffect(() => {
    let raf = 0
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    const loop = (now: number) => {
      const s = st.current
      const m = mapRef.current
      // Movement
      if (s.moving) {
        const t = (now - s.moving.start) / STEP_MS
        if (t >= 1) { s.x = s.moving.tx; s.y = s.moving.ty; s.moving = null }
      }
      if (!s.moving && !dialogueRef.current && !introRef.current) {
        if (s.path.length) {
          const [nx, ny] = s.path[0]
          const door = m.doors.find((d) => d.x === nx && d.y === ny)
          if (door) { s.path = []; changeMap(door.to, door.tx, door.ty, door.facing) }
          else if (isWalkable(m, nx, ny)) { s.path.shift(); tryStep(facingToward(s.x, s.y, nx, ny), now) }
          else s.path = []
          if (!s.path.length && !s.moving && s.pathTarget) {
            const e = s.pathTarget
            s.pathTarget = null
            s.facing = facingToward(s.x, s.y, e.x + ((e.w ?? 1) - 1) / 2, e.y + ((e.h ?? 1) - 1) / 2)
            // Open on the next tick after the last step completes.
            window.setTimeout(() => openEntity(e), STEP_MS)
          }
        } else if (s.held.size && now - s.lastStep > 30) {
          const dir = [...s.held][s.held.size - 1] as Facing
          tryStep(dir, now)
        }
      }
      // Facing-tile hint for the Talk button.
      const [fx, fy] = facingTile(s.x, s.y, s.facing)
      const fe = entityAt(m, fx, fy)
      const hint = fe && (fe.speakerId || fe.propId) ? (fe.speakerId ? SPEAKERS[fe.speakerId]?.name ?? FANS[fe.speakerId]?.name ?? null : PROPS[fe.propId!]?.name ?? null) : null
      setCanTalk((prev) => (prev === hint ? prev : hint))

      // Draw
      const W = m.rows[0].length * TILE
      const H = m.rows.length * TILE
      ctx.clearRect(0, 0, W, H)
      for (let y = 0; y < m.rows.length; y++) for (let x = 0; x < m.rows[y].length; x++) (TILE_DRAW[m.rows[y][x]] ?? TILE_DRAW['#'])(ctx, x * TILE, y * TILE)
      const bob = Math.floor(now / 480) % 2
      const frame = (Math.floor(now / 160) % 2) as 0 | 1
      type Drawable = { y: number; draw: () => void }
      const items: Drawable[] = []
      for (const e of m.entities) {
        const px = e.x * TILE
        const py = e.y * TILE
        const depth = e.y + (e.h ?? 1) - 1 + (e.kind === 'prop' && e.y === 0 ? -10 : 0)
        items.push({
          y: depth,
          draw: () => {
            const dy = e.bob ? -bob : 0
            if (e.draw === 'penguin') drawGrid(ctx, penguinGrid(Math.floor(now / 600) % 2), px, py - 4)
            else if (e.look) {
              drawGrid(ctx, sprite(e.id, e.look, e.facing ?? 'down', e.bob ? (bob as 0 | 1) : 0), px + 2, py - 4 + dy)
              if (e.instrument) {
                ctx.fillStyle = e.instrument === 'guitar' ? PAL.d : PAL.x
                ctx.fillRect(px + 3, py + 8 + dy, 10, 4)
                ctx.fillStyle = PAL.D
                ctx.fillRect(px + 10, py + 5 + dy, 5, 1)
              }
            } else if (e.draw && PROP_DRAW[e.draw]) PROP_DRAW[e.draw](ctx, px, py, now)
          },
        })
      }
      const mv = s.moving
      const tt = mv ? Math.min(1, (now - mv.start) / STEP_MS) : 1
      const pxp = (mv ? mv.fx + (mv.tx - mv.fx) * tt : s.x) * TILE
      const pyp = (mv ? mv.fy + (mv.ty - mv.fy) * tt : s.y) * TILE
      items.push({ y: (mv ? Math.max(mv.fy, mv.ty) : s.y) + 0.5, draw: () => drawGrid(ctx, sprite('player', PLAYER_LOOK, s.facing, mv ? frame : 0), pxp + 2, pyp - 4) })
      items.sort((a, b) => a.y - b.y)
      for (const it of items) it.draw()
      // Stage lights
      if (m.lights) {
        const cols = ['rgba(217,109,138,', 'rgba(242,199,92,', 'rgba(111,194,184,']
        for (let i = 0; i < 3; i++) {
          const cx = 40 + i * 88 + Math.sin(now / 1400 + i) * 24
          const a = 0.12 + 0.04 * Math.sin(now / 300 + i * 2)
          ctx.fillStyle = `${cols[i]}${a})`
          ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx - 34, 92); ctx.lineTo(cx + 34, 92); ctx.closePath(); ctx.fill()
        }
      }
      // Vignette
      const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.9)
      grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tryStep, changeMap, openEntity])

  const W = map.rows[0].length * TILE
  const H = map.rows.length * TILE
  const dpad = (dir: Facing) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); st.current.held.add(dir); st.current.path = [] },
    onPointerUp: () => st.current.held.delete(dir),
    onPointerLeave: () => st.current.held.delete(dir),
    onPointerCancel: () => st.current.held.delete(dir),
  })

  return (
    <main className="screen screen-wide venue">
      <TopBar title={map.name} back={{ name: 'title' }} right={<span className="badge badge-soft">{met.filter((m) => BAND.includes(m)).length} / 5 met</span>} />
      <div className="venue-stage">
        <canvas ref={canvasRef} width={W} height={H} className="venue-canvas" style={{ aspectRatio: `${W} / ${H}` }} onClick={onCanvasClick} aria-label="The Penguin Club. Use the arrow keys or the on-screen pad to walk, and Talk to speak to people." />
        {dialogue && (
          <div className="venue-dialogue rise-in" role="dialog" aria-label={dialogue.title}>
            <div className="venue-dialogue-head"><b>{dialogue.title}</b>{dialogue.subtitle && <span className="muted"> · {dialogue.subtitle}</span>}</div>
            <p>{dialogue.pages[dialogue.index]}</p>
            <div className="row-between">
              <span className="small muted">{dialogue.pages.length > 1 ? `${dialogue.index + 1} / ${dialogue.pages.length}` : ''}{dialogue.sources.length > 0 && <> · <a href={dialogue.sources[0]} target="_blank" rel="noopener noreferrer">source</a></>}</span>
              <button className="btn btn-primary btn-sm" onClick={advance}>{dialogue.index + 1 < dialogue.pages.length ? 'Next' : 'Close'}</button>
            </div>
          </div>
        )}
        {intro && (
          <div className="venue-dialogue rise-in" role="dialog" aria-label="Welcome">
            <div className="venue-dialogue-head"><b>Welcome to The Penguin Club</b></div>
            <p>You are on the road crew tonight. Walk around, talk to the band, and find your way backstage. Tap anywhere to walk there, or use the arrow keys.</p>
            <p className="small muted">{VENUE_DISCLAIMER}</p>
            <div className="row-between"><span /><button className="btn btn-primary btn-sm" onClick={() => { sfx.tap(); setIntro(false) }}>Let’s go</button></div>
          </div>
        )}
      </div>
      <div className="venue-controls">
        <div className="dpad" aria-label="Walk">
          <button className="btn btn-ghost btn-icon up" aria-label="Walk up" {...dpad('up')}>▲</button>
          <button className="btn btn-ghost btn-icon left" aria-label="Walk left" {...dpad('left')}>◀</button>
          <button className="btn btn-ghost btn-icon right" aria-label="Walk right" {...dpad('right')}>▶</button>
          <button className="btn btn-ghost btn-icon down" aria-label="Walk down" {...dpad('down')}>▼</button>
        </div>
        <div className="stack" style={{ alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => (dialogue ? advance() : interact())} disabled={!dialogue && !canTalk}>
            <UiIcon name="help" size={18} /> {dialogue ? 'Next' : canTalk ? `Talk: ${canTalk}` : 'Talk'}
          </button>
          <p className="small muted center">Tap the floor to walk. Tap a person to go and talk.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { pushToast({ title: 'Thanks for visiting', body: 'The band plays on.' }); navigate({ name: 'title' }) }}>Leave the club</button>
        </div>
      </div>
    </main>
  )
}

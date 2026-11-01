/**
 * Tiny pixel-art toolkit for The Penguin Club. Everything is drawn in code at
 * native resolution (16px tiles) and scaled up with image-rendering: pixelated.
 */
export const TILE = 16

export const PAL = {
  k: '#15121a', K: '#2a2436', w: '#f3e9d2', W: '#ffffff', s: '#f1c9a5', S: '#d9a37a',
  y: '#e8c76a', Y: '#c9a24a', b: '#6b3f23', B: '#4a2a16', r: '#b23a5a', R: '#d96d8a',
  g: '#e2b85c', G: '#a67c1e', t: '#2f8a84', T: '#1a5b57', u: '#3f5a8a', U: '#2a3d5e',
  p: '#8c6ab0', P: '#5a3f7a', o: '#e8793a', e: '#4f8a5e', E: '#2f5a3a', n: '#9d8f7a',
  N: '#6e624f', x: '#c0392b', d: '#8a5a2b', D: '#5a3a1a', l: '#cdbfa6', L: '#7a7268',
  c: '#d1a23b', m: '#3a2a44', M: '#241a30', f: '#c88a4a', q: '#dcdcdc', Q: '#9a9a9a',
}
export type PalKey = keyof typeof PAL

export type Facing = 'down' | 'up' | 'left' | 'right'

export interface PersonLook {
  skin?: PalKey
  hair: PalKey
  hairStyle: 'short' | 'long' | 'curly' | 'bob' | 'bald'
  hat?: 'cap' | 'tophat' | 'none'
  hatColor?: PalKey
  beard?: boolean
  top: PalKey
  topAccent?: PalKey
  bottom: PalKey
  shoes?: PalKey
  shawl?: PalKey
  glasses?: boolean
  apron?: PalKey
}

export const SPRITE_W = 12
export const SPRITE_H = 20

type Grid = string[][]

function blank(): Grid {
  return Array.from({ length: SPRITE_H }, () => Array(SPRITE_W).fill('.'))
}
function rect(g: Grid, x: number, y: number, w: number, h: number, c: string) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < SPRITE_W) g[j][i] = c
}
function px(g: Grid, x: number, y: number, c: string) {
  if (g[y] && x >= 0 && x < SPRITE_W) g[y][x] = c
}

/** Build a 12x20 person sprite for a facing and walk frame. Head top at row 4 (hats use rows 0-3). */
export function person(look: PersonLook, facing: Facing, frame: 0 | 1): Grid {
  const g = blank()
  const skin = look.skin ?? 's'
  const shoes = look.shoes ?? 'k'
  const side = facing === 'left' || facing === 'right'
  // legs
  const legTop = 15
  if (frame === 0) {
    rect(g, 3, legTop, 2, 3, look.bottom); rect(g, 7, legTop, 2, 3, look.bottom)
    rect(g, 3, 18, 2, 2, shoes); rect(g, 7, 18, 2, 2, shoes)
  } else {
    rect(g, 2, legTop, 2, 3, look.bottom); rect(g, 8, legTop, 2, 3, look.bottom)
    rect(g, 2, 18, 2, 2, shoes); rect(g, 8, 18, 2, 2, shoes)
  }
  // body
  rect(g, 3, 10, 6, 5, look.top)
  if (look.topAccent) rect(g, 5, 10, 2, 5, look.topAccent)
  if (look.apron) rect(g, 4, 12, 4, 4, look.apron)
  // arms
  rect(g, 2, 10, 1, 4, look.top); rect(g, 9, 10, 1, 4, look.top)
  px(g, 2, 14, skin); px(g, 9, 14, skin)
  if (look.shawl) { rect(g, 1, 10, 2, 6, look.shawl); rect(g, 9, 10, 2, 6, look.shawl); rect(g, 3, 10, 6, 1, look.shawl) }
  // head
  rect(g, 3, 5, 6, 5, skin)
  rect(g, 4, 4, 4, 1, skin)
  if (facing === 'down') {
    px(g, 4, 7, 'k'); px(g, 7, 7, 'k')
    if (look.glasses) { px(g, 4, 7, 'K'); px(g, 7, 7, 'K'); px(g, 5, 7, 'l'); px(g, 6, 7, 'l') }
    if (look.beard) { rect(g, 3, 8, 6, 2, look.hair); rect(g, 4, 9, 4, 1, look.hair) }
  } else if (side) {
    const ex = facing === 'right' ? 7 : 4
    px(g, ex, 7, 'k')
    if (look.beard) rect(g, facing === 'right' ? 5 : 3, 8, 4, 2, look.hair)
  }
  // hair
  const h = look.hair
  if (look.hairStyle !== 'bald') {
    rect(g, 3, 4, 6, 2, h); rect(g, 4, 3, 4, 1, h)
    if (facing === 'up') rect(g, 3, 4, 6, 5, h)
    if (look.hairStyle === 'long') { rect(g, 2, 5, 1, 7, h); rect(g, 9, 5, 1, 7, h); if (facing === 'up') rect(g, 3, 4, 6, 8, h) }
    if (look.hairStyle === 'bob') { rect(g, 2, 5, 1, 4, h); rect(g, 9, 5, 1, 4, h); if (facing === 'up') rect(g, 3, 4, 6, 5, h) }
    if (look.hairStyle === 'curly') { rect(g, 2, 4, 1, 4, h); rect(g, 9, 4, 1, 4, h); px(g, 2, 3, h); px(g, 9, 3, h); if (facing === 'up') rect(g, 2, 4, 8, 5, h) }
    if (side) { rect(g, facing === 'right' ? 3 : 8, 5, 1, 3, h) }
  }
  // hats
  const hc = look.hatColor ?? 'k'
  if (look.hat === 'cap') { rect(g, 3, 3, 6, 2, hc); rect(g, 4, 2, 4, 1, hc); if (facing === 'down') rect(g, 2, 5, 8, 1, hc); if (side) rect(g, facing === 'right' ? 7 : 2, 5, 3, 1, hc) }
  if (look.hat === 'tophat') { rect(g, 2, 4, 8, 1, hc); rect(g, 3, 0, 6, 4, hc); rect(g, 3, 3, 6, 1, 'g') }
  return g
}

export function drawGrid(ctx: CanvasRenderingContext2D, g: Grid, x: number, y: number) {
  for (let j = 0; j < g.length; j++) {
    for (let i = 0; i < g[j].length; i++) {
      const c = g[j][i]
      if (c === '.') continue
      ctx.fillStyle = (PAL as Record<string, string>)[c] ?? c
      ctx.fillRect(x + i, y + j, 1, 1)
    }
  }
}

// ---------- Props (drawn with primitives at native resolution) ----------
type Ctx = CanvasRenderingContext2D
const F = (ctx: Ctx, c: PalKey) => { ctx.fillStyle = PAL[c] }
const R = (ctx: Ctx, x: number, y: number, w: number, h: number, c: PalKey) => { F(ctx, c); ctx.fillRect(x, y, w, h) }
const CIRC = (ctx: Ctx, cx: number, cy: number, r: number, c: PalKey) => {
  F(ctx, c)
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.5) ctx.fillRect(cx + x, cy + y, 1, 1)
}

export const PROP_DRAW: Record<string, (ctx: Ctx, x: number, y: number, t: number) => void> = {
  drums(ctx, x, y) {
    // 2 tiles wide, 1.5 tall; x,y = top-left of the first tile
    R(ctx, x + 2, y + 4, 28, 12, 'D'); R(ctx, x + 3, y + 5, 26, 10, 'r')
    CIRC(ctx, x + 8, y + 9, 5, 'w'); CIRC(ctx, x + 24, y + 9, 5, 'w'); CIRC(ctx, x + 16, y + 12, 6, 'w'); CIRC(ctx, x + 16, y + 12, 5, 'l')
    CIRC(ctx, x + 4, y + 1, 4, 'c'); CIRC(ctx, x + 28, y + 1, 4, 'c'); R(ctx, x + 4, y + 2, 1, 6, 'Q'); R(ctx, x + 28, y + 2, 1, 6, 'Q')
  },
  keyboard(ctx, x, y) {
    R(ctx, x + 1, y + 6, 30, 7, 'k'); R(ctx, x + 2, y + 7, 28, 4, 'W')
    for (let i = 0; i < 14; i++) R(ctx, x + 3 + i * 2, y + 7, 1, 2, 'k')
    R(ctx, x + 4, y + 13, 2, 3, 'Q'); R(ctx, x + 26, y + 13, 2, 3, 'Q')
  },
  amp(ctx, x, y) {
    R(ctx, x + 1, y + 2, 14, 14, 'k'); R(ctx, x + 2, y + 3, 12, 8, 'K'); R(ctx, x + 2, y + 12, 12, 3, 'L')
    R(ctx, x + 3, y + 13, 1, 1, 'x'); R(ctx, x + 5, y + 13, 7, 1, 'Q')
  },
  mic(ctx, x, y) {
    R(ctx, x + 7, y + 4, 2, 12, 'Q'); R(ctx, x + 4, y + 15, 8, 1, 'Q'); R(ctx, x + 6, y + 1, 4, 4, 'K'); R(ctx, x + 7, y + 2, 2, 2, 'l')
  },
  table(ctx, x, y) {
    R(ctx, x + 1, y + 6, 14, 5, 'd'); R(ctx, x + 1, y + 6, 14, 1, 'f'); R(ctx, x + 2, y + 11, 2, 5, 'D'); R(ctx, x + 12, y + 11, 2, 5, 'D')
  },
  crate(ctx, x, y) {
    R(ctx, x + 1, y + 3, 14, 13, 'K'); R(ctx, x + 2, y + 4, 12, 11, 'k'); R(ctx, x + 1, y + 9, 14, 1, 'Q'); R(ctx, x + 4, y + 6, 8, 2, 'g'); R(ctx, x + 2, y + 3, 2, 2, 'Q'); R(ctx, x + 12, y + 3, 2, 2, 'Q')
  },
  poster(ctx, x, y) {
    R(ctx, x + 2, y + 1, 12, 14, 'w'); R(ctx, x + 3, y + 2, 10, 4, 'r'); R(ctx, x + 4, y + 7, 8, 1, 'k'); R(ctx, x + 4, y + 9, 6, 1, 'k'); R(ctx, x + 4, y + 11, 8, 1, 'k'); R(ctx, x + 5, y + 13, 4, 1, 'G')
  },
  mirror(ctx, x, y) {
    R(ctx, x + 1, y + 1, 14, 14, 'G'); R(ctx, x + 2, y + 2, 12, 12, 'l'); R(ctx, x + 3, y + 3, 4, 6, 'q')
    for (let i = 0; i < 4; i++) { R(ctx, x + i * 4, y + 15, 1, 1, 'g'); R(ctx, x + 1 + i * 4, y + 0, 1, 1, 'g') }
  },
  shawls(ctx, x, y) {
    R(ctx, x + 1, y + 2, 14, 1, 'Q'); R(ctx, x + 1, y + 2, 1, 14, 'Q'); R(ctx, x + 14, y + 2, 1, 14, 'Q')
    R(ctx, x + 3, y + 3, 3, 11, 'k'); R(ctx, x + 7, y + 3, 3, 12, 'w'); R(ctx, x + 11, y + 3, 2, 10, 'R'); R(ctx, x + 4, y + 10, 1, 4, 'P')
  },
  jukebox(ctx, x, y) {
    R(ctx, x + 2, y + 2, 12, 14, 'r'); R(ctx, x + 3, y + 0, 10, 3, 'c'); R(ctx, x + 4, y + 4, 8, 4, 'k'); R(ctx, x + 5, y + 5, 6, 2, 't')
    R(ctx, x + 4, y + 10, 8, 3, 'g'); R(ctx, x + 3, y + 14, 10, 1, 'G')
  },
  goldrecord(ctx, x, y) {
    R(ctx, x + 1, y + 1, 14, 14, 'D'); R(ctx, x + 2, y + 2, 12, 12, 'k'); CIRC(ctx, x + 8, y + 7, 4, 'g'); CIRC(ctx, x + 8, y + 7, 1, 'k'); R(ctx, x + 4, y + 12, 8, 1, 'w')
  },
  tophat(ctx, x, y) {
    R(ctx, x + 2, y + 11, 12, 2, 'k'); R(ctx, x + 4, y + 4, 8, 7, 'k'); R(ctx, x + 4, y + 9, 8, 1, 'g')
  },
  tambourine(ctx, x, y) {
    CIRC(ctx, x + 8, y + 8, 6, 'd'); CIRC(ctx, x + 8, y + 8, 4, 'w'); R(ctx, x + 2, y + 8, 1, 1, 'Q'); R(ctx, x + 13, y + 8, 1, 1, 'Q'); R(ctx, x + 8, y + 2, 1, 1, 'Q'); R(ctx, x + 8, y + 13, 1, 1, 'Q'); R(ctx, x + 12, y + 12, 3, 4, 'R'); R(ctx, x + 1, y + 11, 3, 4, 'p')
  },
  balls(ctx, x, y) {
    CIRC(ctx, x + 5, y + 10, 3, 'd'); CIRC(ctx, x + 11, y + 10, 3, 'd'); R(ctx, x + 5, y + 3, 1, 5, 'Q'); R(ctx, x + 11, y + 3, 1, 5, 'Q'); R(ctx, x + 4, y + 2, 9, 1, 'Q')
  },
  reel(ctx, x, y) {
    R(ctx, x + 1, y + 4, 14, 11, 'n'); R(ctx, x + 2, y + 5, 12, 9, 'N'); CIRC(ctx, x + 8, y + 9, 4, 'l'); CIRC(ctx, x + 8, y + 9, 1, 'K'); R(ctx, x + 3, y + 6, 4, 1, 'w')
  },
  setlist(ctx, x, y) {
    R(ctx, x + 3, y + 2, 10, 13, 'w'); R(ctx, x + 7, y + 1, 2, 2, 'x'); for (let i = 0; i < 5; i++) R(ctx, x + 5, y + 5 + i * 2, 6 - (i % 2) * 2, 1, 'k')
  },
  barback(ctx, x, y) {
    R(ctx, x, y + 2, 16, 12, 'D'); R(ctx, x + 1, y + 3, 14, 4, 'd'); R(ctx, x + 1, y + 9, 14, 4, 'd')
    const cs: PalKey[] = ['t', 'g', 'r', 'e', 'p', 'c']
    for (let i = 0; i < 6; i++) { R(ctx, x + 2 + i * 2, y + 4, 1, 3, cs[i]); R(ctx, x + 2 + i * 2, y + 10, 1, 3, cs[(i + 3) % 6]) }
  },
  lamp(ctx, x, y, t) {
    R(ctx, x + 7, y + 6, 2, 10, 'G'); R(ctx, x + 4, y + 2, 8, 5, 'c'); R(ctx, x + 5, y + 7, 6, 1, 'g')
    ctx.fillStyle = `rgba(242,199,92,${0.12 + 0.05 * Math.sin(t / 400)})`; ctx.fillRect(x + 1, y + 7, 14, 9)
  },
  plant(ctx, x, y) {
    R(ctx, x + 5, y + 10, 6, 6, 'f'); R(ctx, x + 3, y + 3, 10, 7, 'e'); R(ctx, x + 5, y + 1, 6, 3, 'E'); R(ctx, x + 2, y + 6, 2, 3, 'e'); R(ctx, x + 12, y + 5, 2, 3, 'e')
  },
}

// ---------- Tiles ----------
export const TILE_DRAW: Record<string, (ctx: Ctx, x: number, y: number) => void> = {
  '#': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'M'); for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) R(ctx, x + i * 8 + (j % 2) * 4 - 2, y + j * 4 + 1, 7, 2, 'm') },
  '.': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'D'); R(ctx, x, y, 16, 7, 'd'); R(ctx, x, y + 8, 16, 7, 'd'); R(ctx, x + 6, y, 1, 7, 'D'); R(ctx, x + 11, y + 8, 1, 7, 'D') },
  'S': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'P'); R(ctx, x, y + 1, 16, 6, 'm'); R(ctx, x, y + 9, 16, 6, 'm'); R(ctx, x + 8, y + 1, 1, 6, 'P') },
  '=': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'd'); R(ctx, x, y, 16, 4, 'P'); R(ctx, x, y + 4, 16, 2, 'g'); R(ctx, x, y + 6, 16, 1, 'D') },
  'C': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'r'); for (let i = 0; i < 4; i++) R(ctx, x + i * 4, y, 1, 16, 'x'); R(ctx, x, y + 14, 16, 2, 'G') },
  'B': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'D'); R(ctx, x, y, 16, 6, 'f'); R(ctx, x, y + 6, 16, 2, 'd'); R(ctx, x, y + 8, 16, 8, 'D') },
  'c': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'T'); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if ((i + j) % 2 === 0) R(ctx, x + i * 4 + 1, y + j * 4 + 1, 2, 2, 't') },
  'D': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'M'); R(ctx, x + 2, y + 1, 12, 15, 'B'); R(ctx, x + 3, y + 2, 10, 13, 'd'); R(ctx, x + 10, y + 8, 2, 2, 'g'); R(ctx, x + 4, y + 0, 8, 1, 'g') },
  'W': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'M'); R(ctx, x + 2, y + 2, 12, 10, 'U'); R(ctx, x + 3, y + 3, 10, 8, 'u'); R(ctx, x + 8, y + 3, 1, 8, 'M'); R(ctx, x + 3, y + 7, 10, 1, 'M'); R(ctx, x + 4, y + 4, 2, 2, 'q') },
  'X': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'D'); R(ctx, x, y, 16, 7, 'd'); R(ctx, x, y + 8, 16, 7, 'd') },
  'R': (ctx, x, y) => { R(ctx, x, y, 16, 16, 'r'); R(ctx, x + 1, y + 1, 14, 14, 'x'); R(ctx, x + 3, y + 3, 10, 10, 'r') },
}

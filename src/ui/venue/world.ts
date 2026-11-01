import type { PersonLook, Facing } from './pixel'

export interface Entity {
  id: string
  kind: 'npc' | 'prop' | 'deco'
  x: number
  y: number
  /** Footprint in tiles. */
  w?: number
  h?: number
  solid?: boolean
  speakerId?: string
  propId?: string
  look?: PersonLook
  facing?: Facing
  draw?: string
  /** Bob with the music. */
  bob?: boolean
  instrument?: 'guitar' | 'bass'
}

export interface Door { x: number; y: number; to: MapId; tx: number; ty: number; facing: Facing }

export interface WorldMap {
  id: MapId
  name: string
  rows: string[]
  entities: Entity[]
  doors: Door[]
  lights: boolean
}

export type MapId = 'club' | 'backstage'

const LOOKS: Record<string, PersonLook> = {
  player: { hair: 'b', hairStyle: 'short', hat: 'cap', hatColor: 'e', top: 'K', topAccent: 'g', bottom: 'u' },
  stevie: { hair: 'y', hairStyle: 'long', hat: 'tophat', top: 'k', bottom: 'k', shawl: 'w' },
  lindsey: { hair: 'B', hairStyle: 'curly', top: 'W', bottom: 'u' },
  christine: { hair: 'y', hairStyle: 'bob', top: 'u', bottom: 'K' },
  john: { hair: 'b', hairStyle: 'short', beard: true, top: 'L', bottom: 'U' },
  mick: { hair: 'b', hairStyle: 'short', beard: true, top: 'r', topAccent: 'w', bottom: 'K' },
  roadie: { hair: 'n', hairStyle: 'short', hat: 'cap', hatColor: 'k', beard: true, top: 'K', bottom: 'u' },
  bartender: { hair: 'o', hairStyle: 'bob', top: 'w', bottom: 'K', apron: 'r' },
  manager: { hair: 'B', hairStyle: 'bob', glasses: true, top: 't', bottom: 'K' },
}
export const PLAYER_LOOK = LOOKS.player

const crowd = (id: string, x: number, y: number, hair: PersonLook['hair'], style: PersonLook['hairStyle'], top: PersonLook['top'], bottom: PersonLook['bottom']): Entity =>
  ({ id, kind: 'npc', x, y, solid: true, speakerId: id, look: { hair, hairStyle: style, top, bottom }, facing: 'up', bob: true })

/** Fans in the crowd: light small talk written for the game, no history claims. */
export const FANS: Record<string, { name: string; role: string; lines: string[] }> = {
  c1: { name: 'Rosie', role: 'in the crowd', lines: ['First time at the Penguin? Stand near the front, that is where the sound is best.', 'I saved up for weeks for this ticket. Worth every penny already.'] },
  c2: { name: 'June', role: 'in the crowd', lines: ['I came for the songs and stayed for the shawls. Look at that top hat!', 'If they play a slow one I am going to cry, and I am fine with that.'] },
  c3: { name: 'Terry', role: 'in the crowd', lines: ['My brother says the drummer is the tallest man he has ever seen. I believe him now.', 'Mind the cables, crew. Pearl will have your head if someone trips.'] },
  c4: { name: 'Marigold', role: 'in the crowd', lines: ['I knitted this for tonight. Do you think she will notice?', 'They say the door at the back leads backstage. Lucky you, with that pass.'] },
  c5: { name: 'Clive', role: 'in the crowd', lines: ['I used to come here for the blues nights. Funny how it all comes around.', 'Do us a favour and ask them to turn the bass up. Just a little.'] },
  c6: { name: 'Wendy', role: 'in the crowd', lines: ['Three of us drove all day to be here. Nobody is tired.', 'Is it true the club is named after a penguin? I love that.'] },
  c7: { name: 'Patrick', role: 'in the crowd', lines: ['I always watch the bass player. Steady as a clock, that one.', 'If you see the setlist, no spoilers. I want to be surprised.'] },
  c8: { name: 'Dot', role: 'in the crowd', lines: ['I have been to a lot of shows, love. This one feels special.', 'Go on, go and say hello to them. You are crew, you are allowed!'] },
}

export const MAPS: Record<MapId, WorldMap> = {
  club: {
    id: 'club',
    name: 'The Penguin Club',
    lights: true,
    rows: [
      '##CCCCCCCCCCCCCC########',
      '#SSSSSSSSSSSSSSS#......#',
      '#SSSSSSSSSSSSSSS#......#',
      '#SSSSSSSSSSSSSSS#......#',
      '#SSSSSSSSSSSSSSS#......#',
      '#===============#..BBBB#',
      '#......................#',
      '#......................#',
      '#......................D',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '########################',
    ],
    entities: [
      { id: 'mick', kind: 'npc', x: 8, y: 1, solid: true, speakerId: 'mick', look: LOOKS.mick, facing: 'down', bob: true },
      { id: 'drums', kind: 'prop', x: 7, y: 2, w: 2, h: 1, solid: true, propId: 'drums', draw: 'drums' },
      { id: 'stevie', kind: 'npc', x: 8, y: 3, solid: true, speakerId: 'stevie', look: LOOKS.stevie, facing: 'down', bob: true },
      { id: 'mic', kind: 'deco', x: 8, y: 4, solid: true, draw: 'mic' },
      { id: 'lindsey', kind: 'npc', x: 4, y: 3, solid: true, speakerId: 'lindsey', look: LOOKS.lindsey, facing: 'down', bob: true, instrument: 'guitar' },
      { id: 'amp', kind: 'deco', x: 2, y: 2, solid: true, draw: 'amp' },
      { id: 'amp2', kind: 'deco', x: 14, y: 4, solid: true, draw: 'amp' },
      { id: 'john', kind: 'npc', x: 12, y: 3, solid: true, speakerId: 'john', look: LOOKS.john, facing: 'down', bob: true, instrument: 'bass' },
      { id: 'christine', kind: 'npc', x: 13, y: 1, solid: true, speakerId: 'christine', look: LOOKS.christine, facing: 'down', bob: true },
      { id: 'keyboard', kind: 'prop', x: 12, y: 2, w: 2, h: 1, solid: true, propId: 'piano', draw: 'keyboard' },
      { id: 'setlist', kind: 'prop', x: 17, y: 0, solid: true, propId: 'setlist', draw: 'setlist' },
      { id: 'poster', kind: 'prop', x: 19, y: 0, solid: true, propId: 'poster', draw: 'poster' },
      { id: 'barback', kind: 'deco', x: 21, y: 0, solid: true, draw: 'barback' },
      { id: 'bartender', kind: 'npc', x: 20, y: 4, solid: true, speakerId: 'bartender', look: LOOKS.bartender, facing: 'down' },
      { id: 'roadie', kind: 'npc', x: 18, y: 9, solid: true, speakerId: 'roadie', look: LOOKS.roadie, facing: 'down' },
      { id: 'jukebox', kind: 'prop', x: 22, y: 12, solid: true, propId: 'jukebox', draw: 'jukebox' },
      { id: 'table1', kind: 'deco', x: 3, y: 10, solid: true, draw: 'table' },
      { id: 'table2', kind: 'deco', x: 7, y: 11, solid: true, draw: 'table' },
      { id: 'lamp1', kind: 'deco', x: 17, y: 12, solid: true, draw: 'lamp' },
      { id: 'plant1', kind: 'deco', x: 1, y: 12, solid: true, draw: 'plant' },
      crowd('c1', 3, 7, 'b', 'short', 'e', 'u'), crowd('c2', 6, 7, 'y', 'long', 'R', 'K'), crowd('c3', 9, 7, 'B', 'curly', 'c', 'u'),
      crowd('c4', 12, 7, 'o', 'bob', 'p', 'U'), crowd('c5', 5, 8, 'k', 'short', 'w', 'K'), crowd('c6', 10, 8, 'n', 'long', 't', 'u'),
      crowd('c7', 14, 8, 'b', 'short', 'x', 'K'), crowd('c8', 8, 9, 'y', 'bob', 'g', 'u'),
    ],
    doors: [{ x: 23, y: 8, to: 'backstage', tx: 9, ty: 10, facing: 'up' }],
  },
  backstage: {
    id: 'backstage',
    name: 'Backstage',
    lights: false,
    rows: [
      '##################',
      '#cccccccccccccccc#',
      '#cccccccccccccccc#',
      '#cccccccccccccccc#',
      '#cccccccccccccccc#',
      '#cccRRRRRRRRRRccc#',
      '#cccRRRRRRRRRRccc#',
      '#cccRRRRRRRRRRccc#',
      '#cccRRRRRRRRRRccc#',
      '#cccccccccccccccc#',
      '#cccccccccccccccc#',
      '#########D########',
    ],
    entities: [
      { id: 'mirror', kind: 'prop', x: 2, y: 0, solid: true, propId: 'mirror', draw: 'mirror' },
      { id: 'shawls', kind: 'prop', x: 5, y: 0, solid: true, propId: 'shawls', draw: 'shawls' },
      { id: 'goldrecord', kind: 'prop', x: 9, y: 0, solid: true, propId: 'goldrecord', draw: 'goldrecord' },
      { id: 'reel', kind: 'prop', x: 12, y: 0, solid: true, propId: 'reel', draw: 'reel' },
      { id: 'table', kind: 'deco', x: 2, y: 3, solid: true, draw: 'table' },
      { id: 'tophat', kind: 'prop', x: 4, y: 3, solid: true, propId: 'tophat', draw: 'tophat' },
      { id: 'tambourine', kind: 'prop', x: 6, y: 3, solid: true, propId: 'tambourine', draw: 'tambourine' },
      { id: 'balls', kind: 'prop', x: 8, y: 3, solid: true, propId: 'balls', draw: 'balls' },
      { id: 'crate', kind: 'prop', x: 14, y: 2, solid: true, propId: 'crate', draw: 'crate' },
      { id: 'crate2', kind: 'deco', x: 15, y: 3, solid: true, draw: 'crate' },
      { id: 'lamp', kind: 'deco', x: 16, y: 1, solid: true, draw: 'lamp' },
      { id: 'table2', kind: 'deco', x: 11, y: 3, solid: true, draw: 'table' },
      { id: 'lamp2', kind: 'deco', x: 1, y: 5, solid: true, draw: 'lamp' },
      { id: 'amp3', kind: 'deco', x: 16, y: 9, solid: true, draw: 'amp' },
      { id: 'crate3', kind: 'deco', x: 15, y: 9, solid: true, draw: 'crate' },
      { id: 'plant', kind: 'deco', x: 1, y: 9, solid: true, draw: 'plant' },
      { id: 'penguin', kind: 'npc', x: 7, y: 7, solid: true, speakerId: 'penguin', draw: 'penguin', facing: 'down' },
      { id: 'manager', kind: 'npc', x: 13, y: 7, solid: true, speakerId: 'manager', look: LOOKS.manager, facing: 'left' },
    ],
    doors: [{ x: 9, y: 11, to: 'club', tx: 22, ty: 8, facing: 'left' }],
  },
}

export const WALKABLE = new Set(['S', '=', '.', 'c', 'X', 'D'])

export function tileAt(map: WorldMap, x: number, y: number): string {
  return map.rows[y]?.[x] ?? '#'
}

export function entityAt(map: WorldMap, x: number, y: number): Entity | undefined {
  return map.entities.find((e) => x >= e.x && x < e.x + (e.w ?? 1) && y >= e.y && y < e.y + (e.h ?? 1))
}

export function isWalkable(map: WorldMap, x: number, y: number): boolean {
  if (!WALKABLE.has(tileAt(map, x, y))) return false
  const e = entityAt(map, x, y)
  return !(e && e.solid)
}

/** Breadth-first path between tiles; returns the list of steps after `from`, or null. */
export function findPath(map: WorldMap, from: [number, number], to: [number, number]): [number, number][] | null {
  const key = (x: number, y: number) => `${x},${y}`
  const prev = new Map<string, string | null>([[key(from[0], from[1]), null]])
  let frontier: [number, number][] = [from]
  const target = key(to[0], to[1])
  while (frontier.length) {
    const next: [number, number][] = []
    for (const [x, y] of frontier) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx
        const ny = y + dy
        const k = key(nx, ny)
        if (prev.has(k) || !isWalkable(map, nx, ny)) continue
        prev.set(k, key(x, y))
        if (k === target) {
          const path: [number, number][] = []
          let cur: string | null = k
          while (cur && cur !== key(from[0], from[1])) {
            const [cx, cy] = cur.split(',').map(Number)
            path.push([cx, cy])
            cur = prev.get(cur) ?? null
          }
          return path.reverse()
        }
        next.push([nx, ny])
      }
    }
    frontier = next
  }
  return null
}

export function facingTile(x: number, y: number, facing: Facing): [number, number] {
  return facing === 'up' ? [x, y - 1] : facing === 'down' ? [x, y + 1] : facing === 'left' ? [x - 1, y] : [x + 1, y]
}

export function facingToward(fx: number, fy: number, tx: number, ty: number): Facing {
  const dx = tx - fx
  const dy = ty - fy
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

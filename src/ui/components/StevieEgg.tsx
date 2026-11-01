import { useEffect, useRef } from 'react'
import { drawGrid, PAL } from '../venue/pixel'

/**
 * Easter egg: a pixel-art singer in a long flowing black dress and top hat at a
 * microphone under a crescent moon. Original artwork, drawn in code.
 */
const W = 160
const H = 120

// 30 x 60 sprite. Legend: k black, m dark dress, p dress shade, y hair, Y hair shadow,
// s skin, S shadow, w cream shawl, g gold, r lips, W eye white, . transparent
const BASE = [
  '............kkkkkkkk..........',
  '............kkkkkkkk..........',
  '............kkkkkkkk..........',
  '............kkkkkkkk..........',
  '............kgggggggk.........',
  '..........kkkkkkkkkkkk........',
  '...........yyyyyyyyyy.........',
  '..........yyyyyyyyyyyy........',
  '.........yyyyssssssyyyy.......',
  '.........yyysssssssyyyy.......',
  '........yyyssWssWssyyyy.......',
  '........yyysskssksssyyy.......',
  '........yyyssssssssyyyyy......',
  '........yyyssSrrSssyyyyy......',
  '.......yyyyysssssssyyyyyy.....',
  '.......yyyyyysssssyyyyyyy.....',
  '.......yyyyyyywwwyyyyyyyy.....',
  '......yyyyyywwmmmwwyyyyyyy....',
  '......yyyyywwmmmmmwwyyyyyy....',
  '......yyyyywmmmmmmmwyyyyyy....',
  '.....yyyyywwmmmmmmmwwyyyyyy...',
  '.....yyyyywmmmmgmmmmwyyyyyy...',
  '.....yyyyywmmmmmmmmmwyyyyyy...',
  '....yyyyymmmmmmmmmmmmmyyyyy...',
  '....yyyymmmmmmmmmmmmmmmyyyyy..',
  '....yyyymmmmmmmmmmmmmmmyyyyy..',
  '...yyyymmmmmmmmmmmmmmmmmyyyy..',
  '...yyymmmmmmmmmmmmmmmmmmmyyy..',
  '...yymmmmmmmmmmmmmmmmmmmmmyy..',
  '..yyymmmmmpmmmmmmmmmpmmmmmyyy.',
  '..yymmmmmpmmmmmmmmmmmpmmmmmyy.',
  '..ymmmmmpmmmmmmmmmmmmmpmmmmmy.',
  '..mmmmmpmmmmmmmmmmmmmmmpmmmmm.',
  '..mmmmpmmmmmmmmmmmmmmmmmpmmmm.',
  '.mmmmpmmmmmmmmmmmmmmmmmmmpmmmm',
  '.mmmmpmmmmmmmmmmmmmmmmmmmpmmmm',
  '.mmmpmmmmmmmmmmmmmmmmmmmmmpmmm',
  '.mmmpmmmmmmmmmmmmmmmmmmmmmpmmm',
  'mmmpmmmmmmmmmmmmmmmmmmmmmmmpmm',
  'mmmpmmmmmmmmmmmmmmmmmmmmmmmpmm',
  'mmpmmmmmmmmmmmmmmmmmmmmmmmmmpm',
  'mmpmmmmmmmmmmmmmmmmmmmmmmmmmpm',
  'mpmmmmmmmmmmmmmmmmmmmmmmmmmmmp',
  'mpmmmmmmmmmmmmmmmmmmmmmmmmmmmp',
  'pmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'pmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
]

const DRESS: Record<string, string> = { k: '#120f16', m: '#1d1824', p: '#2c2537', y: PAL.y, Y: PAL.Y, s: PAL.s, S: PAL.S, w: '#efe3cc', g: PAL.g, r: '#b3465f', W: '#ffffff' }

function sprite(frame: number, mouthOpen: boolean): string[][] {
  const rows = BASE.map((r) => r.split(''))
  // Mouth
  const mrow = rows[13]
  if (mouthOpen) { mrow[14] = 'k'; mrow[15] = 'k' } else { mrow[14] = 'r'; mrow[15] = 'r' }
  // Sway: shift the skirt rows sideways on alternate frames.
  if (frame === 1) {
    for (let j = 28; j < rows.length - 1; j++) {
      const r = rows[j]
      if (r[r.length - 1] === '.') { r.pop(); r.unshift('.') }
    }
  }
  // Translate letters into palette colours understood by drawGrid (hex passthrough).
  return rows.map((r) => r.map((ch) => (ch === '.' ? '.' : DRESS[ch] ?? '.')))
}

export function StevieEgg({ singing }: { singing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    const stars = Array.from({ length: 40 }, (_, i) => ({ x: (i * 37) % W, y: (i * 53) % 70, p: (i * 11) % 7 }))
    const sparks: { x: number; y: number; v: number; c: string }[] = []
    let raf = 0
    const loop = (now: number) => {
      ctx.fillStyle = '#120a1c'
      ctx.fillRect(0, 0, W, H)
      // Sky glow
      const g = ctx.createRadialGradient(80, 40, 10, 80, 40, 110)
      g.addColorStop(0, 'rgba(140,106,176,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      // Stars
      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 900 + s.p))
        ctx.fillStyle = `rgba(243,233,210,${tw})`
        ctx.fillRect(s.x, s.y, 1, 1)
      }
      // Moon
      ctx.fillStyle = PAL.g
      for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) {
        const inOuter = x * x + y * y <= 144
        const inInner = (x - 6) * (x - 6) + (y - 2) * (y - 2) <= 110
        if (inOuter && !inInner) ctx.fillRect(132 + x, 22 + y, 1, 1)
      }
      // Stage floor
      ctx.fillStyle = '#2a1d3b'; ctx.fillRect(0, 100, W, 20)
      ctx.fillStyle = '#3a2a50'; for (let x = 0; x < W; x += 16) ctx.fillRect(x, 100, 15, 1)
      // Spotlight
      ctx.fillStyle = `rgba(242,199,92,${0.10 + 0.04 * Math.sin(now / 500)})`
      ctx.beginPath(); ctx.moveTo(66, 0); ctx.lineTo(30, 112); ctx.lineTo(110, 112); ctx.closePath(); ctx.fill()
      // Mic stand
      ctx.fillStyle = PAL.Q; ctx.fillRect(85, 68, 1, 42); ctx.fillRect(80, 109, 11, 1); ctx.fillRect(82, 66, 4, 1)
      ctx.fillStyle = PAL.K; ctx.fillRect(78, 62, 6, 7); ctx.fillStyle = PAL.l; ctx.fillRect(79, 63, 4, 3)
      // Singer
      const frame = Math.floor(now / 520) % 2
      const mouth = singing && Math.floor(now / 260) % 3 !== 0
      drawGrid(ctx, sprite(frame, mouth), 56, 52 - (frame ? 1 : 0))
      // Sparkles
      if (singing && Math.random() < 0.25) sparks.push({ x: 40 + Math.random() * 80, y: 100, v: 0.3 + Math.random() * 0.5, c: Math.random() < 0.5 ? PAL.g : PAL.w })
      for (const s of sparks) { s.y -= s.v; ctx.fillStyle = s.c; ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1) }
      while (sparks.length && sparks[0].y < 10) sparks.shift()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [singing])
  return <canvas ref={ref} width={W} height={H} className="egg-canvas" aria-label="A pixel-art singer in a long black dress and top hat at a microphone under a crescent moon." />
}

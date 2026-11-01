/**
 * All sound is synthesized with the Web Audio API: no recordings, no samples,
 * nothing to license. Everything is off by default and starts only on a user gesture.
 */
import type { EraId } from '../data/types'

type Ctx = AudioContext

let ctx: Ctx | null = null
let master: GainNode | null = null
let sfxGain: GainNode | null = null
let musicGain: GainNode | null = null

function ensure(): Ctx | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
    sfxGain = ctx.createGain()
    sfxGain.gain.value = 0.5
    sfxGain.connect(master)
    musicGain = ctx.createGain()
    musicGain.gain.value = 0
    musicGain.connect(master)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function unlockAudio(): void {
  ensure()
}

// ---------- Sound effects ----------

let sfxEnabled = false
export function setSfxEnabled(on: boolean): void {
  sfxEnabled = on
  if (on) ensure()
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.25, when = 0, detune = 0) {
  const c = ensure()
  if (!c || !sfxGain) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune
  const t0 = c.currentTime + when
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(sfxGain)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

function noise(dur: number, gain = 0.15, when = 0, cutoff = 2000) {
  const c = ensure()
  if (!c || !sfxGain) return
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = cutoff
  const g = c.createGain()
  g.gain.value = gain
  src.connect(f)
  f.connect(g)
  g.connect(sfxGain)
  src.start(c.currentTime + when)
}

export const sfx = {
  tap() { if (sfxEnabled) tone(660, 0.06, 'triangle', 0.12) },
  place() { if (sfxEnabled) { noise(0.05, 0.12, 0, 3000); tone(220, 0.08, 'sine', 0.15) } },
  remove() { if (sfxEnabled) tone(330, 0.07, 'triangle', 0.1) },
  flipAbsent() { if (sfxEnabled) tone(180, 0.1, 'sine', 0.12) },
  flipPresent() { if (sfxEnabled) tone(440, 0.12, 'triangle', 0.14) },
  flipCorrect() { if (sfxEnabled) tone(587, 0.14, 'triangle', 0.16) },
  invalid() { if (sfxEnabled) { tone(200, 0.12, 'square', 0.08); tone(160, 0.12, 'square', 0.08, 0.08) } },
  word(points: number) {
    if (!sfxEnabled) return
    const n = Math.min(5, 2 + Math.floor(points / 12))
    const base = [392, 494, 587, 784, 988]
    for (let i = 0; i < n; i++) tone(base[i], 0.18, 'triangle', 0.16, i * 0.06)
  },
  link() { if (sfxEnabled) { tone(523, 0.1, 'triangle', 0.14); tone(784, 0.14, 'sine', 0.12, 0.06) } },
  undo() { if (sfxEnabled) tone(392, 0.08, 'triangle', 0.1) },
  hint() { if (sfxEnabled) { tone(880, 0.2, 'sine', 0.1); tone(1108, 0.25, 'sine', 0.08, 0.1) } },
  win() {
    if (!sfxEnabled) return
    const seq = [523, 659, 784, 1047]
    seq.forEach((f, i) => tone(f, 0.35, 'triangle', 0.18, i * 0.11))
    tone(1319, 0.6, 'sine', 0.14, 0.45)
  },
  lose() { if (sfxEnabled) { tone(330, 0.3, 'sine', 0.12); tone(262, 0.5, 'sine', 0.12, 0.2) } },
  fanfare() {
    if (!sfxEnabled) return
    const seq = [392, 523, 659, 784, 1047, 1319]
    seq.forEach((f, i) => { tone(f, 0.5, 'triangle', 0.16, i * 0.09); tone(f / 2, 0.5, 'sine', 0.1, i * 0.09) })
    noise(1.2, 0.08, 0.5, 1200)
  },
  unlock() { if (sfxEnabled) { tone(784, 0.25, 'sine', 0.12); tone(988, 0.3, 'sine', 0.12, 0.12); tone(1319, 0.5, 'sine', 0.1, 0.24) } },
}

// ---------- Lo-fi era music ----------
// Original, generative, in the spirit of a mellow lo-fi reimagining: soft swung
// drums, a warm electric-piano chord bed, round bass, and a vinyl crackle.
// Every era has its own tempo, key, and chord cycle. No melodies are copied.

interface EraTheme {
  bpm: number
  root: number // MIDI note of the key's root
  /** Chord cycle as scale-degree triads over the root: [semitone offsets] per bar. */
  chords: number[][]
  swing: number
  brightness: number
}

const m = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

export const ERA_THEMES: Record<EraId, EraTheme> = {
  blues: { bpm: 68, root: 45, chords: [[0, 3, 7, 10], [5, 8, 12, 15], [0, 3, 7, 10], [7, 10, 14, 17]], swing: 0.62, brightness: 900 },
  transition: { bpm: 74, root: 43, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], swing: 0.58, brightness: 1100 },
  stevie: { bpm: 72, root: 45, chords: [[0, 3, 7, 10], [8, 12, 15, 19], [3, 7, 10, 14], [10, 14, 17, 21]], swing: 0.6, brightness: 1300 },
  rumours: { bpm: 76, root: 47, chords: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 17]], swing: 0.58, brightness: 1400 },
  storm: { bpm: 80, root: 48, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 18]], swing: 0.56, brightness: 1600 },
  tusk: { bpm: 78, root: 50, chords: [[0, 3, 7, 10], [5, 8, 12, 15], [10, 14, 17, 21], [7, 10, 14, 17]], swing: 0.6, brightness: 1200 },
  solo: { bpm: 70, root: 45, chords: [[0, 3, 7, 10], [10, 14, 17, 21], [8, 12, 15, 19], [5, 8, 12, 15]], swing: 0.62, brightness: 1300 },
  legacy: { bpm: 66, root: 43, chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]], swing: 0.6, brightness: 1000 },
}

let musicTimer: number | null = null
let musicEra: EraId | null = null
let crackleSrc: AudioBufferSourceNode | null = null
let nextBeatTime = 0
let beatIndex = 0

function epNote(freq: number, t: number, dur: number, vel: number, brightness: number) {
  const c = ctx!
  const g = c.createGain()
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = brightness
  f.Q.value = 0.7
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vel, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  for (const [type, mult, amt] of [['sine', 1, 1], ['triangle', 2, 0.18], ['sine', 0.5, 0.25]] as const) {
    const o = c.createOscillator()
    o.type = type
    o.frequency.value = freq * mult
    o.detune.value = (Math.random() - 0.5) * 6
    const og = c.createGain()
    og.gain.value = amt
    o.connect(og)
    og.connect(f)
    o.start(t)
    o.stop(t + dur + 0.1)
  }
  f.connect(g)
  g.connect(musicGain!)
}

function bassNote(freq: number, t: number, dur: number) {
  const c = ctx!
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.value = freq
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(musicGain!)
  o.start(t)
  o.stop(t + dur + 0.1)
}

function drum(kind: 'kick' | 'snare' | 'hat', t: number, vel = 1) {
  const c = ctx!
  if (kind === 'kick') {
    const o = c.createOscillator()
    const g = c.createGain()
    o.frequency.setValueAtTime(110, t)
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12)
    g.gain.setValueAtTime(0.5 * vel, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
    o.connect(g)
    g.connect(musicGain!)
    o.start(t)
    o.stop(t + 0.3)
    return
  }
  const len = Math.floor(c.sampleRate * (kind === 'snare' ? 0.18 : 0.05))
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, kind === 'hat' ? 3 : 1.5)
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = kind === 'snare' ? 'bandpass' : 'highpass'
  f.frequency.value = kind === 'snare' ? 1800 : 7000
  const g = c.createGain()
  g.gain.value = (kind === 'snare' ? 0.22 : 0.07) * vel
  src.connect(f)
  f.connect(g)
  g.connect(musicGain!)
  src.start(t)
}

function startCrackle() {
  const c = ctx!
  const len = c.sampleRate * 4
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    const pop = Math.random() < 0.0008 ? (Math.random() * 2 - 1) : 0
    d[i] = pop + (Math.random() * 2 - 1) * 0.01
  }
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 3000
  const g = c.createGain()
  g.gain.value = 0.35
  src.connect(f)
  f.connect(g)
  g.connect(musicGain!)
  src.start()
  crackleSrc = src
}

function schedule() {
  if (!ctx || !musicEra) return
  const theme = ERA_THEMES[musicEra]
  const beat = 60 / theme.bpm
  const lookahead = 0.6
  while (nextBeatTime < ctx.currentTime + lookahead) {
    const bar = Math.floor(beatIndex / 4) % theme.chords.length
    const b = beatIndex % 4
    const chord = theme.chords[bar]
    const t = nextBeatTime
    // Chord bed on 1 and the "and" of 2, lightly varied.
    if (b === 0 || (b === 2 && Math.random() < 0.7)) {
      chord.forEach((iv, i) => epNote(m(theme.root + 12 + iv), t + i * 0.012, beat * 1.9, 0.11, theme.brightness))
    }
    // Bass: root on 1, fifth or octave on 3.
    if (b === 0) bassNote(m(theme.root + chord[0]), t, beat * 1.8)
    if (b === 2) bassNote(m(theme.root + chord[0] + (Math.random() < 0.5 ? 7 : 12)), t, beat * 1.2)
    // Drums with swing on the off-beats.
    if (b === 0 || (b === 2 && Math.random() < 0.6)) drum('kick', t, 0.9)
    if (b === 1 || b === 3) drum('snare', t, 0.8)
    drum('hat', t, 0.7)
    drum('hat', t + beat * theme.swing, 0.45)
    // An occasional soft top note, pentatonic, for sparkle.
    if (Math.random() < 0.3) {
      const pent = [0, 3, 5, 7, 10]
      const n = theme.root + 24 + pent[Math.floor(Math.random() * pent.length)] + (Math.random() < 0.5 ? 0 : 12)
      epNote(m(n), t + beat * 0.5, beat * 1.2, 0.05, theme.brightness + 800)
    }
    nextBeatTime += beat
    beatIndex++
  }
}

export function startMusic(era: EraId): void {
  const c = ensure()
  if (!c || !musicGain) return
  if (musicEra === era && musicTimer !== null) return
  stopMusic(true)
  musicEra = era
  nextBeatTime = c.currentTime + 0.1
  beatIndex = 0
  startCrackle()
  musicGain.gain.cancelScheduledValues(c.currentTime)
  musicGain.gain.setValueAtTime(0, c.currentTime)
  musicGain.gain.linearRampToValueAtTime(0.5, c.currentTime + 2)
  musicTimer = window.setInterval(schedule, 200)
  schedule()
}

export function stopMusic(immediate = false): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer)
    musicTimer = null
  }
  musicEra = null
  if (ctx && musicGain) {
    const t = ctx.currentTime
    musicGain.gain.cancelScheduledValues(t)
    musicGain.gain.setValueAtTime(musicGain.gain.value, t)
    musicGain.gain.linearRampToValueAtTime(0, t + (immediate ? 0.05 : 1))
  }
  if (crackleSrc) {
    const src = crackleSrc
    crackleSrc = null
    window.setTimeout(() => { try { src.stop() } catch { /* already stopped */ } }, immediate ? 100 : 1200)
  }
}

export function currentMusicEra(): EraId | null {
  return musicEra
}

// ---------- Easter egg: an original fingerpicked acoustic intro ----------
// A gentle plucked-string figure written for the game (not a transcription of
// any Fleetwood Mac song). Returns the duration in seconds.

function pluck(freq: number, t: number, dur: number, vel: number) {
  const c = ctx!
  const g = c.createGain()
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(3200, t)
  f.frequency.exponentialRampToValueAtTime(700, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vel, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  for (const [type, mult, amt] of [['triangle', 1, 0.9], ['sine', 2, 0.25], ['sine', 3, 0.08]] as const) {
    const o = c.createOscillator()
    o.type = type
    o.frequency.value = freq * mult
    o.detune.value = (Math.random() - 0.5) * 5
    const og = c.createGain()
    og.gain.value = amt
    o.connect(og)
    og.connect(f)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
  f.connect(g)
  g.connect(master!)
}

export function playEasterEgg(): number {
  const c = ensure()
  if (!c || !master) return 0
  const m = (n: number) => 440 * Math.pow(2, (n - 69) / 12)
  // Chords as MIDI notes (low to high), picked in a rolling pattern.
  const E = [40, 47, 52, 55, 59, 64] // E minor add9 voicing
  const C = [36, 43, 52, 55, 59, 64] // C major 7
  const G = [43, 47, 50, 55, 59, 62]
  const D = [38, 45, 50, 54, 57, 62] // D sus-ish
  const bars = [E, C, G, D, E, C, G, E]
  const beat = 60 / 84
  const eighth = beat / 2
  let t = c.currentTime + 0.05
  const pattern = [0, 3, 4, 5, 4, 3, 0, 4] // string indexes per eighth note
  for (const chord of bars) {
    for (let i = 0; i < 8; i++) {
      const note = chord[pattern[i]]
      pluck(m(note), t, 1.4, i === 0 ? 0.22 : 0.15)
      t += eighth
    }
  }
  // Let the last chord ring.
  for (let i = 0; i < 6; i++) pluck(m(E[i]), t + i * 0.06, 2.8, 0.16)
  return t - c.currentTime + 3
}

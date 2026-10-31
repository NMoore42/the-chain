import { useEffect, useState } from 'react'
import { Dictionary, loadDictionary } from '../engine/dictionary'
import type { EraId } from '../data/types'
import { useGame } from '../state/store'
import { setSfxEnabled, startMusic, stopMusic, unlockAudio } from '../audio/audio'

export function useDictionary(): { dict: Dictionary | null; error: string | null; retry: () => void } {
  const [dict, setDict] = useState<Dictionary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    setError(null)
    loadDictionary(import.meta.env.BASE_URL)
      .then((d) => alive && setDict(d))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [attempt])
  return { dict, error, retry: () => setAttempt((a) => a + 1) }
}

/** Applies the era palette to the document and swaps the music theme. */
export function useEraTheme(era: EraId | null): void {
  const { save } = useGame()
  useEffect(() => {
    const root = document.documentElement
    if (era) root.setAttribute('data-era', era)
    else root.removeAttribute('data-era')
  }, [era])
  useEffect(() => {
    if (save.settings.music && era) startMusic(era)
    else stopMusic()
  }, [era, save.settings.music])
}

/** Mirrors accessibility settings onto the root element and the audio engine. */
export function useSettingsEffects(): void {
  const { save } = useGame()
  const { highContrast, largeText, reduceMotion, sound } = save.settings
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-contrast', highContrast ? 'high' : 'normal')
    root.setAttribute('data-text', largeText ? 'large' : 'normal')
    root.setAttribute('data-motion', reduceMotion ? 'reduce' : 'normal')
  }, [highContrast, largeText, reduceMotion])
  useEffect(() => {
    setSfxEnabled(sound)
  }, [sound])
  useEffect(() => {
    // Browsers require a gesture before audio can start; unlock on the first one.
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])
}

export function usePrefersReducedMotion(): boolean {
  const { save } = useGame()
  const [sys, setSys] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const on = () => setSys(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return sys || save.settings.reduceMotion
}

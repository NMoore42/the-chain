import { useMemo } from 'react'
import { rngFromString } from '../../engine/rng'

/** Fixed, decorative starfield with a crescent moon. Pure SVG, no assets. */
export function Starfield() {
  const stars = useMemo(() => {
    const rng = rngFromString('starfield')
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      r: 0.08 + rng() * 0.22,
      tw: rng() < 0.35,
      delay: rng() * 4,
    }))
  }, [])
  return (
    <svg className="starfield" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {stars.map((s) => (
        <circle key={s.id} cx={s.x} cy={s.y} r={s.r} opacity={0.6} className={s.tw ? 'tw' : undefined} style={s.tw ? { animationDelay: `${s.delay}s` } : undefined} />
      ))}
      <path className="moon" d="M86 10a7 7 0 1 0 0 14 5.4 5.4 0 1 1 0-14z" />
    </svg>
  )
}

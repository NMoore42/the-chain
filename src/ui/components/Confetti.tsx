import { useMemo } from 'react'

export function Confetti({ active }: { active: boolean }) {
  const bits = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({ i, left: Math.random() * 100, delay: Math.random() * 0.8, hue: [42, 350, 200, 48, 320][i % 5], dur: 2 + Math.random() * 1.5 })),
    [],
  )
  if (!active) return null
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <i key={b.i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, background: `hsl(${b.hue} 70% 60%)` }} />
      ))}
    </div>
  )
}

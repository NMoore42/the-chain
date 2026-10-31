import { useEffect } from 'react'
import { useGame } from '../../state/store'
import { MemorabiliaIcon } from './Icons'

export function Toasts() {
  const { toasts, dismissToast } = useGame()
  useEffect(() => {
    if (!toasts.length) return
    const t = window.setTimeout(() => dismissToast(toasts[0].id), 4200)
    return () => window.clearTimeout(t)
  }, [toasts, dismissToast])
  if (!toasts.length) return null
  return (
    <div className="toasts" aria-live="polite">
      {toasts.slice(0, 3).map((t) => (
        <div key={t.id} className="toast" onClick={() => dismissToast(t.id)}>
          <MemorabiliaIcon icon={t.icon ?? 'star'} />
          <div>
            <div className="t">{t.title}</div>
            {t.body && <div className="b">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

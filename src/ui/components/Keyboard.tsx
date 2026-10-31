import type { LetterState } from '../../engine/setlist'

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

export function Keyboard({ states, onKey, onEnter, onBackspace, disabled = false }: {
  states: Record<string, LetterState>
  onKey: (ch: string) => void
  onEnter: () => void
  onBackspace: () => void
  disabled?: boolean
}) {
  return (
    <div className="keyboard" role="group" aria-label="On-screen keyboard">
      {ROWS.map((row, i) => (
        <div className="key-row" key={row}>
          {i === 2 && (
            <button className="key key-wide" onClick={onEnter} disabled={disabled} aria-label="Enter">Enter</button>
          )}
          {Array.from(row).map((ch) => {
            const st = states[ch]
            return (
              <button key={ch} className={`key${st ? ` is-${st}` : ''}`} onClick={() => onKey(ch)} disabled={disabled} aria-label={st ? `${ch}, ${st}` : ch}>
                {ch}
              </button>
            )
          })}
          {i === 2 && (
            <button className="key key-wide" onClick={onBackspace} disabled={disabled} aria-label="Backspace">⌫</button>
          )}
        </div>
      ))}
    </div>
  )
}

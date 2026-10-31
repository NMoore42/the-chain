import type { ReactNode } from 'react'
import { navigate, type Route } from '../../state/router'
import { UiIcon } from './Icons'
import { sfx } from '../../audio/audio'

export function TopBar({ title, back, right }: { title?: string; back?: Route; right?: ReactNode }) {
  return (
    <header className="topbar">
      {back && (
        <button className="btn btn-ghost btn-icon" aria-label="Back" onClick={() => { sfx.tap(); navigate(back) }}>
          <UiIcon name="back" />
        </button>
      )}
      {title ? <h1>{title}</h1> : <a className="brand" href="#/">The Chain</a>}
      <span className="spacer" />
      {right}
    </header>
  )
}

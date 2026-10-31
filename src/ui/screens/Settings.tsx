import { useState } from 'react'
import { navigate } from '../../state/router'
import { useGame } from '../../state/store'
import { exportSave, importSave, type Settings } from '../../state/save'
import { useEraTheme } from '../hooks'
import { TopBar } from '../components/TopBar'
import { Modal } from '../components/Modal'
import { sfx } from '../../audio/audio'

function Toggle({ id, label, desc, value, onChange }: { id: keyof Settings; label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="setting">
      <div className="l"><label htmlFor={id}>{label}</label><span className="d">{desc}</span></div>
      <button id={id} className="switch" role="switch" aria-checked={value} onClick={() => { sfx.tap(); onChange(!value) }}><span className="sr-only">{label}</span></button>
    </div>
  )
}

export function SettingsScreen() {
  const { save, dispatch, pushToast } = useGame()
  useEraTheme(null)
  const [importText, setImportText] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const set = (patch: Partial<Settings>) => dispatch({ type: 'settings', patch })

  const download = () => {
    const blob = new Blob([exportSave(save)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `the-chain-save-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportSave(save))
      pushToast({ title: 'Copied', body: 'Your save is on the clipboard.' })
    } catch {
      pushToast({ title: 'Could not copy', body: 'Use Download instead.' })
    }
  }
  const doImport = () => {
    const data = importSave(importText)
    if (!data) { pushToast({ title: 'That did not look like a save', body: 'Paste the whole file contents.' }); return }
    dispatch({ type: 'replace', data })
    setImportText('')
    pushToast({ title: 'Progress restored', body: 'Welcome back.' })
  }
  const onFile = (file: File | undefined) => {
    if (!file) return
    file.text().then((t) => setImportText(t))
  }

  return (
    <main className="screen">
      <TopBar title="Settings" back={{ name: 'title' }} />
      <div className="content fade-in">
        <section className="card" aria-labelledby="s-sound">
          <h2 id="s-sound" style={{ fontSize: '1.2rem' }}>Sound</h2>
          <Toggle id="sound" label="Sound effects" desc="Gentle taps, tile sounds, and fanfares." value={save.settings.sound} onChange={(v) => set({ sound: v })} />
          <Toggle id="music" label="Lo-fi era music" desc="Original, mellow instrumental themes that change with each era." value={save.settings.music} onChange={(v) => set({ music: v })} />
        </section>
        <section className="card" aria-labelledby="s-access">
          <h2 id="s-access" style={{ fontSize: '1.2rem' }}>Comfort</h2>
          <Toggle id="largeText" label="Larger text and tiles" desc="Bigger type and touch targets throughout." value={save.settings.largeText} onChange={(v) => set({ largeText: v })} />
          <Toggle id="highContrast" label="High-contrast colours" desc="Blue and orange tiles with shapes, friendlier for colour-blind play." value={save.settings.highContrast} onChange={(v) => set({ highContrast: v })} />
          <Toggle id="reduceMotion" label="Reduce motion" desc="Turns off flips, bounces, and confetti." value={save.settings.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
        </section>
        <section className="card stack" aria-labelledby="s-save">
          <h2 id="s-save" style={{ fontSize: '1.2rem' }}>Back up your progress</h2>
          <p className="small muted">Progress is saved in this browser automatically. To move it to another device, download or copy it here, then paste it on the other device.</p>
          <div className="row">
            <button className="btn btn-ghost btn-sm" onClick={download}>Download save file</button>
            <button className="btn btn-ghost btn-sm" onClick={copy}>Copy to clipboard</button>
          </div>
          <label className="small" htmlFor="import">Restore from a save</label>
          <textarea id="import" className="save-box" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste a save here, or choose a file below" />
          <div className="row">
            <input type="file" accept="application/json,.json" aria-label="Choose a save file" onChange={(e) => onFile(e.target.files?.[0])} />
            <button className="btn btn-primary btn-sm" onClick={doImport} disabled={!importText.trim()}>Restore</button>
          </div>
        </section>
        <section className="card stack">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate({ name: 'about' })}>About this game</button>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>Start over (erase progress)</button>
        </section>
      </div>
      {confirmReset && (
        <Modal title="Erase progress?" onClose={() => setConfirmReset(false)}>
          <h2>Start the tour again?</h2>
          <p>This erases every concert, star, and scrapbook page on this device. Download a backup first if you might want it later.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Keep my progress</button>
            <button className="btn btn-danger" onClick={() => { dispatch({ type: 'reset' }); setConfirmReset(false); pushToast({ title: 'Fresh start', body: 'The tour begins again.' }) }}>Erase everything</button>
          </div>
        </Modal>
      )}
    </main>
  )
}

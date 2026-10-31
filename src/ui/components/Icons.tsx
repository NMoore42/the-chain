/** Hand-drawn line icons for memorabilia and UI. All original. */

const MEMORABILIA: Record<string, string> = {
  ticket: 'M4 9a2 2 0 0 0 0 6v3h16v-3a2 2 0 0 1 0-6V6H4zM9 6v12M9 9h.01M9 12h.01M9 15h.01',
  pick: 'M12 3c4 0 7 2 7 6 0 5-4 10-7 12-3-2-7-7-7-12 0-4 3-6 7-6zM10 9c1 1 3 1 4 0',
  reel: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2',
  sketch: 'M4 4h16v16H4zM7 16l3-5 3 3 2-2 2 4M8 8h.01',
  penguin: 'M12 3c-3 0-5 3-5 7s1 8 5 9c4-1 5-5 5-9s-2-7-5-7zM10 8h.01M14 8h.01M12 10l-1 1h2zM9 20l-2 1M15 20l2 1',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14M11 10l2 2-2 2',
  tape: 'M3 6h18v12H3zM8 12a2 2 0 1 0 0 .01M16 12a2 2 0 1 0 0 .01M8 10h8M7 18l1-3h8l1 3',
  shawl: 'M12 3c-2 4-6 5-8 5 1 5 3 10 8 13 5-3 7-8 8-13-2 0-6-1-8-5zM12 3v18M8 9c1 3 3 6 4 7M16 9c-1 3-3 6-4 7',
  record: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 6a6 6 0 0 1 6 6',
  key: 'M8 4h8v16H8zM8 4v9h8V4M12 13v7',
  rose: 'M12 21v-8M12 13c-3 0-5-2-5-5 0 2 2 2 3 1-1-2 0-4 2-5 2 1 3 3 2 5 1 1 3 1 3-1 0 3-2 5-5 5zM12 17c-2-1-4-1-5 0M12 19c2-1 4-1 5 0',
  balls: 'M9 4v4M15 4v4M9 8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM15 8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM9 15v4M15 15v4',
  laminate: 'M7 3h10v18H7zM12 3v-1M9 8h6M9 11h6M9 14h4M12 18h.01',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4',
  drum: 'M4 8c0-2 4-3 8-3s8 1 8 3v8c0 2-4 3-8 3s-8-1-8-3zM4 8c0 2 4 3 8 3s8-1 8-3M4 12c0 2 4 3 8 3s8-1 8-3M7 5l10 11M17 5L7 16',
  boots: 'M8 3h6v10l4 3v4H6v-4l2-3zM8 13h6M6 20h12',
  feather: 'M20 4c-6 0-12 4-14 12l-3 4M6 16c3 1 8 0 12-5M9 13c2 0 5-1 8-4M8 15c2-1 4-3 6-6',
  tambourine: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 6a6 6 0 1 0 0 12M8 6v2M16 6v2M6 12h2M16 12h2M12 21v2M14 22l1 2M10 22l-1 2',
  hat: 'M8 4h8v9H8zM4 13h16v2H4zM8 10h8',
  ribbon: 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM9 12l-2 9 5-3 5 3-2-9',
  plaque: 'M4 5h16v12H4zM7 8h10M7 11h10M7 14h6M10 17v4M14 17v4',
  moon: 'M15 3a9 9 0 1 0 0 18 7 7 0 1 1 0-18zM5 5h.01M4 12h.01M6 19h.01',
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.6l-5.4 3 1.2-6.1L3.3 9.3l6.1-.7z',
}

export function MemorabiliaIcon({ icon, locked = false }: { icon: string; locked?: boolean }) {
  const d = MEMORABILIA[icon] ?? MEMORABILIA.star
  return (
    <span className={`memorabilia${locked ? ' is-locked' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d={d} />
      </svg>
    </span>
  )
}

const UI: Record<string, string> = {
  back: 'M15 5l-7 7 7 7',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  book: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01',
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  shuffle: 'M4 6h3l10 12h3M4 18h3l3-3.6M14 9.6L17 6h3M18 4l2 2-2 2M18 16l2 2-2 2',
  swap: 'M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3',
  hint: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z',
  sound: 'M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
  play: 'M7 4l12 8-12 8z',
  check: 'M5 12l4 4L19 6',
  star: MEMORABILIA.star,
  moon: MEMORABILIA.moon,
  close: 'M6 6l12 12M18 6L6 18',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  music: 'M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM9 18V6l12-3v13',
}

export function UiIcon({ name, size = 22 }: { name: string; size?: number }) {
  const d = UI[name] ?? UI.star
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

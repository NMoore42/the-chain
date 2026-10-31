/**
 * Venue silhouettes that grow with the campaign: club, theatre, hall, arena,
 * stadium, plus a recording-studio variant. Pure SVG, themed by CSS variables.
 */
export function VenueArt({ scale, kind = 'venue', className = 'venue-art' }: { scale: 1 | 2 | 3 | 4 | 5; kind?: 'venue' | 'studio'; className?: string }) {
  const gold = 'var(--gold)'
  const gold2 = 'var(--gold-2)'
  const ink = 'color-mix(in srgb, var(--ink) 32%, transparent)'
  const ink2 = 'color-mix(in srgb, var(--ink) 18%, transparent)'
  const bg = 'var(--bg)'
  const glow = `color-mix(in srgb, ${gold} 28%, transparent)`
  return (
    <svg className={className} viewBox="0 0 200 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <ellipse cx="100" cy="58" rx="84" ry="5" fill={glow} />
      {kind === 'studio' && (
        <g>
          {/* mixing console */}
          <path d="M40 56V40l8-10h104l8 10v16z" fill={ink} />
          <rect x="52" y="34" width="96" height="4" rx="1" fill={ink2} />
          {[60, 72, 84, 96, 108, 120, 132].map((x, i) => (
            <g key={x}>
              <rect x={x} y="40" width="2" height="13" fill={ink2} />
              <rect x={x - 3} y={42 + ((i * 5) % 8)} width="8" height="3" rx="1" fill={gold} />
            </g>
          ))}
          {/* reel-to-reel */}
          <rect x="150" y="18" width="36" height="24" rx="3" fill={ink} />
          <circle cx="160" cy="27" r="6" fill={bg} stroke={gold} strokeWidth="1.5" />
          <circle cx="176" cy="27" r="6" fill={bg} stroke={gold} strokeWidth="1.5" />
          <circle cx="160" cy="27" r="1.5" fill={gold2} /><circle cx="176" cy="27" r="1.5" fill={gold2} />
          <path d="M160 33q8 4 16 0" stroke={gold} strokeWidth="1" fill="none" />
          {/* mic */}
          <rect x="22" y="22" width="6" height="12" rx="3" fill={gold} />
          <line x1="25" y1="34" x2="25" y2="48" stroke={ink} strokeWidth="2" />
          <path d="M19 48h12" stroke={ink} strokeWidth="2" />
          <circle cx="166" cy="14" r="2" fill="#d9534f" />
        </g>
      )}
      {kind !== 'studio' && scale === 1 && (
        <g>
          <rect x="66" y="22" width="68" height="34" rx="2" fill={ink} />
          <rect x="60" y="18" width="80" height="8" rx="2" fill={gold} opacity="0.85" />
          <text x="100" y="24.5" textAnchor="middle" fontSize="6" fill={bg} fontFamily="var(--font-display)" fontWeight="700" letterSpacing="1.5">CLUB</text>
          <path d="M62 26h76l6 8H56z" fill={ink2} />
          <rect x="92" y="38" width="16" height="18" rx="1" fill={bg} />
          <rect x="94" y="40" width="12" height="14" fill={glow} />
          <rect x="72" y="38" width="10" height="8" fill={bg} /><rect x="118" y="38" width="10" height="8" fill={bg} />
          <line x1="40" y1="56" x2="40" y2="34" stroke={ink} strokeWidth="2" />
          <circle cx="40" cy="32" r="3" fill={gold2} />
          <circle cx="40" cy="32" r="7" fill={glow} />
        </g>
      )}
      {kind !== 'studio' && scale === 2 && (
        <g>
          <rect x="46" y="20" width="108" height="36" rx="2" fill={ink} />
          <path d="M40 24h120l-8-10H48z" fill={gold} opacity="0.85" />
          <text x="100" y="21" textAnchor="middle" fontSize="6" fill={bg} fontFamily="var(--font-display)" fontStyle="italic" fontWeight="700" letterSpacing="1">TONIGHT</text>
          {[52, 64, 76, 88, 100, 112, 124, 136, 148].map((x) => <circle key={x} cx={x} cy="26" r="1.4" fill={gold2} />)}
          <rect x="92" y="40" width="16" height="16" fill={bg} />
          <rect x="94" y="42" width="12" height="12" fill={glow} />
          {[58, 72, 114, 128].map((x) => <rect key={x} x={x} y="32" width="10" height="10" rx="1" fill={bg} />)}
          <rect x="46" y="54" width="108" height="2" fill={ink2} />
        </g>
      )}
      {kind !== 'studio' && scale === 3 && (
        <g>
          <path d="M34 56V30l66-18 66 18v26z" fill={ink} />
          <path d="M40 30L100 14l60 16z" fill={ink2} />
          {[50, 66, 82, 118, 134, 150].map((x) => <rect key={x} x={x} y="32" width="6" height="22" rx="1" fill={bg} opacity="0.7" />)}
          <rect x="92" y="38" width="16" height="18" fill={bg} />
          <rect x="94" y="40" width="12" height="14" fill={glow} />
          <circle cx="100" cy="22" r="3" fill={gold2} />
          <circle cx="100" cy="22" r="7" fill={glow} />
          <path d="M26 56h148" stroke={ink2} strokeWidth="2" />
        </g>
      )}
      {kind !== 'studio' && scale === 4 && (
        <g>
          <path d="M18 56c0-24 36-38 82-38s82 14 82 38z" fill={ink} />
          <path d="M30 56c0-16 30-26 70-26s70 10 70 26z" fill={ink2} />
          {[40, 60, 80, 100, 120, 140, 160].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="56" stroke={gold} strokeWidth="0.8" opacity="0.5" />)}
          <rect x="92" y="44" width="16" height="12" fill={bg} />
          <rect x="94" y="46" width="12" height="8" fill={glow} />
          <circle cx="100" cy="12" r="3" fill={gold2} /><circle cx="100" cy="12" r="8" fill={glow} />
          <circle cx="60" cy="18" r="2" fill={gold2} /><circle cx="140" cy="18" r="2" fill={gold2} />
        </g>
      )}
      {kind !== 'studio' && scale === 5 && (
        <g>
          <path d="M4 56c0-26 44-46 96-46s96 20 96 46z" fill={ink} />
          <path d="M26 56c0-18 34-28 74-28s74 10 74 28z" fill={ink2} />
          {[16, 36, 56, 76, 96, 116, 136, 156, 176].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="56" stroke={gold} strokeWidth="0.8" opacity="0.4" />)}
          <g stroke={gold} strokeWidth="2" strokeLinecap="round">
            <line x1="24" y1="6" x2="24" y2="22" /><line x1="176" y1="6" x2="176" y2="22" /><line x1="100" y1="2" x2="100" y2="12" />
          </g>
          {[[24, 6], [176, 6], [100, 2]].map(([x, y]) => (
            <g key={x}><circle cx={x} cy={y} r="3" fill={gold2} /><circle cx={x} cy={y} r="9" fill={glow} /></g>
          ))}
          <rect x="92" y="46" width="16" height="10" fill={bg} />
          <rect x="94" y="48" width="12" height="6" fill={glow} />
        </g>
      )}
    </svg>
  )
}

/** Silhouette of a venue that grows with the campaign: club → theatre → hall → arena → stadium. */
export function VenueArt({ scale, className = 'venue-art' }: { scale: 1 | 2 | 3 | 4 | 5; className?: string }) {
  const gold = 'var(--gold)'
  const ink = 'color-mix(in srgb, var(--ink) 35%, transparent)'
  return (
    <svg className={className} viewBox="0 0 200 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      {/* stage glow */}
      <ellipse cx="100" cy="58" rx="80" ry="6" fill={`color-mix(in srgb, ${gold} 25%, transparent)`} />
      {scale === 1 && (
        <g fill={ink}>
          <rect x="70" y="30" width="60" height="26" rx="2" />
          <rect x="92" y="42" width="16" height="14" fill="var(--bg)" />
          <path d="M66 30h68l-6-8H72z" fill={gold} opacity="0.7" />
          <circle cx="100" cy="18" r="3" fill={gold} />
        </g>
      )}
      {scale === 2 && (
        <g fill={ink}>
          <rect x="55" y="26" width="90" height="30" rx="2" />
          <path d="M50 26h100l-10-10H60z" fill={gold} opacity="0.7" />
          <rect x="92" y="40" width="16" height="16" fill="var(--bg)" />
          <rect x="66" y="34" width="10" height="8" fill="var(--bg)" /><rect x="124" y="34" width="10" height="8" fill="var(--bg)" />
          <text x="100" y="14" textAnchor="middle" fontSize="9" fill={gold} fontFamily="var(--font-display)" fontStyle="italic">tonight</text>
        </g>
      )}
      {scale === 3 && (
        <g fill={ink}>
          <path d="M40 56V30l60-16 60 16v26z" />
          <rect x="70" y="36" width="60" height="20" fill={ink} />
          <rect x="94" y="42" width="12" height="14" fill="var(--bg)" />
          {[52, 64, 76, 124, 136, 148].map((x) => <rect key={x} x={x} y="40" width="6" height="16" fill={gold} opacity="0.5" />)}
          <circle cx="100" cy="22" r="3" fill={gold} />
        </g>
      )}
      {scale === 4 && (
        <g fill={ink}>
          <path d="M20 56c0-24 36-36 80-36s80 12 80 36z" />
          <path d="M44 56c0-14 25-22 56-22s56 8 56 22z" fill="var(--bg)" opacity="0.6" />
          {[40, 60, 80, 100, 120, 140, 160].map((x) => <line key={x} x1={x} y1="24" x2={x} y2="56" stroke={gold} strokeWidth="1" opacity="0.4" />)}
          <circle cx="100" cy="14" r="3" fill={gold} />
          <circle cx="70" cy="18" r="2" fill={gold} /><circle cx="130" cy="18" r="2" fill={gold} />
        </g>
      )}
      {scale === 5 && (
        <g fill={ink}>
          <path d="M6 56c0-26 42-44 94-44s94 18 94 44z" />
          <path d="M30 56c0-16 32-26 70-26s70 10 70 26z" fill="var(--bg)" opacity="0.6" />
          {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x) => <line key={x} x1={x} y1="14" x2={x} y2="56" stroke={gold} strokeWidth="1" opacity="0.35" />)}
          <g stroke={gold} strokeWidth="2" strokeLinecap="round">
            <line x1="30" y1="4" x2="30" y2="18" /><line x1="170" y1="4" x2="170" y2="18" />
            <line x1="100" y1="2" x2="100" y2="12" />
          </g>
          <circle cx="30" cy="4" r="3" fill={gold} /><circle cx="170" cy="4" r="3" fill={gold} /><circle cx="100" cy="2" r="3" fill={gold} />
        </g>
      )}
    </svg>
  )
}

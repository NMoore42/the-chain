export function Stars({ value, max = 3, large = false, label }: { value: number; max?: number; large?: boolean; label?: string }) {
  return (
    <span className={`stars${large ? ' stars-lg' : ''}`} role="img" aria-label={label ?? `${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
          <path className={i < value ? 'on' : 'off'} d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </span>
  )
}

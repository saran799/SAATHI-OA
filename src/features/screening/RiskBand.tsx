import { cx } from '../../components/ui'
import type { RiskBand as Band } from '../../domain/types'

/** Figma: 3-segment mint → teal → pink bar with a pointer above the active segment. */
export function RiskBandIndicator({ band }: { band: Band }) {
  const bands: { id: Band; label: string; color: string }[] = [
    { id: 'low', label: 'Low', color: 'bg-mint' }, { id: 'moderate', label: 'Moderate', color: 'bg-[#6ED9CC]' }, { id: 'higher', label: 'Higher', color: 'bg-error-tint' },
  ]
  const idx = bands.findIndex(b => b.id === band)
  return (
    <div role="img" aria-label={`Screening risk band: ${band}`}>
      <div className="relative h-3 mb-1" aria-hidden><span className="absolute -translate-x-1/2 text-primary text-[10px]" style={{ left: `${(idx + 0.5) / 3 * 100}%` }}>▼</span></div>
      <div className="grid grid-cols-3 gap-0.5 rounded-full overflow-hidden">
        {bands.map(b => <div key={b.id} className={cx('h-3', b.color, b.id === band && 'ring-2 ring-primary ring-inset')} />)}
      </div>
      <div className="grid grid-cols-3 mt-1.5 text-[12px]">
        {bands.map(b => <span key={b.id} className={cx(b.id === band ? 'font-bold text-primary' : 'text-secondary', b.id === 'moderate' && 'text-center', b.id === 'higher' && 'text-right')}>{b.label}</span>)}
      </div>
    </div>
  )
}

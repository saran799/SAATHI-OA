import React from 'react'
import { Check, ArrowLeft, AlertCircle, Info, CheckCircle2, AlertTriangle, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import mark from '../../assets/saathi-mark.png'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline'
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'lg' | 'md' | 'sm'; full?: boolean; icon?: LucideIcon; loading?: boolean }
export function Button({ variant = 'primary', size = 'lg', full, icon: Icon, loading, className, children, disabled, ...rest }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[16px] font-semibold transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-h-[44px]'
  const sizes = { lg: 'h-14 px-5 text-base', md: 'h-12 px-4 text-[15px] rounded-[14px]', sm: 'h-11 px-3 text-sm rounded-[12px]' }
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-[var(--shadow-btn)]',
    secondary: 'bg-tint text-primary hover:bg-tint-2',
    ghost: 'bg-transparent text-primary hover:bg-tint',
    danger: 'bg-error text-white hover:bg-error-text shadow-[0_6px_16px_rgba(186,27,27,.22)]',
    dangerOutline: 'bg-surface text-error-text border-[1.5px] border-error hover:bg-error-tint',
  }
  return (
    <button className={cx(base, sizes[size], variants[variant], full && 'w-full', className)} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spin inline-block h-5 w-5 rounded-full border-2 border-current border-t-transparent" aria-hidden /> : Icon && <Icon size={20} strokeWidth={2} aria-hidden />}
      {children}
    </button>
  )
}

/* ---------- Card ---------- */
export function Card({ className, children, onClick, as: Tag = 'div' }: { className?: string; children: React.ReactNode; onClick?: () => void; as?: 'div' | 'section' | 'button' }) {
  return <Tag onClick={onClick} className={cx('card', onClick && 'text-left w-full hover:bg-tint/40 transition-colors', className)}>{children}</Tag>
}

/* ---------- SelectableCard (border + fill + check + label) ---------- */
interface SelProps { selected: boolean; onSelect: () => void; title: string; subtitle?: string; leading?: React.ReactNode; role?: 'radio' | 'checkbox'; className?: string; compact?: boolean }
export function SelectableCard({ selected, onSelect, title, subtitle, leading, role = 'radio', className, compact }: SelProps) {
  return (
    <button type="button" role={role} aria-checked={selected} onClick={onSelect}
      className={cx('relative w-full text-left rounded-[16px] transition-colors flex items-center gap-3 border-2',
        compact ? 'min-h-14 px-4 py-3' : 'min-h-16 px-4 py-3.5',
        selected ? 'border-primary bg-mint-soft' : 'border-transparent card hover:bg-tint/40', className)}>
      {leading}
      <span className="flex-1">
        <span className={cx('block text-[17px] leading-snug font-semibold text-ink')}>{title}</span>
        {subtitle && <span className="block text-[13px] text-secondary mt-0.5">{subtitle}</span>}
      </span>
      <span className={cx('shrink-0 h-7 w-7 rounded-full flex items-center justify-center', selected ? 'bg-primary' : 'border-2 border-mint bg-surface')} aria-hidden>
        {selected && <Check size={16} strokeWidth={3} className="text-white" />}
      </span>
      {selected && <span className="sr-only">Selected</span>}
    </button>
  )
}

/* ---------- Form ---------- */
interface FieldProps { label: string; helper?: string; error?: string; optional?: boolean; children: React.ReactNode; htmlFor?: string }
export function Field({ label, helper, error, optional, children, htmlFor }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[15px] font-semibold text-ink">{label}{optional ? <span className="text-secondary font-normal"> (optional)</span> : <span className="text-error"> *</span>}</label>
      {children}
      {error ? <p className="text-sm text-error-text flex items-center gap-1.5" role="alert"><AlertCircle size={16} aria-hidden />{error}</p>
        : helper && <p className="text-sm text-secondary">{helper}</p>}
    </div>
  )
}
export const inputCls = (err?: boolean) => cx('w-full h-[54px] px-4 rounded-[14px] bg-surface border text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-[0_1px_2px_rgba(16,30,54,0.04)]', err ? 'border-error' : 'border-border/70')
export function Input({ error, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={cx(inputCls(error), className)} aria-invalid={error || undefined} {...rest} />
}
export function Select({ error, className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return <select className={cx(inputCls(error), 'appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2366736F%27 stroke-width=%272%27><path d=%27m6 9 6 6 6-6%27/></svg>")] bg-no-repeat bg-[right_12px_center]', className)} aria-invalid={error || undefined} {...rest}>{children}</select>
}
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 p-1 bg-tint-2 rounded-[14px]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(o => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cx('h-11 rounded-[11px] text-[15px] font-semibold flex items-center justify-center gap-1.5 transition-colors', value === o.value ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-surface/70')}>
          {value === o.value && <Check size={16} strokeWidth={3} aria-hidden />}{o.label}
        </button>
      ))}
    </div>
  )
}
export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full min-h-14 flex items-center justify-between gap-4 py-2 text-left">
      <span><span className="block text-base font-medium">{label}</span>{description && <span className="block text-sm text-secondary">{description}</span>}</span>
      <span className={cx('relative shrink-0 h-8 w-14 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-tint-2')} aria-hidden>
        <span className={cx('absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform flex items-center justify-center', checked ? 'translate-x-7' : 'translate-x-1')}>
          {checked && <Check size={14} strokeWidth={3} className="text-primary" />}
        </span>
      </span>
    </button>
  )
}

/* ---------- Chip / Status ---------- */
export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
const toneCls: Record<Tone, string> = {
  success: 'bg-mint text-primary-dark', warning: 'bg-warning-tint text-warning-text', error: 'bg-error-tint text-error-text',
  info: 'bg-info-tint text-info', neutral: 'bg-tint text-secondary', primary: 'bg-primary-light text-primary-dark',
}
const dotCls: Record<Tone, string> = { success: 'bg-success', warning: 'bg-warning', error: 'bg-error', info: 'bg-info', neutral: 'bg-secondary', primary: 'bg-primary' }
export function Chip({ tone = 'neutral', children, dot, icon: Icon, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; icon?: LucideIcon; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap', toneCls[tone], className)}>
    {dot && <span className={cx('h-2 w-2 rounded-full', dotCls[tone])} aria-hidden />}{Icon && <Icon size={14} strokeWidth={2.5} aria-hidden />}{children}</span>
}

/* ---------- Callout ---------- */
const calloutIcon: Record<Exclude<Tone, 'neutral' | 'primary'>, LucideIcon> = { success: CheckCircle2, warning: AlertTriangle, error: AlertCircle, info: Info }
export function Callout({ tone = 'info', title, children, action }: { tone?: Exclude<Tone, 'neutral' | 'primary'>; title?: string; children?: React.ReactNode; action?: React.ReactNode }) {
  const Icon = calloutIcon[tone]
  const color = { success: 'text-success-text', warning: 'text-warning-text', error: 'text-error-text', info: 'text-info' }[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('rounded-[16px] p-4 flex gap-3', tone === 'info' ? 'bg-tint' : toneCls[tone])}>
      <Icon size={20} className={cx('shrink-0 mt-0.5', color)} aria-hidden />
      <div className="flex-1 text-sm leading-relaxed text-ink">
        {title && <p className={cx('font-semibold text-[15px] mb-0.5', color)}>{title}</p>}
        {children}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="h-1.5 w-full rounded-full bg-info-tint overflow-hidden" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
    <div className="h-full bg-primary rounded-full transition-[width] duration-300 ease-out" style={{ width: `${value}%` }} /></div>
}
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current, active = i === current
        return (
          <li key={s} className="flex-1 flex flex-col items-center relative">
            {i > 0 && <span className={cx('absolute top-3.5 right-1/2 w-full h-0.5', done || active ? 'bg-primary' : 'bg-border')} aria-hidden />}
            <span className={cx('relative z-10 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2',
              done ? 'bg-primary border-primary text-white' : active ? 'bg-surface border-primary text-primary' : 'bg-surface border-border text-secondary')} aria-current={active ? 'step' : undefined}>
              {done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className={cx('mt-1.5 text-xs text-center leading-tight', active ? 'text-primary-dark font-semibold' : 'text-secondary')}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}
export function Ring({ value, size = 168, stroke = 10, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-primary)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value / 100)))} style={{ transition: 'stroke-dashoffset 300ms ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

/* ---------- Misc ---------- */
export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between mb-3"><h2 className="text-[19px] font-bold text-ink tracking-tight">{children}</h2>{action}</div>
}
export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between gap-4 py-2.5 border-b border-tint-2 last:border-0"><span className="text-sm text-secondary">{label}</span><span className="text-sm font-semibold text-right">{value}</span></div>
}
export function BackButton({ to, label = 'Back' }: { to?: string; label?: string }) {
  const nav = useNavigate()
  return <button type="button" onClick={() => to ? nav(to) : nav(-1)} aria-label={label} className="h-11 w-11 -ml-2 inline-flex items-center justify-center text-ink rounded-full hover:bg-tint"><ArrowLeft size={24} aria-hidden /></button>
}
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  return <span className="shrink-0 rounded-full bg-mint text-primary-dark font-bold flex items-center justify-center" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>{initials}</span>
}
export function Logo({ size = 40 }: { size?: number }) {
  return <img src={mark} width={size} height={size} alt="SAATHI" className="object-contain" style={{ width: size, height: size }} />
}
/** Lavender icon tile used throughout the Figma (menu rows, form headers). */
export function IconTile({ icon: Icon, tone = 'tint', size = 44, iconSize = 22, className }: { icon: LucideIcon; tone?: 'tint' | 'mint' | 'primary' | 'error'; size?: number; iconSize?: number; className?: string }) {
  const t = { tint: 'bg-tint text-primary', mint: 'bg-mint text-primary-dark', primary: 'bg-primary-mid text-white', error: 'bg-error-tint text-error' }[tone]
  return <span className={cx('shrink-0 rounded-[12px] flex items-center justify-center', t, className)} style={{ width: size, height: size }} aria-hidden><Icon size={iconSize} strokeWidth={2} /></span>
}
export function Empty({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: React.ReactNode }) {
  return <div className="text-center py-10 px-4"><Icon size={36} className="mx-auto text-secondary mb-3" aria-hidden /><p className="font-semibold">{title}</p>{body && <p className="text-sm text-secondary mt-1">{body}</p>}{action && <div className="mt-4">{action}</div>}</div>
}

import { useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Card, cx } from '../../components/ui'
import { ARTICLES } from '../../domain/awareness'
import { useT } from '../../i18n'

export default function Awareness() {
  const { t, tArray } = useT()
  const [open, setOpen] = useState<string | null>(ARTICLES[0].id)
  return (
    <AppShell title={t('common.appName')} subtitle={t('awareness.title')}>
      <h1 className="text-[24px] font-bold tracking-tight pt-4">{t('awareness.title')}</h1>
      <p className="text-secondary text-[15px] mt-1 mb-4">{t('awareness.subtitle')}</p>
      <div className="space-y-3">
        {ARTICLES.map(a => (
          <Card key={a.id}>
            <button type="button" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)} className="w-full text-left p-4 flex items-center gap-3">
              <span className="flex-1"><span className="block font-bold text-[16px]">{t(`awareness.articles.${a.id}.title`) || a.title}</span><span className="block text-sm text-secondary mt-0.5">{t(`awareness.articles.${a.id}.summary`) || a.summary}</span><span className="inline-flex items-center gap-1 text-xs text-secondary mt-1.5"><Clock size={12} aria-hidden />{t('awareness.read', { min: a.minutes })}</span></span>
              <ChevronDown size={20} className={cx('text-secondary transition-transform shrink-0', open === a.id && 'rotate-180')} aria-hidden />
            </button>
            {open === a.id && <ul className="px-4 pb-4 space-y-2 fade-in">{(tArray(`awareness.articles.${a.id}.points`)?.length ? tArray(`awareness.articles.${a.id}.points`) : a.points).map(p => <li key={p} className="flex gap-3 text-[15px] leading-relaxed"><span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />{p}</li>)}</ul>}
          </Card>
        ))}
      </div>
      <p className="text-xs text-secondary mt-6">{t('awareness.educational')}</p>
    </AppShell>
  )
}

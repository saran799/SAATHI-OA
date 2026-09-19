import { useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Card, cx } from '../../components/ui'
import { useT } from '../../i18n'

export default function Awareness() {
  const { t } = useT()
  const ids = ['what','signs','care','when']
  const [open, setOpen] = useState<string | null>(ids[0])
  return (
    <AppShell title={t('common.appName')} subtitle={t('awareness.title')}>
      <h1 className="text-[24px] font-bold tracking-tight pt-4 break-words">{t('awareness.title')}</h1>
      <p className="text-secondary text-[15px] mt-1 mb-4 break-words">{t('awareness.subtitle')}</p>
      <div className="space-y-3">
        {ids.map(id => (
          <Card key={id}>
            <button type="button" aria-expanded={open === id} onClick={() => setOpen(open === id ? null : id)} className="w-full text-left p-4 flex items-center gap-3">
              <span className="flex-1 min-w-0"><span className="block font-bold text-[16px] break-words">{t(`awareness.articles.${id}.title`)}</span><span className="block text-sm text-secondary mt-0.5 break-words">{t(`awareness.articles.${id}.summary`)}</span><span className="inline-flex items-center gap-1 text-xs text-secondary mt-1.5 break-words"><Clock size={12} aria-hidden />{t('awareness.read', { min: 2 })}</span></span>
              <ChevronDown size={20} className={cx('text-secondary transition-transform shrink-0', open === id && 'rotate-180')} aria-hidden />
            </button>
            {open === id && <ul className="px-4 pb-4 space-y-2 fade-in">{(t(`awareness.articles.${id}.points`) as any as string[]).map((p: string) => <li key={p} className="flex gap-3 text-[15px] leading-relaxed break-words"><span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />{p}</li>)}</ul>}
          </Card>
        ))}
      </div>
      <p className="text-xs text-secondary mt-6 break-words">{t('awareness.educational')}</p>
    </AppShell>
  )
}

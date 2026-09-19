import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Globe, Languages, Info } from 'lucide-react'
import { Button, SelectableCard, IconTile, Logo } from '../../components/ui'
import { Frame } from '../../components/layout/Shells'
import { useApp } from '../../store/appStore'
import { LANGUAGES_META, useT } from '../../i18n'

export default function Language({ fromSettings }: { fromSettings?: boolean }) {
  const nav = useNavigate()
  const { language, setLanguage } = useApp()
  const [sel, setSel] = useState<string | null>(language ?? 'en')
  const { t } = useT()
  return (
    <Frame>
      <header className="px-5 pt-4 flex items-center gap-2">
        {fromSettings && <button type="button" aria-label={t('common.back')} onClick={() => nav('/settings')} className="h-11 w-11 -ml-3 inline-flex items-center justify-center rounded-full text-ink">‹</button>}
        <Logo size={38} />
        <div className="flex-1"><p className="text-[19px] font-bold text-primary leading-tight">{t('common.appName')}</p><p className="text-[10px] font-semibold tracking-wider text-secondary uppercase">{t('auth.language.careCompanion')}</p></div>
        <span className="h-7 px-3 rounded-full bg-tint text-[11px] font-semibold text-ink inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />{t('auth.language.step')}</span>
      </header>
      <main className="flex-1 px-5 pt-6 pb-40 page-enter">
        <h1 className="text-[26px] font-bold tracking-tight break-words">{t('auth.language.title')}</h1>
        <p className="text-secondary text-[15px] mt-1 break-words">{t('auth.language.subtitle')}</p>
        <div role="radiogroup" aria-label="Language" className="space-y-3 mt-5">
          {LANGUAGES_META.map(l => (
            <SelectableCard key={l.code} selected={sel === l.code} onSelect={() => setSel(l.code)} title={l.native} subtitle={l.english}
              leading={<IconTile icon={sel === l.code ? Languages : Globe} tone={sel === l.code ? 'mint' : 'tint'} size={40} iconSize={20} />} />
          ))}
        </div>
      </main>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-bg/95 backdrop-blur px-5 pb-5 pt-3">
        <div className="h-auto min-h-11 rounded-[14px] bg-tint px-4 py-2 flex items-center gap-2 text-[13px] text-ink mb-3 break-words"><Info size={16} className="text-primary shrink-0" aria-hidden />{t('auth.language.note')}</div>
        <Button full disabled={!sel} onClick={() => { setLanguage(sel!); nav(fromSettings ? '/settings' : '/dashboard') }}>{t('auth.language.continue')} <ArrowRight size={18} aria-hidden /></Button>
      </div>
    </Frame>
  )
}

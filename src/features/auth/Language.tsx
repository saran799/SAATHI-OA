import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Globe, Languages, Info } from 'lucide-react'
import { Button, SelectableCard, IconTile, Logo } from '../../components/ui'
import { Frame } from '../../components/layout/Shells'
import { LANGUAGES } from '../../domain/copy'
import { useApp } from '../../store/appStore'

export default function Language({ fromSettings }: { fromSettings?: boolean }) {
  const nav = useNavigate()
  const { language, setLanguage } = useApp()
  const [sel, setSel] = useState<string | null>(language ?? 'en')
  return (
    <Frame>
      <header className="px-5 pt-4 flex items-center gap-2">
        {fromSettings && <button type="button" aria-label="Back" onClick={() => nav('/settings')} className="h-11 w-11 -ml-3 inline-flex items-center justify-center rounded-full text-ink">‹</button>}
        <Logo size={38} />
        <div className="flex-1"><p className="text-[19px] font-bold text-primary leading-tight">SAATHI</p><p className="text-[10px] font-semibold tracking-wider text-secondary uppercase">Care companion</p></div>
        <span className="h-7 px-3 rounded-full bg-tint text-[11px] font-semibold text-ink inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />Step 1 of 2</span>
      </header>
      <main className="flex-1 px-5 pt-6 pb-40 page-enter">
        <h1 className="text-[26px] font-bold tracking-tight">Select Language</h1>
        <p className="text-secondary text-[15px] mt-1">Choose your preferred language to continue</p>
        <div role="radiogroup" aria-label="Language" className="space-y-3 mt-5">
          {LANGUAGES.map(l => (
            <SelectableCard key={l.code} selected={sel === l.code} onSelect={() => setSel(l.code)} title={l.native} subtitle={l.english}
              leading={<IconTile icon={sel === l.code ? Languages : Globe} tone={sel === l.code ? 'mint' : 'tint'} size={40} iconSize={20} />} />
          ))}
        </div>
      </main>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-bg/95 backdrop-blur px-5 pb-5 pt-3">
        <div className="h-11 rounded-[14px] bg-tint px-4 flex items-center gap-2 text-[13px] text-ink mb-3"><Info size={16} className="text-primary shrink-0" aria-hidden />Language can be changed anytime in Settings.</div>
        <Button full disabled={!sel} onClick={() => { setLanguage(sel!); nav(fromSettings ? '/settings' : '/dashboard') }}>Continue <ArrowRight size={18} aria-hidden /></Button>
      </div>
    </Frame>
  )
}

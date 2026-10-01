import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Printer } from 'lucide-react'
import { useT } from '../../i18n'
import { jointName, fmtDate } from '../../domain/copy'

export default function PatientPdf() {
  const [params] = useSearchParams()
  const { t } = useT()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const d = params.get('d')
    if (d) {
      try {
        setData(JSON.parse(decodeURIComponent(escape(atob(d)))))
      } catch (e) {
        console.error('Invalid QR data', e)
      }
    }
  }, [params])

  if (!data) return <div className="p-8 text-center">Invalid Report Data</div>

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-teal-800">SAATHI Screening Report</h1>
          <p className="text-sm text-slate-500 mt-1">{fmtDate(data.d)} • {data.phc}</p>
        </div>
        <ShieldCheck size={40} className="text-teal-600" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Patient Name</p>
          <p className="font-semibold text-lg">{data.n}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Age / Sex</p>
          <p className="font-semibold text-lg">{data.a} / {data.s}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Joint Assessed</p>
          <p className="font-semibold text-lg">{jointName(data.j, data.sd, t)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Health Worker</p>
          <p className="font-semibold text-lg">{data.w}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Screening Outcome</h2>
        <div className={`p-4 rounded-xl flex items-center justify-between ${data.rb === 'higher' ? 'bg-rose-50 text-rose-900 border border-rose-100' : data.rb === 'moderate' ? 'bg-amber-50 text-amber-900 border border-amber-100' : 'bg-teal-50 text-teal-900 border border-teal-100'}`}>
          <div>
            <p className="font-bold text-xl capitalize">{data.rb} Screening Risk</p>
            <p className="text-sm mt-1 opacity-90">{t(`screening.result.riskMeta.${data.rb}.summary`)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Recommended Actions</h2>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="font-semibold">{t(`screening.result.riskMeta.${data.rb}.action`)}</p>
        </div>
      </div>

      <div className="mt-12 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
        <p className="font-bold mb-1">Clinical Notice</p>
        <p>This is a screening result, not a diagnosis. SAATHI supports community screening and does not diagnose osteoarthritis. Further clinical evaluation by a qualified professional is required for any diagnosis.</p>
      </div>

      <div className="mt-8 flex justify-center no-print">
        <button onClick={() => window.print()} className="bg-teal-700 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-teal-800 transition flex items-center gap-2">
          <Printer size={18} /> Download PDF
        </button>
      </div>
    </div>
  )
}

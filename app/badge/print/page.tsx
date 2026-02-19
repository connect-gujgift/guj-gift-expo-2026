'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

export default function PrintBadge() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [visitor, setVisitor] = useState<any>(null)

  useEffect(() => {
    if (id) {
      supabase.from('visitors').select('*').eq('id', id).single()
        .then(({ data }) => {
          setVisitor(data)
          // Automatically open print dialog once data loads
          setTimeout(() => window.print(), 1000)
        })
    }
  }, [id])

  if (!visitor) return <p className="p-10 text-center uppercase font-bold">Loading Badge...</p>

  return (
    <div className="flex justify-center items-start pt-10 bg-white min-h-screen">
      {/* THE BADGE (Sized for standard thermal/ID printers) */}
      <div className="w-[320px] border border-slate-200 p-6 flex flex-col items-center text-center">
         <img src="/event-logo.png" alt="Logo" className="h-20 mb-4" />
         <div className="bg-[#ef6c33] text-white px-6 py-1 rounded-full text-[10px] font-black mb-4 uppercase">Valued Visitor</div>
         <h2 className="text-2xl font-black text-[#0b3d41] uppercase mb-1">{visitor.full_name}</h2>
         <p className="text-xs font-bold text-[#ef6c33] uppercase mb-4 italic">Visitor</p>
         <QRCode value={visitor.id} size={130} fgColor="#0b3d41" />
         <div className="mt-6 border-t pt-4 w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Company</p>
            <p className="text-sm font-bold text-[#0b3d41] uppercase">{visitor.company_name}</p>
         </div>
         <p className="mt-8 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">GGE 2026 | GMDC Ground, Ahmedabad</p>
      </div>
    </div>
  )
}
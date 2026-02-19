'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

// --- THE ACTUAL BADGE CONTENT ---
function BadgeContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchVisitor = async () => {
        const { data, error } = await supabase
          .from('visitors')
          .select('*')
          .eq('id', id)
          .single()
        
        if (data) {
          setVisitor(data)
          // Small delay to ensure QR code renders before print dialog pops up
          setTimeout(() => window.print(), 1000)
        }
        setLoading(false)
      }
      fetchVisitor()
    }
  }, [id])

  if (loading) return <p className="p-10 text-center uppercase font-black text-slate-400">Loading Badge...</p>
  if (!visitor) return <p className="p-10 text-center uppercase font-black text-red-500">Visitor Not Found</p>

  return (
    <div className="flex justify-center items-start pt-10 bg-white min-h-screen">
      {/* THE BADGE (Sized for standard thermal/ID printers) */}
      <div className="w-[320px] border-2 border-slate-100 p-6 flex flex-col items-center text-center rounded-xl">
         <img src="/event-logo.png" alt="Logo" className="h-20 mb-4 object-contain" />
         
         <div className="bg-[#ef6c33] text-white px-6 py-1 rounded-full text-[10px] font-black mb-4 uppercase tracking-widest">
            Valued Visitor
         </div>
         
         <h2 className="text-2xl font-black text-[#0b3d41] uppercase mb-1 leading-tight">
            {visitor.full_name}
         </h2>
         <p className="text-xs font-bold text-[#ef6c33] uppercase mb-5 tracking-widest">
            Visitor
         </p>
         
         <div className="p-2 border-2 border-[#0b3d41] rounded-2xl mb-6">
            <QRCode value={visitor.id} size={140} fgColor="#0b3d41" level="H" />
         </div>

         <div className="border-t border-slate-100 pt-4 w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company / Firm</p>
            <p className="text-sm font-bold text-[#0b3d41] uppercase mt-1">
                {visitor.company_name || 'Individual'}
            </p>
         </div>

         <div className="mt-8 pt-4 border-t border-dotted w-full">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                GGE 2026 | GMDC Ground, Ahmedabad
            </p>
            <p className="text-[7px] font-bold text-slate-300 uppercase mt-1">
                Organized by Shree Balaji Event LLP
            </p>
         </div>
      </div>
    </div>
  )
}

// --- MAIN PAGE COMPONENT WITH SUSPENSE BOUNDARY ---
export default function PrintBadgePage() {
  return (
    // Suspense is required for useSearchParams() to work in Next.js builds
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-slate-400">Preparing Print Job...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

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
          // 1.5 second delay to ensure QR code and images fully render before the print dialog opens
          setTimeout(() => window.print(), 1500)
        }
        setLoading(false)
      }
      fetchVisitor()
    }
  }, [id])

  if (loading) return <p className="p-10 text-center uppercase font-black text-slate-400">Loading Digital Pass...</p>
  if (!visitor) return <p className="p-10 text-center uppercase font-black text-red-500">Visitor Not Found</p>

  return (
    <div className="flex justify-center items-start pt-10 pb-20 bg-slate-200 min-h-screen print:bg-white print:pt-0 print:pb-0">
      
      {/* MAIN BADGE CONTAINER - Standard 4-inch width */}
      <div className="w-[384px] rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col font-sans relative print:w-full print:max-w-[384px] print:shadow-none print:border-none print:rounded-none">
         
         {/* 1. TOP EVENT LOGO - Clean background */}
         <div className="bg-white pt-6 pb-4 flex justify-center">
             <img src="/event-logo.png" alt="Guj Gift Expo" className="h-24 object-contain" />
         </div>

         {/* 2. OVERLAPPING PILL */}
         <div className="flex justify-center -mt-5 relative z-10">
             <div className="bg-[#ef6c33] text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest border-4 border-white shadow-sm">
                 Valued Visitor
             </div>
         </div>

         {/* 3. MIDDLE BODY (QR & NAME) */}
         <div className="px-6 pt-8 pb-8 bg-white flex-col flex gap-8 text-center">
             
             {/* QR & Name Row */}
             <div className="flex flex-col items-center gap-4">
                 {/* QR Code bordered box */}
                 <div className="p-2 border-[3px] border-[#ef6c33] rounded-2xl flex-shrink-0 bg-white">
                     <QRCode value={visitor.id} size={120} fgColor="#0b3d41" level="H" />
                 </div>
                 
                 {/* Name & Role */}
                 <div className="flex flex-col">
                     <h2 className="text-3xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words">
                         {visitor.full_name}
                     </h2>
                     <p className="text-base font-black text-[#ef6c33] uppercase tracking-widest mt-1">
                         Visitor
                     </p>
                 </div>
             </div>

             {/* Company / Firm */}
             <div className="border-t border-slate-100 pt-5 w-full">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company / Firm</p>
                 <p className="text-xl font-black text-[#0b3d41] uppercase leading-tight">
                     {visitor.company_name || 'Individual'}
                 </p>
             </div>
         </div>

         {/* 4. DARK TEAL EVENT INFO STRIP */}
         <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full">
             <div className="w-1/2 pr-4 border-r border-teal-700/50">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                 <p className="text-xs font-black uppercase tracking-widest leading-none">12-14 Aug 2026</p>
             </div>
             <div className="w-1/2 pl-6">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                 <p className="text-xs font-black uppercase tracking-widest leading-none">GMDC UNIVERSITY GROUND, AHMEDABAD</p>
             </div>
         </div>

         {/* 5. BOTTOM ORGANIZER FOOTER - Centered Layout */}
         <div className="bg-white px-6 py-5 flex flex-col items-center justify-center gap-2">
             {/* Organizer Logo */}
             <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                 <img 
                    src="/organizer-logo.png" 
                    alt="Organizer Logo" 
                    className="w-full h-full object-cover" 
                    onError={(e) => e.currentTarget.style.display = 'none'} 
                 />
             </div>
             <div className="text-center">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                 <p className="text-xs font-black text-[#0b3d41] uppercase tracking-wide">Shree Balaji Event LLP</p>
             </div>
         </div>

      </div>
    </div>
  )
}

// Wrapping in Suspense to safely build with Next.js useSearchParams
export default function FinalPrintBadgePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-slate-400">Loading...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
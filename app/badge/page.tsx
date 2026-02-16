'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"

export default function BadgePage() {
  const router = useRouter()
  const [visitor, setVisitor] = useState<any>(null)
  const [exhibitorInfo, setExhibitorInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBadgeData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: visitorData } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (visitorData) setVisitor(visitorData)

      const { data: exhibitorData } = await supabase
        .from('exhibitors')
        .select('stall_number')
        .eq('id', user.id)
        .single()

      if (exhibitorData) setExhibitorInfo(exhibitorData)
      setLoading(false)
    }
    fetchBadgeData()
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading Pass...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Profile Not Found</div>

  const isExhibitor = !!exhibitorInfo;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-4 px-4 font-sans overflow-hidden">
      
      {/* COMPACT BADGE CARD */}
      <div className="bg-white w-full max-w-[330px] rounded-[1.5rem] border-[6px] border-orange-500 shadow-xl overflow-hidden flex flex-col items-center text-center pb-4 relative">
        
        {/* 1. COMPACT LOGO SECTION */}
        <div className="mt-4 mb-2 h-20 flex items-center justify-center px-4">
           <img 
             src="/event-logo.png" 
             alt="Logo" 
             className="max-w-full max-h-full object-contain"
           />
        </div>

        {/* 2. ROLE LABEL & STALL */}
        <div className="flex flex-col items-center gap-2 mb-3">
          <div className={`px-6 py-1 rounded-full text-[12px] font-black tracking-widest uppercase shadow-sm ${isExhibitor ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
            {isExhibitor ? 'EXHIBITOR' : 'VISITOR'}
          </div>
          {isExhibitor && (
            <div className="bg-green-50 border border-green-600 text-green-700 px-4 py-0.5 rounded-lg font-black text-sm">
              STALL: {exhibitorInfo.stall_number || 'A-111'}
            </div>
          )}
        </div>

        {/* 3. USER INFO (Tightened) */}
        <div className="px-4 mb-3">
          <h1 className="text-2xl font-black text-slate-900 uppercase leading-none mb-1">
            {visitor.full_name}
          </h1>
          <p className="text-blue-600 font-bold uppercase text-[12px] tracking-wide">
            {visitor.company_name}
          </p>
          <p className="text-gray-400 font-medium italic text-[10px] mt-0.5">
            {visitor.designation}
          </p>
        </div>

        {/* 4. QR CODE (Sized for Screenshot) */}
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-4">
          <QRCode 
            value={visitor.id} 
            size={130}
          />
        </div>

        {/* 5. FOOTER (Small & Essential) */}
        <div className="w-full bg-slate-50 py-3 px-4 border-t border-slate-100 mt-auto">
          <p className="text-slate-900 font-black text-[12px] uppercase tracking-tighter">
            12th - 14th AUGUST 2026
          </p>
          <p className="text-slate-500 text-[9px] font-bold uppercase">
            GMDC University Ground, Ahmedabad
          </p>
        </div>

        {/* 6. ORGANIZER BRANDING */}
        <div className="bg-white w-full py-2 flex items-center justify-center gap-2">
            <img src="/organizer-logo.png" alt="SB" className="w-6 h-6 object-contain" />
            <div className="text-left border-l pl-2 border-slate-200">
                <p className="text-[9px] text-slate-900 font-black leading-none uppercase">Shree Balaji Event LLP</p>
            </div>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="mt-4 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          📸 Please Take a Screenshot
        </p>
        <p className="text-slate-400 text-[10px] mt-1">
          Show this image at the entry gate for scanning.
        </p>
      </div>
    </div>
  )
}
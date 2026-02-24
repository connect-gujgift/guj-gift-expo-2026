'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

function PrintContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const type = searchParams.get('type') // 'visitor', 'exhibitor', or 'staff'
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const table = type === 'visitor' ? 'visitors' : 'exhibitors'
      const { data } = await supabase.from(table).select('*').eq('id', id).single()
      
      if (data) setProfile(data)
      setLoading(false)
      
      // Auto-trigger print dialog once data loads
      if (data) {
        setTimeout(() => window.print(), 1000)
      }
    }
    fetchData()
  }, [id, type])

  if (loading) return <div className="p-10 text-center font-black uppercase text-[10px]">Preparing Print...</div>

  // --- VIP STYLING LOGIC ---
  const isVIP = profile?.is_vip === true
  const themeColor = isVIP ? '#0d9488' : (type === 'visitor' ? '#ef6c33' : '#0b3d41')

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-0 print:p-0">
      {/* This div is sized for standard 4x6 inch or 3x4 inch thermal badge printers.
        The 'print:shadow-none' and 'print:border-0' ensure a clean print.
      */}
      <div className="w-[350px] h-[500px] border-2 border-slate-100 relative overflow-hidden flex flex-col print:border-0">
        
        {/* HEADER AREA */}
        <div 
          className="h-24 flex flex-col items-center justify-center text-white" 
          style={{ backgroundColor: themeColor }}
        >
          <img src="/event-logo.png" className="h-10 mb-1 brightness-200 grayscale" />
          <p className="text-[8px] font-black uppercase tracking-[0.3em]">Guj Gift Expo 2026</p>
        </div>

        {/* WATERMARK FOR VIP */}
        {isVIP && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <h1 className="text-[120px] font-black rotate-45">VIP</h1>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col items-center pt-8 px-6 text-center">
          <div className="p-2 border-2 rounded-2xl mb-6" style={{ borderColor: themeColor }}>
            <QRCode value={profile.id} size={140} level="H" fgColor={themeColor} />
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">
            {profile.full_name}
          </h2>
          
          <p className="text-xs font-bold uppercase mt-3 text-slate-500 max-w-[250px]">
            {profile.company_name || 'Individual Attendee'}
          </p>
        </div>

        {/* CATEGORY STRIP */}
        <div className="py-4 text-center">
          <div 
            className="inline-block px-8 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            {isVIP ? '✨ VIP ATTENDEE ✨' : type?.toUpperCase()}
          </div>
          {type === 'exhibitor' && (
             <p className="text-xl font-black mt-2 text-slate-800">STALL: {profile.stall_number}</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 py-3 text-center border-t border-slate-100">
           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
             Ahmedabad • GMDC Ground • 12-14 August 2026
           </p>
        </div>

      </div>

      {/* Manual print button (hidden during actual printing) */}
      <button 
        onClick={() => window.print()} 
        className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase text-xs print:hidden"
      >
        Click to Reprint Badge
      </button>
    </div>
  )
}

export default function BadgePrintPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black">Syncing Printer...</div>}>
      <PrintContent />
    </Suspense>
  )
}
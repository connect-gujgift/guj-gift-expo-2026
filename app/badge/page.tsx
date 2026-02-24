'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { toPng } from 'html-to-image'

function BadgeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const badgeId = searchParams.get('id')
  const badgeRef = useRef<HTMLDivElement>(null)
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', badgeId)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    fetchData()
  }, [badgeId, router])

  const downloadBadge = async () => {
    if (badgeRef.current === null) return
    const dataUrl = await toPng(badgeRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' })
    const link = document.createElement('a')
    link.download = `GGE-Exhibitor-${profile?.full_name}.png`
    link.href = dataUrl
    link.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest italic">Finalizing Placement...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white font-sans">
      
      {/* 4x5.5 INCH VERTICAL BADGE */}
      <div 
        ref={badgeRef}
        className="w-[380px] h-[580px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col print:shadow-none print:rounded-none border-[10px] border-white"
      >
        
        {/* TOP: CENTERED LOGO & ROLE PILL */}
        <div className="pt-10 flex flex-col items-center flex-shrink-0">
          <img src="/event-logo.png" alt="GGE 2026" className="h-24 mb-6 object-contain" />
          <div className="bg-[#ef6c33] text-white px-10 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
            Official Exhibitor
          </div>
        </div>

        {/* MIDDLE: QR & NAME PLACEMENT */}
        <div className="flex-grow flex flex-col items-center justify-center px-10 text-center">
          <div className="p-4 border-[4px] border-[#0b3d41] rounded-[2.5rem] bg-white mb-8 shadow-sm">
            <QRCode value={profile.id || 'ID'} size={170} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-4xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none mb-2">
            {profile.full_name}
          </h1>
          <p className="text-[12px] font-bold text-[#ef6c33] uppercase tracking-widest">
            {profile.company_name}
          </p>
        </div>

        {/* STALL & CITY BAR */}
        <div className="px-12 py-5 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div className="text-left">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stall Number</p>
            <p className="text-3xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'T-101'}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event City</p>
            <p className="text-sm font-black text-[#0b3d41] uppercase tracking-tight">Ahmedabad</p>
          </div>
        </div>

        {/* FINAL FOOTER: CENTERED ORGANIZER & JUSTIFIED DETAILS */}
        <div className="bg-white px-10 pb-8 pt-4 border-t border-slate-100 flex flex-col items-center flex-shrink-0">
           
           {/* LOGO AREA - PERFECTLY CENTERED */}
           <div className="flex flex-col items-center w-full mb-6">
              <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-2 leading-none">Organized By</p>
              <img src="/organizer-logo.png" alt="Shree Balaji" className="h-8 object-contain mb-1.5" />
              <p className="text-[9px] font-black text-[#0b3d41] uppercase tracking-tighter leading-none">
                Shree Balaji Event LLP
              </p>
           </div>

           {/* DATE & VENUE ROW - JUSTIFIED SIDES */}
           <div className="flex justify-between items-center w-full border-t border-slate-100 pt-4">
              <div className="text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 leading-none">Date</p>
                <p className="text-[10px] font-black text-[#0b3d41] leading-none">12-14 Aug 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 leading-none">Venue</p>
                <p className="text-[10px] font-black text-[#0b3d41] leading-none">GMDC Ground, Ahmedabad</p>
              </div>
           </div>
        </div>
      </div>

      {/* ACTION HUB */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[380px] print:hidden">
        <Button onClick={downloadBadge} className="bg-[#0b3d41] hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest flex gap-3 shadow-xl">
          📥 Save PNG to Gallery
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => window.print()} variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest">
            Print ⎙
          </Button>
          <Button variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest">
            Email 📧
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SecureExhibitorBadgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">SYNCING...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
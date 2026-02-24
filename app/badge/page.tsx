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
      
      {/* FIXED 4x5.5 INCH CONTAINER */}
      <div 
        ref={badgeRef}
        className="w-[380px] h-[580px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col print:shadow-none print:rounded-none border-[8px] border-white"
      >
        
        {/* HEADER: LOGO & PILL */}
        <div className="pt-10 pb-4 flex flex-col items-center flex-shrink-0">
          <img src="/event-logo.png" alt="GGE 2026" className="h-20 mb-4 object-contain" />
          <div className="bg-[#ef6c33] text-white px-10 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            Official Exhibitor
          </div>
        </div>

        {/* MIDDLE SECTION: FLEX-GROW ENSURES CENTER PLACEMENT */}
        <div className="flex-grow flex flex-col items-center justify-center px-8 text-center">
          <div className="p-3 border-[3px] border-[#0b3d41] rounded-[2rem] bg-white mb-6">
            <QRCode value={profile.id} size={155} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-3xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-tight mb-1">
            {profile.full_name}
          </h1>
          <p className="text-[11px] font-bold text-[#ef6c33] uppercase tracking-widest">
            {profile.company_name}
          </p>
        </div>

        {/* STALL & CITY BAR */}
        <div className="px-10 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div className="text-left">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Stall Number</p>
            <p className="text-2xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'T-BA'}</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Event City</p>
            <p className="text-sm font-black text-[#0b3d41] uppercase">Ahmedabad</p>
          </div>
        </div>

        {/* FOOTER: PROPER ALIGNMENT */}
        <div className="bg-white p-6 border-t border-slate-100 flex flex-col items-center flex-shrink-0">
           
           {/* CENTERED ORGANIZER BLOCK */}
           <div className="flex flex-col items-center w-full mb-5">
              <p className="text-[6px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-2 leading-none">Organized By</p>
              <img src="/organizer-logo.png" alt="Shree Balaji" className="h-7 object-contain mb-1.5" />
              <p className="text-[8px] font-black text-[#0b3d41] uppercase tracking-tighter leading-none">
                Shree Balaji Event LLP
              </p>
           </div>

           {/* JUSTIFIED DATE & VENUE ROW */}
           <div className="flex justify-between items-center w-full px-4 border-t border-slate-50 pt-3">
              <div className="text-left">
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 leading-none">Date</p>
                <p className="text-[9px] font-black text-[#0b3d41] leading-none">12-14 Aug 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 leading-none">Venue</p>
                <p className="text-[9px] font-black text-[#0b3d41] leading-none">GMDC Ground, Ahmedabad</p>
              </div>
           </div>
        </div>
      </div>

      {/* MOBILE ACTION HUB */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[380px] print:hidden">
        <Button onClick={downloadBadge} className="bg-[#0b3d41] hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest flex gap-3 shadow-xl">
          📥 Save Image (PNG)
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => window.print()} variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest">
            Print ⎙
          </Button>
          <Button variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest">
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
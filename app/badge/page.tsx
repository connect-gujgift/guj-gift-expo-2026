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
    link.download = `GGE2026-Pass-${profile?.full_name}.png`
    link.href = dataUrl
    link.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest">Polishing Final Design...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white font-sans">
      
      {/* STANDARD 4x5.5 INCH VERTICAL CONTAINER */}
      <div 
        ref={badgeRef}
        className="w-[380px] h-[560px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col print:shadow-none print:rounded-none border-[8px] border-white"
      >
        
        {/* HEADER: LARGER CENTERED LOGO */}
        <div className="pt-10 pb-4 flex flex-col items-center">
          <img src="/event-logo.png" alt="GGE 2026" className="h-20 mb-4 object-contain" />
          <div className="bg-[#ef6c33] text-white px-10 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            Official Exhibitor
          </div>
        </div>

        {/* MIDDLE: QR & IDENTIFICATION */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-2">
          <div className="p-3 border-[3px] border-[#0b3d41] rounded-[2rem] bg-white mb-6">
            <QRCode value={profile.id} size={150} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-3xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none mb-2">
            {profile.full_name}
          </h1>
          <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest">
            {profile.company_name}
          </p>
        </div>

        {/* INFO SECTION: ALIGNED STALL & CITY */}
        <div className="px-10 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="text-left">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Stall Number</p>
            <p className="text-2xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'T-BA'}</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Event City</p>
            <p className="text-sm font-black text-[#0b3d41] uppercase">Ahmedabad</p>
          </div>
        </div>

        {/* FINAL FOOTER: CENTERED ORGANIZER & ALIGNED DETAILS */}
        <div className="bg-white p-6 pt-4 border-t border-slate-100 flex flex-col items-center">
           
           {/* LOGO & ORGANIZER TEXT */}
           <div className="flex flex-col items-center w-full mb-4">
              <p className="text-[6px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-2">Organized By</p>
              <img src="/organizer-logo.png" alt="Shree Balaji" className="h-8 object-contain mb-1" />
              <p className="text-[8px] font-black text-[#0b3d41] uppercase tracking-tighter">
                Shree Balaji Event LLP
              </p>
           </div>

           {/* ALIGNED DATE & VENUE */}
           <div className="flex justify-between items-center w-full px-2 border-t border-slate-50 pt-3">
              <div className="text-left">
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Date</p>
                <p className="text-[9px] font-black text-[#0b3d41]">12-14 Aug 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Venue</p>
                <p className="text-[9px] font-black text-[#0b3d41]">GMDC Ground, Ahmedabad</p>
              </div>
           </div>
        </div>
      </div>

      {/* ACTION HUB */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[380px] print:hidden">
        <Button onClick={downloadBadge} className="bg-[#0b3d41] hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest flex gap-3 shadow-xl">
          📥 Save PNG to Phone
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => window.print()} variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest">
            Print ⎙
          </Button>
          <Button onClick={() => alert('Sending Pass...')} variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest">
            Email 📧
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SecureExhibitorBadgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">SYNCING...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
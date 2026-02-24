'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { toPng } from 'html-to-image' // For the download feature

function BadgeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const badgeId = searchParams.get('id')
  const badgeRef = useRef<HTMLDivElement>(null) // Reference for image capture
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const isSuperAdmin = user.email === 'maulikshah.13@gmail.com'
      
      if (badgeId !== user.id && !isSuperAdmin) {
        setError("ACCESS DENIED: UNAUTHORIZED VIEWING.")
        setLoading(false)
        return
      }

      const { data, error: dbError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', badgeId)
        .single()

      if (dbError || !data) setError("Badge Profile Not Found.")
      else setProfile(data)
      
      setLoading(false)
    }
    verifyAndFetch()
  }, [badgeId, router])

  // --- DOWNLOAD FEATURE LOGIC ---
  const downloadBadge = async () => {
    if (badgeRef.current === null) return
    
    const dataUrl = await toPng(badgeRef.current, { cacheBust: true, pixelRatio: 3 })
    const link = document.createElement('a')
    link.download = `GGE2026-Pass-${profile?.full_name}.png`
    link.href = dataUrl
    link.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[10px] tracking-widest text-slate-400">SYNCING OFFICIAL PASS...</div>
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"><p className="font-black text-[11px] text-red-500">{error}</p></div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white">
      
      {/* THE BADGE - Capture this area */}
      <div 
        ref={badgeRef}
        className="w-[380px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col print:shadow-none print:rounded-none border-4 border-white"
      >
        
        {/* HEADER: BIGGER LOGO, NO TEAL */}
        <div className="pt-12 pb-6 flex flex-col items-center">
          <img src="/event-logo.png" alt="GGE 2026" className="h-28 mb-6 object-contain" />
          <div className="bg-[#ef6c33] text-white px-12 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
            Official Exhibitor
          </div>
        </div>

        {/* MIDDLE: QR & INFO */}
        <div className="flex-1 flex flex-col items-center px-10 text-center">
          <div className="p-4 border-[4px] border-[#0b3d41] rounded-[2.5rem] bg-white mb-8 mt-4 shadow-sm">
            <QRCode value={profile.id} size={180} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-4xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none mb-3">
            {profile.full_name}
          </h1>
          <p className="text-[12px] font-bold text-[#ef6c33] uppercase tracking-widest mb-10">
            {profile.company_name}
          </p>
        </div>

        {/* BOTTOM: STALL & CITY */}
        <div className="px-12 py-8 border-t border-slate-100 flex justify-between items-end bg-slate-50/50">
          <div className="text-left">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stall Number</p>
            <p className="text-3xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'T-BA'}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event City</p>
            <p className="text-sm font-black text-[#0b3d41] uppercase">Ahmedabad</p>
          </div>
        </div>

        {/* NEW FOOTER: NO TEAL, INCLUDES ORGANIZER LOGO */}
        <div className="bg-white p-8 border-t-2 border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <div className="text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Date</p>
                <p className="text-[10px] font-black uppercase text-[#0b3d41]">12-14 Aug 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Venue</p>
                <p className="text-[10px] font-black uppercase text-[#0b3d41]">GMDC University Ground</p>
              </div>
           </div>
           
           <div className="flex flex-col items-center border-t pt-6">
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Organized By</p>
              <img src="/organizer-logo.png" className="h-10 object-contain grayscale" />
              <p className="text-[9px] font-black text-[#0b3d41] uppercase mt-2 tracking-tighter">Shree Balaji Event LLP</p>
           </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[380px] print:hidden">
        <Button 
          onClick={downloadBadge} 
          className="bg-[#0b3d41] hover:bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl flex gap-3"
        >
          📥 Download Image (PNG)
        </Button>
        <Button 
          onClick={() => window.print()} 
          variant="outline"
          className="h-14 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest"
        >
          ⎙ Print Physical Copy
        </Button>
      </div>
    </div>
  )
}

export default function SecureExhibitorBadgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">LOADING...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
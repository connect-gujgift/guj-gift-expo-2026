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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest">Loading Final Badge...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white font-sans">
      
      {/* 4x6 INCH STANDARD CONTAINER (Size is strictly 600px) */}
      <div 
        ref={badgeRef}
        className="w-[380px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col justify-between print:shadow-none print:rounded-none border-[8px] border-white shrink-0"
      >
        
        {/* --- 1. HEADER (Tighter padding to save space) --- */}
        <div className="pt-6 pb-2 flex flex-col items-center flex-none">
          {/* Bigger event logo as requested */}
          <img src="/event-logo.png" alt="GGE 2026" className="h-24 mb-3 object-contain" />
          <div className="bg-[#ef6c33] text-white px-10 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
            Official Exhibitor
          </div>
        </div>

        {/* --- 2. MIDDLE (Decreased QR Code Size to 135) --- */}
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center">
          <div className="p-2.5 border-[3px] border-[#0b3d41] rounded-[1.5rem] bg-white mb-4 shadow-sm">
            <QRCode value={profile.id || 'ID'} size={135} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-3xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none mb-1.5 px-2">
            {profile.full_name}
          </h1>
          <p className="text-[11px] font-bold text-[#ef6c33] uppercase tracking-widest px-2">
            {profile.company_name}
          </p>
        </div>

        {/* --- 3. BOTTOM INFO BAR --- */}
        <div className="px-10 py-3.5 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 flex-none">
          <div className="text-left">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stall Number</p>
            <p className="text-2xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'T-BA'}</p>
          </div>
          
          {/* Event Location text with line wrapping */}
          <div className="text-right flex flex-col items-end">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event Location</p>
            <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-tight leading-tight text-right max-w-[150px]">
              GMDC University Ground, Ahmedabad
            </p>
          </div>
        </div>

        {/* --- 4. FOOTER (Safely inside the bounds now) --- */}
        <div className="bg-white px-8 pt-4 pb-5 border-t border-slate-100 flex flex-col items-center flex-none">
           <div className="flex flex-col items-center w-full">
              <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-1.5 leading-none">Organized By</p>
              <img src="/organizer-logo.png" alt="Shree Balaji" className="h-9 object-contain mb-1.5" />
              <p className="text-[9px] font-black text-[#0b3d41] uppercase tracking-tighter leading-none">
                Shree Balaji Event LLP
              </p>
           </div>
        </div>

      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[380px] print:hidden">
        <Button onClick={downloadBadge} className="bg-[#0b3d41] hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest flex gap-3 shadow-xl">
          📥 Save PNG to Gallery
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => window.print()} variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest bg-white">
            Print ⎙
          </Button>
          <Button onClick={() => alert('Sending Pass...')} variant="outline" className="h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest bg-white">
            Email 📧
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SecureExhibitorBadgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading System...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
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
  const [sendingEmail, setSendingEmail] = useState(false)

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
    const dataUrl = await toPng(badgeRef.current, { pixelRatio: 3 })
    const link = document.createElement('a')
    link.download = `GGE-Pass-${profile?.full_name}.png`
    link.href = dataUrl
    link.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest">Resizing Badge...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white font-sans">
      
      {/* STANDARD 4x5.5 INCH DIMENSIONS (Approx 380px x 530px) */}
      <div 
        ref={badgeRef}
        className="w-[380px] h-[530px] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col print:shadow-none print:rounded-none border-[6px] border-white"
      >
        
        {/* HEADER: LARGER LOGO */}
        <div className="pt-8 pb-4 flex flex-col items-center">
          <img src="/event-logo.png" alt="GGE 2026" className="h-20 mb-4 object-contain" />
          <div className="bg-[#ef6c33] text-white px-10 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            Official Exhibitor
          </div>
        </div>

        {/* MIDDLE: QR & NAME */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-2">
          <div className="p-3 border-[3px] border-[#0b3d41] rounded-[1.5rem] bg-white mb-6">
            <QRCode value={profile.id} size={140} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-3xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none mb-2">
            {profile.full_name}
          </h1>
          <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest">
            {profile.company_name}
          </p>
        </div>

        {/* INFO STRIP */}
        <div className="px-10 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Stall</p>
            <p className="text-xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'T-BA'}</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">City</p>
            <p className="text-xs font-black text-[#0b3d41] uppercase">Ahmedabad</p>
          </div>
        </div>

        {/* COMPACT FOOTER */}
        <div className="bg-white p-6 border-t border-slate-100 flex flex-col items-center">
           <div className="flex justify-between w-full mb-4">
              <div className="text-left">
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Date</p>
                <p className="text-[9px] font-black text-[#0b3d41]">12-14 Aug 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Venue</p>
                <p className="text-[9px] font-black text-[#0b3d41]">GMDC Ground</p>
              </div>
           </div>
           
           <div className="flex flex-col items-center border-t border-slate-50 pt-3 w-full">
              <img src="/organizer-logo.png" className="h-7 object-contain grayscale mb-1" />
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                Organized By Shree Balaji Event LLP
              </p>
           </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[380px] print:hidden">
        <Button onClick={downloadBadge} className="bg-[#0b3d41] hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest flex gap-3 shadow-lg">
          📥 Save to Phone
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">SYNCING...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
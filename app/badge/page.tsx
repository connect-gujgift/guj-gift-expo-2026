'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { toPng } from 'html-to-image'

export default function VisitorBadge() {
  const router = useRouter()
  const badgeRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // Check Exhibitor Table
      const { data: exhibitor } = await supabase.from('exhibitors').select('*').eq('id', user.id).single()

      if (exhibitor) {
        setProfile(exhibitor)
        setRole('exhibitor')
      } else {
        // Fallback to Visitor Table
        const { data: visitor } = await supabase.from('visitors').select('*').eq('id', user.id).single()
        setProfile(visitor)
        setRole('visitor')
      }
      setLoading(false)
    }
    getProfileData()
  }, [router])

  const downloadBadge = async () => {
    if (badgeRef.current === null) return
    try {
      const dataUrl = await toPng(badgeRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff',
        pixelRatio: 3 
      })
      const link = document.createElement('a')
      link.download = `GGE-Badge-${profile?.full_name || profile?.company_name || 'Pass'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-[#ef6c33]">Generating Pass...</div>

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4">
      
      {/* STANDARD COMPACT BADGE SIZING (max-w-[320px] and tighter rounding) */}
      <div 
        ref={badgeRef} 
        className="w-full max-w-[320px] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
      >
        
        {/* LIGHT TEAL HEADER: Reduced vertical padding */}
        <div className="bg-[#f0f7f7] pt-6 pb-8 flex flex-col items-center px-4">
          <img src="/event-logo.png" alt="GGE 2026" className="h-20 w-auto object-contain scale-110" />
        </div>

        {/* ROLE PILL: Tighter margins */}
        <div className="flex justify-center -mt-4">
          <div className={`${role === 'exhibitor' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md`}>
            {role === 'exhibitor' ? 'OFFICIAL EXHIBITOR' : 'VALUED VISITOR'}
          </div>
        </div>

        {/* MIDDLE SECTION: Tighter spacing */}
        <div className="px-6 pt-5 pb-4 flex flex-col items-center text-center">
          
          {/* 1. NAME & ROLE */}
          <div className="mb-3 w-full">
            <h2 className="text-2xl font-black text-[#0b3d41] uppercase tracking-tighter leading-tight break-words mb-1">
              {role === 'exhibitor' ? (profile?.full_name || 'Exhibitor Name') : profile?.full_name}
            </h2>
            <p className="text-[11px] font-black text-[#ef6c33] uppercase leading-none tracking-widest">
              {role === 'exhibitor' ? 'Exhibitor' : 'Visitor'}
            </p>
          </div>

          {/* 2. QR CODE */}
          <div className="p-2.5 border-2 border-[#ef6c33] rounded-[1.5rem] bg-white shadow-sm mb-4 inline-block">
            {profile && <QRCode value={profile.id} size={120} level="H" fgColor="#0b3d41" />}
          </div>

          {/* 3. COMPANY & STALL INFO */}
          <div className="w-full flex justify-between items-end border-t border-slate-100 pt-3 text-left">
            <div className="flex-1 pr-2">
               <p className="text-[9px] font-bold text-slate-400 uppercase">Company / Firm</p>
               <p className="text-xs font-bold text-[#0b3d41] uppercase leading-tight mt-0.5 line-clamp-2">
                 {profile?.company_name || 'Individual Visitor'}
               </p>
            </div>
            {role === 'exhibitor' && profile?.stall_number && (
              <div className="bg-[#0b3d41] text-white p-2 rounded-xl text-center min-w-[60px]">
                <p className="text-[7px] opacity-70 uppercase font-black">Stall</p>
                <p className="text-lg font-black leading-none">{profile.stall_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* INFO STRIP: Reduced padding */}
        <div className="bg-[#0b3d41] text-white px-6 py-3 flex justify-between items-center">
          <div>
            <p className="text-[8px] opacity-60 uppercase font-bold tracking-widest">Date</p>
            <p className="text-[10px] font-black uppercase tracking-tighter">12-14 Aug 2026</p>
          </div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="text-right">
            <p className="text-[8px] opacity-60 uppercase font-bold tracking-widest">Location</p>
            <p className="text-[10px] font-black uppercase tracking-tighter text-right">GMDC Ground</p>
          </div>
        </div>

        {/* ORGANIZER FOOTER: Compacted */}
        <div className="p-4 flex items-center justify-center gap-3 bg-white">
           <img src="/organizer-logo.png" alt="Organizer" className="h-8 w-auto object-contain opacity-100" />
           <div className="h-6 w-[1px] bg-slate-200"></div>
           <p className="text-[8px] font-bold text-slate-500 uppercase leading-tight tracking-tighter">
              Organized by <br/> <span className="text-[#0b3d41]">Shree Balaji Event LLP</span>
           </p>
        </div>
      </div>

      {/* DOWNLOAD ACTIONS */}
      <div className="mt-6 w-full max-w-[320px] space-y-3">
        <Button onClick={downloadBadge} className="w-full h-14 rounded-2xl bg-[#ef6c33] text-white font-black uppercase tracking-widest shadow-xl hover:bg-[#d45a27] transition-all">
          Download Digital Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-slate-400 font-bold uppercase text-[10px]">
          Skip to Dashboard
        </Button>
      </div>
    </div>
  )
}
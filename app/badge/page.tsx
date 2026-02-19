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

      const { data: exhibitor } = await supabase.from('exhibitors').select('*').eq('id', user.id).single()

      if (exhibitor) {
        setProfile(exhibitor)
        setRole('exhibitor')
      } else {
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
        pixelRatio: 3 // Higher quality for printing
      })
      const link = document.createElement('a')
      link.download = `GGE2026-Pass.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-orange-500 animate-pulse">Designing Your Premium Pass...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-6 pt-10 pb-20">
      
      {/* THE REDESIGNED BADGE */}
      <div 
        ref={badgeRef} 
        className="w-full max-w-[360px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-t-[14px] border-[#f39200]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f39200' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        
        {/* HEADER SECTION */}
        <div className="px-8 pt-10 pb-4 flex flex-col items-center">
          <img src="/event-logo.png" alt="Logo" className="h-28 w-auto object-contain mb-4 drop-shadow-md" />
          <div className="bg-[#f39200] text-white px-8 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-200">
            {role === 'exhibitor' ? 'Official Exhibitor' : 'Valued Visitor'}
          </div>
        </div>

        {/* QR CODE SECTION */}
        <div className="flex flex-col items-center px-8 py-4">
          <div className="bg-white p-5 rounded-[2.5rem] border-4 border-[#f39200]/10 shadow-inner mb-6">
            {profile && <QRCode value={profile.id} size={170} level="H" fgColor="#1e3a8a" />}
          </div>
          
          <h2 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-tighter leading-none text-center">
            {role === 'exhibitor' ? profile?.company_name : profile?.full_name}
          </h2>
          <p className="text-[#f39200] font-bold uppercase text-xs mt-3 tracking-widest">
            {role === 'exhibitor' ? profile?.category : (profile?.company_name || 'Individual Visitor')}
          </p>

          {role === 'exhibitor' && profile?.stall_number && (
            <div className="mt-4 flex flex-col items-center bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stall Number</p>
               <p className="text-3xl font-black text-[#1e3a8a] tracking-tighter">{profile.stall_number}</p>
            </div>
          )}
        </div>

        {/* EVENT INFO STRIP */}
        <div className="mt-6 px-8 py-5 bg-[#1e3a8a] text-white flex justify-between items-center border-b-4 border-[#f39200]">
          <div className="text-left">
            <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Event Date</p>
            <p className="text-[11px] font-black uppercase italic">12 - 14 Aug 2026</p>
          </div>
          <div className="h-8 w-[1px] bg-white/20"></div>
          <div className="text-right">
            <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Location</p>
            <p className="text-[11px] font-black uppercase italic">GMDC Ground, Ahmedabad</p>
          </div>
        </div>

        {/* ORGANIZER FOOTER */}
        <div className="p-8 flex flex-col items-center bg-white/80 backdrop-blur-sm">
           <img src="/organizer-logo.png" alt="Organizer" className="h-12 w-auto object-contain mb-2" />
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-center max-w-[200px]">
              Organized by Shree Balaji Event LLP, Ahmedabad
           </p>
        </div>
      </div>

      {/* DOWNLOAD BUTTONS */}
      <div className="mt-8 w-full max-w-[360px] space-y-3">
        <Button onClick={downloadBadge} className="w-full h-16 rounded-3xl bg-[#f39200] text-white font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-[#d98200] transition-all">
          Download Digital Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
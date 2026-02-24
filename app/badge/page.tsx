'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"

function BadgeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const badgeId = searchParams.get('id')
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // NEW SECURITY: Allow access if it's the User's own badge OR if the viewer is the Super Admin
      const isSuperAdmin = user.email === 'maulikshah.13@gmail.com'
      
      if (badgeId !== user.id && !isSuperAdmin) {
        setError("ACCESS DENIED: YOU CAN ONLY VIEW YOUR OWN OFFICIAL BADGE.")
        setLoading(false)
        return
      }

      // Fetch the details of the person the badge belongs to
      const { data, error: dbError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', badgeId)
        .single()

      if (dbError || !data) {
        setError("Badge Profile Not Found.")
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    verifyAndFetch()
  }, [badgeId, router])

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-[10px] tracking-widest text-slate-400">LOADING OFFICIAL BADGE...</div>

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 text-2xl">✕</div>
      <p className="font-black uppercase text-[11px] tracking-widest text-slate-900 leading-relaxed max-w-[200px]">{error}</p>
      <Button onClick={() => router.push('/dashboard')} className="mt-8 bg-[#0b3d41] uppercase font-bold text-[10px] rounded-full px-8">Return to Hub</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 print:p-0 print:bg-white">
      {/* NEW BADGE DESIGN TEMPLATE */}
      <div className="w-[380px] h-[580px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col print:shadow-none print:rounded-none">
        
        {/* TOP SECTION: LOGO & PILL */}
        <div className="bg-[#0b3d41] pt-10 pb-8 flex flex-col items-center">
          <img src="/event-logo.png" alt="GGE 2026" className="h-14 mb-6 object-contain" />
          <div className="bg-[#ef6c33] text-white px-10 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            Official Exhibitor
          </div>
        </div>

        {/* MIDDLE SECTION: QR & INFO */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-4">
          <div className="p-3 border-[3px] border-[#0b3d41] rounded-[2rem] bg-white mb-8">
            <QRCode value={profile.id} size={160} level="H" fgColor="#0b3d41" />
          </div>

          <h1 className="text-3xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none mb-2">
            {profile.full_name}
          </h1>
          <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest">
            {profile.company_name}
          </p>
        </div>

        {/* BOTTOM SECTION: STALL & CITY INFO */}
        <div className="px-10 py-6 border-t border-slate-100 flex justify-between items-end">
          <div className="text-left">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stall Number</p>
            <p className="text-2xl font-black text-[#0b3d41] italic leading-none">{profile.stall_number || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event City</p>
            <p className="text-sm font-black text-[#0b3d41] uppercase">Ahmedabad</p>
          </div>
        </div>

        {/* FOOTER: DATE & LOCATION */}
        <div className="bg-[#0b3d41] p-6 text-white flex border-t-2 border-white/10">
           <div className="w-1/2 pr-4 border-r border-white/10">
              <p className="text-[7px] font-bold uppercase tracking-widest text-teal-300 opacity-60 mb-1">Date</p>
              <p className="text-[9px] font-black uppercase">12-14 Aug 2026</p>
           </div>
           <div className="w-1/2 pl-4">
              <p className="text-[7px] font-bold uppercase tracking-widest text-teal-300 opacity-60 mb-1">Location</p>
              <p className="text-[9px] font-black uppercase leading-tight">GMDC University Ground, Ahmedabad</p>
           </div>
        </div>

        {/* ORGANIZER LOGO */}
        <div className="bg-white py-3 flex flex-col items-center">
           <p className="text-[6px] font-bold text-slate-300 uppercase tracking-widest mb-1">Organized By</p>
           <p className="text-[8px] font-black text-[#0b3d41] uppercase tracking-tighter">Shree Balaji Event LLP</p>
        </div>
      </div>

      <Button onClick={() => window.print()} className="mt-8 bg-[#ef6c33] hover:bg-[#d45a27] font-black uppercase tracking-widest h-14 w-full max-w-[380px] rounded-2xl shadow-xl print:hidden">
        ⎙ Print Digital Pass
      </Button>
    </div>
  )
}

export default function SecureExhibitorBadgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-black text-[10px] tracking-widest text-slate-400">SYNCING SYSTEM...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
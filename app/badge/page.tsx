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
      const dataUrl = await toPng(badgeRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `GGE2026-Badge.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400">Loading Premium Pass...</div>

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center p-6 pt-10 pb-20">
      
      {/* REDESIGNED MODERN BADGE */}
      <div ref={badgeRef} className="w-full max-w-[350px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-t-[12px] border-blue-600">
        
        {/* TOP BRANDING SECTION */}
        <div className="px-8 pt-10 pb-6 flex flex-col items-center">
          <img src="/event-logo.png" alt="Logo" className="h-24 w-auto object-contain mb-4" />
          <div className="bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            {role === 'exhibitor' ? 'OFFICIAL EXHIBITOR' : 'VALUED VISITOR'}
          </div>
        </div>

        {/* QR CODE CORE */}
        <div className="flex flex-col items-center px-8">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 mb-6">
            {profile && <QRCode value={profile.id} size={160} level="H" fgColor="#1e3a8a" />}
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none text-center">
            {role === 'exhibitor' ? profile?.company_name : profile?.full_name}
          </h2>
          <p className="text-blue-600 font-bold uppercase text-xs mt-2 tracking-widest">
            {role === 'exhibitor' ? profile?.category : (profile?.company_name || 'Individual Visitor')}
          </p>

          {role === 'exhibitor' && profile?.stall_number && (
            <div className="mt-4 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">STALL NUMBER</p>
               <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{profile.stall_number}</p>
            </div>
          )}
        </div>

        {/* EVENT INFO STRIP */}
        <div className="mt-8 px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="text-left">
            <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Date</p>
            <p className="text-[11px] font-black uppercase">12-14 Aug 2026</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Location</p>
            <p className="text-[11px] font-black uppercase">GMDC Ground, Ahmedabad</p>
          </div>
        </div>

        {/* ORGANIZER FOOTER */}
        <div className="p-8 flex flex-col items-center bg-white border-t border-slate-100">
           <img src="/organizer-logo.png" alt="Organizer" className="h-10 w-auto object-contain mb-2 opacity-80" />
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center">
              Organized by Shree Balaji Event LLP, Ahmedabad
           </p>
        </div>
      </div>

      {/* DOWNLOAD BUTTONS */}
      <div className="mt-8 w-full max-w-[350px] space-y-3">
        <Button onClick={downloadBadge} className="w-full h-16 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
          Download Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-slate-400 font-bold uppercase text-[10px]">
          Skip to Dashboard
        </Button>
      </div>
    </div>
  )
}
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
        pixelRatio: 3 
      })
      const link = document.createElement('a')
      link.download = `GGE-Badge-${profile?.full_name || 'Pass'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-[#ef6c33]">Loading Expo Pass...</div>

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4">
      
      {/* THE COMPACT BADGE */}
      <div 
        ref={badgeRef} 
        className="w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
      >
        
        {/* LIGHT TEAL HEADER: Lighter to make the logo pop */}
        <div className="bg-[#f0f7f7] pt-10 pb-12 flex flex-col items-center px-6">
          <img src="/event-logo.png" alt="GGE 2026" className="h-28 w-auto object-contain scale-125" />
        </div>

        {/* ROLE PILL */}
        <div className="flex justify-center -mt-5">
          <div className="bg-[#ef6c33] text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
            {role === 'exhibitor' ? 'OFFICIAL EXHIBITOR' : 'VALUED VISITOR'}
          </div>
        </div>

        {/* MIDDLE SECTION: QR & INFO */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center">
          <div className="flex w-full items-center gap-6 mb-6">
            <div className="p-2 border-2 border-[#ef6c33] rounded-2xl bg-white shadow-sm">
              {profile && <QRCode value={profile.id} size={110} level="H" fgColor="#0b3d41" />}
            </div>
            
            <div className="flex-1 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Role</p>
              <p className="text-sm font-black text-[#ef6c33] uppercase leading-tight mb-2">
                {role === 'exhibitor' ? 'Exhibitor' : 'Visitor'}
              </p>
              <h2 className="text-2xl font-black text-[#0b3d41] uppercase tracking-tighter leading-none break-words">
                {role === 'exhibitor' ? profile?.company_name : profile?.full_name}
              </h2>
            </div>
          </div>

          <div className="w-full flex justify-between items-end border-t border-slate-100 pt-4">
            <div className="text-left">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Company / Firm</p>
               <p className="text-sm font-bold text-[#0b3d41] uppercase">{role === 'exhibitor' ? profile?.category : (profile?.company_name || 'Individual Visitor')}</p>
            </div>
            {role === 'exhibitor' && profile?.stall_number && (
              <div className="bg-[#0b3d41] text-white px-4 py-2 rounded-xl text-right">
                <p className="text-[9px] opacity-70 uppercase font-bold">Stall</p>
                <p className="text-xl font-black leading-none">{profile.stall_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* INFO STRIP */}
        <div className="bg-[#0b3d41] text-white px-8 py-5 flex justify-between items-center">
          <div>
            <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest">Date</p>
            <p className="text-xs font-black uppercase tracking-tighter">12-14 Aug 2026</p>
          </div>
          <div className="h-8 w-[1px] bg-white/20"></div>
          <div className="text-right">
            <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest">Location</p>
            <p className="text-xs font-black uppercase tracking-tighter text-right">GMDC Ground, Ahmedabad</p>
          </div>
        </div>

        {/* ORGANIZER FOOTER: Clearer logo visibility */}
        <div className="p-6 flex items-center justify-center gap-4 bg-white">
           <img src="/organizer-logo.png" alt="Organizer" className="h-10 w-auto object-contain opacity-100" />
           <div className="h-8 w-[1px] bg-slate-200"></div>
           <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight tracking-tighter">
              Organized by <br/> <span className="text-[#0b3d41]">Shree Balaji Event LLP</span>
           </p>
        </div>
      </div>

      {/* DOWNLOAD ACTIONS */}
      <div className="mt-8 w-full max-w-[340px] space-y-3">
        <Button onClick={downloadBadge} className="w-full h-16 rounded-2xl bg-[#ef6c33] text-white font-black uppercase tracking-widest shadow-xl hover:bg-[#d45a27] transition-all">
          Download Digital Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-slate-400 font-bold uppercase text-[10px]">
          Skip to Dashboard
        </Button>
      </div>
    </div>
  )
}
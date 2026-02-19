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
        className="w-full max-w-[320px] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ef6c33' fill-opacity='0.03'/%3E%3C/svg%3E")`
        }}
      >
        
        {/* DARK TEAL HEADER */}
        <div className="bg-[#0b3d41] p-6 flex flex-col items-center">
          <img src="/event-logo.png" alt="GGE 2026" className="h-16 w-auto object-contain" />
        </div>

        {/* ROLE PILL */}
        <div className="flex justify-center -mt-3">
          <div className="bg-[#ef6c33] text-white px-5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
            {role === 'exhibitor' ? 'OFFICIAL EXHIBITOR' : 'VALUED VISITOR'}
          </div>
        </div>

        {/* MIDDLE SECTION: QR & INFO */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center">
          <div className="flex w-full items-center gap-4 mb-4">
            {/* QR Code with Orange Border */}
            <div className="p-2 border-2 border-[#ef6c33] rounded-xl bg-white shadow-sm">
              {profile && <QRCode value={profile.id} size={100} level="H" fgColor="#0b3d41" />}
            </div>
            
            {/* Short Details */}
            <div className="flex-1 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Role</p>
              <p className="text-xs font-black text-[#ef6c33] uppercase leading-tight mb-2">
                {role === 'exhibitor' ? 'Exhibitor' : 'Visitor'}
              </p>
              <h2 className="text-xl font-black text-[#0b3d41] uppercase tracking-tighter leading-none break-words">
                {role === 'exhibitor' ? profile?.company_name : profile?.full_name}
              </h2>
            </div>
          </div>

          {/* SECONDARY DETAILS (Stall or Category) */}
          <div className="w-full flex justify-between items-end border-t border-slate-100 pt-3">
            <div className="text-left">
               <p className="text-[9px] font-bold text-slate-400 uppercase">Company / Firm</p>
               <p className="text-xs font-bold text-[#0b3d41] uppercase">{role === 'exhibitor' ? profile?.category : (profile?.company_name || 'Individual')}</p>
            </div>
            {role === 'exhibitor' && profile?.stall_number && (
              <div className="bg-[#0b3d41] text-white px-3 py-1 rounded-lg text-right">
                <p className="text-[8px] opacity-70 uppercase font-bold">Stall</p>
                <p className="text-lg font-black leading-none">{profile.stall_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* INFO STRIP (Dark Teal) */}
        <div className="bg-[#0b3d41] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-[8px] opacity-60 uppercase font-bold">Date</p>
            <p className="text-[10px] font-black uppercase">12-14 Aug 2026</p>
          </div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="text-right">
            <p className="text-[8px] opacity-60 uppercase font-bold">Location</p>
            <p className="text-[10px] font-black uppercase">GMDC Ground, Ahmedabad</p>
          </div>
        </div>

        {/* ORGANIZER FOOTER */}
        <div className="p-4 flex items-center justify-center gap-3 bg-white">
           <img src="/organizer-logo.png" alt="Organizer" className="h-8 w-auto grayscale opacity-50" />
           <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight border-l pl-3 border-slate-200">
              Organized by <br/> Shree Balaji Event LLP
           </p>
        </div>
      </div>

      {/* DOWNLOAD ACTIONS */}
      <div className="mt-6 w-full max-w-[320px] space-y-3">
        <Button onClick={downloadBadge} className="w-full h-14 rounded-2xl bg-[#ef6c33] text-white font-black uppercase tracking-widest shadow-lg hover:bg-[#d45a27] transition-all">
          Download Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-slate-400 font-bold uppercase text-[10px]">
          Skip to Dashboard
        </Button>
      </div>
    </div>
  )
}
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
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setVisitor(data)
      setLoading(false)
    }
    getProfile()
  }, [router])

  const downloadBadge = async () => {
    if (badgeRef.current === null) return
    try {
      const dataUrl = await toPng(badgeRef.current, { 
        cacheBust: true,
        backgroundColor: '#0f172a', // Navy Blue Background for the export
      })
      const link = document.createElement('a')
      link.download = `GGE2026-Pass-${visitor?.full_name || 'Visitor'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400">Generating Pass...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 pt-10 pb-20">
      
      {/* THE BADGE AREA - NAVY BLUE THEME */}
      <div ref={badgeRef} className="w-full max-w-sm bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-slate-900 text-white">
        
        {/* HEADER: Event Logo */}
        <div className="p-8 flex flex-col items-center border-b border-white/10">
          <img 
            src="/event-logo.png" 
            alt="Guj Gift Expo 2026" 
            className="h-20 w-auto object-contain mb-4" 
          />
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Entry Pass</h1>
          <p className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase mt-2">Guj Gift Expo 2026</p>
        </div>

        {/* QR & User Details - Navy Background with White Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="p-4 border-4 border-white/10 rounded-[2rem] bg-white mb-6">
            {visitor && <QRCode value={visitor.id} size={180} level="H" />}
          </div>

          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight">
            {visitor?.full_name || "Visitor"}
          </h2>
          <p className="text-blue-400 font-bold uppercase text-sm mt-1">
            {visitor?.company_name || "Delegate"}
          </p>

          {/* Venue & Date: August Schedule */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full space-y-1">
            <p className="text-xs font-black uppercase tracking-wider">📅 12th Aug - 14th Aug, 2026</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">📍 GMDC University Ground, Ahmedabad</p>
          </div>
        </div>

        {/* FOOTER: Organizer Section */}
        <div className="bg-white/5 p-8 flex flex-col items-center">
          <p className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Organized by:</p>
          <img 
            src="/organizer-logo.png" 
            alt="Shree Balaji Event LLP" 
            className="h-14 w-auto object-contain brightness-0 invert opacity-90" 
          />
          <p className="text-[9px] font-bold text-slate-500 uppercase mt-3">Shree Balaji Event LLP, Ahmedabad</p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
        <Button onClick={downloadBadge} className="w-full py-8 rounded-3xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-xl transition-all">
          ⬇️ Download Digital Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full py-4 font-black uppercase text-slate-500 text-xs">
          Back to Hub
        </Button>
      </div>
    </div>
  )
}
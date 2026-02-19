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
        backgroundColor: '#ffffff',
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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 pt-6 pb-20">
      
      {/* COMPACT WHITE THEME BADGE */}
      <div ref={badgeRef} className="w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* HEADER: Event Logo & Title */}
        <div className="pt-6 pb-4 flex flex-col items-center border-b border-slate-100">
          <img 
            src="/event-logo.png" 
            alt="Guj Gift Expo 2026" 
            className="h-16 w-auto object-contain mb-2" 
          />
          <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Entry Pass</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-1">Guj Gift Expo 2026</p>
        </div>

        {/* QR & User Details (Tightened Spacing) */}
        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div className="p-3 border-2 border-slate-50 rounded-2xl bg-white mb-4 shadow-sm">
            {visitor && <QRCode value={visitor.id} size={150} level="H" />}
          </div>

          <h2 className="text-2xl font-black uppercase text-slate-900 leading-tight">
            {visitor?.full_name || "Visitor"}
          </h2>
          <p className="text-blue-600 font-bold uppercase text-xs mt-1">
            {visitor?.company_name || "Delegate"}
          </p>

          {/* Venue & Date: August Schedule */}
          <div className="mt-4 pt-4 border-t border-slate-100 w-full">
            <p className="text-[10px] font-black text-slate-800 uppercase">📅 12th Aug - 14th Aug, 2026</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">📍 GMDC University Ground, Ahmedabad</p>
          </div>
        </div>

        {/* COMPACT FOOTER: Organizer Section */}
        <div className="bg-slate-50 py-4 px-6 flex flex-col items-center border-t border-dashed border-slate-200">
          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Organized by:</p>
          <img 
            src="/organizer-logo.png" 
            alt="Shree Balaji Event LLP" 
            className="h-10 w-auto object-contain" 
          />
          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1.5">Shree Balaji Event LLP, Ahmedabad</p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-6 flex flex-col gap-2 w-full max-w-[340px]">
        <Button onClick={downloadBadge} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg transition-all">
          ⬇️ Download Pass
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full py-2 font-black uppercase text-slate-400 text-[10px]">
          Back to Hub
        </Button>
      </div>
    </div>
  )
}
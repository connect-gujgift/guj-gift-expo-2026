'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { toPng } from 'html-to-image' // Helper to save as image

export default function VisitorBadge() {
  const router = useRouter()
  const badgeRef = useRef<HTMLDivElement>(null)
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
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

  const downloadBadge = async () => {
    if (badgeRef.current === null) return
    
    try {
      const dataUrl = await toPng(badgeRef.current, { cacheBust: true })
      const link = document.createElement('a')
      link.download = `GGE2026-Pass-${visitor?.full_name || 'Visitor'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed', err)
      alert("Please take a screenshot instead.")
    }
  }

  if (loading) return <div className="p-20 text-center font-black">GENERATING PASS...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 pt-10 pb-20">
      
      {/* WRAPPER FOR IMAGE CAPTURE */}
      <div ref={badgeRef} className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-slate-900">
        
        {/* BRANDING */}
        <div className="bg-slate-900 p-8 text-center text-white">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Entry Pass</h1>
          <p className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase mt-1">Guj Gift Expo 2026</p>
        </div>

        {/* QR CODE & DETAILS */}
        <div className="p-10 flex flex-col items-center bg-white">
          <div className="p-4 border-4 border-slate-50 rounded-3xl bg-white mb-6">
            {visitor && (
              <QRCode value={visitor.id} size={180} level="H" />
            )}
          </div>

          <h2 className="text-2xl font-black uppercase text-slate-900 text-center leading-tight">
            {visitor?.full_name || "Guest Visitor"}
          </h2>
          <p className="text-blue-600 font-bold uppercase text-sm mt-1">
            {visitor?.company_name || "Official Delegate"}
          </p>
        </div>

        {/* FOOTER OF BADGE */}
        <div className="bg-slate-50 p-6 border-t-2 border-dashed border-slate-200 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed">
            Organized by: <br/> Shree Balaji Event LLP
          </p>
        </div>
      </div>

      {/* BUTTONS (Hidden in the downloaded image) */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
        <Button 
          onClick={downloadBadge} 
          className="w-full py-7 rounded-2xl font-black uppercase tracking-widest bg-blue-600 shadow-lg active:scale-95 transition-transform"
        >
          ⬇️ Download Pass (Image)
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')} 
          className="w-full py-4 font-black uppercase text-slate-400 text-xs"
        >
          Skip to Dashboard
        </Button>
      </div>
    </div>
  )
}
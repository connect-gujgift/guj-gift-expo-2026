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
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase.from('visitors').select('*').eq('id', user.id).single()
      if (data) setVisitor(data)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const downloadBadge = async () => {
    if (badgeRef.current === null) return
    const dataUrl = await toPng(badgeRef.current, { cacheBust: true })
    const link = document.createElement('a')
    link.download = `GGE-Badge.png`
    link.href = dataUrl
    link.click()
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">CREATING YOUR PASS...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 pt-32 pb-20">
      {/* THE PASS */}
      <div ref={badgeRef} className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-slate-900">
        <div className="bg-slate-900 p-8 text-center text-white">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Entry Pass</h1>
          <p className="text-[10px] font-bold text-blue-400 uppercase mt-1 tracking-widest">Guj Gift Expo 2026</p>
        </div>
        
        <div className="p-10 flex flex-col items-center bg-white">
          <div className="p-4 border-4 border-slate-50 rounded-3xl mb-6">
            {visitor && <QRCode value={visitor.id} size={180} level="H" />}
          </div>
          <h2 className="text-2xl font-black uppercase text-slate-900 text-center">{visitor?.full_name}</h2>
          <p className="text-blue-600 font-bold uppercase text-sm mt-1">{visitor?.company_name}</p>
        </div>
      </div>

      <div className="mt-8 w-full max-w-sm flex flex-col gap-3">
        <Button onClick={downloadBadge} className="w-full py-7 rounded-2xl font-black bg-blue-600">⬇️ Download Pass</Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full font-bold text-slate-400">Back to Dashboard</Button>
      </div>
    </div>
  )
}
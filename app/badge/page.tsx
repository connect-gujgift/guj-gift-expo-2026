'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"

export default function VisitorBadge() {
  const router = useRouter()
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // Fetch from visitors table
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setVisitor(data)
    setLoading(false)
  }

  if (loading) return <div className="p-20 text-center font-black">GENERATING PASS...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 pt-10 pb-20">
      
      {/* THE DIGITAL BADGE */}
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-900">
        
        {/* TOP SECTION: Branding */}
        <div className="bg-slate-900 p-8 text-center text-white">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Visitor Pass</h1>
          <p className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase mt-1">Guj Gift Expo 2026</p>
        </div>

        {/* MIDDLE SECTION: QR CODE */}
        <div className="p-10 flex flex-col items-center bg-white">
          <div className="p-4 border-4 border-slate-50 rounded-3xl bg-white mb-6">
            {visitor ? (
              <QRCode 
                value={visitor.id} 
                size={180} 
                level="H" // High error correction for fast scanning
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse rounded-xl" />
            )}
          </div>

          <h2 className="text-2xl font-black uppercase text-slate-900 text-center leading-tight">
            {visitor?.full_name || "Guest Visitor"}
          </h2>
          <p className="text-blue-600 font-bold uppercase text-sm mt-1">
            {visitor?.company_name || "Official Delegate"}
          </p>
        </div>

        {/* BOTTOM SECTION: Instructions */}
        <div className="bg-slate-50 p-6 border-t-2 border-dashed border-slate-200 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed">
            Please show this QR code at the <br/> 
            entry gate for verification.
          </p>
          <p className="text-[9px] font-bold text-red-500 uppercase mt-4 animate-pulse">
            📸 Take a Screenshot Now
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
        <Button onClick={() => router.push('/dashboard')} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest bg-slate-900">
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => window.print()} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest border-2">
          Save as PDF
        </Button>
      </div>
    </div>
  )
}
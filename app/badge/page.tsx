'use client'

import { useEffect, useState, Suspense } from 'react' // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"

// 1. Create a component for the actual badge content
function BadgeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const badgeId = searchParams.get('id')
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyAndFetchBadge = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      if (badgeId !== user.id) {
        setError("Access Denied: You can only view your own official badge.")
        setLoading(false)
        return
      }

      const { data, error: dbError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (dbError || !data) {
        setError("Profile not found.")
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    verifyAndFetchBadge()
  }, [badgeId, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black uppercase text-[10px] tracking-widest text-slate-400">Verifying Identity...</div>

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-2xl">✕</div>
      <p className="font-black uppercase text-xs tracking-widest text-slate-800">{error}</p>
      <Button onClick={() => router.push('/dashboard')} className="mt-6 bg-[#0b3d41] uppercase font-bold text-[10px]">Return to Hub</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-8 border-white">
        <div className="bg-[#0b3d41] p-8 text-center text-white">
           <img src="/event-logo.png" alt="Logo" className="h-14 mx-auto mb-4" />
           <div className="inline-block bg-[#ef6c33] px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Official Exhibitor</div>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
           <div className="p-3 border-4 border-[#0b3d41] rounded-3xl">
             <QRCode value={profile.id} size={150} level="H" />
           </div>

           <div className="text-center">
             <h1 className="text-3xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none">{profile.full_name}</h1>
             <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest mt-2">{profile.company_name}</p>
           </div>

           <div className="w-full pt-6 border-t border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Stall Number</p>
                <p className="text-xl font-black text-[#0b3d41] uppercase italic">{profile.stall_number || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Event City</p>
                <p className="text-sm font-black text-[#0b3d41] uppercase">Ahmedabad</p>
              </div>
           </div>
        </div>

        <div className="bg-slate-50 p-4 text-center">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Organized by Shree Balaji Event LLP</p>
        </div>
      </div>

      <Button onClick={() => window.print()} className="mt-8 bg-[#ef6c33] hover:bg-[#d45a27] font-black uppercase tracking-widest h-14 w-full max-w-[380px] rounded-2xl shadow-xl">
        ⎙ Print Official Pass
      </Button>
    </div>
  )
}

// 2. The main page component that wraps the content in Suspense
export default function SecureExhibitorBadgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase text-[10px] tracking-widest text-slate-400">Loading System...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
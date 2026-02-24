'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function StaffContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewBadgeId = searchParams.get('id')
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(!!viewBadgeId)

  useEffect(() => {
    const verifyStaff = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase.from('exhibitors').select('*').eq('id', user.id).single()

      if (!profile?.is_staff && user.email !== 'maulikshah.13@gmail.com') {
        setError("Access Denied")
      } else {
        if (viewBadgeId && viewBadgeId !== user.id) {
          setError("Unauthorized Badge Access")
        } else {
          setProfile(profile)
        }
      }
      setLoading(false)
    }
    verifyStaff()
  }, [viewBadgeId, router])

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-white text-[10px]">Verifying...</div>

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-white font-black uppercase text-xs mb-6">{error}</p>
      <Button onClick={() => { setShowPass(false); router.push('/staff') }} className="bg-blue-600 font-black uppercase text-[10px] px-8 rounded-full">Return Hub</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {!showPass ? (
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-3xl font-black uppercase italic text-white text-center">Staff Hub</h1>
          <Card className="bg-blue-600 text-white rounded-[2rem] p-8 cursor-pointer shadow-xl" onClick={() => { setShowPass(true); router.push(`/staff?id=${profile.id}`) }}>
            <h2 className="text-2xl font-black uppercase italic">View Staff Pass</h2>
            <p className="text-[10px] font-bold uppercase mt-2 opacity-80">Official Management Badge</p>
          </Card>
          <div className="grid grid-cols-2 gap-3">
             <Button onClick={() => router.push('/admin/registration-desk')} className="bg-slate-800 h-16 rounded-2xl font-black uppercase text-[10px] text-white">Reg Desk</Button>
             <Button onClick={() => router.push('/admin/stalls')} className="bg-slate-800 h-16 rounded-2xl font-black uppercase text-[10px] text-white">Stall Map</Button>
          </div>
          <Button variant="ghost" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full text-slate-500 font-bold uppercase text-[10px] mt-10">Logout</Button>
        </div>
      ) : (
        <div className="w-full max-w-[380px] flex flex-col items-center gap-4">
          <Button variant="ghost" onClick={() => { setShowPass(false); router.push('/staff') }} className="self-start text-slate-400 font-bold text-[10px] uppercase">← Hub</Button>
          <div className="w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 text-center"><img src="/event-logo.png" className="h-12 mx-auto" /></div>
            <div className="p-8 flex flex-col items-center gap-6">
              <div className="p-3 border-4 border-blue-600 rounded-3xl"><QRCode value={profile.id} size={150} /></div>
              <h1 className="text-3xl font-black uppercase italic text-blue-900">{profile.full_name}</h1>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StaffPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>}>
      <StaffContent />
    </Suspense>
  )
}
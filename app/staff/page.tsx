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
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data } = await supabase.from('exhibitors').select('*').eq('id', user.id).eq('is_staff', true).single()
      if (!data || (viewBadgeId && viewBadgeId !== user.id)) setError("Access Denied")
      else setProfile(data)
      setLoading(false)
    }
    check()
  }, [viewBadgeId, router])

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-white text-[10px]">Verifying...</div>

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* ... Hub or Badge rendering logic from previous code ... */}
    </div>
  )
}

export default function StaffPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center uppercase font-black text-xs">Loading Staff System...</div>}>
      <StaffContent />
    </Suspense>
  )
}
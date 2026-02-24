'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExhibitorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get the current logged-in user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      // 2. Fetch the profile details
      const { data, error: dbError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!dbError && data) {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  if (loading) return <div className="p-10 text-center font-black uppercase text-xs">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* WELCOME CARD */}
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-[#0b3d41] text-white">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Welcome, {profile?.full_name}</h1>
            <p className="text-[10px] font-bold uppercase text-teal-300 tracking-widest mt-2">{profile?.company_name}</p>
          </CardContent>
        </Card>

        {/* SECURE BADGE BUTTON */}
        <Card 
          className="border-0 shadow-md bg-white rounded-[2rem] p-6 cursor-pointer active:scale-95 transition-all"
          onClick={() => {
            // CRUCIAL: Pass the profile.id to match the security check
            router.push(`/badge?id=${profile.id}`)
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase italic text-[#0b3d41]">Exhibitor Pass</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Entry Badge</p>
            </div>
            <div className="text-3xl">🎫</div>
          </div>
        </Card>

        {/* OTHER ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
           <Button onClick={() => router.push('/exhibitor/leads')} className="bg-[#ef6c33] h-16 rounded-2xl font-black uppercase text-[10px] text-white">View Leads</Button>
           <Button onClick={() => router.push('/exhibitor/scanner')} className="bg-blue-600 h-16 rounded-2xl font-black uppercase text-[10px] text-white">Scan Visitor</Button>
        </div>

        <Button variant="ghost" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full text-slate-400 font-bold uppercase text-[10px] mt-10">Logout</Button>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminHubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'maulikshah.13@gmail.com') {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [router])

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Verifying Credentials...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans pb-20">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <img src="/event-logo.png" alt="GGE 2026" className="h-24 mx-auto mb-6 object-contain" />
          <h1 className="text-4xl font-black uppercase text-[#0b3d41] italic tracking-tighter">Super Admin Hub</h1>
          <p className="text-[11px] font-bold uppercase text-[#ef6c33] tracking-widest mt-2">Guj Gift Expo 2026 Command Center</p>
        </div>

        {/* NAVIGATION DASHBOARD */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* REGISTRATION DESK */}
          <Card 
            onClick={() => router.push('/admin/registration-desk')} 
            className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border-0 shadow-md rounded-[2.5rem] bg-white overflow-hidden group"
          >
            <div className="h-2 bg-blue-600 w-full"></div>
            <CardContent className="p-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">👥</div>
              <h2 className="text-2xl font-black uppercase text-[#0b3d41] tracking-tight">Reg Desk</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Live Visitor Check-in</p>
            </CardContent>
          </Card>

          {/* STALL REGISTRY */}
          <Card 
            onClick={() => router.push('/admin/stalls')} 
            className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border-0 shadow-md rounded-[2.5rem] bg-white overflow-hidden group"
          >
            <div className="h-2 bg-teal-600 w-full"></div>
            <CardContent className="p-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">🎪</div>
              <h2 className="text-2xl font-black uppercase text-[#0b3d41] tracking-tight">Stall Registry</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Manage Exhibitors</p>
            </CardContent>
          </Card>

        </div>

        {/* LOGOUT */}
        <div className="flex justify-center mt-12">
          <Button 
            variant="ghost" 
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="text-slate-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest"
          >
            Secure Logout
          </Button>
        </div>

      </div>
    </div>
  )
}
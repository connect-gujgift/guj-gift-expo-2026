'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Dashboard() {
  const router = useRouter()
  
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)

  // --- INITIALIZATION ---
  useEffect(() => { 
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      // Check for Exhibitor Role
      const { data: exhibitor } = await supabase.from('exhibitors').select('*').eq('id', user.id).single()
      
      if (exhibitor) {
        setRole('exhibitor')
      } else {
        setRole('visitor')
      }
      setLoading(false)
    }

    checkUser() 
  }, [router])

  if (loading) return <div className="p-12 text-center font-black uppercase text-slate-400 text-xs tracking-widest">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      
      {/* HEADER WITH LOGOUT */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-[#0b3d41]">
            {role === 'exhibitor' ? 'Exhibitor Hub' : 'Visitor Hub'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live System</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold border-2 text-xs bg-white text-slate-500 rounded-xl hover:bg-slate-100">LOGOUT</Button>
        </div>
      </div>

      {/* --- UNIVERSAL BADGE CARD --- */}
      <Card 
        className="border-0 shadow-xl bg-[#0b3d41] text-white mb-4 active:scale-95 transition-all cursor-pointer overflow-hidden relative rounded-[2rem]" 
        onClick={() => router.push('/badge')}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="z-10">
            <h2 className="text-xl font-black uppercase italic leading-none">
              {role === 'exhibitor' ? 'Exhibitor Pass' : 'My Entry Pass'}
            </h2>
            <p className="text-[10px] font-bold uppercase text-teal-300 mt-2 tracking-widest">View & Download QR Badge</p>
          </div>
          <div className="text-4xl opacity-40">🎫</div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
        </CardContent>
      </Card>

      {/* --- EXHIBITOR QUICK ACTIONS --- */}
      {role === 'exhibitor' && (
        <div className="flex gap-3 mb-4">
            <Button 
                onClick={() => router.push('/exhibitors/scanner')}
                className="flex-1 bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white text-[10px] flex gap-2 items-center justify-center"
            >
                <span className="text-lg">📷</span> Scan Lead
            </Button>
            
            <Button 
                onClick={() => router.push('/exhibitors/leads')}
                className="flex-1 bg-white hover:bg-slate-50 text-[#0b3d41] border-2 border-slate-200 h-14 font-black uppercase tracking-widest rounded-2xl shadow-sm transition-all text-[10px] flex gap-2 items-center justify-center"
            >
                <span className="text-lg">📊</span> View Leads
            </Button>
        </div>
      )}

      {/* --- VISITOR QUICK ACTIONS --- */}
      {role === 'visitor' && (
        <div className="flex gap-3 mb-4">
            <Button 
                onClick={() => router.push('/visitor/scanner')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 transition-all text-white text-[10px] flex gap-2 items-center justify-center"
            >
                <span className="text-lg">📷</span> Scan Exhibitor
            </Button>
            
            <Button 
                onClick={() => router.push('/visitor/connections')}
                className="flex-1 bg-white hover:bg-slate-50 text-blue-600 border-2 border-slate-200 h-14 font-black uppercase tracking-widest rounded-2xl shadow-sm transition-all text-[10px] flex gap-2 items-center justify-center"
            >
                <span className="text-lg">📋</span> Saved Stalls
            </Button>
        </div>
      )}

    </div>
  )
}
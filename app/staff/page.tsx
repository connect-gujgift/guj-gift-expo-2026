'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { QRCodeSVG } from 'qrcode.react' // Switched to the modern SVG library
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

      const { data: profileData } = await supabase.from('exhibitors').select('*').eq('email', user.email).single()

      // ALLOWED ADMIN EMAILS
      const allowedAdmins = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']

      // Check if they are actually staff or an admin
      if (!profileData?.is_staff && !allowedAdmins.includes(user.email || '')) {
        setError("Access Denied: You do not have active staff credentials.")
      } else {
        // Use database profile, or fallback to Admin profile for the UI
        setProfile(profileData || { 
          id: user.id, 
          full_name: 'Super Admin', 
          company_name: 'Shree Balaji Events', 
          designation: 'Event Command' 
        })
      }
      setLoading(false)
    }
    verifyStaff()
  }, [viewBadgeId, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-amber-500 tracking-widest uppercase text-[10px] animate-pulse">Verifying Credentials...</div>

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="text-red-500 text-6xl">🚫</div>
      <p className="text-white font-black uppercase text-sm tracking-widest leading-relaxed max-w-xs">{error}</p>
      <Button onClick={handleLogout} className="bg-amber-500 hover:bg-amber-600 font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl text-slate-900 shadow-lg">
        Sign Out & Re-Login
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {!showPass ? (
        /* VIEW 1: STAFF HUB */
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">Team Hub</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Hello, {profile?.full_name}</p>
          </div>

          <Card 
            className="bg-amber-500 border-0 text-slate-900 rounded-[2rem] p-8 cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 group relative overflow-hidden" 
            onClick={() => { setShowPass(true); }}
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight leading-none">View Pass</h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-80 italic">Open QR Code for Entry</p>
              </div>
              <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                🎟️
              </div>
            </div>
          </Card>

          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-center">Resources</p>
            <div className="grid grid-cols-2 gap-4">
               <Button onClick={() => router.push('/floor-plan')} className="bg-slate-800 hover:bg-slate-700 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white border border-slate-700 shadow-lg">
                 Live Map
               </Button>
               <Button onClick={() => window.location.href='tel:+910000000000'} className="bg-slate-800 hover:bg-slate-700 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white border border-slate-700 shadow-lg">
                 Help Desk
               </Button>
            </div>
          </div>

          <Button variant="ghost" onClick={handleLogout} className="w-full text-slate-500 hover:text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl mt-6">
            Log Out Securely
          </Button>

        </div>
      ) : (
        /* VIEW 2: THE DIGITAL STAFF BADGE */
        <div className="w-full max-w-[380px] flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
          
          <Button variant="ghost" onClick={() => { setShowPass(false); }} className="self-start text-slate-500 hover:text-white font-black tracking-widest text-[10px] uppercase">
            ← Back to Hub
          </Button>
          
          <div className="w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-950 relative">
            
            {/* Header */}
            <div className="bg-slate-900 p-8 text-center border-b-4 border-amber-500">
              <img src="/event-logo.png" className="h-16 mx-auto" alt="Logo" />
              <div className="mt-4 inline-block bg-amber-500 text-slate-950 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Official Staff Pass
              </div>
            </div>
            
            {/* QR Content */}
            <div className="p-10 flex flex-col items-center text-center">
              
              <div className="p-4 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm mb-8">
                <QRCodeSVG 
                  value={`GGE2026-STAFF-${profile?.id}`} 
                  size={180} 
                  level="H" 
                  fgColor="#0f172a" 
                />
              </div>
              
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-2">
                {profile?.full_name}
              </h1>
              
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-widest text-amber-600">
                  {profile?.company_name}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Role: {profile?.designation || 'Event Team'}
                </p>
              </div>

            </div>

            {/* Event Footer */}
            <div className="bg-slate-50 border-t border-slate-100 py-4 text-center">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scan at Security Point 1 & 2</p>
            </div>
            <div className="h-3 w-full bg-amber-500"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StaffPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-amber-500 uppercase tracking-widest text-[10px]">Loading Hub...</div>}>
      <StaffContent />
    </Suspense>
  )
}
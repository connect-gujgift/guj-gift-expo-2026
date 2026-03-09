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

      // Allow access if they are flagged as staff OR if they are the Super Admin
      if (!profile?.is_staff && user.email !== 'maulikshah.13@gmail.com') {
        setError("Access Denied: You do not have active staff credentials.")
      } else {
        if (viewBadgeId && viewBadgeId !== user.id) {
          setError("Unauthorized Badge Access")
        } else {
          // If Super Admin doesn't have a profile in the table, create a temporary one for the UI
          setProfile(profile || { 
            id: user.id, 
            full_name: 'Super Admin', 
            company_name: 'Event Command', 
            designation: 'Director' 
          })
        }
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
      <p className="text-white font-black uppercase text-sm tracking-widest">{error}</p>
      <Button onClick={() => { setShowPass(false); router.push('/login') }} className="bg-amber-500 hover:bg-amber-600 font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl text-slate-900">
        Return to Login
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* ------------------------------------------------------------------------- */}
      {/* VIEW 1: STAFF COMMAND HUB */}
      {/* ------------------------------------------------------------------------- */}
      {!showPass ? (
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Team Portal</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Welcome, {profile.full_name}</p>
          </div>

          {/* Digital Pass Card */}
          <Card 
            className="bg-amber-500 border-0 text-slate-900 rounded-[2rem] p-8 cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform active:scale-95" 
            onClick={() => { setShowPass(true); router.push(`/staff?id=${profile.id}`) }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Digital ID</h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Official Access Badge</p>
              </div>
              <div className="w-12 h-12 bg-slate-900 text-amber-500 rounded-full flex items-center justify-center text-xl shadow-inner">
                📱
              </div>
            </div>
          </Card>

          {/* Quick Tools */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Operational Tools</p>
            <div className="grid grid-cols-2 gap-3">
               <Button onClick={() => router.push('/admin/registration-desk')} className="bg-slate-800 hover:bg-slate-700 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-md border border-slate-700">
                 Reg Desk
               </Button>
               <Button onClick={() => router.push('/floor-plan')} className="bg-slate-800 hover:bg-slate-700 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-md border border-slate-700">
                 Live Map
               </Button>
            </div>
            {/* Show Admin Hub button only if they are the Super Admin */}
            {profile.full_name === 'Super Admin' && (
              <Button onClick={() => router.push('/admin')} className="w-full bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-md">
                Super Admin Hub
              </Button>
            )}
          </div>

          <Button variant="ghost" onClick={handleLogout} className="w-full text-slate-500 hover:text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl mt-4">
            Sign Out
          </Button>

        </div>
      ) : (

      /* ------------------------------------------------------------------------- */
      /* VIEW 2: THE DIGITAL STAFF BADGE */
      /* ------------------------------------------------------------------------- */
        <div className="w-full max-w-[380px] flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
          
          <Button variant="ghost" onClick={() => { setShowPass(false); router.push('/staff') }} className="self-start text-slate-400 hover:text-white font-black tracking-widest text-[10px] uppercase">
            ← Back to Hub
          </Button>
          
          <div className="w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 relative">
            
            {/* Badge Header */}
            <div className="bg-slate-900 p-8 text-center border-b-4 border-amber-500 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
              <img src="/event-logo.png" className="h-14 mx-auto relative z-10" alt="GGE Logo" />
              <div className="mt-4 inline-block bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.4em] relative z-10">
                Official Staff
              </div>
            </div>
            
            {/* Badge Content */}
            <div className="p-8 flex flex-col items-center text-center">
              
              {/* QR Code Container */}
              <div className="p-4 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm mb-6 relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-[2.2rem] opacity-20 blur-sm"></div>
                <QRCode value={profile.id} size={160} className="relative z-10" />
              </div>
              
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                {profile.full_name}
              </h1>
              
              <div className="mt-4 space-y-1">
                <p className="text-sm font-black uppercase tracking-widest text-amber-600">
                  {profile.designation || 'Event Team'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {profile.company_name || 'Guj Gift Expo 2026'}
                </p>
              </div>

            </div>

            {/* Bottom Color Bar */}
            <div className="h-3 w-full bg-amber-500"></div>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 text-center px-8">
            Present this QR code at any security checkpoint for scanning.
          </p>

        </div>
      )}
    </div>
  )
}

export default function StaffPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-amber-500 uppercase tracking-widest text-[10px]">Loading Portal...</div>}>
      <StaffContent />
    </Suspense>
  )
}
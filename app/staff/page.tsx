'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StaffPortalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewBadgeId = searchParams.get('id') // Check if URL is asking for a badge view
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(!!viewBadgeId)

  useEffect(() => {
    const verifyStaff = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      // SECURITY: Fetch the profile and ensure it is a STAFF account
      const { data, error: dbError } = await supabase
        .from('exhibitors') 
        .select('*')
        .eq('id', user.id)
        .eq('is_staff', true)
        .single()

      if (dbError || !data) {
        setError("Staff access denied or record not found.")
      } else {
        // IDENTITY LOCK: If they are trying to view a badge, it MUST be their own
        if (viewBadgeId && viewBadgeId !== user.id) {
          setError("Unauthorized: You cannot view this badge.")
        } else {
          setProfile(data)
        }
      }
      setLoading(false)
    }

    verifyStaff()
  }, [viewBadgeId, router])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-slate-500 uppercase text-[10px] tracking-widest">
      Verifying Staff Credentials...
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">✕</div>
      <p className="font-black uppercase text-sm tracking-widest text-white leading-relaxed">{error}</p>
      <Button onClick={() => { setShowPass(false); router.push('/staff'); }} className="mt-8 bg-blue-600 uppercase font-black text-[10px] px-8 rounded-full">Return to Hub</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      
      {!showPass ? (
        // --- STAFF HUB DASHBOARD ---
        <div className="w-full max-w-md flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">Staff Hub</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Guj Gift Expo 2026 • Management</p>
          </div>

          <Card className="border-0 shadow-xl bg-blue-600 text-white active:scale-95 transition-all cursor-pointer overflow-hidden relative rounded-[2.5rem]" 
                onClick={() => { setShowPass(true); router.push(`/staff?id=${profile.id}`); }}>
            <CardContent className="p-8 flex items-center justify-between">
              <div className="z-10 text-left">
                <h2 className="text-2xl font-black uppercase italic leading-none">Official Badge</h2>
                <p className="text-[10px] font-bold uppercase text-blue-100 mt-2 tracking-widest">View & Print Staff Pass</p>
              </div>
              <div className="text-5xl opacity-30">🆔</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
             <Button onClick={() => router.push('/admin/registration-desk')} className="bg-slate-800 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700">Reg Desk 🖨️</Button>
             <Button onClick={() => router.push('/admin/stalls')} className="bg-slate-800 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700">Stall Map 🎪</Button>
          </div>

          <Button variant="ghost" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-red-500 mt-10">
            ← Logout Securely
          </Button>
        </div>
      ) : (
        // --- SECURE STAFF BADGE VIEW ---
        <div className="w-full max-w-[380px] flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="w-full flex justify-start mb-4">
             <Button variant="ghost" onClick={() => { setShowPass(false); router.push('/staff'); }} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-white bg-white/5 rounded-full px-4 py-1">
               ← Back to Hub
             </Button>
          </div>

          <div className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border-8 border-slate-800">
            <div className="bg-blue-600 p-8 text-center text-white relative">
               <img src="/event-logo.png" alt="Logo" className="h-12 mx-auto mb-4 grayscale brightness-200" />
               <div className="inline-block bg-white text-blue-600 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Organizing Team</div>
            </div>

            <div className="p-8 flex flex-col items-center gap-8">
               <div className="p-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-blue-200">
                 <QRCode value={profile.id} size={160} level="H" fgColor="#1e3a8a" />
               </div>

               <div className="text-center">
                 <h1 className="text-3xl font-black uppercase text-blue-900 italic tracking-tighter leading-none">{profile.full_name}</h1>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 border-t pt-2 border-slate-100">
                    {profile.company_name}
                 </p>
               </div>
            </div>

            <div className="bg-blue-900 p-5 flex justify-between items-center text-white">
               <div className="text-left">
                  <p className="text-[7px] font-bold uppercase tracking-widest text-blue-300 opacity-60">Role</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">Management</p>
               </div>
               <div className="text-right">
                  <p className="text-[7px] font-bold uppercase tracking-widest text-blue-300 opacity-60">Venue</p>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Ahmedabad</p>
               </div>
            </div>
          </div>

          <Button onClick={() => window.print()} className="mt-8 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest h-14 w-full rounded-2xl shadow-xl text-white">
            ⎙ Print Staff Pass
          </Button>
        </div>
      )}
    </div>
  )
}
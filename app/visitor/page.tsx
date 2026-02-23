'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import QRCode from "react-qr-code"

export default function VisitorPortal() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState('')
  const [visitorPass, setVisitorPass] = useState<any>(null)
  const [showPass, setShowPass] = useState(false)

  // 1. SESSION INITIALIZATION WITH 24-HOUR TIMEOUT
  useEffect(() => {
    const activeVisitor = localStorage.getItem('activeVisitor')
    const loginTimestamp = localStorage.getItem('visitorLoginTime')

    if (activeVisitor && loginTimestamp) {
      const now = new Date().getTime()
      const oneDay = 24 * 60 * 60 * 1000 // 24 hours in ms

      // If session is older than 24 hours, clear it automatically
      if (now - parseInt(loginTimestamp) > oneDay) {
        localStorage.removeItem('activeVisitor')
        localStorage.removeItem('visitorLoginTime')
        setVisitorPass(null)
      } else {
        try {
          setVisitorPass(JSON.parse(activeVisitor))
        } catch (e) {
          localStorage.removeItem('activeVisitor')
        }
      }
    }
    setIsInitializing(false)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Clean phone number input
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '')

    const { data, error } = await supabase.from('visitors').select('*').eq('phone', cleanPhone).single()
    
    if (error || !data) {
      setError('No pass found for this number. Please register at the desk.')
    } else {
      setVisitorPass(data)
      // Save session with timestamp for security
      localStorage.setItem('activeVisitor', JSON.stringify(data))
      localStorage.setItem('visitorLoginTime', new Date().getTime().toString())
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('activeVisitor')
    localStorage.removeItem('visitorLoginTime')
    setVisitorPass(null)
    setPhone('')
    setShowPass(false)
  }

  if (isInitializing) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
      Verifying Access...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20">
      
      {!visitorPass ? (
        // --- VISITOR LOGIN VIEW ---
        <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]">
              ← Back to Hub
            </Button>
          </div>
          <Card className="border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
              <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
              <CardTitle className="text-xl font-black uppercase tracking-tight italic">Visitor Portal</CardTitle>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-70">Retrieve Digital Pass</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSearch} className="space-y-6">
                {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight rounded-r-xl">{error}</div>}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered Phone Number</Label>
                  <Input type="text" placeholder="Enter 10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-slate-50 border-0 h-12 font-medium text-center tracking-widest" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white">
                  {loading ? 'Searching...' : 'Access My Hub'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : !showPass ? (
        // --- VISITOR HUB DASHBOARD ---
        <div className="w-full max-w-md flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-[#0b3d41]">Visitor Hub</h1>
            <div className="flex justify-center items-center gap-2 mt-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Active</p>
            </div>
          </div>

          <Card 
            className="border-0 shadow-xl bg-[#0b3d41] text-white active:scale-95 transition-all cursor-pointer overflow-hidden relative rounded-[2rem]" 
            onClick={() => setShowPass(true)}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="z-10 text-left">
                <h2 className="text-xl font-black uppercase italic leading-none">My Entry Pass</h2>
                <p className="text-[10px] font-bold uppercase text-teal-300 mt-2 tracking-widest">View & Download QR Badge</p>
              </div>
              <div className="text-4xl opacity-40">🎫</div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
            </CardContent>
          </Card>

          <div className="flex gap-3 w-full mt-2">
              <Button 
                onClick={() => router.push('/visitor/scanner')} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 transition-all text-white text-[10px] flex gap-2 items-center justify-center"
              >
                  <span className="text-lg">📷</span> Scan Stall
              </Button>
              <Button 
                onClick={() => router.push('/visitor/connections')} 
                className="flex-1 bg-white hover:bg-slate-50 text-blue-600 border-2 border-slate-200 h-14 font-black uppercase tracking-widest rounded-2xl shadow-sm transition-all text-[10px] flex gap-2 items-center justify-center"
              >
                  <span className="text-lg">📋</span> Saved
              </Button>
          </div>

          <Button variant="ghost" onClick={handleLogout} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-500 mt-6 mx-auto w-fit">
            ← Logout Securely
          </Button>
        </div>
      ) : (
        // --- DIGITAL QR PASS VIEW ---
        <div className="w-full max-w-[350px] flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="w-full flex justify-start mb-4">
             <Button variant="ghost" onClick={() => setShowPass(false)} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-[#0b3d41] bg-white rounded-full px-4 py-1 shadow-sm">
               ← Back to Hub
             </Button>
          </div>
          <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white relative">
            <div className="bg-white pt-8 pb-3 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-16 object-contain" />
            </div>
            <div className="flex justify-center -mt-4 relative z-10">
              <div className="bg-[#ef6c33] text-white px-6 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-4 border-white shadow-sm">Valued Visitor</div>
            </div>
            <div className="px-6 pt-6 pb-6 bg-white flex-col flex gap-4 text-center items-center">
              <div className="p-2 border-[3px] border-[#ef6c33] rounded-2xl bg-white inline-block">
                <QRCode value={visitorPass.id} size={130} fgColor="#0b3d41" level="H" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter">{visitorPass.full_name}</h2>
                <p className="text-[10px] font-black text-[#ef6c33] uppercase tracking-widest mt-1">Visitor</p>
              </div>
              <div className="border-t border-slate-100 w-full pt-4">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Company / Firm</p>
                <p className="text-lg font-black text-[#0b3d41] uppercase leading-tight">{visitorPass.company_name || 'Individual'}</p>
              </div>
            </div>
            <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full text-center">
              <div className="w-1/2 pr-3 border-r border-teal-700/50">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                <p className="text-[9px] font-black uppercase tracking-widest">12-14 Aug 2026</p>
              </div>
              <div className="w-1/2 pl-4">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">GMDC GROUND, AHMEDABAD</p>
              </div>
            </div>
          </Card>
          <Button onClick={() => window.open(`/badge/print?id=${visitorPass.id}`, '_blank')} className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all text-white mt-4">
            ⎙ Save / Print Digital Pass
          </Button>
        </div>
      )}
    </div>
  )
}
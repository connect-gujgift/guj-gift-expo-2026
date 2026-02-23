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
  const [error, setError] = useState('')
  const [visitorPass, setVisitorPass] = useState<any>(null)

  // Auto-load pass if they already logged in recently on this device
  useEffect(() => {
    const activeVisitor = localStorage.getItem('activeVisitor')
    if (activeVisitor) {
      setVisitorPass(JSON.parse(activeVisitor))
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Clean the phone input just in case they added spaces or dashes
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '')

    const { data, error } = await supabase.from('visitors').select('*').eq('phone', cleanPhone).single()
    
    if (error || !data) {
      setError('No pass found for this number. Please register at the desk.')
    } else {
      setVisitorPass(data)
      // Save their session so the Scanner and Connections pages know who they are!
      localStorage.setItem('activeVisitor', JSON.stringify(data))
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('activeVisitor')
    setVisitorPass(null)
    setPhone('')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20">
      
      {!visitorPass && (
        <div className="w-full max-w-[400px] mb-6">
          <Button variant="ghost" onClick={() => router.push('/login')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]">← Back to Main Hub</Button>
        </div>
      )}

      {visitorPass && (
        <div className="w-full max-w-[400px] mb-6 flex justify-between items-center mt-4">
           <Button variant="ghost" onClick={handleLogout} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-500">
             ← Logout
           </Button>
           <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Visitor Hub</p>
        </div>
      )}

      {!visitorPass ? (
        <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white">
          <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
            <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
            <CardTitle className="text-xl font-black uppercase tracking-tight italic">Visitor Portal</CardTitle>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-70">Retrieve Digital Pass</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {error && <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">{error}</div>}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered Phone Number</Label>
                <Input type="text" placeholder="Enter 10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-slate-50 border-0 h-12 font-medium text-center tracking-widest" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white">
                {loading ? 'Searching...' : 'Find My Pass'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* VISITOR HUB (PASS + QUICK ACTIONS) */
        <div className="w-full max-w-[350px] flex flex-col items-center gap-4">
          
          <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white relative">
            <div className="bg-white pt-4 pb-3 flex justify-center mt-4">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-16 object-contain" />
            </div>

            <div className="flex justify-center -mt-4 relative z-10">
              <div className="bg-[#ef6c33] text-white px-6 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-4 border-white shadow-sm">Valued Visitor</div>
            </div>

            <div className="px-6 pt-4 pb-4 bg-white flex-col flex gap-4 text-center items-center">
              <div className="p-2 border-[3px] border-[#ef6c33] rounded-2xl bg-white inline-block">
                <QRCode value={visitorPass.id} size={110} fgColor="#0b3d41" level="H" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words">{visitorPass.full_name}</h2>
                <p className="text-[10px] font-black text-[#ef6c33] uppercase tracking-widest mt-1">Visitor</p>
              </div>
              <div className="border-t border-slate-100 w-full pt-3">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Company / Firm</p>
                <p className="text-base font-black text-[#0b3d41] uppercase leading-tight">{visitorPass.company_name || 'Individual'}</p>
              </div>
            </div>

            <div className="bg-[#0b3d41] text-white flex px-6 py-3 w-full">
              <div className="w-1/2 pr-3 border-r border-teal-700/50 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-0.5">Date</p>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">12-14 Aug 2026</p>
              </div>
              <div className="w-1/2 pl-4 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-0.5">Location</p>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">GMDC UNIVERSITY GROUND, AHMEDABAD</p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 flex flex-col items-center justify-center gap-1.5">
              <div className="text-center">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                <p className="text-[9px] font-black text-[#0b3d41] uppercase tracking-wide">Shree Balaji Event LLP</p>
              </div>
            </div>
          </Card>

          {/* NEW QUICK ACTIONS ROW */}
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
          
          <Button onClick={() => window.open(`/badge/print?id=${visitorPass.id}`, '_blank')} variant="ghost" className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 hover:text-[#0b3d41]">
             ⎙ Print Full Page Badge
          </Button>

        </div>
      )}
    </div>
  )
}
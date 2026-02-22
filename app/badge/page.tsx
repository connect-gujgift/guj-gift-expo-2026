'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function BadgeDisplay() {
  const searchParams = useSearchParams()
  const urlId = searchParams.get('id')
  const router = useRouter()
  
  const [person, setPerson] = useState<any>(null)
  const [role, setRole] = useState<string>('VISITOR')
  const [loading, setLoading] = useState(true)
  
  const [needsLookup, setNeedsLookup] = useState(false)
  const [phone, setPhone] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)

  useEffect(() => {
    if (urlId) {
      fetchPersonById(urlId)
    } else {
      setLoading(false)
      setNeedsLookup(true)
    }
  }, [urlId])

  const fetchPersonById = async (targetId: string) => {
    setLoading(true)
    
    let { data } = await supabase.from('visitors').select('*').eq('id', targetId).single()
    let userRole = 'VISITOR'

    if (!data) {
      const { data: exhibitorData } = await supabase.from('exhibitors').select('*').eq('id', targetId).single()
      if (exhibitorData) {
        data = exhibitorData
        userRole = exhibitorData.is_staff ? 'STAFF' : 'EXHIBITOR'
      }
    }

    if (data) {
      setPerson(data)
      setRole(userRole)
      setNeedsLookup(false)
    } else {
      setNeedsLookup(true)
    }
    setLoading(false)
  }

  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLookupLoading(true)
    setLookupError('')

    let { data } = await supabase.from('visitors').select('*').eq('phone', phone).single()
    let userRole = 'VISITOR'

    if (!data) {
      const { data: exhibitorData } = await supabase.from('exhibitors').select('*').eq('phone', phone).single()
      if (exhibitorData) {
        data = exhibitorData
        userRole = exhibitorData.is_staff ? 'STAFF' : 'EXHIBITOR'
      }
    }

    if (data) {
      setPerson(data)
      setRole(userRole)
      setNeedsLookup(false)
    } else {
      setLookupError('No pass found for this phone number.')
    }
    setLookupLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Digital Pass...</div>

  const stallNumber = person?.stall_number || person?.stall_no || person?.stall || person?.Stall || '';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20">
      
      <div className="w-full max-w-[320px] mb-4 flex justify-between items-center opacity-50">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-[10px] font-black tracking-widest uppercase p-0 hover:bg-transparent">
             ← Back
          </Button>
          <img src="/event-logo.png" alt="GGE 2026" className="h-6 object-contain grayscale" />
      </div>

      {needsLookup && !person ? (
        <Card className="w-full max-w-[320px] border-0 shadow-2xl overflow-hidden rounded-[1.5rem] bg-white">
          <CardHeader className="bg-[#0b3d41] text-white p-6 text-center">
            <img src="/event-logo.png" alt="GGE 2026" className="h-12 mx-auto mb-3 object-contain" />
            <CardTitle className="text-lg font-black uppercase tracking-tight italic">Find My Badge</CardTitle>
            <p className="text-[9px] font-bold text-teal-200 uppercase tracking-widest mt-1 opacity-80">Enter Phone Number to Continue</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handlePhoneLookup} className="space-y-5">
              {lookupError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">
                  {lookupError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Registered Phone Number</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. 9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-slate-50 border-0 h-10 font-medium text-center tracking-widest"
                />
              </div>

              <Button 
                type="submit" 
                disabled={lookupLoading}
                className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-12 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-100 transition-all text-white text-[11px]"
              >
                {lookupLoading ? 'Searching...' : 'Retrieve Pass'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-[320px] flex flex-col items-center">
          
          {/* EXTREMELY COMPACT BADGE CARD */}
          <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-[1.5rem] bg-white relative">
            
            {/* TIGHT LOGO */}
            <div className="bg-white pt-4 pb-2 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-12 object-contain" />
            </div>

            {/* TIGHT ROLE PILL */}
            <div className="flex justify-center -mt-2 relative z-10">
              <div className={`${role === 'EXHIBITOR' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-4 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border-2 border-white shadow-sm`}>
                {role === 'VISITOR' ? 'VALUED VISITOR' : 'OFFICIAL EXHIBITOR'}
              </div>
            </div>

            {/* TIGHT BODY SPACING */}
            <div className="px-5 pt-3 pb-3 bg-white flex-col flex gap-2 text-center items-center">
              <div className={`p-1 border-2 ${role === 'EXHIBITOR' ? 'border-[#0b3d41]' : 'border-[#ef6c33]'} rounded-xl bg-white inline-block`}>
                <QRCode value={person.id} size={110} fgColor="#0b3d41" level="Q" />
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words text-center">
                  {person.full_name}
                </h2>
                <p className={`text-[9px] font-black ${role === 'EXHIBITOR' ? 'text-[#0b3d41]' : 'text-[#ef6c33]'} uppercase tracking-widest mt-0.5`}>
                  {role}
                </p>
              </div>

              {/* LOUD STALL NUMBER & COMPANY NAME */}
              <div className="border-t border-slate-200 w-full pt-2 mt-1">
                {stallNumber && (
                    <div className="text-[#ef6c33] font-black text-xl leading-none mb-1 uppercase tracking-tighter">
                        STALL: {stallNumber}
                    </div>
                )}
                {!stallNumber && (
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">COMPANY / FIRM</p>
                )}
                <p className="text-sm font-black text-[#0b3d41] uppercase leading-tight">
                  {person.company_name || 'Individual'}
                </p>
              </div>
            </div>

            {/* TIGHT INFO STRIPS */}
            <div className="bg-[#0b3d41] text-white flex px-5 py-2 w-full">
              <div className="w-1/2 pr-3 border-r border-teal-700/50 text-left">
                <p className="text-[7px] font-bold uppercase tracking-widest text-teal-200/60 mb-0.5">Date</p>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">12-14 AUG 2026</p>
              </div>
              <div className="w-1/2 pl-3 text-left">
                <p className="text-[7px] font-bold uppercase tracking-widest text-teal-200/60 mb-0.5">Location</p>
                <p className="text-[8px] font-black uppercase tracking-wide leading-tight">GMDC GROUND,<br/>AHMEDABAD</p>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-2 flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <div className="text-left">
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0">Organized By</p>
                <p className="text-[9px] font-black text-[#0b3d41] uppercase tracking-wide">SHREE BALAJI EVENT LLP</p>
              </div>
            </div>
          </Card>

          {/* ACTIONS */}
          <div className="w-full mt-5 space-y-3">
            <Button 
                onClick={() => window.open(`/badge/print?id=${person.id}`, '_blank')}
                className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-12 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-100 transition-all text-white text-[11px]"
            >
                🖨️ Print / Download Pass
            </Button>
            <Button 
                onClick={() => {
                    setPerson(null);
                    setNeedsLookup(true);
                }}
                variant="ghost"
                className="w-full text-slate-400 hover:text-slate-800 font-bold uppercase tracking-widest text-[9px]"
            >
                Not your badge? Search again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DigitalBadgePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500 mt-20 uppercase tracking-widest text-xs">Loading...</div>}>
      <BadgeDisplay />
    </Suspense>
  )
}
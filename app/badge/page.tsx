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
      
      <div className="w-full max-w-[350px] mb-6 flex justify-between items-center opacity-50">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-[10px] font-black tracking-widest uppercase p-0 hover:bg-transparent">
             ← Back
          </Button>
          <img src="/event-logo.png" alt="GGE 2026" className="h-8 object-contain grayscale" />
      </div>

      {needsLookup && !person ? (
        <Card className="w-full max-w-[350px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white">
          <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
            <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
            <CardTitle className="text-xl font-black uppercase tracking-tight italic">Find My Badge</CardTitle>
            <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1 opacity-80">Enter Phone Number to Continue</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handlePhoneLookup} className="space-y-6">
              {lookupError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">
                  {lookupError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered Phone Number</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. 9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-slate-50 border-0 h-12 font-medium text-center tracking-widest"
                />
              </div>

              <Button 
                type="submit" 
                disabled={lookupLoading}
                className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
              >
                {lookupLoading ? 'Searching...' : 'Retrieve Pass'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-[350px] flex flex-col items-center">
          <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white relative">
            
            <div className="bg-white pt-6 pb-4 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain" />
            </div>

            <div className="flex justify-center -mt-5 relative z-10">
              <div className={`${role === 'EXHIBITOR' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm`}>
                {role === 'VISITOR' ? 'VALUED VISITOR' : 'OFFICIAL EXHIBITOR'}
              </div>
            </div>

            <div className="px-6 pt-6 pb-6 bg-white flex-col flex gap-5 text-center items-center">
              <div className={`p-2 border-[3px] ${role === 'EXHIBITOR' ? 'border-[#0b3d41]' : 'border-[#ef6c33]'} rounded-2xl bg-white inline-block`}>
                <QRCode value={person.id} size={130} fgColor="#0b3d41" level="H" />
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words text-center">
                  {person.full_name}
                </h2>
                <p className={`text-sm font-black ${role === 'EXHIBITOR' ? 'text-[#0b3d41]' : 'text-[#ef6c33]'} uppercase tracking-widest mt-1`}>
                  {role}
                </p>
              </div>

              {/* UPDATED: Prominent Company & Massive Stall Number Section */}
              <div className="border-t border-slate-100 w-full pt-5 flex flex-col gap-4">
                
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      COMPANY / FIRM
                    </p>
                    <p className="text-xl font-black text-[#0b3d41] uppercase leading-tight">
                      {person.company_name || 'Individual'}
                    </p>
                </div>

                {/* The new massive Stall Number Box (Only shows if they have a stall) */}
                {stallNumber && (
                    <div className="bg-orange-50/80 border border-orange-100 px-6 py-3 rounded-2xl mx-auto min-w-[160px]">
                        <p className="text-[9px] font-bold text-[#ef6c33] uppercase tracking-widest mb-0.5">
                            Stall Number
                        </p>
                        <p className="text-3xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter">
                            {stallNumber}
                        </p>
                    </div>
                )}

              </div>
            </div>

            <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full">
              <div className="w-1/2 pr-3 border-r border-teal-700/50 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 AUG 2026</p>
              </div>
              <div className="w-1/2 pl-4 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                <p className="text-[9px] font-black uppercase tracking-wide leading-tight">GMDC UNIVERSITY GROUND,<br/>AHMEDABAD</p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">SHREE BALAJI EVENT LLP</p>
              </div>
            </div>
          </Card>

          <div className="w-full mt-6 space-y-3">
            <Button 
                onClick={() => window.open(`/badge/print?id=${person.id}`, '_blank')}
                className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
            >
                🖨️ Print / Download Pass
            </Button>
            <Button 
                onClick={() => {
                    setPerson(null);
                    setNeedsLookup(true);
                }}
                variant="ghost"
                className="w-full text-slate-400 hover:text-slate-800 font-bold uppercase tracking-widest text-[10px]"
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
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function BadgeDisplay() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const [person, setPerson] = useState<any>(null)
  const [role, setRole] = useState<string>('VISITOR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchPerson = async () => {
        // 1. Check Visitors
        let { data } = await supabase.from('visitors').select('*').eq('id', id).single()
        let userRole = 'VISITOR'

        // 2. Check Exhibitors if not a Visitor
        if (!data) {
          const { data: exhibitorData } = await supabase.from('exhibitors').select('*').eq('id', id).single()
          if (exhibitorData) {
            data = exhibitorData
            userRole = exhibitorData.is_staff ? 'STAFF' : 'EXHIBITOR'
          }
        }

        if (data) {
          setPerson(data)
          setRole(userRole)
        }
        setLoading(false)
      }
      fetchPerson()
    } else {
        setLoading(false)
    }
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Digital Pass...</div>
  if (!person) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold tracking-widest uppercase text-xs">Badge Not Found</div>

  // Robust check for stall number across different column naming conventions
  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20">
      
      {/* Top Header Logo to make the screen feel less empty */}
      <div className="w-full max-w-[350px] mb-8 flex justify-center opacity-50">
          <img src="/event-logo.png" alt="GGE 2026" className="h-12 object-contain grayscale" />
      </div>

      <div className="w-full max-w-[350px] flex flex-col items-center">
        <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white relative">
          
          {/* 1. TOP LOGO (Clean White Background) */}
          <div className="bg-white pt-6 pb-4 flex justify-center">
            <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain" />
          </div>

          {/* 2. OVERLAPPING PILL (Dynamic Color based on Role) */}
          <div className="flex justify-center -mt-5 relative z-10">
            <div className={`${role === 'EXHIBITOR' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm`}>
              {role === 'VISITOR' ? 'VALUED VISITOR' : 'OFFICIAL EXHIBITOR'}
            </div>
          </div>

          {/* 3. MIDDLE BODY (QR, NAME, STALL) */}
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

            <div className="border-t border-slate-100 w-full pt-4">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {stallNumber ? `STALL: ${stallNumber}` : 'COMPANY / FIRM'}
              </p>
              <p className="text-lg font-black text-[#0b3d41] uppercase leading-tight">
                {person.company_name || 'Individual'}
              </p>
            </div>
          </div>

          {/* 4. DARK TEAL STRIP */}
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

          {/* 5. FOOTER */}
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

        {/* ACTIONS */}
        <div className="w-full mt-6 space-y-3">
          <Button 
              onClick={() => window.open(`/badge/print?id=${person.id}`, '_blank')}
              className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
          >
              🖨️ Print / Download Pass
          </Button>
          <Button 
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              className="w-full text-slate-400 hover:text-slate-800 font-bold uppercase tracking-widest text-[10px]"
          >
              Skip to Dashboard →
          </Button>
        </div>
      </div>
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
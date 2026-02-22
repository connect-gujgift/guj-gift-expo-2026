'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

function BadgeContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [person, setPerson] = useState<any>(null)
  const [role, setRole] = useState<string>('VISITOR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchPerson = async () => {
        let { data } = await supabase.from('visitors').select('*').eq('id', id).single()
        let userRole = 'VISITOR'

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
          setTimeout(() => window.print(), 100)
        }
        setLoading(false)
      }
      fetchPerson()
    }
  }, [id])

  if (loading) return <p className="p-10 text-center uppercase font-black text-slate-400">Loading Digital Pass...</p>
  if (!person) return <p className="p-10 text-center uppercase font-black text-red-500">Badge Not Found</p>

  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  return (
    <>
      {/* THE TWO-BADGE CSS: 
        This guarantees the colorful badge only shows on screen, 
        and the stripped-down, blank-spaced badge only shows to the printer.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-badge-only { display: none !important; }
        }
        @media print {
          @page { size: 384px 680px; margin: 0; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .screen-badge-only { display: none !important; }
          
          .print-badge-only {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 0;
            left: 0;
            width: 384px;
            height: 680px;
            background: transparent !important;
            z-index: 999999;
          }
        }
      `}} />

      <div className="flex justify-center items-start pt-10 pb-20 bg-slate-200 min-h-screen">
        
        {/* ========================================================= */}
        {/* 1. SCREEN BADGE (Colorful, Logos included, HIDDEN on Print) */}
        {/* ========================================================= */}
        <div className="screen-badge-only w-[384px] h-[680px] rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col font-sans relative">
            <div className="pt-8 pb-4 flex justify-center">
                <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain" />
            </div>
            <div className="flex justify-center -mt-4 relative z-10">
                <div className={`${role === 'EXHIBITOR' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm`}>
                    {role === 'VISITOR' ? 'VALUED VISITOR' : 'OFFICIAL EXHIBITOR'}
                </div>
            </div>
            <div className="px-6 pt-8 pb-6 bg-transparent flex-col flex gap-4 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className={`p-2 border-[3px] ${role === 'EXHIBITOR' ? 'border-[#0b3d41]' : 'border-[#ef6c33]'} rounded-2xl flex-shrink-0 bg-white`}>
                        <QRCode value={person.id} size={140} fgColor="#0b3d41" level="M" />
                    </div>
                    <div className="flex flex-col mt-2">
                        <h2 className="text-3xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words">
                            {person.full_name}
                        </h2>
                        <p className={`text-sm font-black ${role === 'EXHIBITOR' ? 'text-[#0b3d41]' : 'text-[#ef6c33]'} uppercase tracking-widest mt-1.5`}>
                            {role}
                        </p>
                    </div>
                </div>
                <div className="border-t border-slate-100 pt-5 w-full mt-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {stallNumber ? `STALL: ${stallNumber}` : 'COMPANY / FIRM'}
                    </p>
                    <p className="text-xl font-black text-[#0b3d41] uppercase leading-tight">
                        {person.company_name || 'Individual'}
                    </p>
                </div>
            </div>
            <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full items-center mt-auto">
                <div className="w-[40%] pr-4 border-r border-teal-700/50 text-left">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 AUG 2026</p>
                </div>
                <div className="w-[60%] pl-4 text-left">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                    <p className="text-[9px] font-black uppercase tracking-wide leading-tight">GMDC UNIVERSITY GROUND,<br/>AHMEDABAD</p>
                </div>
            </div>
            <div className="bg-slate-50 px-6 py-6 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                    <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                    <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">SHREE BALAJI EVENT LLP</p>
                </div>
            </div>
        </div>


        {/* ========================================================= */}
        {/* 2. PRINT BADGE (Pure text/QR, NO LOGOS, HIDDEN on Screen) */}
        {/* ========================================================= */}
        <div className="print-badge-only font-sans">
            
            {/* Blank space to perfectly skip over your pre-printed Logo and Pill */}
            <div style={{ height: '145px' }} className="w-full"></div>

            {/* QR & Text Area (Forced to pure Black for crisp printing) */}
            <div className="px-6 flex-col flex gap-4 text-center items-center">
                <div className="p-2 border-[4px] border-black rounded-2xl flex-shrink-0 bg-white">
                    <QRCode value={person.id} size={140} fgColor="#000000" level="M" />
                </div>
                <div className="flex flex-col mt-2">
                    <h2 className="text-3xl font-black text-black uppercase leading-none tracking-tighter break-words">
                        {person.full_name}
                    </h2>
                    <p className="text-sm font-black text-black uppercase tracking-widest mt-1.5">
                        {role}
                    </p>
                </div>
            </div>

            <div className="px-6 w-full mt-3 text-center">
                <div className="border-t border-gray-400 pt-5">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">
                        {stallNumber ? `STALL: ${stallNumber}` : 'COMPANY / FIRM'}
                    </p>
                    <p className="text-xl font-black text-black uppercase leading-tight">
                        {person.company_name || 'Individual'}
                    </p>
                </div>
            </div>

        </div>

      </div>
    </>
  )
}

export default function FinalPrintBadgePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-slate-400">Loading...</div>}>
      <BadgeContent />
    </Suspense>
  )
}
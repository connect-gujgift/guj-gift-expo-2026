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

  // Robust check to find the stall number no matter what the database column is named
  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: 384px 680px; 
            margin: 0;
          }
          html, body {
            width: 384px !important;
            height: 680px !important;
            background: transparent !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
          .print-safe-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 384px !important;
            height: 680px !important;
            z-index: 999999 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          #printable-badge {
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            background: transparent !important; 
          }
        }
      `}} />

      <div className="flex justify-center items-start pt-10 pb-20 bg-slate-200 min-h-screen print:bg-transparent print:p-0">
        
        <div className="print-safe-area">
            
          <div id="printable-badge" className="w-[384px] rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col font-sans relative">
            
            {/* 1. TOP EVENT LOGO - Bulletproof Print Removal */}
            <div className="pt-8 pb-4 flex justify-center">
                {/* Screen shows logo. Printer deletes it completely. */}
                <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain print:hidden" />
                {/* Printer replaces it with an invisible empty block of the exact same size to preserve spacing */}
                <div className="h-20 w-full hidden print:block"></div>
            </div>

            {/* 2. OVERLAPPING PILL - Bulletproof Print Removal */}
            <div className="flex justify-center -mt-4 relative z-10">
                <div className={`print:hidden ${role === 'EXHIBITOR' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm`}>
                    {role === 'VISITOR' ? 'VALUED VISITOR' : 'OFFICIAL EXHIBITOR'}
                </div>
                {/* Invisible spacing placeholder */}
                <div className="h-[28px] w-full hidden print:block"></div>
            </div>

            {/* 3. MIDDLE BODY: QR & NAME (VISIBLE ON PRINT) */}
            <div className="px-6 pt-8 pb-6 bg-transparent flex-col flex gap-4 text-center">
                
                <div className="flex flex-col items-center gap-4">
                    <div className={`p-2 border-[3px] ${role === 'EXHIBITOR' ? 'border-[#0b3d41]' : 'border-[#ef6c33]'} print:border-black rounded-2xl flex-shrink-0 bg-white print:bg-transparent`}>
                        <QRCode value={person.id} size={140} fgColor="#000000" level="M" />
                    </div>
                    
                    <div className="flex flex-col mt-2">
                        <h2 className="text-3xl font-black text-[#0b3d41] print:text-black uppercase leading-none tracking-tighter break-words">
                            {person.full_name}
                        </h2>
                        <p className={`text-sm font-black ${role === 'EXHIBITOR' ? 'text-[#0b3d41]' : 'text-[#ef6c33]'} print:text-black uppercase tracking-widest mt-1.5`}>
                            {role}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 print:border-black/20 pt-5 w-full mt-3">
                    {/* Fixed dynamic stall display */}
                    <p className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-widest mb-1">
                        {stallNumber ? `STALL: ${stallNumber}` : 'COMPANY / FIRM'}
                    </p>
                    <p className="text-xl font-black text-[#0b3d41] print:text-black uppercase leading-tight">
                        {person.company_name || 'Individual'}
                    </p>
                </div>
            </div>

            {/* 4. DARK TEAL EVENT INFO STRIP - Bulletproof Print Removal */}
            <div className="bg-[#0b3d41] print:bg-transparent text-white flex px-6 py-4 w-full items-center mt-auto">
                <div className="flex w-full print:hidden">
                    <div className="w-[40%] pr-4 border-r border-teal-700/50 text-left">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 AUG 2026</p>
                    </div>
                    <div className="w-[60%] pl-4 text-left">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                        <p className="text-[9px] font-black uppercase tracking-wide leading-tight">GMDC UNIVERSITY GROUND,<br/>AHMEDABAD</p>
                    </div>
                </div>
                {/* Invisible spacing placeholder */}
                <div className="h-[36px] w-full hidden print:block"></div>
            </div>

            {/* 5. BOTTOM ORGANIZER FOOTER - Bulletproof Print Removal */}
            <div className="bg-slate-50 print:bg-transparent px-6 py-6 flex flex-col items-center justify-center gap-2">
                <div className="flex flex-col items-center justify-center gap-2 print:hidden">
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                        <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                        <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">SHREE BALAJI EVENT LLP</p>
                    </div>
                </div>
                {/* Invisible spacing placeholder */}
                <div className="h-[52px] w-full hidden print:block"></div>
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
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

          /* BULLETPROOF PRE-PRINT TRICK: Forces the container AND all images/text inside it to be invisible */
          .hide-on-print, .hide-on-print * {
            visibility: hidden !important;
            opacity: 0 !important;
            color: transparent !important;
            background: transparent !important;
            border-color: transparent !important;
          }
        }
      `}} />

      <div className="flex justify-center items-start pt-10 pb-20 bg-slate-200 min-h-screen print:bg-transparent print:p-0">
        
        <div className="print-safe-area">
            
          <div id="printable-badge" className="w-[384px] rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col font-sans relative">
            
            {/* 1. TOP EVENT LOGO (Hidden on Print) */}
            <div className="pt-8 pb-4 flex justify-center hide-on-print">
                <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain hide-on-print" />
            </div>

            {/* 2. OVERLAPPING PILL (Hidden on Print) */}
            <div className="flex justify-center -mt-4 relative z-10 hide-on-print">
                <div className={`${role === 'EXHIBITOR' ? 'bg-[#0b3d41]' : 'bg-[#ef6c33]'} text-white px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm`}>
                    {role === 'VISITOR' ? 'VALUED VISITOR' : 'OFFICIAL EXHIBITOR'}
                </div>
            </div>

            {/* 3. MIDDLE BODY: QR & NAME (VISIBLE ON PRINT) */}
            <div className="px-6 pt-8 pb-6 bg-transparent flex-col flex gap-4 text-center">
                
                <div className="flex flex-col items-center gap-4">
                    {/* Added print:border-black so B&W printers print a sharp, dark border */}
                    <div className={`p-2 border-[3px] ${role === 'EXHIBITOR' ? 'border-[#0b3d41]' : 'border-[#ef6c33]'} print:border-black rounded-2xl flex-shrink-0 bg-white print:bg-transparent`}>
                        <QRCode value={person.id} size={140} fgColor="#000000" level="M" />
                    </div>
                    
                    <div className="flex flex-col mt-2">
                        {/* Added print:text-black for crisp thermal/laser printing */}
                        <h2 className="text-3xl font-black text-[#0b3d41] print:text-black uppercase leading-none tracking-tighter break-words">
                            {person.full_name}
                        </h2>
                        <p className={`text-sm font-black ${role === 'EXHIBITOR' ? 'text-[#0b3d41]' : 'text-[#ef6c33]'} print:text-black uppercase tracking-widest mt-1.5`}>
                            {role}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 print:border-black/20 pt-5 w-full mt-3">
                    <p className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-widest mb-1">
                        {role === 'EXHIBITOR' && person.stall_number ? `STALL: ${person.stall_number}` : 'COMPANY / FIRM'}
                    </p>
                    <p className="text-xl font-black text-[#0b3d41] print:text-black uppercase leading-tight">
                        {person.company_name || 'Individual'}
                    </p>
                </div>
            </div>

            {/* 4. DARK TEAL EVENT INFO STRIP (Hidden on Print) */}
            <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full items-center hide-on-print mt-auto">
                <div className="w-[40%] pr-4 border-r border-teal-700/50 text-left hide-on-print">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 AUG 2026</p>
                </div>
                <div className="w-[60%] pl-4 text-left hide-on-print">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                    <p className="text-[9px] font-black uppercase tracking-wide leading-tight">GMDC UNIVERSITY GROUND,<br/>AHMEDABAD</p>
                </div>
            </div>

            {/* 5. BOTTOM ORGANIZER FOOTER (Hidden on Print) */}
            <div className="bg-slate-50 px-6 py-6 flex flex-col items-center justify-center gap-2 hide-on-print">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden hide-on-print">
                    <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover hide-on-print" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="text-center hide-on-print">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                    <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">SHREE BALAJI EVENT LLP</p>
                </div>
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
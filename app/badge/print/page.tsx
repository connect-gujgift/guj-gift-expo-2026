'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

function BadgeContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchVisitor = async () => {
        const { data } = await supabase.from('visitors').select('*').eq('id', id).single()
        if (data) {
          setVisitor(data)
          setTimeout(() => window.print(), 1500)
        }
        setLoading(false)
      }
      fetchVisitor()
    }
  }, [id])

  if (loading) return <p className="p-10 text-center uppercase font-black text-slate-400">Loading Digital Pass...</p>
  if (!visitor) return <p className="p-10 text-center uppercase font-black text-red-500">Visitor Not Found</p>

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: 4in 6in; /* Forces the PDF to be exactly 4x6 badge-sized */
            margin: 0;
          }
          html, body {
            height: 100vh;
            overflow: hidden;
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-badge, #printable-badge * {
            visibility: visible;
          }
          #printable-badge {
            position: absolute; /* Pulls badge out of the normal layout flow */
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}} />

      <div className="flex justify-center items-start pt-10 pb-20 bg-slate-200 min-h-screen print:bg-white print:p-0">
        
        {/* MAIN BADGE CONTAINER - Condensed vertical spacing */}
        <div id="printable-badge" className="w-[384px] rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col font-sans relative">
          
          {/* 1. TOP EVENT LOGO */}
          <div className="bg-white pt-4 pb-3 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain" />
          </div>

          {/* 2. OVERLAPPING PILL */}
          <div className="flex justify-center -mt-4 relative z-10">
              <div className="bg-[#ef6c33] text-white px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm">
                  Valued Visitor
              </div>
          </div>

          {/* 3. MIDDLE BODY (QR & NAME) */}
          <div className="px-6 pt-5 pb-5 bg-white flex-col flex gap-4 text-center">
              
              <div className="flex flex-col items-center gap-3">
                  <div className="p-2 border-[3px] border-[#ef6c33] rounded-2xl flex-shrink-0 bg-white">
                      <QRCode value={visitor.id} size={110} fgColor="#0b3d41" level="H" />
                  </div>
                  
                  <div className="flex flex-col">
                      <h2 className="text-2xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words">
                          {visitor.full_name}
                      </h2>
                      <p className="text-xs font-black text-[#ef6c33] uppercase tracking-widest mt-1">
                          Visitor
                      </p>
                  </div>
              </div>

              <div className="border-t border-slate-100 pt-3 w-full">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Company / Firm</p>
                  <p className="text-lg font-black text-[#0b3d41] uppercase leading-tight">
                      {visitor.company_name || 'Individual'}
                  </p>
              </div>
          </div>

          {/* 4. DARK TEAL EVENT INFO STRIP */}
          <div className="bg-[#0b3d41] text-white flex px-6 py-3 w-full items-center">
              <div className="w-[45%] pr-4 border-r border-teal-700/50">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 Aug 2026</p>
              </div>
              <div className="w-[55%] pl-4">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                  <p className="text-[9px] font-black uppercase tracking-wide leading-tight">GMDC UNIVERSITY GROUND, AHMEDABAD</p>
              </div>
          </div>

          {/* 5. BOTTOM ORGANIZER FOOTER */}
          <div className="bg-white px-6 py-3 flex flex-col items-center justify-center gap-1.5">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                  <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">Shree Balaji Event LLP</p>
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
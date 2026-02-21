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
          // SLASHED DELAY: Now it will open the print dialog almost instantly
          setTimeout(() => window.print(), 300)
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
            size: 384px 620px; /* Perfectly sizes the PDF to exactly match the badge dimensions */
            margin: 0;
          }
          html, body {
            height: 100vh;
            overflow: hidden;
            margin: 0;
            padding: 0;
            background: white;
            /* CRITICAL FIX: This forces the browser to print your dark teal and orange backgrounds! */
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-badge, #printable-badge * {
            visibility: visible;
          }
          #printable-badge {
            position: absolute;
            left: 0;
            top: 0;
            width: 384px;
            margin: 0;
            padding: 0;
          }
        }
      `}} />

      <div className="flex justify-center items-start pt-10 pb-20 bg-slate-200 min-h-screen print:bg-white print:p-0">
        
        {/* MAIN BADGE CONTAINER */}
        <div id="printable-badge" className="w-[384px] rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col font-sans relative">
          
          {/* 1. TOP EVENT LOGO */}
          <div className="bg-white pt-6 pb-4 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain" />
          </div>

          {/* 2. OVERLAPPING PILL */}
          <div className="flex justify-center -mt-4 relative z-10">
              <div className="bg-[#ef6c33] text-white px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm">
                  Valued Visitor
              </div>
          </div>

          {/* 3. MIDDLE BODY (QR & NAME) */}
          <div className="px-6 pt-6 pb-6 bg-white flex-col flex gap-4 text-center">
              
              <div className="flex flex-col items-center gap-3">
                  <div className="p-2 border-[3px] border-[#ef6c33] rounded-2xl flex-shrink-0 bg-white">
                      <QRCode value={visitor.id} size={130} fgColor="#0b3d41" level="H" />
                  </div>
                  
                  <div className="flex flex-col">
                      <h2 className="text-3xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words mt-2">
                          {visitor.full_name}
                      </h2>
                      <p className="text-sm font-black text-[#ef6c33] uppercase tracking-widest mt-1">
                          Visitor
                      </p>
                  </div>
              </div>

              <div className="border-t border-slate-100 pt-4 w-full mt-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Company / Firm</p>
                  <p className="text-xl font-black text-[#0b3d41] uppercase leading-tight">
                      {visitor.company_name || 'Individual'}
                  </p>
              </div>
          </div>

          {/* 4. DARK TEAL EVENT INFO STRIP */}
          <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full items-center">
              <div className="w-[40%] pr-4 border-r border-teal-700/50">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 AUG 2026</p>
              </div>
              <div className="w-[60%] pl-4 text-left">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                  {/* Neatly stacked the location text as requested */}
                  <p className="text-[9px] font-black uppercase tracking-wide leading-tight">GMDC UNIVERSITY GROUND,<br/>AHMEDABAD</p>
              </div>
          </div>

          {/* 5. BOTTOM ORGANIZER FOOTER */}
          <div className="bg-slate-50 px-6 py-4 flex flex-col items-center justify-center gap-1.5">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                  <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">SHREE BALAJI EVENT LLP</p>
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